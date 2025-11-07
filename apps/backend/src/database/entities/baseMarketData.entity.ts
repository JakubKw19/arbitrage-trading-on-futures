import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Index(['symbol', 'exchange', 'timestamp'])
export abstract class BaseMarketData {
  protected constructor(exchange: string) {
    this.exchange = exchange;
  }

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  exchange: string;

  @Column({ type: 'varchar', length: 50 })
  symbol!: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  volume!: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  bid?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  ask?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  bidVolume?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  askVolume?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp!: Date;
}
