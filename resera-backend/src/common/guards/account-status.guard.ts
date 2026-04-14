import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../enums';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip check for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    const user = request.user;

    // If no user (unauthenticated), let other guards handle it
    if (!user) return true;

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        'Tu cuenta está suspendida por deuda pendiente. Regularizá tu situación para continuar operando.',
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException(
        'Tu cuenta está bloqueada. Contactá al soporte de RESERA para más información.',
      );
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException(
        'Tu cuenta está pendiente de aprobación. Te notificaremos cuando sea activada.',
      );
    }

    if (user.status === UserStatus.REJECTED) {
      throw new ForbiddenException(
        'Tu solicitud de cuenta fue rechazada. Contactá al soporte para más información.',
      );
    }

    return true;
  }
}
