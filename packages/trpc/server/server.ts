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
export const MarketOnMarketUpdateInputSchema = z.object({});
export type MarketOnMarketUpdateInputSchemaType = z.infer<
  typeof MarketOnMarketUpdateInputSchema
>;
export const SchemaWR6RI9 = z.object({
  price: z.number(),
  quantity: z.number(),
});
export type SchemaWR6RI9Type = z.infer<typeof SchemaWR6RI9>;
export const MarketOnMarketUpdateOutputSchema = z.object({
  exchange: z.enum(["binance", "okx"]),
  symbol: z.string(),
  get bids(): z.ZodArray<typeof SchemaWR6RI9> {
    return z.array(SchemaWR6RI9) as z.ZodArray<typeof SchemaWR6RI9>;
  },
  get asks(): z.ZodArray<typeof SchemaWR6RI9> {
    return z.array(SchemaWR6RI9) as z.ZodArray<typeof SchemaWR6RI9>;
  },
  timestamp: z.number(),
});
export type MarketOnMarketUpdateOutputSchemaType = z.infer<
  typeof MarketOnMarketUpdateOutputSchema
>;

const MarketRouter = router({
  getSupportedExchangesData: publicProcedure
    .input(MarketGetSupportedExchangesDataInputSchema)
    .output(MarketGetSupportedExchangesDataOutputSchema)
    .query(async () => "" as any),
  onMarketUpdate: publicProcedure
    .input(MarketOnMarketUpdateInputSchema)
    .subscription(async function* () {
      yield {} as z.infer<typeof MarketOnMarketUpdateOutputSchema>;
    }),
});

export const appRouter = router({
  MarketRouter,
});

export type AppRouter = typeof appRouter;
