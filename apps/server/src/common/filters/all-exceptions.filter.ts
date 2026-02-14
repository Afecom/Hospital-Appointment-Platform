import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    try {
      const status =
        exception instanceof HttpException ? exception.getStatus() : 500;
      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : String(exception);

      // Log rich debugging info to help trace auth/guard failures
      console.error('[Exception]', {
        status,
        message,
        path: req?.originalUrl || req?.url,
        method: req?.method,
        headers: req?.headers && {
          // avoid logging sensitive headers fully
          authorization: req.headers.authorization,
          cookie: req.headers.cookie ? '[present]' : '[none]',
        },
      });
    } catch (e) {
      console.error('[Exception] failed to log details', e);
    }

    if (res && exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      res.status(status).json(body as any);
      return;
    }

    if (res) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
