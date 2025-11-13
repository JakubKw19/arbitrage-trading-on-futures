import { Injectable } from '@nestjs/common';
import { TRPCContext } from '@nexica/nestjs-trpc';
import type { ContextOptions } from '@nexica/nestjs-trpc';
import { auth } from '@repo/auth';

export type AuthContext = ContextOptions & {
  user?: { id: string; email: string };
  isAuthenticated: boolean;
};

@Injectable()
export class AuthContextFactory implements TRPCContext<AuthContext> {
  async create(opts: ContextOptions): Promise<AuthContext> {
    const cookie = opts.req.headers?.cookie;
    if (!cookie) return { ...opts, isAuthenticated: false };

    try {
      const session = await auth.api.getSession({ headers: { cookie } });
      if (session?.user) {
        return {
          ...opts,
          user: { id: session.user.id, email: session.user.email },
          isAuthenticated: true,
        };
      }
    } catch (e) {
      console.error('Session verification failed');
    }

    return { ...opts, isAuthenticated: false };
  }
}
