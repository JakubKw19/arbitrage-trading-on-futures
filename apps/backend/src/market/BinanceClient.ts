import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import type WebSocket from 'ws';
import type {
  AvailableExchanges,
  MarketExchange,
} from './types/marketExchanges';
import {
  addExchange,
  getAvailableExchanges,
  marketExchangesSubject,
  updatePairExchange,
} from './market.pubsub';
import type {
  BinanceExchangeInfo,
  BinanceDepthUpdate,
} from './types/api-responses';
import { ConfigService } from '../config/config.service';
import { MarketClient } from './MarketClient.base';
import { GetSupportedExchangesDataInput } from './market.router';

@Injectable()
export class BinanceClient
  extends MarketClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    super(configService, 'binance');
  }

  async getAllTrades() {
    try {
      console.log(
        `${this.configService.exchanges.binance.restUrl}/fapi/v1/exchangeInfo`,
      );
      const res = await fetch(
        `${this.configService.exchanges.binance.restUrl}/fapi/v1/exchangeInfo`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch exchange info: ${res.statusText}`);
      }
      const data: BinanceExchangeInfo = await res.json();
      const symbols = data.symbols
        .filter((s) => s.status === 'TRADING')
        .map((s) => s.symbol.toLowerCase());
      const params = symbols.map((symbol) => `${symbol}@depth5`);

      addExchange({
        name: 'binance',
        cryptoPairs: data.symbols.map((s) => {
          return {
            pair: s.baseAsset + '-' + s.quoteAsset,
            pairCode: s.symbol.toLowerCase(),
          };
        }),
      });

      console.log(`Loaded ${symbols.length} trading pairs`, {
        exchange: 'binance',
      });
      return params;
    } catch (error) {
      console.error('Failed to fetch trading pairs', (error as Error).message, {
        exchange: 'binance',
      });
      throw error;
    }
  }

  protected handleMessage(msg: WebSocket.Data) {
    try {
      const json: BinanceDepthUpdate = JSON.parse(msg.toString());

      if (!json.s || !json.b || !json.a) {
        return;
      }

      const dataToSend: MarketExchange = {
        exchange: 'binance',
        symbol: json.s,
        bids: json.b.map((bid: [string, string]) => ({
          price: Number.parseFloat(bid[0]),
          quantity: Number.parseFloat(bid[1]),
        })),
        asks: json.a.map((ask: [string, string]) => ({
          price: Number.parseFloat(ask[0]),
          quantity: Number.parseFloat(ask[1]),
        })),
        timestamp: Date.now(),
      };
      updatePairExchange(dataToSend);
    } catch (error) {
      console.error('Failed to parse message', (error as Error).message, {
        exchange: 'binance',
      });
    }
  }

  protected subscribe(params: string[]) {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot subscribe: not connected', { exchange: 'binance' });
      return;
    }

    const BATCH_SIZE = 50;
    const batches: string[][] = [];

    for (let i = 0; i < params.length; i += BATCH_SIZE) {
      batches.push(params.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `Subscribing to ${params.length} streams in ${batches.length} batches`,
      { exchange: 'binance' },
    );

    batches.forEach((batch, index) => {
      setTimeout(() => {
        if (this.client && this.isConnected) {
          this.client.send(
            JSON.stringify({
              method: 'SUBSCRIBE',
              params: batch,
              id: index + 1,
            }),
          );
          console.log(
            `Subscribed to batch ${index + 1}/${batches.length} (${batch.length} streams)`,
            {
              exchange: 'binance',
            },
          );
        }
      }, index * 100);
    });
  }

  async subscribeToClient(exchanges: AvailableExchanges) {
    const binanceExchange = exchanges[0];

    if (!binanceExchange) {
      console.warn('No binance exchange found in exchanges array', {
        exchange: 'binance',
      });
      return;
    }
    this.subscriptionParams = binanceExchange.cryptoPairs.map(
      (pair) => `${pair.pairCode}@depth5`,
    );
    this.subsriptionInit();
  }

  protected reconnect() {
    const wsUrl = `${this.configService.exchanges.binance.wsUrl}/ws`;
    this.connect(wsUrl);
  }

  async onModuleInit() {
    try {
      await this.getAllTrades();
      this.reconnect();
    } catch (error) {
      console.error('Failed to initialize', (error as Error).message, {
        exchange: 'binance',
      });
    }
  }

  onModuleDestroy() {
    this.destroy();
  }
}
