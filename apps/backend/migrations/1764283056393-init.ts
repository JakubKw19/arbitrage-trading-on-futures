import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1764283056393 implements MigrationInterface {
  name = 'Init1764283056393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "arbitrage_spreads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "exchangeFrom" character varying(50) NOT NULL,
        "exchangeTo" character varying(50) NOT NULL,
        "symbol" character varying(50) NOT NULL,
        "spread" numeric(20,10) NOT NULL,
        "quantity" numeric(20,10) NOT NULL,
        "spreadPercent" numeric(20,10) NOT NULL,
        "spreadPercentFees" numeric(20,10) NOT NULL,
        "bids" jsonb NOT NULL,
        "asks" jsonb NOT NULL,
        "updateTimestamp" bigint array NOT NULL,
        "timestampComputed" bigint array NOT NULL,
        "timestamp" bigint NOT NULL,
        "fundingRateFrom" numeric(20,10),
        "fundingRateTo" numeric(20,10),
        "takerFeeFrom" numeric(20,10) NOT NULL,
        "takerFeeTo" numeric(20,10) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_arbitrage_spreads_id" PRIMARY KEY ("id", "createdAt")
      )
    `);

    await queryRunner.query(`
      SELECT create_hypertable('arbitrage_spreads', 'createdAt', if_not_exists => TRUE);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "arbitrage_spreads"`);
  }
}
