import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ratings')
@Check('"reviewer_id" != "reviewed_id"')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Quién califica
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ name: 'reviewer_id' })
  reviewerId: string;

  // A quién califica
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'reviewed_id' })
  reviewed: User;

  @Column({ name: 'reviewed_id' })
  reviewedId: string;

  // Pedido asociado (una calificación por pedido por dirección)
  @Column({ name: 'order_id' })
  orderId: string;

  // 1 a 5 estrellas
  @Column({ type: 'smallint' })
  stars: number;           // 1–5

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
