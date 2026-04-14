import {
  Controller, Get, Post, Body, Param,
  Query, UseGuards, ParseUUIDPipe, ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole, ScoreEventType } from '../common/enums';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ApplyEventDto {
  @ApiProperty({ enum: ScoreEventType })
  @IsEnum(ScoreEventType)
  type: ScoreEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  triggeredBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

@ApiTags('scoring')
@Controller('scoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ScoringController {
  constructor(private readonly svc: ScoringService) {}

  // ── Mi score (comprador) ──────────────────────────────────────
  @Get('me')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: '[Comprador] Mi score crediticio y tier de seña' })
  myScore(@CurrentUser() user: User) {
    return this.svc.getScoreInfo(user.id);
  }

  // ── Mi historial (comprador) ──────────────────────────────────
  @Get('me/history')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: '[Comprador] Historial de eventos de mi score' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  myHistory(
    @CurrentUser() user: User,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.svc.getHistory(user.id, limit, offset);
  }

  // ── Score de cualquier comprador (admin) ──────────────────────
  @Get(':buyerId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Score de un comprador específico' })
  getScore(@Param('buyerId', ParseUUIDPipe) buyerId: string) {
    return this.svc.getScoreInfo(buyerId);
  }

  // ── Historial de cualquier comprador (admin) ──────────────────
  @Get(':buyerId/history')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Historial de score de un comprador' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getHistory(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.svc.getHistory(buyerId, limit, offset);
  }

  // ── Aplicar evento manual (admin) ────────────────────────────
  @Post(':buyerId/event')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Aplicar evento de score manualmente' })
  applyEvent(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: ApplyEventDto,
  ) {
    return this.svc.applyEvent(
      buyerId, dto.type, dto.orderId, dto.triggeredBy ?? 'admin', dto.notes,
    );
  }
}
