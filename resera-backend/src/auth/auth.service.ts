import {
  Injectable, UnauthorizedException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../common/enums';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), ...tokens };
  }

  // ─────────────────────────────────────────────
  // LOGIN con protección anti brute-force
  // ─────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Siempre comparar para no dar timing attacks
    const dummyHash = '$2b$12$invalidhashforerror';
    const passwordToCompare = user ? user.password : dummyHash;
    const isMatch = await bcrypt.compare(dto.password, passwordToCompare);

    if (!user || !isMatch) {
      if (user) await this.handleFailedLogin(user);
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    // ── Check lockout ──
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Cuenta bloqueada temporalmente. Intentá de nuevo en ${minutesLeft} minuto(s).`,
      );
    }

    // ── Check account status ──
    this.checkAccountStatus(user);

    // ── Reset failed attempts ──
    await this.usersService.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), ...tokens };
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Sesión cerrada exitosamente.' };
  }

  // ─────────────────────────────────────────────
  // REFRESH TOKEN ROTATION
  // ─────────────────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Acceso denegado. Ingresá de nuevo.');
    }

    const isRefreshValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isRefreshValid) {
      // Possible token theft — invalidate all sessions
      await this.usersService.updateRefreshToken(userId, null);
      throw new ForbiddenException('Refresh token inválido. Todas las sesiones fueron cerradas por seguridad.');
    }

    this.checkAccountStatus(user);

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private checkAccountStatus(user: User) {
    const messages: Record<UserStatus, string> = {
      [UserStatus.SUSPENDED]: 'Tu cuenta está suspendida por deuda pendiente. Regularizá tu situación.',
      [UserStatus.BLOCKED]: 'Tu cuenta está bloqueada. Contactá al soporte de RESERA.',
      [UserStatus.PENDING]: 'Tu cuenta está pendiente de aprobación. Te avisaremos cuando sea activada.',
      [UserStatus.REJECTED]: 'Tu solicitud fue rechazada. Contactá al soporte para más información.',
      [UserStatus.ACTIVE]: '',
    };

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(messages[user.status] || 'Cuenta no disponible.');
    }
  }

  private async handleFailedLogin(user: User) {
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    const updates: Partial<User> = { failedLoginAttempts: attempts };

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      updates.failedLoginAttempts = 0;
    }

    await this.usersService.update(user.id, updates);
  }

  sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, mpAccessToken, failedLoginAttempts, lockedUntil, ...safe } = user as unknown as Record<string, unknown>;
    return safe;
  }
}
