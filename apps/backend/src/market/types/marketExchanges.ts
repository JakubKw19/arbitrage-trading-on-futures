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
  exchange: z.enum(['binance', 'okx', 'kraken', 'mexc']),
  symbol: z.string(),
  bids: z.array(orders),
  asks: z.array(orders),
  updateTimestamp: z.number(),
  timestamp: z.number(),
  fundingRate: z.number().optional(),
  takerFee: z.number().optional(),
  makerFee: z.number().optional(),
});

export const arbitrageSpreadSchema = z.object({
  exchangeFrom: z.enum(['binance', 'okx', 'kraken', 'mexc']),
  exchangeTo: z.enum(['binance', 'okx', 'kraken', 'mexc']),
  symbol: z.string(),
  spread: z.number(),
  spreadPercent: z.number(),
  spreadPercentFees: z.number(),
  bids: z.array(orders),
  asks: z.array(orders),
  updateTimestamp: z.array(z.number()),
  timestampComputed: z.array(z.number()),
  timestamp: z.number(),
  fundingRateFrom: z.number().optional(),
  fundingRateTo: z.number().optional(),
  takerFeeFrom: z.number().optional(),
  takerFeeTo: z.number().optional(),
});

export const UserTrackedMarketPair = z.object({
  pairKey: z.string(),
  symbol: z.string(),
  isCompleted: z.boolean(),
  initialArbitrage: z.number(),
  finalArbitrage: z.number().nullable().optional(),
  entryPriceA: z.number(),
  entryPriceB: z.number(),
  finalPriceA: z.number().nullable().optional(),
  finalPriceB: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  finalizedAt: z.date().nullable().optional(),
});

export const AddMarketPairToTrackingInputSchema = z.object({
  pairKey: z.string(),
  symbol: z.string(),
  initialArbitrage: z.number(),
  entryPriceA: z.number(),
  entryPriceB: z.number(),
});

export const exchangePairArbitrageSchema = z.object({
  pairKey: z.string(),
  opportunities: z.array(arbitrageSpreadSchema),
});

export const groupedArbitrageSchema = z.array(exchangePairArbitrageSchema);
export const userTrackedMarketPairsSchema = z.array(UserTrackedMarketPair);

export type MarketExchange = z.infer<typeof marketExchangesSchema>;
export type AvailableExchanges = z.infer<typeof availableExchangesSchema>;
export type ArbitrageSpread = z.infer<typeof arbitrageSpreadSchema>;
export type GroupedArbitrage = z.infer<typeof groupedArbitrageSchema>;
export type UserTrackedMarketPairs = z.infer<
  typeof userTrackedMarketPairsSchema
>;
export type AddMarketPairToTrackingInput = z.infer<
  typeof AddMarketPairToTrackingInputSchema
>;
