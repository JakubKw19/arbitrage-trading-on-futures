import z from 'zod';

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
