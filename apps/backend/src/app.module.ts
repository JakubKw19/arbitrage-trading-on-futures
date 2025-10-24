import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketModule } from './market/market.module';
import { MarketRouter } from './market/market.router';
import { TRPCModule } from '@nexica/nestjs-trpc';
// import { RequestContextFactory } from './context';

@Module({
  imports: [
    MarketModule,
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
