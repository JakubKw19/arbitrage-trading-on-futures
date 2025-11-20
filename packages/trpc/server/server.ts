import { initTRPC } from "@trpc/server";
import z from "zod/v4";

undefined;
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;
export const MarketGetSupportedExchangesDataInputSchema = z.object({});
export type MarketGetSupportedExchangesDataInputSchemaType = z.infer<
  typeof MarketGetSupportedExchangesDataInputSchema
>;
export const SchemaZAE2C4 = z.object({
  pair: z.string(),
  pairCode: z.string(),
});
export type SchemaZAE2C4Type = z.infer<typeof SchemaZAE2C4>;
export const SchemaMYBPRI = z.object({
  name: z.string(),
  get cryptoPairs(): z.ZodArray<typeof SchemaZAE2C4> {
    return z.array(SchemaZAE2C4) as z.ZodArray<typeof SchemaZAE2C4>;
  },
});
export type SchemaMYBPRIType = z.infer<typeof SchemaMYBPRI>;
export const MarketGetSupportedExchangesDataOutputSchema =
  z.array(SchemaMYBPRI);
export type MarketGetSupportedExchangesDataOutputSchemaType = z.infer<
  typeof MarketGetSupportedExchangesDataOutputSchema
>;
export const MarketAddMarketPairToTrackingInputSchema = z.object({
  pairKey: z.string(),
  symbol: z.string(),
  initialArbitrage: z.number(),
  entryPriceA: z.number(),
  entryPriceB: z.number(),
});
export type MarketAddMarketPairToTrackingInputSchemaType = z.infer<
  typeof MarketAddMarketPairToTrackingInputSchema
>;
export const MarketRemoveUserTrackedMarketPairInputSchema = z.object({
  tradeId: z.string(),
});
export type MarketRemoveUserTrackedMarketPairInputSchemaType = z.infer<
  typeof MarketRemoveUserTrackedMarketPairInputSchema
>;
export const MarketGetUserTrackedMarketPairsInputSchema = z.object({});
export type MarketGetUserTrackedMarketPairsInputSchemaType = z.infer<
  typeof MarketGetUserTrackedMarketPairsInputSchema
>;
export const SchemaKIR5DX = z.object({
  id: z.string(),
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
export type SchemaKIR5DXType = z.infer<typeof SchemaKIR5DX>;
export const MarketGetUserTrackedMarketPairsOutputSchema =
  z.array(SchemaKIR5DX);
export type MarketGetUserTrackedMarketPairsOutputSchemaType = z.infer<
  typeof MarketGetUserTrackedMarketPairsOutputSchema
>;
export const MarketGetCurrentExchangesDataInputSchema = z.object({
  exchangeFrom: z.string(),
  exchangeTo: z.string(),
});
export type MarketGetCurrentExchangesDataInputSchemaType = z.infer<
  typeof MarketGetCurrentExchangesDataInputSchema
>;
export const MarketGetCurrentExchangesDataOutputSchema = z.array(SchemaMYBPRI);
export type MarketGetCurrentExchangesDataOutputSchemaType = z.infer<
  typeof MarketGetCurrentExchangesDataOutputSchema
>;
export const MarketOnGroupedArbitrageUpdateInputSchema = z.object({
  pairKey: z.string(),
});
export type MarketOnGroupedArbitrageUpdateInputSchemaType = z.infer<
  typeof MarketOnGroupedArbitrageUpdateInputSchema
>;
export const SchemaWR6RI9 = z.object({
  price: z.number(),
  quantity: z.number(),
});
export type SchemaWR6RI9Type = z.infer<typeof SchemaWR6RI9>;
export const Schema5VEYHT = z.object({
  exchangeFrom: z.enum(["binance", "okx", "kraken", "mexc"]),
  exchangeTo: z.enum(["binance", "okx", "kraken", "mexc"]),
  symbol: z.string(),
  spread: z.number(),
  spreadPercent: z.number(),
  spreadPercentFees: z.number(),
  get bids(): z.ZodArray<typeof SchemaWR6RI9> {
    return z.array(SchemaWR6RI9) as z.ZodArray<typeof SchemaWR6RI9>;
  },
  get asks(): z.ZodArray<typeof SchemaWR6RI9> {
    return z.array(SchemaWR6RI9) as z.ZodArray<typeof SchemaWR6RI9>;
  },
  updateTimestamp: z.array(z.number()),
  timestampComputed: z.array(z.number()),
  timestamp: z.number(),
  fundingRateFrom: z.number().optional(),
  fundingRateTo: z.number().optional(),
  takerFeeFrom: z.number().optional(),
  takerFeeTo: z.number().optional(),
});
export type Schema5VEYHTType = z.infer<typeof Schema5VEYHT>;
export const SchemaINAS9J = z.object({
  pairKey: z.string(),
  get opportunities(): z.ZodArray<typeof Schema5VEYHT> {
    return z.array(Schema5VEYHT) as z.ZodArray<typeof Schema5VEYHT>;
  },
});
export type SchemaINAS9JType = z.infer<typeof SchemaINAS9J>;
export const MarketOnGroupedArbitrageUpdateOutputSchema = z.array(SchemaINAS9J);
export type MarketOnGroupedArbitrageUpdateOutputSchemaType = z.infer<
  typeof MarketOnGroupedArbitrageUpdateOutputSchema
>;
export const SchemaBSYLFY = z.object({
  pairKey: z.string(),
  symbol: z.string(),
});
export type SchemaBSYLFYType = z.infer<typeof SchemaBSYLFY>;
export const MarketOnUserArbitrageUpdateInputSchema = z.array(SchemaBSYLFY);
export type MarketOnUserArbitrageUpdateInputSchemaType = z.infer<
  typeof MarketOnUserArbitrageUpdateInputSchema
>;
export const MarketOnUserArbitrageUpdateOutputSchema = z.array(SchemaINAS9J);
export type MarketOnUserArbitrageUpdateOutputSchemaType = z.infer<
  typeof MarketOnUserArbitrageUpdateOutputSchema
>;
export const CredentialsGetBinanceCredentialsInputSchema = z.object({});
export type CredentialsGetBinanceCredentialsInputSchemaType = z.infer<
  typeof CredentialsGetBinanceCredentialsInputSchema
>;
export const CredentialsGetBinanceCredentialsOutputSchema = z
  .object({
    id: z.string(),
    apiKey: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .nullable();
export type CredentialsGetBinanceCredentialsOutputSchemaType = z.infer<
  typeof CredentialsGetBinanceCredentialsOutputSchema
>;
export const CredentialsUpdateBinanceCredentialsInputSchema = z.object({
  apiKey: z.string(),
  apiSecret: z.string(),
});
export type CredentialsUpdateBinanceCredentialsInputSchemaType = z.infer<
  typeof CredentialsUpdateBinanceCredentialsInputSchema
>;
export const CredentialsDeleteBinanceCredentialsInputSchema = z.object({});
export type CredentialsDeleteBinanceCredentialsInputSchemaType = z.infer<
  typeof CredentialsDeleteBinanceCredentialsInputSchema
>;
export const CredentialsGetOkxCredentialsInputSchema = z.object({});
export type CredentialsGetOkxCredentialsInputSchemaType = z.infer<
  typeof CredentialsGetOkxCredentialsInputSchema
>;
export const CredentialsGetOkxCredentialsOutputSchema = z
  .object({
    id: z.string(),
    apiKey: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .nullable();
export type CredentialsGetOkxCredentialsOutputSchemaType = z.infer<
  typeof CredentialsGetOkxCredentialsOutputSchema
>;
export const CredentialsUpdateOkxCredentialsInputSchema = z.object({
  apiKey: z.string(),
  passphrase: z.string(),
  apiSecret: z.string(),
});
export type CredentialsUpdateOkxCredentialsInputSchemaType = z.infer<
  typeof CredentialsUpdateOkxCredentialsInputSchema
>;
export const CredentialsDeleteOkxCredentialsInputSchema = z.object({});
export type CredentialsDeleteOkxCredentialsInputSchemaType = z.infer<
  typeof CredentialsDeleteOkxCredentialsInputSchema
>;

const MarketRouter = router({
  getSupportedExchangesData: publicProcedure
    .input(MarketGetSupportedExchangesDataInputSchema)
    .output(MarketGetSupportedExchangesDataOutputSchema)
    .query(async () => "" as any),
  addMarketPairToTracking: publicProcedure
    .input(MarketAddMarketPairToTrackingInputSchema)
    .output(MarketAddMarketPairToTrackingOutputSchema)
    .mutation(async () => "" as any),
  removeUserTrackedMarketPair: publicProcedure
    .input(MarketRemoveUserTrackedMarketPairInputSchema)
    .output(MarketRemoveUserTrackedMarketPairOutputSchema)
    .mutation(async () => "" as any),
  getUserTrackedMarketPairs: publicProcedure
    .input(MarketGetUserTrackedMarketPairsInputSchema)
    .output(MarketGetUserTrackedMarketPairsOutputSchema)
    .query(async () => "" as any),
  getCurrentExchangesData: publicProcedure
    .input(MarketGetCurrentExchangesDataInputSchema)
    .output(MarketGetCurrentExchangesDataOutputSchema)
    .query(async () => "" as any),
  onGroupedArbitrageUpdate: publicProcedure
    .input(MarketOnGroupedArbitrageUpdateInputSchema)
    .subscription(async function* () {
      yield {} as z.infer<typeof MarketOnGroupedArbitrageUpdateOutputSchema>;
    }),
  onUserArbitrageUpdate: publicProcedure
    .input(MarketOnUserArbitrageUpdateInputSchema)
    .subscription(async function* () {
      yield {} as z.infer<typeof MarketOnUserArbitrageUpdateOutputSchema>;
    }),
});

const CredentialsRouter = router({
  getBinanceCredentials: publicProcedure
    .input(CredentialsGetBinanceCredentialsInputSchema)
    .output(CredentialsGetBinanceCredentialsOutputSchema)
    .query(async () => "" as any),
  updateBinanceCredentials: publicProcedure
    .input(CredentialsUpdateBinanceCredentialsInputSchema)
    .mutation(async () => "" as any),
  deleteBinanceCredentials: publicProcedure
    .input(CredentialsDeleteBinanceCredentialsInputSchema)
    .mutation(async () => "" as any),
  getOkxCredentials: publicProcedure
    .input(CredentialsGetOkxCredentialsInputSchema)
    .output(CredentialsGetOkxCredentialsOutputSchema)
    .query(async () => "" as any),
  updateOkxCredentials: publicProcedure
    .input(CredentialsUpdateOkxCredentialsInputSchema)
    .mutation(async () => "" as any),
  deleteOkxCredentials: publicProcedure
    .input(CredentialsDeleteOkxCredentialsInputSchema)
    .mutation(async () => "" as any),
});

export const appRouter = router({
  MarketRouter,
  CredentialsRouter,
});

export type AppRouter = typeof appRouter;
