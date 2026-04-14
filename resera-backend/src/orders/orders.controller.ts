import {
  Controller, Get, Post, Patch,
  Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  // ── Crear pedido (comprador) ──────────────────────────────────
  @Post()
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: '[Comprador] Reservar una res/lote' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.svc.create(dto, user);
  }

  // ── Mis pedidos (comprador) ───────────────────────────────────
  @Get('mine/as-buyer')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: '[Comprador] Mis pedidos' })
  myOrdersAsBuyer(@CurrentUser() user: User) {
    return this.svc.findByBuyer(user.id);
  }

  // ── Pedidos recibidos (vendedor) ──────────────────────────────
  @Get('mine/as-vendor')
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: '[Vendedor] Pedidos recibidos' })
  myOrdersAsVendor(@CurrentUser() user: User) {
    return this.svc.findByVendor(user.id);
  }

  // ── Todos los pedidos (admin) ─────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Todos los pedidos' })
  findAll() {
    return this.svc.findAll();
  }

  // ── Detalle de pedido ─────────────────────────────────────────
  @Get(':id')
  @Roles(UserRole.BUYER, UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Detalle de un pedido' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  // ── Despachar (vendedor) ──────────────────────────────────────
  @Patch(':id/dispatch')
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: '[Vendedor] Marcar pedido como despachado' })
  dispatch(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.svc.dispatch(id, user.id);
  }

  // ── Confirmar entrega (vendedor) ──────────────────────────────
  @Patch(':id/deliver')
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: '[Vendedor] Confirmar entrega al comprador' })
  deliver(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.svc.confirmDelivery(id, user.id);
  }

  // ── Cancelar (ambos roles) ────────────────────────────────────
  @Patch(':id/cancel')
  @Roles(UserRole.BUYER, UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancelar pedido (antes del despacho)' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.svc.cancel(id, user.id);
  }
}
