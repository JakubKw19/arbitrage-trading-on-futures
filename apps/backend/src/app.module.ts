import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketModule } from './market/market.module';
import { MarketRouter } from './market/market.router';
import { TRPCModule } from '@nexica/nestjs-trpc';
import { ConfigModule } from './config/config.module';
import { HistoricalDataModule } from './historical/historicalData.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '@repo/auth';
// import { RequestContextFactory } from './context';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    MarketModule,
    HistoricalDataModule,
    ConfigModule,
    TRPCModule.forRoot({
      outputPath: '../../packages/trpc/server/server.ts',
      // basePath: '/trpc',
      generateSchemas: true,
      websocket: { enabled: true, port: 5001, path: '/trpc' },
      driver: 'express',
      // context: RequestContextFactory,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
