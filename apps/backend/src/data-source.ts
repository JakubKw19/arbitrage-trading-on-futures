import { DataSource } from 'typeorm';
import { ArbitrageSpread } from './database/entities/ArbitrageSpread.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt('5433', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'arbitrage_timescale',
  synchronize: false,
  logging: true,
  entities: [ArbitrageSpread],
  migrations: ['./migrations/*.ts'],
});
