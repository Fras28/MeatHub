import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') ?? '';
    const userId = (request as Request & { user?: { id?: string } }).user?.id ?? 'anon';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<{ statusCode: number }>();
        const { statusCode } = response;
        const elapsed = Date.now() - now;
        this.logger.log(
          `${method} ${url} ${statusCode} +${elapsed}ms [uid:${userId}] [ip:${ip}] [ua:${userAgent.substring(0, 60)}]`,
        );
      }),
      catchError((err: unknown) => {
        const elapsed = Date.now() - now;
        const status =
          typeof err === 'object' && err !== null && 'status' in err
            ? (err as { status: number }).status
            : 500;
        this.logger.error(
          `${method} ${url} ${status} +${elapsed}ms [uid:${userId}] [ip:${ip}]`,
        );
        return throwError(() => err);
      }),
    );
  }
}
