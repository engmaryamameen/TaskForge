import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

import { AppModule } from '../../src/app.module';
import { REDIS_CLIENT } from '../../src/infrastructure/redis/redis.module';
import { AppExceptionFilter } from '../../src/common/filters/app-exception.filter';
import { ResponseTransformInterceptor } from '../../src/common/interceptors/response-transform.interceptor';
import { API_PREFIX } from '../../src/shared/constants';

export interface TestContext {
  app: INestApplication;
  module: TestingModule;
  dataSource: DataSource;
  redis: Redis;
}

/**
 * Creates a fully bootstrapped NestJS application for E2E testing.
 * Uses the REAL AppModule to ensure we test actual guard chains, middleware,
 * and DI wiring — not a stripped-down mock that could miss issues.
 */
export async function createTestApp(): Promise<TestContext> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication({ rawBody: true });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  await app.init();

  const dataSource = module.get(DataSource);
  const redis = module.get<Redis>(REDIS_CLIENT);

  return { app, module, dataSource, redis };
}

/**
 * Truncates all application tables between tests for isolation.
 * Preserves schema/migrations — only clears data.
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;
  const tableNames = entities
    .map((e) => `"${e.tableName}"`)
    .join(', ');

  if (tableNames.length > 0) {
    await dataSource.query(`TRUNCATE TABLE ${tableNames} CASCADE`);
  }
}

/**
 * Flushes all Redis keys for test isolation.
 */
export async function cleanRedis(redis: Redis): Promise<void> {
  await redis.flushdb();
}

/**
 * Full cleanup: database + redis.
 */
export async function cleanAll(ctx: TestContext): Promise<void> {
  await Promise.all([cleanDatabase(ctx.dataSource), cleanRedis(ctx.redis)]);
}

/**
 * Graceful shutdown of the test application.
 */
export async function destroyTestApp(ctx: TestContext): Promise<void> {
  await ctx.app.close();
}
