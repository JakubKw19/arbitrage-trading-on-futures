import { initTRPC } from "@trpc/server";
import z from "zod/v4";

undefined;
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;
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
