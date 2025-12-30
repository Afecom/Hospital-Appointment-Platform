import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { prisma } from './lib/prisma.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('/api/v1');
  app.enableCors({
    credentials: true,
    origin: [
      'http://192.168.1.2:3000',
      'http://192.168.1.101:3000',
      'http://localhost:3000',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
