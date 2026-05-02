import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { getPostgresSslConfig } from '../../config/db-ssl';

const ssl = getPostgresSslConfig();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'taskforge',
  ...(ssl ? { ssl } : {}),
  entities: [path.join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
});
