import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { BinanceClient } from './BinanceClient';
import { OkxClient } from './OkxClient';
import { MarketGateway } from 'src/gateway/market.gateway';

@Module({
  providers: [MarketService, MarketGateway, BinanceClient, OkxClient],
  controllers: [MarketController],
})
export class MarketModule {}
