import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TimescaleHypertable } from '../timescale-hypertable.decorator';

@TimescaleHypertable('created_at')
@Entity('arbitrage_spreads')
export class ArbitrageSpread {
  protected constructor() {}

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  exchangeFrom!: string;

  @Column({ type: 'varchar', length: 50 })
  exchangeTo!: string;

  @Column({ type: 'varchar', length: 50 })
  symbol!: string;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  spread!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  spreadPercent!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  spreadPercentFees!: number;

  @Column({ type: 'jsonb' })
  bids!: any[];

  @Column({ type: 'jsonb' })
  asks!: any[];

  @Column({ type: 'bigint', array: true })
  updateTimestamp!: number[];

  @Column({ type: 'bigint', array: true })
  timestampComputed!: number[];

  @Column({ type: 'bigint' })
  timestamp!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10, nullable: true })
  fundingRateFrom!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10, nullable: true })
  fundingRateTo!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  takerFeeFrom!: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  takerFeeTo!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
