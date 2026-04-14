import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListingsService } from '../listings/listings.service';
import { ScoringService } from '../scoring/scoring.service';
import { UsersService } from '../users/users.service';
import { OrderStatus, UserRole, ScoreEventType, UserStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    private readonly listingsService: ListingsService,
    private readonly scoringService: ScoringService,
    private readonly usersService: UsersService,
  ) {}

  // ─────────────────────────────────────────────
  // CREATE — El comprador reserva una res/lote
  // ─────────────────────────────────────────────
  async create(dto: CreateOrderDto, buyer: User): Promise<Order> {
    if (buyer.role !== UserRole.BUYER) {
      throw new ForbiddenException('Solo los compradores pueden hacer pedidos.');
    }

    const listing = await this.listingsService.findOne(dto.listingId);
    if (listing.status !== 'publicado') {
      throw new BadRequestException('Esta publicación ya no está disponible.');
    }

    // Calcular seña según score del comprador
    const señaResult = this.scoringService.calculateSeña(
      buyer.creditScore,
      listing.totalPrice,
    );

    if (señaResult.autoReject) {
      throw new BadRequestException(
        'Tu score crediticio es demasiado bajo para realizar este pedido. ' +
        'Comunicate con soporte para más información.',
      );
    }

    // Timer de 24hs para pagar la seña
    const señaDueAt = new Date();
    señaDueAt.setHours(señaDueAt.getHours() + 24);

    const order = this.repo.create({
      buyerId: buyer.id,
      vendorId: listing.vendorId,
      listingId: listing.id,
      totalAmount: listing.totalPrice,
      señaPercent: señaResult.señaPercent,
      señaAmount: señaResult.señaAmount,
      status: OrderStatus.PENDING_SEÑA,
      señaDueAt: señaResult.señaPercent === 0 ? null : señaDueAt,
      notes: dto.notes ?? null,
    });

    const saved = await this.repo.save(order);

    // Marcar la publicación como reservada
    await this.listingsService.markReserved(listing.id);

    return saved;
  }

  // ─────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────
  async findOne(id: string): Promise<Order> {
    const order = await this.repo.findOne({
      where: { id },
      relations: ['buyer', 'vendor', 'listing'],
    });
    if (!order) throw new NotFoundException('Pedido no encontrado.');
    return order;
  }

  async findByBuyer(buyerId: string): Promise<Order[]> {
    return this.repo.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
      relations: ['listing', 'vendor'],
    });
  }

  async findByVendor(vendorId: string): Promise<Order[]> {
    return this.repo.find({
      where: { vendorId },
      order: { createdAt: 'DESC' },
      relations: ['listing', 'buyer'],
    });
  }

  async findAll(): Promise<Order[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['buyer', 'vendor', 'listing'],
    });
  }

  // ─────────────────────────────────────────────
  // CONFIRM DELIVERY (vendor marks delivered)
  // ─────────────────────────────────────────────
  async confirmDelivery(id: string, vendorId: string): Promise<Order> {
    const order = await this.findOneRaw(id);
    if (order.vendorId !== vendorId) {
      throw new ForbiddenException('Este pedido no es tuyo.');
    }
    if (order.status !== OrderStatus.DISPATCHED) {
      throw new BadRequestException('El pedido debe estar despachado para confirmar entrega.');
    }

    order.status = OrderStatus.DELIVERED;
    order.deliveredAt = new Date();
    const saved = await this.repo.save(order);

    // +3 puntos al comprador por completar la operación
    await this.scoringService.applyEvent(
      order.buyerId,
      ScoreEventType.ORDER_COMPLETED,
      order.id,
      'system',
      'Pedido completado exitosamente.',
    );

    // Marcar la publicación como vendida
    await this.listingsService.markSold(order.listingId);

    return saved;
  }

  // ─────────────────────────────────────────────
  // DISPATCH (vendor sends goods)
  // ─────────────────────────────────────────────
  async dispatch(id: string, vendorId: string): Promise<Order> {
    const order = await this.findOneRaw(id);
    if (order.vendorId !== vendorId) {
      throw new ForbiddenException('Este pedido no es tuyo.');
    }
    if (order.status !== OrderStatus.SEÑA_PAID) {
      throw new BadRequestException('La seña debe estar pagada para despachar.');
    }
    order.status = OrderStatus.DISPATCHED;
    return this.repo.save(order);
  }

  // ─────────────────────────────────────────────
  // CANCEL
  // ─────────────────────────────────────────────
  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOneRaw(id);

    const isBuyer = order.buyerId === userId;
    const isVendor = order.vendorId === userId;
    if (!isBuyer && !isVendor) {
      throw new ForbiddenException('No tenés permiso para cancelar este pedido.');
    }

    const cancelableStatuses: OrderStatus[] = [
      OrderStatus.PENDING_SEÑA,
      OrderStatus.SEÑA_PAID,
    ];
    if (!cancelableStatuses.includes(order.status)) {
      throw new BadRequestException('Este pedido ya no puede cancelarse.');
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await this.repo.save(order);

    // Devolver la publicación al catálogo
    await this.listingsService.markActive(order.listingId);

    return saved;
  }

  // ─────────────────────────────────────────────
  // UPDATE STATUS FROM PAYMENT WEBHOOK
  // ─────────────────────────────────────────────
  async onSeñaPaid(id: string, mpPaymentId: string): Promise<Order> {
    const order = await this.findOneRaw(id);
    if (order.status !== OrderStatus.PENDING_SEÑA) {
      return order; // Idempotente
    }
    order.status = OrderStatus.SEÑA_PAID;
    order.mpPaymentId = mpPaymentId;
    order.confirmedAt = new Date();
    return this.repo.save(order);
  }

  async setMpPreference(
    id: string,
    preferenceId: string,
    initPoint: string,
  ): Promise<void> {
    await this.repo.update(id, {
      mpPreferenceId: preferenceId,
      mpInitPoint: initPoint,
    });
  }

  // ─────────────────────────────────────────────
  // CRON — Expirar pedidos con seña vencida
  // ─────────────────────────────────────────────
  async expireOverdueSeñas(): Promise<number> {
    const overdue = await this.repo.find({
      where: {
        status: OrderStatus.PENDING_SEÑA,
        señaDueAt: LessThan(new Date()),
      },
    });

    for (const order of overdue) {
      order.status = OrderStatus.EXPIRED;
      await this.repo.save(order);

      // Devolver publicación al catálogo
      await this.listingsService.markActive(order.listingId);

      // Penalizar al comprador
      await this.scoringService.applyEvent(
        order.buyerId,
        ScoreEventType.PAYMENT_VERY_LATE,
        order.id,
        'system',
        'Seña no pagada en 24hs — pedido vencido automáticamente.',
      );

      // Suspender cuenta si el score cae muy bajo
      const buyer = await this.usersService.findOne(order.buyerId);
      if (buyer.creditScore < 20 && buyer.status === UserStatus.ACTIVE) {
        await this.usersService.suspend(
          buyer.id,
          'Score crediticio crítico por seña no pagada.',
        );
        await this.scoringService.applyEvent(
          buyer.id,
          ScoreEventType.ACCOUNT_SUSPENDED,
          order.id,
          'system',
          'Cuenta suspendida automáticamente por score crítico.',
        );
      }
    }

    return overdue.length;
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async findOneRaw(id: string): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado.');
    return order;
  }
}
