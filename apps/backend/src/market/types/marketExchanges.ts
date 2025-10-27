import z from 'zod';

export const availableExchangesSchema = z.array(
  z.object({
    name: z.string(),
    cryptoPairs: z.array(
      z.object({
        pair: z.string(),
        pairCode: z.string(),
      }),
    ),
  }),
);

export const orders = z.object({
  price: z.number(),
  quantity: z.number(),
});

export const marketExchangesSchema = z.object({
  exchange: z.enum(['binance', 'okx']),
  symbol: z.string(),
  bids: z.array(orders),
  asks: z.array(orders),
  timestamp: z.number(),
});

export type MarketExchange = z.infer<typeof marketExchangesSchema>;
export type AvailableExchanges = z.infer<typeof availableExchangesSchema>;
