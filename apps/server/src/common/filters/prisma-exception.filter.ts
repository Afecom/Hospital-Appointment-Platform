import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@hap/prisma';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Unique constraint failed: ${exception.meta?.target}`;
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `Foreign key constraint failed: ${exception.meta?.field_name}`;
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: 'PrismaError',
    });
  }
}
