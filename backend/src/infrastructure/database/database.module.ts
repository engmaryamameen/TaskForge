import { Module } from '@nestjs/common';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const ssl = config.get<{ rejectUnauthorized: boolean } | undefined>('database.ssl');
        const base: TypeOrmModuleOptions = {
          type: 'postgres',
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
          autoLoadEntities: true,
          synchronize: false,
          logging: process.env.NODE_ENV === 'development',
        };
        return ssl ? { ...base, ssl } : base;
      },
    }),
  ],
})
export class DatabaseModule {}
