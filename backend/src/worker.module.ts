import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import {
  databaseConfig,
  redisConfig,
  authConfig,
  billingConfig,
  envValidationSchema,
} from './config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis';
import { QueueWorkerModule } from './infrastructure/queue';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, authConfig, billingConfig],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        autoLogging: false,
      },
    }),

    DatabaseModule,

    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    RedisModule,

    QueueWorkerModule,
  ],
})
export class WorkerModule {}
