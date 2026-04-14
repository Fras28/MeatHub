import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole, UserStatus } from '../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Rol y estado ────────────────────────────
  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  // ── Datos del negocio ───────────────────────
  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ unique: true })
  cuit: string;

  @Column({ type: 'varchar', nullable: true })
  rubro: string;

  // ── Contacto ────────────────────────────────
  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ name: 'contact_name', type: 'varchar', nullable: true })
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  province: string;

  @Column({ name: 'postal_code', type: 'varchar', nullable: true })
  postalCode: string;

  // ── Auth ─────────────────────────────────────
  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  @Exclude()
  refreshToken: string | null;

  // ── Scoring (sólo BUYER) ────────────────────
  @Column({ name: 'credit_score', type: 'int', default: 50 })
  creditScore: number;

  // ── Crédito ──────────────────────────────────
  @Column({ name: 'credit_limit', type: 'decimal', precision: 12, scale: 2, default: 0 })
  creditLimit: number;

  // ── Mercado Pago ─────────────────────────────
  @Column({ name: 'mp_access_token', type: 'varchar', nullable: true })
  @Exclude()
  mpAccessToken: string | null;

  @Column({ name: 'mp_user_id', type: 'varchar', nullable: true })
  mpUserId: string | null;

  // ── Vendor-specific ──────────────────────────
  @Column({ name: 'senasa_license', type: 'varchar', nullable: true })
  senasaLicense: string | null;

  @Column({ name: 'municipal_license', type: 'varchar', nullable: true })
  municipalLicense: string | null;

  @Column({ name: 'weekly_capacity_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  weeklyCapacityKg: number | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  // ── Avatar/Logo ───────────────────────────────
  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  // ── Métricas públicas ─────────────────────────
  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @Column({ name: 'total_operations', type: 'int', default: 0 })
  totalOperations: number;

  // ── Seguridad ─────────────────────────────────
  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  @Exclude()
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  @Exclude()
  lockedUntil: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
