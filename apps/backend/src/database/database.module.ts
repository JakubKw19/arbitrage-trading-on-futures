import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { BinanceMarketData } from './entities/binanceMarketData.entity';
import { OkxMarketData } from './entities/okxMarketData.entity';
// import { MarketData } from "./entities/market-data.entity"
// import { ArbitrageOpportunity } from "./entities/arbitrage-opportunity.entity"

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.database.host,
        port: configService.database.port,
        username: configService.database.username,
        password: configService.database.password,
        database: configService.database.name,
        entities: [BinanceMarketData, OkxMarketData],
      }),
    }),
    TypeOrmModule.forFeature([BinanceMarketData, OkxMarketData]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
