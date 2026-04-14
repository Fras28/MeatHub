import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreEvent } from './entities/score-event.entity';
import { UsersService } from '../users/users.service';
import { ScoreEventType, ScoreCategory } from '../common/enums';

// ─── Puntos por evento ────────────────────────────────────────────────────────
const SCORE_DELTAS: Record<ScoreEventType, number> = {
  [ScoreEventType.PAYMENT_ON_TIME]:    +5,
  [ScoreEventType.PAYMENT_LATE_1_3]:   -8,
  [ScoreEventType.PAYMENT_LATE_4_7]:  -15,
  [ScoreEventType.PAYMENT_VERY_LATE]: -25,
  [ScoreEventType.ORDER_COMPLETED]:    +3,
  [ScoreEventType.POSITIVE_RATING]:    +5,
  [ScoreEventType.NEGATIVE_RATING]:   -10,
  [ScoreEventType.ACCOUNT_SUSPENDED]: -20,
  [ScoreEventType.DISPUTE_LOST]:      -15,
  [ScoreEventType.DISPUTE_WON]:        +5,
  [ScoreEventType.MANUAL_ADJUSTMENT]:   0,   // admin define el delta manualmente
};

// ─── Tabla de señas ───────────────────────────────────────────────────────────
export interface SeñaResult {
  score: number;
  category: ScoreCategory;
  señaPercent: number;         // 0 | 30 | 50
  señaAmount: number;          // monto en pesos
  autoReject: boolean;         // score < 20 → rechazar automáticamente
}

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(ScoreEvent)
    private readonly eventsRepo: Repository<ScoreEvent>,
    private readonly usersService: UsersService,
  ) {}

  // ─────────────────────────────────────────────
  // APPLY EVENT
  // ─────────────────────────────────────────────
  async applyEvent(
    buyerId: string,
    type: ScoreEventType,
    orderId?: string,
    triggeredBy?: string,
    notes?: string,
  ): Promise<ScoreEvent> {
    const user = await this.usersService.findOne(buyerId);
    if (!user) throw new NotFoundException('Comprador no encontrado.');

    const scoreBefore = user.creditScore;
    const delta = SCORE_DELTAS[type];
    const scoreAfter = Math.min(100, Math.max(0, scoreBefore + delta));

    // Persiste el evento
    const event = this.eventsRepo.create({
      buyerId,
      type,
      pointsDelta: delta,
      scoreBefore,
      scoreAfter,
      orderId:     orderId     ?? null,
      triggeredBy: triggeredBy ?? null,
      notes:       notes       ?? null,
    });
    await this.eventsRepo.save(event);

    // Actualiza el score del usuario
    await this.usersService.updateCreditScore(buyerId, scoreAfter);

    return event;
  }

  // ─────────────────────────────────────────────
  // CALCULATE SEÑA
  // ─────────────────────────────────────────────
  calculateSeña(buyerScore: number, totalAmount: number): SeñaResult {
    const category = this.getCategory(buyerScore);

    let señaPercent: number;
    let autoReject = false;

    if (buyerScore >= 80) {
      señaPercent = 0;
    } else if (buyerScore >= 40) {
      señaPercent = 30;
    } else if (buyerScore >= 20) {
      señaPercent = 50;
    } else {
      señaPercent = 50;
      autoReject = true;
    }

    const señaAmount = +(totalAmount * señaPercent / 100).toFixed(2);

    return { score: buyerScore, category, señaPercent, señaAmount, autoReject };
  }

  // ─────────────────────────────────────────────
  // GET HISTORY
  // ─────────────────────────────────────────────
  async getHistory(
    buyerId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ events: ScoreEvent[]; total: number }> {
    const [events, total] = await this.eventsRepo.findAndCount({
      where: { buyerId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { events, total };
  }

  // ─────────────────────────────────────────────
  // GET SCORE INFO
  // ─────────────────────────────────────────────
  async getScoreInfo(buyerId: string): Promise<{
    score: number;
    category: ScoreCategory;
    señaTier: { percent: number; label: string };
  }> {
    const user = await this.usersService.findOne(buyerId);
    if (!user) throw new NotFoundException('Comprador no encontrado.');

    const score = user.creditScore;
    const category = this.getCategory(score);
    const señaTier = this.getSeñaTierLabel(score);

    return { score, category, señaTier };
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private getCategory(score: number): ScoreCategory {
    if (score >= 80) return ScoreCategory.EXCELLENT;
    if (score >= 40) return ScoreCategory.REGULAR;
    return ScoreCategory.RISKY;
  }

  private getSeñaTierLabel(score: number): { percent: number; label: string } {
    if (score >= 80) return { percent: 0,  label: 'Sin seña (crédito excelente)' };
    if (score >= 40) return { percent: 30, label: '30% de seña requerido' };
    return               { percent: 50, label: '50% de seña requerido (riesgo alto)' };
  }
}
