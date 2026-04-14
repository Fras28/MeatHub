import {
  Controller, Get, Post, Patch, Param, Body,
  Query, UseGuards, ClassSerializerInterceptor,
  UseInterceptors, ParseUUIDPipe, ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from './entities/user.entity';
import { UserRole, UserStatus } from '../common/enums';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  // ── Admin: listar todos ──────────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Listar todos los usuarios' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'status', enum: UserStatus, required: false })
  findAll(
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    return this.svc.findAll({ role, status });
  }

  // ── Perfil público (sin auth) ────────────────────────────────
  @Get(':id/public')
  @Public()
  @ApiOperation({ summary: 'Perfil público de un usuario (vendedor/comprador)' })
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getPublicProfile(id);
  }

  // ── Ver un usuario ────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de un usuario' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() me: User,
  ) {
    // Solo admin o el propio usuario
    if (me.role !== UserRole.ADMIN && me.id !== id) {
      throw new ForbiddenException('No tenés acceso a este perfil.');
    }
    return this.svc.findOne(id);
  }

  // ── Admin: aprobar cuenta ────────────────────────────────────
  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Aprobar cuenta' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.approve(id);
  }

  // ── Admin: suspender cuenta ──────────────────────────────────
  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Suspender cuenta por deuda' })
  suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes?: string,
  ) {
    return this.svc.suspend(id, notes);
  }

  // ── Admin: bloquear cuenta ───────────────────────────────────
  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Bloquear cuenta' })
  block(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes?: string,
  ) {
    return this.svc.block(id, notes);
  }

  // ── Admin: reactivar cuenta ──────────────────────────────────
  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Reactivar cuenta suspendida/bloqueada' })
  reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.reactivate(id);
  }

  // ── Stats admin ──────────────────────────────────────────────
  @Get('admin/platform-stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Estadísticas de usuarios de la plataforma' })
  platformStats() {
    return this.svc.getPlatformStats();
  }
}
