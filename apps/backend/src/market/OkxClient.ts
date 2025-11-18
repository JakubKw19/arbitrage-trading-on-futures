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
  marketExchangesSubject,
  updatePairExchange,
} from './market.pubsub';
import type {
  OkxBookEntry,
  OkxFundingRate,
  OkxInstrumentsResponse,
  OkxTradeFee,
  OkxWebSocketMessage,
} from './types/api-responses';
import { ConfigService } from '../config/config.service';
import { MarketClient } from './MarketClient.base';

@Injectable()
export class OkxClient
  extends MarketClient
  implements OnModuleInit, OnModuleDestroy
{
  private subscriptionArgs: Array<{
    channel: string;
    instType: string;
    instId: string;
  }> = [];

  constructor(configService: ConfigService) {
    super(configService, 'okx');
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

  protected async getFundingRates(): Promise<void> {
    try {
      const instIds = Array.from(this.fundingRateCache.keys());
      if (instIds.length === 0) return;

      const fetchPromises = instIds.map(async (instId) => {
        try {
          const res = await fetch(
            `${this.configService.exchanges.okx.restUrl}/api/v5/public/funding-rate?instId=${instId}`,
          );
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);

          const json = await res.json();
          if (json.data?.[0]?.fundingRate) {
            this.fundingRateCache.set(
              instId,
              Number.parseFloat(json.data[0].fundingRate),
            );
          }
        } catch (error) {
          console.error(
            `Failed to fetch funding rate for okx ${instId}:`,
            error,
          );
        }
      });

      await Promise.all(fetchPromises);
    } catch (error) {
      console.error(
        'Failed to fetch funding rates okx',
        (error as Error).message,
      );
    }
  }

  // protected async getTradingFees(): Promise<void> {
  //   try {
  //     const res = await fetch(
  //       `${this.configService.exchanges.okx.restUrl}/api/v5/account/trade-fee?instType=SWAP`,
  //     );
  //     if (res.ok) {
  //       const json = await res.json();
  //       if (json.data) {
  //         const fees: OkxTradeFee[] = json.data;
  //         fees.forEach((fee) => {
  //           this.feesCache.set(fee.instId, {
  //             makerFee: Number.parseFloat(fee.makerU || fee.makerUSDC || '0'),
  //             takerFee: Number.parseFloat(fee.takerU || fee.takerUSDC || '0'),
  //           });
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch trading fees', (error as Error).message);
  //   }
  // }

  async getAllTrades() {
    try {
      const res = await fetch(
        `${this.configService.exchanges.okx.restUrl}/api/v5/public/instruments?instType=SWAP`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch instruments: ${res.statusText}`);
      }
      const data: OkxInstrumentsResponse = await res.json();

      const instruments = data.data
        .filter((inst) => inst.state === 'live')
        .map((inst) => inst.instFamily);

      data.data.forEach((inst) => {
        (this.fundingRateCache.set(`${inst.instId}`, 0),
          this.setTradingFees(
            inst.instId,
            (0.0005).toString(),
            (0.0002).toString(),
          ));
      });
      addExchange({
        name: 'okx',
        cryptoPairs: instruments.map((s) => {
          return {
            pair: s,
            pairCode:
              s.split('-')[0].toLowerCase() + s.split('-')[1].toLowerCase(),
          };
        }),
      });

      // await this.getTradingFees();
      await this.getFundingRates();

      // if (this.fundingRateUpdateInterval) {
      //   clearInterval(this.fundingRateUpdateInterval);
      // }
      // this.fundingRateUpdateInterval = setInterval(
      //   () => this.getFundingRates(),
      //   10 * 60000,
      // );

      console.log(`Loaded ${instruments.length} trading pairs`);
      return instruments;
    } catch (error) {
      console.error('Failed to fetch instruments', (error as Error).message);
      throw error;
    }
  }

  protected handleMessage(msg: WebSocket.Data) {
    try {
      const json: OkxWebSocketMessage = JSON.parse(msg.toString());

      if (!json.data || json.data.length === 0) {
        return;
      }

      const data = json.data;

      if (!data[0]) return;

      const entry = data[0] as OkxBookEntry;
      const symbol = entry.instId.replace(/-/g, '').replace(/SWAP$/, '');

      const fundingRate = this.fundingRateCache.get(entry.instId);
      const fees = this.feesCache.get(entry.instId);
      const dataToSend: MarketExchange = {
        exchange: 'okx',
        symbol: symbol,
        bids: entry.bids.map((bid) => ({
          price: Number.parseFloat(bid[0]),
          quantity: Number.parseFloat(bid[1]),
        })),
        asks: entry.asks.map((ask) => ({
          price: Number.parseFloat(ask[0]),
          quantity: Number.parseFloat(ask[1]),
        })),
        updateTimestamp: Number.parseFloat(entry.ts),
        timestamp: Date.now(),
        fundingRate,
        makerFee: fees?.makerFee,
        takerFee: fees?.takerFee,
      };
      updatePairExchange(dataToSend);
    } catch (error) {
      console.error('Failed to parse message', (error as Error).message);
    }
  }

  protected handleOpen() {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    console.log('Websocket connected', { exchange: 'okx' });
    this.startPingInterval();

    // Automatically resubscribe to stored subscription parameters
    if (this.subscriptionParams && this.subscriptionParams.length > 0) {
      this.subscribe(this.subscriptionParams);
    }
  }

  protected reconnect() {
    const wsUrl = this.configService.exchanges.okx.wsUrl;
    this.connect(wsUrl);
  }

  protected subscribe(
    args: Array<{ channel: string; instType: string; instId: string }>,
  ) {
    if (!this.client || !this.isConnected) {
      console.warn('[okx] Cannot subscribe: not connected');
      return;
    }

    const BATCH_SIZE = 50;
    const batches: Array<
      Array<{ channel: string; instType: string; instId: string }>
    > = [];

    for (let i = 0; i < args.length; i += BATCH_SIZE) {
      batches.push(args.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `[okx] Subscribing to ${args.length} channels in ${batches.length} batches`,
    );

    batches.forEach((batch, index) => {
      setTimeout(() => {
        if (this.client && this.isConnected) {
          const subscribe = {
            op: 'subscribe',
            args: batch,
          };
          const message = JSON.stringify(subscribe);

          if (message.length > 4096) {
            console.error(
              `[okx] Batch ${index + 1} payload too large: ${message.length} bytes`,
            );
            return;
          }

          this.client.send(message);
          console.log(
            `[okx] Subscribed to batch ${index + 1}/${batches.length} (${batch.length} channels, ${message.length} bytes)`,
          );
        }
      }, index * 200);
    });
  }

  async subscribeToClient(exchanges: AvailableExchanges) {
    const okxExchange = exchanges[0];
    if (!okxExchange) {
      console.warn('[okx] No okx exchange found in exchanges array');
      return;
    }

    this.subscriptionArgs = okxExchange.cryptoPairs.map((pair) => ({
      channel: 'books5',
      instType: 'SWAP',
      instId: `${pair.pair}-SWAP`,
    }));

    this.subscriptionParams = this.subscriptionArgs;
    this.subsriptionInit();
  }

  async onModuleInit() {
    try {
      await this.getAllTrades();
      this.reconnect();
    } catch (error) {
      console.error('Failed to initialize', (error as Error).message, {
        exchange: 'okx',
      });
    }
  }

  onModuleDestroy() {
    this.destroy();
  }
}
