import {
  Injectable, NotFoundException,
  BadRequestException, Logger, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Payment } from './entities/payment.entity';
import { OrdersService } from '../orders/orders.service';
import { MercadoPagoStatus } from '../common/enums';

// ─── Tipos de la API de Mercado Pago ─────────────────────────────────────────
interface MpPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface MpCreatePreferencePayload {
  items: MpPreferenceItem[];
  payer: { email: string };
  external_reference: string;
  notification_url: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  expires: boolean;
  expiration_date_to?: string;
}

interface MpPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface MpWebhookPayload {
  id: string | number;
  type: string;
  data: { id: string };
}

interface MpPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly mpBaseUrl = 'https://api.mercadopago.com';
  private readonly accessToken: string;
  private readonly webhookSecret: string;
  private readonly notificationUrl: string;
  private readonly frontUrl: string;
  private readonly isDev: boolean;

  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly ordersService: OrdersService,
  ) {
    this.accessToken  = process.env.MP_ACCESS_TOKEN  ?? '';
    this.webhookSecret = process.env.MP_WEBHOOK_SECRET ?? '';
    this.notificationUrl = process.env.MP_NOTIFICATION_URL ?? '';
    this.frontUrl    = process.env.FRONTEND_URL ?? 'https://app.resera.com.ar';
    this.isDev       = process.env.NODE_ENV !== 'production';
  }

  // ─────────────────────────────────────────────
  // CREAR PREFERENCIA DE PAGO (seña)
  // ─────────────────────────────────────────────
  async createPreference(orderId: string, buyerEmail: string): Promise<Payment> {
    const order = await this.ordersService.findOne(orderId);

    if (order.señaAmount <= 0) {
      throw new BadRequestException('Este pedido no requiere seña.');
    }

    const payload: MpCreatePreferencePayload = {
      items: [
        {
          id:          order.listingId,
          title:       `Seña pedido RESERA #${order.id.slice(0, 8)}`,
          quantity:    1,
          unit_price:  order.señaAmount,
          currency_id: 'ARS',
        },
      ],
      payer:              { email: buyerEmail },
      external_reference: order.id,
      notification_url:   this.notificationUrl,
      back_urls: {
        success: `${this.frontUrl}/pedidos/${order.id}?pago=ok`,
        failure: `${this.frontUrl}/pedidos/${order.id}?pago=error`,
        pending: `${this.frontUrl}/pedidos/${order.id}?pago=pendiente`,
      },
      auto_return: 'approved',
      expires:     order.señaDueAt !== null,
      ...(order.señaDueAt ? { expiration_date_to: order.señaDueAt.toISOString() } : {}),
    };

    const mpResponse = await this.callMercadoPago<MpPreferenceResponse>(
      'POST',
      '/checkout/preferences',
      payload,
    );

    // Persiste el pago
    const payment = this.repo.create({
      orderId: order.id,
      mpPreferenceId: mpResponse.id,
      amount: order.señaAmount,
      currencyId: 'ARS',
      status: MercadoPagoStatus.PENDING,
      initPoint: this.isDev ? mpResponse.sandbox_init_point : mpResponse.init_point,
    });
    await this.repo.save(payment);

    // Guarda el preference ID en el pedido para referencia cruzada
    await this.ordersService.setMpPreference(
      order.id,
      mpResponse.id,
      payment.initPoint!,
    );

    return payment;
  }

  // ─────────────────────────────────────────────
  // PROCESAR WEBHOOK
  // ─────────────────────────────────────────────
  async processWebhook(
    rawBody: Buffer,
    xSignature: string,
    xRequestId: string,
    payload: MpWebhookPayload,
  ): Promise<void> {
    // 1. Verificar firma HMAC (v2)
    this.verifySignature(rawBody, xSignature, xRequestId);

    // Solo procesar eventos de pago
    if (payload.type !== 'payment') return;

    const mpPaymentId = String(payload.data?.id);
    if (!mpPaymentId) return;

    // 2. Consultar el pago en MP
    const mpPayment = await this.callMercadoPago<MpPaymentResponse>(
      'GET',
      `/v1/payments/${mpPaymentId}`,
    );

    const orderId = mpPayment.external_reference;
    if (!orderId) {
      this.logger.warn(`MP payment ${mpPaymentId} sin external_reference`);
      return;
    }

    // 3. Encontrar el registro de pago local
    const payment = await this.repo.findOne({ where: { orderId } });
    if (!payment) {
      this.logger.warn(`No se encontró Payment para order ${orderId}`);
      return;
    }

    // 4. Actualizar estado
    const newStatus = mpPayment.status as MercadoPagoStatus;
    payment.mpPaymentId  = mpPaymentId;
    payment.status       = newStatus;
    payment.webhookPayload = payload as unknown as Record<string, unknown>;
    await this.repo.save(payment);

    // 5. Si está aprobado, actualizar el pedido
    if (newStatus === MercadoPagoStatus.APPROVED) {
      await this.ordersService.onSeñaPaid(orderId, mpPaymentId);
      this.logger.log(`Seña aprobada — Pedido ${orderId}`);
    }
  }

  // ─────────────────────────────────────────────
  // LEER PAGO DE UN PEDIDO
  // ─────────────────────────────────────────────
  async findByOrder(orderId: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { orderId } });
  }

  // ─────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ─────────────────────────────────────────────

  /** Verifica la firma HMAC-SHA256 del webhook de Mercado Pago (v2) */
  private verifySignature(
    body: Buffer,
    xSignature: string,
    xRequestId: string,
  ): void {
    if (!this.webhookSecret) return;   // omitir en dev si no hay secret

    // x-signature = ts=...v1=...
    const parts = Object.fromEntries(
      xSignature.split(',').map(p => p.split('=') as [string, string]),
    );
    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) throw new UnauthorizedException('Firma de webhook inválida.');

    const manifest = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;
    const expectedHmac = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(manifest)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(v1, 'hex'),
        Buffer.from(expectedHmac, 'hex'),
      )
    ) {
      throw new UnauthorizedException('Firma de webhook inválida.');
    }
  }

  /** Llamada a la API de Mercado Pago */
  private async callMercadoPago<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.mpBaseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`MP API error ${res.status}: ${err}`);
      throw new BadRequestException(`Error al comunicarse con Mercado Pago: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }
}
