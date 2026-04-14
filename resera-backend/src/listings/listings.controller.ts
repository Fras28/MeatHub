import {
  Controller, Get, Post, Patch, Param,
  Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { AnimalSpecies, ListingType, UserRole } from '../common/enums';

@ApiTags('listings')
@Controller('listings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListingsController {
  constructor(private readonly svc: ListingsService) {}

  // ── Catálogo público ──────────────────────────────────────────
  @Get()
  @Public()
  @ApiOperation({ summary: 'Catálogo público de reses y lotes disponibles' })
  @ApiQuery({ name: 'species', enum: AnimalSpecies, required: false })
  @ApiQuery({ name: 'type', enum: ListingType, required: false })
  @ApiQuery({ name: 'province', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minWeight', required: false, type: Number })
  @ApiQuery({ name: 'onlyVerified', required: false, type: Boolean })
  findPublic(
    @Query('species') species?: AnimalSpecies,
    @Query('type') type?: ListingType,
    @Query('province') province?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minWeight') minWeight?: number,
    @Query('onlyVerified') onlyVerified?: string,
  ) {
    return this.svc.findPublic({
      species, type, province, minPrice, maxPrice, minWeight,
      onlyVerified: onlyVerified === 'true',
    });
  }

  // ── Detalle público ───────────────────────────────────────────
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Detalle de una publicación' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  // ── Mis publicaciones (vendedor) ──────────────────────────────
  @Get('vendor/mine')
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Vendedor] Mis publicaciones' })
  myListings(@CurrentUser() user: User) {
    return this.svc.findByVendor(user.id);
  }

  // ── Crear publicación ─────────────────────────────────────────
  @Post()
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Vendedor] Crear nueva publicación de res/lote' })
  create(@Body() dto: CreateListingDto, @CurrentUser() user: User) {
    return this.svc.create(dto, user);
  }

  // ── Editar publicación ────────────────────────────────────────
  @Patch(':id')
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Vendedor] Editar publicación' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateListingDto>,
    @CurrentUser() user: User,
  ) {
    return this.svc.update(id, dto, user.id);
  }

  // ── Publicar ──────────────────────────────────────────────────
  @Patch(':id/publish')
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Vendedor] Publicar borrador' })
  publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.svc.publish(id, user.id);
  }

  // ── Pausar ────────────────────────────────────────────────────
  @Patch(':id/pause')
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Vendedor] Pausar publicación' })
  pause(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.svc.pause(id, user.id);
  }
}
