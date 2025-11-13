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
import { AuthController } from './auth/auth.controller';
import { UserController } from './users/user.controller';
// import { RequestContextFactory } from './context';
import { CredentialsModule } from './credentials/credentials.module';
import { AuthContextFactory } from './app.context';

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
      context: AuthContextFactory,
    }),
    CredentialsModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, AuthContextFactory],
})
export class AppModule {}
