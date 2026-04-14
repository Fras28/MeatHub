import {
  Controller, Post, Get, Body,
  Param, UseGuards, ParseUUIDPipe,
  Req, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  // ── Crear preferencia de pago de seña ────────────────────────
  @Post('orders/:orderId/preference')
  @Roles(UserRole.BUYER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Comprador] Generar link de pago de seña (Mercado Pago)' })
  createPreference(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: User,
  ) {
    return this.svc.createPreference(orderId, user.email);
  }

  // ── Estado del pago de un pedido ─────────────────────────────
  @Get('orders/:orderId')
  @Roles(UserRole.BUYER, UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Estado del pago de seña de un pedido' })
  findByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.svc.findByOrder(orderId);
  }

  // ── Webhook de Mercado Pago (público, sin JWT) ────────────────
  @Post('webhook/mercadopago')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async webhook(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Req() req: any,
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
  ) {
    const rawBody: Buffer = req.rawBody ?? Buffer.from(JSON.stringify(body));
    await this.svc.processWebhook(
      rawBody,
      xSignature ?? '',
      xRequestId ?? '',
      body as unknown as Parameters<PaymentsService['processWebhook']>[3],
    );
    return { received: true };
  }
}
