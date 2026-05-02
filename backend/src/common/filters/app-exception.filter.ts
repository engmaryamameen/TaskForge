import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../../shared/errors';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      // Log metadata server-side for debugging — never send to client
      if (exception.metadata) {
        this.logger.warn(
          `${exception.code}: ${exception.message}`,
          { metadata: exception.metadata },
        );
      }

      return response.status(exception.statusCode).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
        },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json({
        success: false,
        error: {
          code: 'HTTP_ERROR',
          message: exception.message,
        },
      });
    }

    // Unexpected errors — log full details, return safe message
    // Nest's Logger + pino often omit `Error` as a second arg; log a string the host can index.
    const detail =
      exception instanceof Error
        ? `${exception.name}: ${exception.message}\n${exception.stack ?? ''}`
        : JSON.stringify(exception);
    this.logger.error(detail);

    return response.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}
