import { MarketExchange, marketExchangesSchema } from './types/marketExchanges';
import { marketExchangesSubject } from './market.pubsub';
import { Input, Router, Subscription } from '@nexica/nestjs-trpc';
import z from 'zod';

@Router()
export class MarketRouter {
  @Subscription({ input: z.object(), output: marketExchangesSchema })
  onMarketUpdate(@Input() input: void): AsyncIterableIterator<MarketExchange> {
    const queue: MarketExchange[] = [];
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
