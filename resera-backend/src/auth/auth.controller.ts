import {
  Controller, Post, Body, UseGuards,
  HttpCode, HttpStatus, Get, Patch,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiOkResponse, ApiCreatedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Registro público ──────────────────────────────────────────
  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar nueva cuenta (vendedor o comprador)' })
  @ApiCreatedResponse({ description: 'Cuenta creada. Pendiente de aprobación.' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  // ── Login con anti brute-force ────────────────────────────────
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({ description: 'Devuelve accessToken + refreshToken' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── Logout ────────────────────────────────────────────────────
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cerrar sesión (invalida el refresh token)' })
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  // ── Refresh Token Rotation ────────────────────────────────────
  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Renovar access token usando el refresh token' })
  refresh(@CurrentUser() user: User & { refreshToken: string }) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  // ── Perfil propio ─────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  me(@CurrentUser() user: User) {
    return this.authService.sanitize(user);
  }
}
