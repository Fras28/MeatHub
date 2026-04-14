import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ScoreEventType } from '../../common/enums';

@Entity('score_events')
export class ScoreEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ type: 'enum', enum: ScoreEventType })
  type: ScoreEventType;

  @Column({ name: 'points_delta', type: 'int' })
  pointsDelta: number;           // +5, -8, etc.

  @Column({ name: 'score_before', type: 'int' })
  scoreBefore: number;

  @Column({ name: 'score_after', type: 'int' })
  scoreAfter: number;

  @Column({ name: 'order_id', type: 'varchar', nullable: true })
  orderId: string | null;        // referencia al pedido que disparó el evento

  @Column({ name: 'triggered_by', type: 'varchar', nullable: true })
  triggeredBy: string | null;    // userId del vendedor o 'system'

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
