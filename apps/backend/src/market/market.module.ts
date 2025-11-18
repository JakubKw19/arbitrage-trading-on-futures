import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { BinanceClient } from './BinanceClient';
import { OkxClient } from './OkxClient';
import { MarketRouter } from './market.router';
import { ConfigModule } from '../config/config.module';
import { MexcClient } from './MexcClient';

@Module({
  imports: [ConfigModule],
  providers: [
    MarketService,
    MarketRouter,
    BinanceClient,
    OkxClient,
    MexcClient,
  ],
  controllers: [MarketController],
  exports: [MarketRouter],
})
export class MarketModule {}
