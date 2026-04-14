import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  AnimalSpecies, AnimalBreed, ListingType, ListingStatus,
} from '../../common/enums';

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Relación con vendedor ────────────────────
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  @Column({ name: 'vendor_id' })
  vendorId: string;

  // ── Tipo y especie ───────────────────────────
  @Column({ type: 'enum', enum: ListingType })
  type: ListingType;

  @Column({ type: 'enum', enum: AnimalSpecies })
  species: AnimalSpecies;

  @Column({ type: 'enum', enum: AnimalBreed, default: AnimalBreed.OTHER, nullable: true })
  breed: AnimalBreed | null;

  // ── Datos del animal ─────────────────────────
  @Column({ name: 'live_weight_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  liveWeightKg: number | null;

  @Column({ name: 'hook_weight_kg', type: 'decimal', precision: 8, scale: 2 })
  hookWeightKg: number;

  @Column({ name: 'price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  pricePerKg: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  // ── Info ────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'origin_farm', type: 'varchar', nullable: true })
  originFarm: string | null;

  @Column({ name: 'origin_province', type: 'varchar', nullable: true })
  originProvince: string | null;

  @Column({ name: 'slaughter_date', type: 'date', nullable: true })
  slaughterDate: Date | null;

  @Column({ name: 'images', type: 'json', default: [] })
  images: string[];

  // ── Lugar de retiro/entrega ──────────────────
  @Column({ name: 'pickup_address', type: 'varchar', nullable: true })
  pickupAddress: string | null;

  @Column({ name: 'pickup_city', type: 'varchar', nullable: true })
  pickupCity: string | null;

  @Column({ name: 'pickup_province', type: 'varchar', nullable: true })
  pickupProvince: string | null;

  @Column({ name: 'delivery_available', default: false })
  deliveryAvailable: boolean;

  // ── Estado ───────────────────────────────────
  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.DRAFT })
  status: ListingStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'special_conditions', type: 'text', nullable: true })
  specialConditions: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
