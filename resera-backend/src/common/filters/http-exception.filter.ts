import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string | string[]) ?? exception.message;
        error = resp.error as string | undefined;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      // PostgreSQL / TypeORM DB errors — never expose details
      status = HttpStatus.CONFLICT;

      const driverError = (exception as QueryFailedError & { driverError?: { code?: string } })
        .driverError;
      if (driverError?.code === '23505') {
        message = 'Ya existe un registro con esos datos únicos.';
        error = 'Conflict';
      } else if (driverError?.code === '23503') {
        message = 'La operación viola una restricción de integridad referencial.';
        error = 'Foreign Key Violation';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error interno del servidor.';
        error = 'Database Error';
      }

      this.logger.error(
        `DB Error [${driverError?.code ?? 'unknown'}]: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor.';
      error = 'Internal Server Error';
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor.';
      error = 'Internal Server Error';
      this.logger.error('Unknown exception', String(exception));
    }

    const body: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(error && { error }),
    };

    response.status(status).json(body);
  }
}
