import * as marketExchanges from './types/marketExchanges';
import {
  // arbitrageSpreadSubject,
  availableExchangesSubject,
  getAvailableExchanges,
  groupedArbitrageSubject,
  marketExchangesSubject,
} from './market.pubsub';
import {
  Context,
  Input,
  Mutation,
  Query,
  Router,
  Subscription,
} from '@nexica/nestjs-trpc';
import z, { symbol } from 'zod';
import { BinanceClient } from './BinanceClient';
import { OkxClient } from './OkxClient';
import { MexcClient } from './MexcClient';
import type { AuthContext } from '../app.context';
import { MarketService } from './market.service';
import type { AddMarketPairToTrackingInput } from './types/marketExchanges';
import { filter, map, auditTime } from 'rxjs';

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
    private readonly marketService: MarketService,
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

  @Mutation({
    input: marketExchanges.AddMarketPairToTrackingInputSchema,
    output: z.void(),
  })
  async addMarketPairToTracking(
    @Input() input: AddMarketPairToTrackingInput,
    @Context() ctx: AuthContext,
  ): Promise<void> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    console.log(input);
    return this.marketService.addMarketPairToTracking(ctx.user.id, input);
  }

  @Mutation({
    input: z.object({ tradeId: z.string() }),
    output: z.void(),
  })
  async removeUserTrackedMarketPair(
    @Input() input: { tradeId: string },
    @Context() ctx: AuthContext,
  ): Promise<void> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    console.log(
      `Removing trade with ID: ${input.tradeId} for user: ${ctx.user.id}`,
    );
    await this.marketService.removeMarketPairFromTracking(
      ctx.user.id,
      input.tradeId,
    );
  }

  @Query({
    input: z.object({}),
    output: marketExchanges.userTrackedMarketPairsSchema,
  })
  async getUserTrackedMarketPairs(
    @Context() ctx: AuthContext,
  ): Promise<marketExchanges.UserTrackedMarketPairs> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    const result = await this.marketService.getUserTrackedMarketPairs(
      ctx.user.id,
    );
    console.log('DEBUG result:', result);
    return result;
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
  onGroupedArbitrageUpdate(input: { pairKey: string }) {
    const [from, to] = input.pairKey.split('-');
    const reversed = `${to}-${from}`;

    // Use RxJS pipeline to filter only relevant pairKey updates
    return groupedArbitrageSubject.asObservable().pipe(
      auditTime(50),
      map((dataArray) =>
        dataArray.filter(
          (item) => item.pairKey === input.pairKey || item.pairKey === reversed,
        ),
      ),
      // Only emit if there’s at least one match
      filter((filteredData) => filteredData.length > 0),
    );
  }

  @Subscription({
    input: z.array(
      z.object({
        pairKey: z.string(),
        symbol: z.string(),
      }),
    ),
    output: marketExchanges.groupedArbitrageSchema,
  })
  onUserArbitrageUpdate(input: { pairKey: string; symbol: string }[]) {
    const allowedKeys = new Set<string>();

    input.forEach((t) => {
      allowedKeys.add(`${t.pairKey}::${t.symbol}`);
    });
    console.log(allowedKeys);
    return groupedArbitrageSubject.asObservable().pipe(
      auditTime(50),
      map((groups) => {
        return groups
          .map((group) => {
            const filteredOpp = group.opportunities.filter((opp) => {
              const uniqueKey = `${group.pairKey}::${opp.symbol}`;
              return allowedKeys.has(uniqueKey);
            });
            console.log(filteredOpp);
            return {
              ...group,
              opportunities: filteredOpp,
            };
          })
          .filter((group) => group.opportunities.length > 0);
      }),
      filter((finalData) => finalData.length > 0),
    );
  }

  // @Subscription({
  //   input: z.object(),
  //   output: z.array(marketExchanges.arbitrageSpreadSchema),
  // })
  // onMarketUpdate(
  //   @Input() input: void,
  // ): AsyncIterableIterator<marketExchanges.ArbitrageSpread[]> {
  //   const asyncQueue: ((data: marketExchanges.ArbitrageSpread[]) => void)[] =
  //     [];
  //   let latestData: marketExchanges.ArbitrageSpread[] | null = null;

  //   const sub = arbitrageSpreadSubject.subscribe((dataArray) => {
  //     latestData = dataArray;
  //     if (asyncQueue.length > 0) {
  //       const resolve = asyncQueue.shift();
  //       if (resolve) {
  //         resolve(latestData);
  //         latestData = null;
  //       }
  //     }
  //   });

  //   return (async function* () {
  //     try {
  //       while (true) {
  //         const nextData = await new Promise<marketExchanges.ArbitrageSpread[]>(
  //           (resolve) => {
  //             if (latestData) {
  //               resolve(latestData);
  //               latestData = null;
  //             } else {
  //               asyncQueue.push(resolve);
  //             }
  //           },
  //         );
  //         yield nextData;
  //         await new Promise((resolve) => setTimeout(resolve, 50));
  //       }
  //     } finally {
  //       sub.unsubscribe();
  //     }
  //   })();
  // }

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
