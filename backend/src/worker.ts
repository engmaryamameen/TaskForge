import './telemetry';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const logger = app.get(Logger);
  logger.log('Worker process started — listening for jobs');

  process.on('SIGTERM', () => logger.log('SIGTERM received'));
  process.on('SIGINT', () => logger.log('SIGINT received'));
}

bootstrap();
