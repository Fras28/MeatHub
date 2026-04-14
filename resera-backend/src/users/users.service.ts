import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserStatus } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  async create(dto: CreateUserDto): Promise<User> {
    const [existingEmail, existingCuit] = await Promise.all([
      this.repo.findOne({ where: { email: dto.email } }),
      this.repo.findOne({ where: { cuit: dto.cuit } }),
    ]);

    if (existingEmail) throw new ConflictException('Ya existe una cuenta con ese email.');
    if (existingCuit) throw new ConflictException('Ya existe una cuenta con ese CUIT.');

    const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);
    const hashedPassword = await bcrypt.hash(dto.password, rounds);

    // Vendors start PENDING (need admin approval); buyers start PENDING too
    const user = this.repo.create({
      ...dto,
      password: hashedPassword,
      status: UserStatus.PENDING,
      creditScore: dto.role === UserRole.BUYER ? 50 : 0,
    });

    return this.repo.save(user);
  }

  // ─────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────
  async findAll(filters?: { role?: UserRole; status?: UserStatus }): Promise<User[]> {
    const qb = this.repo.createQueryBuilder('u').select([
      'u.id', 'u.businessName', 'u.cuit', 'u.email', 'u.role',
      'u.status', 'u.city', 'u.province', 'u.creditScore',
      'u.avgRating', 'u.totalOperations', 'u.isVerified', 'u.createdAt',
    ]);
    if (filters?.role) qb.andWhere('u.role = :role', { role: filters.role });
    if (filters?.status) qb.andWhere('u.status = :status', { status: filters.status });
    return qb.orderBy('u.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado.`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  // ─────────────────────────────────────────────
  // PUBLIC PROFILE (safe fields only)
  // ─────────────────────────────────────────────
  async getPublicProfile(id: string) {
    const user = await this.repo.findOne({
      where: { id },
      select: [
        'id', 'businessName', 'city', 'province', 'role',
        'status', 'isVerified', 'avgRating', 'totalRatings',
        'totalOperations', 'avatarUrl', 'senasaLicense', 'createdAt',
      ],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return user;
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────
  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, data);
    return this.repo.save(user);
  }

  async updateCreditScore(id: string, score: number): Promise<void> {
    await this.repo.update(id, { creditScore: score });
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    if (token === null) {
      await this.repo.update(id, { refreshToken: undefined });
      return;
    }
    const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);
    const hashed = await bcrypt.hash(token, rounds);
    await this.repo.update(id, { refreshToken: hashed });
  }

  // ─────────────────────────────────────────────
  // ADMIN ACTIONS
  // ─────────────────────────────────────────────
  async approve(id: string): Promise<User> {
    return this.update(id, { status: UserStatus.ACTIVE });
  }

  async suspend(id: string, notes?: string): Promise<User> {
    return this.update(id, { status: UserStatus.SUSPENDED, notes: notes ?? null });
  }

  async block(id: string, notes?: string): Promise<User> {
    return this.update(id, { status: UserStatus.BLOCKED, notes: notes ?? null });
  }

  async reject(id: string, notes?: string): Promise<User> {
    return this.update(id, { status: UserStatus.REJECTED, notes: notes ?? null });
  }

  async reactivate(id: string): Promise<User> {
    return this.update(id, { status: UserStatus.ACTIVE });
  }

  // ─────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────
  async getPlatformStats() {
    const raw = await this.repo
      .createQueryBuilder('u')
      .select([
        'u.role AS role',
        'u.status AS status',
        'COUNT(*) AS count',
      ])
      .groupBy('u.role, u.status')
      .getRawMany<{ role: string; status: string; count: string }>();

    return raw.reduce(
      (acc, r) => {
        const key = `${r.role}_${r.status}`;
        acc[key] = parseInt(r.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
