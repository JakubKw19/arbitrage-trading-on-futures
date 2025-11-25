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
  kraken: {
    wsUrl: string;
    restUrl: string;
    reconnectDelay: number;
    maxReconnectAttempts: number;
    pingInterval: number;
  };
  mexc: {
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
  staleDataThreshold: number;
  messageThrottleMs: number;
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
        kraken: {
          wsUrl: 'wss://ws.kraken.com/v2',
          restUrl: 'https://www.kraken.com',
          reconnectDelay: 5000,
          maxReconnectAttempts: 10,
          pingInterval: 30000,
        },
        mexc: {
          wsUrl: 'wss://contract.mexc.com/edge',
          restUrl: 'https://contract.mexc.com',
          reconnectDelay: 5000,
          maxReconnectAttempts: 10,
          pingInterval: 20000,
        },
      },
      dataFlow: {
        throttleInterval: 200,
        batchSize: 10,
        maxQueueSize: 1000,
        staleDataThreshold: 60000,
        messageThrottleMs: 10,
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'arbitrage_timescale',
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
