import * as marketExchanges from './types/marketExchanges';
import {
  arbitrageSpreadSubject,
  availableExchangesSubject,
  getAvailableExchanges,
  marketExchangesSubject,
} from './market.pubsub';
import { Input, Query, Router, Subscription } from '@nexica/nestjs-trpc';
import z from 'zod';
import { BinanceClient } from './BinanceClient';
import { OkxClient } from './OkxClient';

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
    input: z.object(),
    output: z.array(marketExchanges.arbitrageSpreadSchema),
  })
  onMarketUpdate(
    @Input() input: void,
  ): AsyncIterableIterator<marketExchanges.ArbitrageSpread[]> {
    // const queue: marketExchanges.MarketExchange[][] = [];
    // const sub = marketExchangesSubject.subscribe((dataArray) => {
    //   queue.push(dataArray);
    // });

    // return (async function* () {
    //   try {
    //     while (true) {
    //       if (queue.length > 0) {
    //         const data = queue.shift()!;
    //         yield data; // yield full array
    //       } else {
    //         await new Promise((resolve) => setTimeout(resolve, 100));
    //       }
    //     }
    //   } finally {
    //     sub.unsubscribe();
    //   }
    // })();

    let latestData: marketExchanges.ArbitrageSpread[] | null = null;
    let hasNewData = false;
    const sub = arbitrageSpreadSubject.subscribe((dataArray) => {
      latestData = dataArray;
      hasNewData = true;
    });
    return (async function* () {
      try {
        while (true) {
          if (hasNewData && latestData) {
            yield latestData;
            hasNewData = false;
          }
          await new Promise((resolve) => setTimeout(resolve, 10));
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
    const client =
      exchange === 'binance'
        ? this.binanceClient
        : exchange === 'okx'
          ? this.okxClient
          : null;

    if (!client) {
      throw new Error(`Unsupported exchange: ${exchange}`);
    }

    console.log(exchange);

    await client.subscribeToClient(exchanges);

    if (!client['isConnected']) {
      console.log(`[MarketRouter] Reconnecting ${exchange} client...`);
      await client.onModuleInit(); // triggers reconnect logic
    }
  }
}
