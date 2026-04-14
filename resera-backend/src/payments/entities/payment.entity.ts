import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { MercadoPagoStatus } from '../../common/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { eager: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: string;

  // MP preference (creada al iniciar el pago)
  @Column({ name: 'mp_preference_id', type: 'varchar', nullable: true })
  mpPreferenceId: string | null;

  // MP payment_id (llega vía webhook)
  @Column({ name: 'mp_payment_id', type: 'varchar', nullable: true })
  mpPaymentId: string | null;

  @Column({ name: 'mp_merchant_order_id', type: 'varchar', nullable: true })
  mpMerchantOrderId: string | null;

  @Column({
    type: 'enum',
    enum: MercadoPagoStatus,
    default: MercadoPagoStatus.PENDING,
  })
  status: MercadoPagoStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency_id', type: 'varchar', default: 'ARS' })
  currencyId: string;

  /** URL de pago de MP (init_point) */
  @Column({ name: 'init_point', type: 'varchar', nullable: true })
  initPoint: string | null;

  /** Respuesta cruda del webhook para auditoría */
  @Column({ name: 'webhook_payload', type: 'jsonb', nullable: true })
  webhookPayload: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
