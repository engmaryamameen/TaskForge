import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  /** Upstash / Redis Cloud TLS — set REDIS_TLS=true */
  tls: process.env.REDIS_TLS === 'true',
}));
