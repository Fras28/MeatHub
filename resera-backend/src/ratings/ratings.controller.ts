import {
  Controller, Get, Post, Body,
  Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';

@ApiTags('ratings')
@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  constructor(private readonly svc: RatingsService) {}

  // ── Calificar (vendor o buyer) ────────────────────────────────
  @Post()
  @Roles(UserRole.VENDOR, UserRole.BUYER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Calificar a la contraparte de un pedido (1-5 ★)' })
  create(@Body() dto: CreateRatingDto, @CurrentUser() user: User) {
    return this.svc.create(user.id, dto);
  }

  // ── Calificaciones recibidas por un usuario (público) ────────
  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Calificaciones recibidas por un usuario' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.svc.findByUser(userId);
  }

  // ── Mis calificaciones emitidas ───────────────────────────────
  @Get('mine/given')
  @Roles(UserRole.VENDOR, UserRole.BUYER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Calificaciones que yo emití' })
  myGiven(@CurrentUser() user: User) {
    return this.svc.findByReviewer(user.id);
  }
}
