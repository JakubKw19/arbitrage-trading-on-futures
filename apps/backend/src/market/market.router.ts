import * as marketExchanges from './types/marketExchanges';
import {
  arbitrageSpreadSubject,
  availableExchangesSubject,
  getAvailableExchanges,
  groupedArbitrageSubject,
  marketExchangesSubject,
} from './market.pubsub';
import { Input, Query, Router, Subscription } from '@nexica/nestjs-trpc';
import z from 'zod';
import { BinanceClient } from './BinanceClient';
import { OkxClient } from './OkxClient';
import { MexcClient } from './MexcClient';

const getSupportedExchangesDataInputSchema = z.object({
  exchangeFrom: z.string(),
  exchangeTo: z.string(),
});

export type GetSupportedExchangesDataInput = z.infer<
  typeof getSupportedExchangesDataInputSchema
>;
@Router()
export class MarketRouter {
  constructor(
    private readonly binanceClient: BinanceClient,
    private readonly okxClient: OkxClient,
    private readonly mexcClient: MexcClient,
  ) {}
  @Query({
    input: z.object({}),
    output: marketExchanges.availableExchangesSchema,
  })
  getSupportedExchangesData(
    @Input() input: void,
  ): marketExchanges.AvailableExchanges {
    return availableExchangesSubject.getValue();
  }

  @Query({
    input: getSupportedExchangesDataInputSchema,
    output: marketExchanges.availableExchangesSchema,
  })
  async getCurrentExchangesData(
    @Input() input: GetSupportedExchangesDataInput,
  ): Promise<marketExchanges.AvailableExchanges> {
    const exchanges = getAvailableExchanges({
      exchangeFrom: input.exchangeFrom,
      exchangeTo: input.exchangeTo,
    });
    await this.ensureClientSubscribed(input.exchangeFrom, exchanges);
    await this.ensureClientSubscribed(input.exchangeTo, exchanges);

    return exchanges;
  }

  @Subscription({
    input: z.object({ pairKey: z.string() }),
    output: marketExchanges.groupedArbitrageSchema,
  })
  onGroupedArbitrageUpdate(input: {
    pairKey: string;
  }): AsyncIterableIterator<marketExchanges.GroupedArbitrage> {
    let latestData: marketExchanges.GroupedArbitrage | null = null;
    let waitingResolve:
      | ((data: marketExchanges.GroupedArbitrage) => void)
      | null = null;
    // console.log(input.pairKey);
    const sub = groupedArbitrageSubject.subscribe((dataArray) => {
      const [from, to] = input.pairKey.split('-');
      const reversed = `${to}-${from}`;

      const filteredData = dataArray.filter(
        (item) => item.pairKey === input.pairKey || item.pairKey === reversed,
      );
      if (filteredData.length === 0) return;
      latestData = filteredData;

      if (waitingResolve) {
        waitingResolve(latestData);
        waitingResolve = null;
        latestData = null;
      }
    });

    return (async function* () {
      try {
        while (true) {
          if (latestData) {
            yield latestData;
            latestData = null;
          } else {
            const data = await new Promise<marketExchanges.GroupedArbitrage>(
              (resolve) => {
                waitingResolve = resolve;
              },
            );
            yield data;
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } finally {
        sub.unsubscribe();
      }
    })();
  }

  @Subscription({
    input: z.object(),
    output: z.array(marketExchanges.arbitrageSpreadSchema),
  })
  onMarketUpdate(
    @Input() input: void,
  ): AsyncIterableIterator<marketExchanges.ArbitrageSpread[]> {
    const asyncQueue: ((data: marketExchanges.ArbitrageSpread[]) => void)[] =
      [];
    let latestData: marketExchanges.ArbitrageSpread[] | null = null;

    const sub = arbitrageSpreadSubject.subscribe((dataArray) => {
      latestData = dataArray;
      if (asyncQueue.length > 0) {
        const resolve = asyncQueue.shift();
        if (resolve) {
          resolve(latestData);
          latestData = null;
        }
      }
    });

    return (async function* () {
      try {
        while (true) {
          const nextData = await new Promise<marketExchanges.ArbitrageSpread[]>(
            (resolve) => {
              if (latestData) {
                resolve(latestData);
                latestData = null;
              } else {
                asyncQueue.push(resolve);
              }
            },
          );
          yield nextData;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } finally {
        sub.unsubscribe();
      }
    })();
  }

  private async ensureClientSubscribed(
    exchange: string,
    exchanges: marketExchanges.AvailableExchanges,
  ) {
    const exchangeClients: Record<string, any> = {
      binance: this.binanceClient,
      okx: this.okxClient,
      mexc: this.mexcClient,
    };

    const client = exchangeClients[exchange];

    if (!client) {
      throw new Error(`Unsupported exchange: ${exchange}`);
    }

    await client.subscribeToClient(exchanges);

    if (!client['isConnected']) {
      console.log(`Reconnecting ${exchange} client...`);
      await client.onModuleInit(); // triggers reconnect logic
    }
  }
}
