import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
// import { BinanceMarketData } from './entities/binanceMarketData.entity';
// import { OkxMarketData } from './entities/okxMarketData.entity';
import { ArbitrageSpread } from './entities/ArbitrageSpread.entity';
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
        synchronize: false,
        migrations: ['/migrations/*.ts'],
        entities: [ArbitrageSpread],
      }),
    }),
    TypeOrmModule.forFeature([ArbitrageSpread]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
