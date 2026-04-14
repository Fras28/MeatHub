import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { AnimalSpecies, ListingStatus, ListingType, UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

interface ListingFilters {
  species?: AnimalSpecies;
  type?: ListingType;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  onlyVerified?: boolean;
}

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly repo: Repository<Listing>,
  ) {}

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  async create(dto: CreateListingDto, vendor: User): Promise<Listing> {
    if (vendor.role !== UserRole.VENDOR) {
      throw new ForbiddenException('Solo los faenadores/mataderos pueden publicar reses.');
    }

    const hookWeight = dto.hookWeightKg;
    const totalPrice = +(dto.pricePerKg * hookWeight).toFixed(2);

    const listing = this.repo.create({
      ...dto,
      vendorId: vendor.id,
      totalPrice,
      slaughterDate: dto.slaughterDate ? new Date(dto.slaughterDate) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      status: ListingStatus.DRAFT,
    });

    return this.repo.save(listing);
  }

  // ─────────────────────────────────────────────
  // PUBLISH / PAUSE / CLOSE
  // ─────────────────────────────────────────────
  async publish(id: string, vendorId: string): Promise<Listing> {
    const listing = await this.findOneRaw(id);
    this.assertOwner(listing, vendorId);
    if (listing.images.length === 0) {
      throw new BadRequestException('Necesitás al menos una foto para publicar.');
    }
    listing.status = ListingStatus.ACTIVE;
    return this.repo.save(listing);
  }

  async pause(id: string, vendorId: string): Promise<Listing> {
    const listing = await this.findOneRaw(id);
    this.assertOwner(listing, vendorId);
    listing.status = ListingStatus.PAUSED;
    return this.repo.save(listing);
  }

  // ─────────────────────────────────────────────
  // READ — PUBLIC CATALOG
  // ─────────────────────────────────────────────
  async findPublic(filters: ListingFilters = {}) {
    const qb = this.repo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.vendor', 'v')
      .select([
        'l.id', 'l.type', 'l.species', 'l.breed',
        'l.hookWeightKg', 'l.pricePerKg', 'l.totalPrice',
        'l.pickupProvince', 'l.deliveryAvailable',
        'l.images', 'l.status', 'l.expiresAt', 'l.createdAt',
        'v.id', 'v.businessName', 'v.province', 'v.isVerified',
        'v.avgRating', 'v.totalRatings',
      ])
      .where('l.status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('(l.expiresAt IS NULL OR l.expiresAt > NOW())');

    if (filters.species) qb.andWhere('l.species = :species', { species: filters.species });
    if (filters.type) qb.andWhere('l.type = :type', { type: filters.type });
    if (filters.province) qb.andWhere('l.pickupProvince ILIKE :prov', { prov: `%${filters.province}%` });
    if (filters.minPrice) qb.andWhere('l.pricePerKg >= :minP', { minP: filters.minPrice });
    if (filters.maxPrice) qb.andWhere('l.pricePerKg <= :maxP', { maxP: filters.maxPrice });
    if (filters.minWeight) qb.andWhere('l.hookWeightKg >= :minW', { minW: filters.minWeight });
    if (filters.onlyVerified) qb.andWhere('v.isVerified = true');

    return qb.orderBy('l.createdAt', 'DESC').getMany();
  }

  // ─────────────────────────────────────────────
  // READ — VENDOR'S OWN
  // ─────────────────────────────────────────────
  async findByVendor(vendorId: string): Promise<Listing[]> {
    return this.repo.find({
      where: { vendorId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─────────────────────────────────────────────
  // READ — SINGLE (public detail)
  // ─────────────────────────────────────────────
  async findOne(id: string): Promise<Listing> {
    const listing = await this.repo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!listing) throw new NotFoundException('Publicación no encontrada.');

    // increment view count silently
    void this.repo.increment({ id }, 'viewCount', 1);

    return listing;
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────
  async update(id: string, dto: Partial<CreateListingDto>, vendorId: string): Promise<Listing> {
    const listing = await this.findOneRaw(id);
    this.assertOwner(listing, vendorId);

    if (listing.status === ListingStatus.SOLD) {
      throw new BadRequestException('No podés editar una publicación ya vendida.');
    }

    if (dto.pricePerKg !== undefined || dto.hookWeightKg !== undefined) {
      const newPrice = dto.pricePerKg ?? listing.pricePerKg;
      const newWeight = dto.hookWeightKg ?? listing.hookWeightKg;
      listing.totalPrice = +(+newPrice * +newWeight).toFixed(2);
    }

    Object.assign(listing, dto);
    return this.repo.save(listing);
  }

  // ─────────────────────────────────────────────
  // INTERNAL: mark as reserved / sold
  // ─────────────────────────────────────────────
  async markReserved(id: string): Promise<void> {
    await this.repo.update(id, { status: ListingStatus.RESERVED });
  }

  async markSold(id: string): Promise<void> {
    await this.repo.update(id, { status: ListingStatus.SOLD });
  }

  async markActive(id: string): Promise<void> {
    await this.repo.update(id, { status: ListingStatus.ACTIVE });
  }

  // ─────────────────────────────────────────────
  // EXPIRE STALE LISTINGS (called by cron)
  // ─────────────────────────────────────────────
  async expireStale(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Listing)
      .set({ status: ListingStatus.EXPIRED })
      .where('status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('expiresAt IS NOT NULL')
      .andWhere('expiresAt < NOW()')
      .execute();
    return result.affected ?? 0;
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async findOneRaw(id: string): Promise<Listing> {
    const l = await this.repo.findOne({ where: { id } });
    if (!l) throw new NotFoundException('Publicación no encontrada.');
    return l;
  }

  private assertOwner(listing: Listing, vendorId: string): void {
    if (listing.vendorId !== vendorId) {
      throw new ForbiddenException('Esta publicación no es tuya.');
    }
  }
}
