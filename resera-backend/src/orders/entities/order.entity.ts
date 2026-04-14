import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { OrderStatus } from '../../common/enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Partes ──────────────────────────────────────────────────
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  @Column({ name: 'vendor_id' })
  vendorId: string;

  @ManyToOne(() => Listing, { eager: false })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ name: 'listing_id' })
  listingId: string;

  // ── Montos ──────────────────────────────────────────────────
  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'seña_percent', type: 'smallint', default: 0 })
  señaPercent: number;              // 0 | 30 | 50

  @Column({ name: 'seña_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  señaAmount: number;

  // ── Estado ──────────────────────────────────────────────────
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_SEÑA })
  status: OrderStatus;

  // ── Mercado Pago ─────────────────────────────────────────────
  @Column({ name: 'mp_preference_id', type: 'varchar', nullable: true })
  mpPreferenceId: string | null;

  @Column({ name: 'mp_payment_id', type: 'varchar', nullable: true })
  mpPaymentId: string | null;

  @Column({ name: 'mp_init_point', type: 'varchar', nullable: true })
  mpInitPoint: string | null;

  // ── Timers ───────────────────────────────────────────────────
  /** El comprador tiene 24hs para pagar la seña */
  @Column({ name: 'seña_due_at', type: 'timestamptz', nullable: true })
  señaDueAt: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  // ── Notas ────────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
