import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /** Map a Prisma known-request error to a clean HTTP status + client-safe message. */
  private mapPrisma(e: Prisma.PrismaClientKnownRequestError): {
    status: number;
    error: string;
    message: string;
  } {
    switch (e.code) {
      case 'P2002':
        return { status: HttpStatus.CONFLICT, error: 'Conflict', message: 'This already exists' };
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, error: 'NotFound', message: 'Resource not found' };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'BadRequest',
          message: 'Invalid reference',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'InternalServerError',
          message: 'Internal server error',
        };
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string | string[]) ?? exception.message;
        error = (r.error as string) ?? exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Map DB errors to proper codes; never surface raw Prisma internals.
      const mapped = this.mapPrisma(exception);
      status = mapped.status;
      error = mapped.error;
      message = mapped.message;
      this.logger.error(`Prisma ${exception.code} on ${request.method} ${request.url}: ${exception.message}`);
    } else if (exception instanceof Error) {
      // Always log the real error; only reveal it to the client outside production.
      this.logger.error(exception.message, exception.stack);
      if (process.env.NODE_ENV !== 'production') message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} -> ${status}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
