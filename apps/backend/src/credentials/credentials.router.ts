import { Router, Query, Mutation, Input, Context } from '@nexica/nestjs-trpc';
import { z } from 'zod';
import {
  BinanceCredentialsOutputSchema,
  CredentialsService,
  OkxCredentialsOutputSchema,
} from './credentials.service';
import type {
  BinanceCredentialsOutput,
  OkxCredentialsOutput,
} from './credentials.service';
import type { AuthContext } from '../app.context';

const binanceInputSchema = z.object({
  apiKey: z.string(),
  apiSecret: z.string(),
});

const okxInputSchema = z.object({
  apiKey: z.string(),
  passphrase: z.string(),
  apiSecret: z.string(),
});

@Router()
export class CredentialsRouter {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Query({
    input: z.object({}),
    output: BinanceCredentialsOutputSchema,
  })
  getBinanceCredentials(
    @Context() ctx: AuthContext,
  ): Promise<BinanceCredentialsOutput> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    return this.credentialsService.getBinanceCredentials(ctx.user.id);
  }

  @Mutation({ input: binanceInputSchema })
  updateBinanceCredentials(
    @Context() ctx: AuthContext,
    @Input() input: z.infer<typeof binanceInputSchema>,
  ): Promise<BinanceCredentialsOutput> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    return this.credentialsService.upsertBinanceCredentials(ctx.user.id, input);
  }

  @Mutation({ input: z.object({}) })
  deleteBinanceCredentials(@Context() ctx: AuthContext) {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    return this.credentialsService.deleteBinanceCredentials(ctx.user.id);
  }

  @Query({
    input: z.object({}),
    output: OkxCredentialsOutputSchema,
  })
  getOkxCredentials(
    @Context() ctx: AuthContext,
  ): Promise<OkxCredentialsOutput> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    return this.credentialsService.getOkxCredentials(ctx.user.id);
  }

  @Mutation({ input: okxInputSchema })
  updateOkxCredentials(
    @Context() ctx: AuthContext,
    @Input() input: z.infer<typeof okxInputSchema>,
  ): Promise<OkxCredentialsOutput> {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    return this.credentialsService.upsertOkxCredentials(ctx.user.id, input);
  }

  @Mutation({ input: z.object({}) })
  deleteOkxCredentials(@Context() ctx: AuthContext) {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new Error('Not authenticated');
    }
    return this.credentialsService.deleteOkxCredentials(ctx.user.id);
  }
}
