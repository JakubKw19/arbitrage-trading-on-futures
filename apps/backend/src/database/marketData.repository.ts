// import { Injectable } from '@nestjs/common';
// import { Repository, Between } from 'typeorm';
// import { BaseMarketData } from './entities/ArbitrageSpread.entity';

// @Injectable()
// export abstract class MarketDataRepository {
//   private readonly repository: Repository<BaseMarketData>;

//   constructor(repository: Repository<BaseMarketData>) {
//     this.repository = repository;
//   }

//   async create(data: Partial<BaseMarketData>): Promise<BaseMarketData> {
//     const marketData = this.repository.create(data);
//     return this.repository.save(marketData);
//   }

//   async bulkCreate(data: Partial<BaseMarketData>[]): Promise<BaseMarketData[]> {
//     const marketDataArray = this.repository.create(data);
//     return this.repository.save(marketDataArray);
//   }

//   async findByTimeRange(
//     symbol: string,
//     exchange: string,
//     startTime: Date,
//     endTime: Date,
//   ): Promise<BaseMarketData[]> {
//     return this.repository.find({
//       where: {
//         symbol,
//         exchange,
//         timestamp: Between(startTime, endTime),
//       },
//       order: { timestamp: 'ASC' },
//     });
//   }

//   async getAggregatedData(
//     symbol: string,
//     exchange: string,
//     interval = '1 minute',
//     startTime: Date,
//     endTime: Date,
//   ): Promise<any[]> {
//     return this.repository.query(
//       `
//       SELECT
//         time_bucket($1, timestamp) AS bucket,
//         symbol,
//         exchange,
//         AVG(price::numeric) as avg_price,
//         MAX(price::numeric) as max_price,
//         MIN(price::numeric) as min_price,
//         SUM(volume::numeric) as total_volume,
//         COUNT(*) as data_points
//       FROM market_data
//       WHERE symbol = $2
//         AND exchange = $3
//         AND timestamp BETWEEN $4 AND $5
//       GROUP BY bucket, symbol, exchange
//       ORDER BY bucket DESC
//     `,
//       [interval, symbol, exchange, startTime, endTime],
//     );
//   }
// }
