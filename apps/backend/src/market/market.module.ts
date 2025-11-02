import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { BinanceClient } from './BinanceClient';
import { OkxClient } from './OkxClient';
import { MarketGateway } from 'src/gateway/market.gateway';
import { MarketRouter } from './market.router';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [
    MarketService,
    MarketRouter,
    MarketGateway,
    BinanceClient,
    OkxClient,
  ],
  controllers: [MarketController],
  exports: [MarketRouter],
})
export class MarketModule {}
