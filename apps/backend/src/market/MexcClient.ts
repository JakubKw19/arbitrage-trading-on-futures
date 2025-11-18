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
import { addExchange, updatePairExchange } from './market.pubsub';
import type { MexcExchangeInfo, MexcDepthUpdate } from './types/api-responses';
import { ConfigService } from '../config/config.service';
import { MarketClient } from './MarketClient.base';

@Injectable()
export class MexcClient
  extends MarketClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    super(configService, 'mexc');
  }

  protected async getFundingRates(): Promise<void> {
    try {
      const res = await fetch(
        `${this.configService.exchanges.mexc.restUrl}/api/v1/contract/funding_rate`,
      );
      if (!res.ok) {
        throw new Error(
          `Failed to fetch funding rates mexc: ${res.statusText}`,
        );
      }
      const data: any = await res.json();
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item: any) => {
          const symbol = item.symbol.replace('_', '').toLowerCase();
          const fundingRate = parseFloat(item.fundingRate) || 0;
          this.fundingRateCache.set(symbol, fundingRate);
        });
      }
    } catch (error) {
      console.error(
        'Failed to fetch MEXC funding rates',
        (error as Error).message,
        { exchange: 'mexc' },
      );
    }
  }

  protected async getTradingFees(): Promise<void> {}

  protected async setTradingFees(
    symbol: string,
    takerFeeRate: string,
    makerFeeRate: string,
  ): Promise<void> {
    this.feesCache.set(symbol, {
      makerFee: Number.parseFloat(makerFeeRate),
      takerFee: Number.parseFloat(takerFeeRate),
    });
  }

  async getAllTrades() {
    try {
      console.log(
        `${this.configService.exchanges.mexc.restUrl}/api/v1/contract/detail`,
      );
      const res = await fetch(
        `${this.configService.exchanges.mexc.restUrl}/api/v1/contract/detail`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch exchange info: ${res.statusText}`);
      }
      const data: MexcExchangeInfo = await res.json();

      const symbols = data.data
        .filter((s) => s.state === 0) // Only enabled contracts
        .map((s) => s.symbol);

      addExchange({
        name: 'mexc',
        cryptoPairs: data.data
          .filter((s) => s.state === 0)
          .map((s) => {
            return {
              pair: s.baseCoin + '-' + s.quoteCoin,
              pairCode: s.symbol.replace('_', '').toLowerCase(),
            };
          }),
      });

      data.data.map((s) => {
        this.setTradingFees(
          s.symbol.replace('_', '').toLowerCase(),
          s.takerFeeRate,
          s.makerFeeRate,
        );
      });

      await this.getFundingRates();

      // if (this.fundingRateUpdateInterval) {
      //   clearInterval(this.fundingRateUpdateInterval);
      // }
      // this.fundingRateUpdateInterval = setInterval(
      //   () => this.getFundingRates(),
      //   10 * 60000,
      // );

      console.log(`Loaded ${symbols.length} trading pairs`, {
        exchange: 'mexc',
      });
      return symbols;
    } catch (error) {
      console.error('Failed to fetch trading pairs', (error as Error).message, {
        exchange: 'mexc',
      });
      throw error;
    }
  }

  protected handleMessage(msg: WebSocket.Data) {
    try {
      const json: MexcDepthUpdate = JSON.parse(msg.toString());
      //   console.log(json);
      if (!json.channel || json.channel !== 'push.depth' || !json.data) {
        return;
      }
      const symbol = json.symbol.replace('_', '');

      const fundingRate = this.fundingRateCache.get(symbol.toLowerCase());
      const fees = this.feesCache.get(symbol.toLowerCase());

      const dataToSend: MarketExchange = {
        exchange: 'mexc',
        symbol: symbol,
        bids: json.data.bids.map((bid: [number, number]) => ({
          price: bid[0],
          quantity: bid[1],
        })),
        asks: json.data.asks.map((ask: [number, number]) => ({
          price: ask[0],
          quantity: ask[1],
        })),
        updateTimestamp: json.ts,
        timestamp: Date.now(),
        fundingRate,
        makerFee: fees?.makerFee,
        takerFee: fees?.takerFee,
      };
      updatePairExchange(dataToSend);
    } catch (error) {
      console.error('Failed to parse message', (error as Error).message, {
        exchange: 'mexc',
      });
    }
  }

  protected handleOpen() {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    console.log('Websocket connected', { exchange: 'mexc' });
    this.startPingInterval();

    // Automatically resubscribe to stored subscription parameters
    if (this.subscriptionParams && this.subscriptionParams.length > 0) {
      this.subscribe(this.subscriptionParams);
    }
  }

  protected subscribe(symbols: string[]) {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot subscribe: not connected', { exchange: 'mexc' });
      return;
    }

    const BATCH_SIZE = 100;
    const batches: string[][] = [];

    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      batches.push(symbols.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `Subscribing to ${symbols.length} symbols in ${batches.length} batches`,
      { exchange: 'mexc' },
    );

    batches.forEach((batch, index) => {
      setTimeout(() => {
        if (this.client && this.isConnected) {
          batch.forEach((symbol) => {
            this.client.send(
              JSON.stringify({
                method: 'sub.depth',
                param: {
                  symbol: symbol,
                },
              }),
            );
          });
          console.log(
            `Subscribed to batch ${index + 1}/${batches.length} (${batch.length} symbols)`,
            {
              exchange: 'mexc',
            },
          );
        }
      }, index * 100);
    });
  }

  protected startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => {
      if (this.client && this.isConnected) {
        console.log('Sending ping to MEXC', { exchange: 'mexc' });
        this.client.send(JSON.stringify({ method: 'ping' }));
      }
    }, 20000);
  }

  protected handleClose(code: number, reason: Buffer) {
    this.isConnected = false;
    console.log('Websocket closed', code, this.exchangeName, reason.toString());
    this.cleanup();

    if (
      this.shouldReconnect &&
      this.reconnectAttempts <
        this.configService.exchanges.mexc.maxReconnectAttempts
    ) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.configService.exchanges.mexc.maxReconnectAttempts})`,
        {
          exchange: 'mexc',
        },
      );

      this.reconnectTimeout = setTimeout(() => {
        this.reconnect();
      }, this.configService.exchanges.mexc.reconnectDelay);
    } else if (
      this.reconnectAttempts >=
      this.configService.exchanges.mexc.maxReconnectAttempts
    ) {
      console.error('Max reconnect attempts reached', { exchange: 'mexc' });
    }
  }

  async subscribeToClient(exchanges: AvailableExchanges) {
    const mexcExchange = exchanges[0];

    if (!mexcExchange) {
      console.warn('No mexc exchange found in exchanges array', {
        exchange: 'mexc',
      });
      return;
    }
    this.subscriptionParams = mexcExchange.cryptoPairs.map((pair) =>
      pair.pair.replace('-', '_'),
    );
    this.subsriptionInit();
  }

  protected reconnect() {
    const wsUrl = this.configService.exchanges.mexc.wsUrl;
    this.connect(wsUrl);
  }

  async onModuleInit() {
    try {
      await this.getAllTrades();
      this.reconnect();
    } catch (error) {
      console.error('Failed to initialize', (error as Error).message, {
        exchange: 'mexc',
      });
    }
  }

  onModuleDestroy() {
    this.destroy();
  }
}
