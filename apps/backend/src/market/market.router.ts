import * as marketExchanges from './types/marketExchanges';
import {
  availableExchangesSubject,
  marketExchangesSubject,
} from './market.pubsub';
import { Input, Query, Router, Subscription } from '@nexica/nestjs-trpc';
import z from 'zod';

@Router()
export class MarketRouter {
  @Query({
    input: z.object({}),
    output: marketExchanges.availableExchangesSchema,
  })
  getSupportedExchangesData(
    @Input() input: void,
  ): marketExchanges.AvailableExchanges {
    return availableExchangesSubject.getValue();
  }

  @Subscription({
    input: z.object(),
    output: marketExchanges.marketExchangesSchema,
  })
  onMarketUpdate(
    @Input() input: void,
  ): AsyncIterableIterator<marketExchanges.MarketExchange> {
    const queue: marketExchanges.MarketExchange[] = [];
    const sub = marketExchangesSubject.subscribe((data) => queue.push(data));
    return (async function* () {
      try {
        while (true) {
          if (queue.length > 0) {
            const data = queue.shift()!;
            yield data;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      } finally {
        sub.unsubscribe();
      }
    })();
  }
}
