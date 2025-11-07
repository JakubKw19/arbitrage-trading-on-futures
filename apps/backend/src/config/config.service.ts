import { Injectable } from '@nestjs/common';

export interface AppConfig {
  port: number;
  corsOrigin: string;
  environment: 'development' | 'production' | 'test';
}

export interface ExchangeConfig {
  binance: {
    wsUrl: string;
    restUrl: string;
    reconnectDelay: number;
    maxReconnectAttempts: number;
    pingInterval: number;
  };
  okx: {
    wsUrl: string;
    restUrl: string;
    reconnectDelay: number;
    maxReconnectAttempts: number;
    pingInterval: number;
  };
}

export interface DataFlowConfig {
  throttleInterval: number;
  batchSize: number;
  maxQueueSize: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

@Injectable()
export class ConfigService {
  private readonly config: {
    app: AppConfig;
    exchanges: ExchangeConfig;
    dataFlow: DataFlowConfig;
    database: DatabaseConfig;
  };

  constructor() {
    this.config = {
      app: {
        port: Number.parseInt(process.env.PORT || '5000', 10),
        corsOrigin: process.env.CORS_ORIGIN || '*',
        environment: (process.env.NODE_ENV as any) || 'development',
      },
      exchanges: {
        binance: {
          wsUrl: 'wss://fstream.binance.com',
          restUrl: 'https://fapi.binance.com',
          reconnectDelay: 5000,
          maxReconnectAttempts: 10,
          pingInterval: 30000,
        },
        okx: {
          wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
          restUrl: 'https://www.okx.com',
          reconnectDelay: 5000,
          maxReconnectAttempts: 10,
          pingInterval: 30000,
        },
      },
      dataFlow: {
        throttleInterval: 100,
        batchSize: 10,
        maxQueueSize: 1000,
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_POSTGRES || 'postgres',
        name: process.env.DB_NAME || 'arbitrage',
      },
    };
  }

  get app(): AppConfig {
    return this.config.app;
  }

  get exchanges(): ExchangeConfig {
    return this.config.exchanges;
  }

  get dataFlow(): DataFlowConfig {
    return this.config.dataFlow;
  }

  get database(): DatabaseConfig {
    return this.config.database;
  }
}
