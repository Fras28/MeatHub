import {
  Injectable, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UsersService } from '../users/users.service';
import { ScoringService } from '../scoring/scoring.service';
import { ScoreEventType, UserRole } from '../common/enums';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly repo: Repository<Rating>,
    private readonly usersService: UsersService,
    private readonly scoringService: ScoringService,
  ) {}

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  async create(reviewerId: string, dto: CreateRatingDto): Promise<Rating> {
    // Un usuario no puede calificarse a sí mismo
    if (reviewerId === dto.reviewedId) {
      throw new BadRequestException('No podés calificarte a vos mismo.');
    }

    // Verificar que no haya calificado este pedido en esta dirección antes
    const existing = await this.repo.findOne({
      where: {
        orderId: dto.orderId,
        reviewerId,
        reviewedId: dto.reviewedId,
      },
    });
    if (existing) {
      throw new ConflictException('Ya calificaste a este usuario para este pedido.');
    }

    const rating = this.repo.create({
      reviewerId,
      reviewedId: dto.reviewedId,
      orderId: dto.orderId,
      stars: dto.stars,
      comment: dto.comment ?? null,
    });
    await this.repo.save(rating);

    // Actualizar promedio del usuario calificado
    await this.updateUserAvgRating(dto.reviewedId);

    // Si el calificado es un comprador, afectar su score crediticio
    const reviewed = await this.usersService.findOne(dto.reviewedId);
    if (reviewed.role === UserRole.BUYER) {
      const scoreType = dto.stars >= 4
        ? ScoreEventType.POSITIVE_RATING
        : ScoreEventType.NEGATIVE_RATING;
      await this.scoringService.applyEvent(
        dto.reviewedId,
        scoreType,
        dto.orderId,
        reviewerId,
        `Rating ${dto.stars}★ — ${dto.comment ?? ''}`.trim(),
      );
    }

    return rating;
  }

  // ─────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────
  async findByUser(userId: string): Promise<Rating[]> {
    return this.repo.find({
      where: { reviewedId: userId },
      order: { createdAt: 'DESC' },
      relations: ['reviewer'],
    });
  }

  async findByReviewer(reviewerId: string): Promise<Rating[]> {
    return this.repo.find({
      where: { reviewerId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async updateUserAvgRating(userId: string): Promise<void> {
    const result = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.stars)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.reviewed_id = :userId', { userId })
      .getRawOne<{ avg: string; count: string }>();

    const avg = parseFloat(result?.avg ?? '0');
    const count = parseInt(result?.count ?? '0', 10);

    await this.usersService.update(userId, {
      avgRating: +avg.toFixed(2),
      totalRatings: count,
    });
  }
}
