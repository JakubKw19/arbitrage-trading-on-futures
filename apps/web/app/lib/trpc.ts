// lib/trpc.ts

import { createTRPCReact } from "@trpc/react-query";

import { wsLink, createWSClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/trpc/server/server";

const wsClient = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_URL ?? "ws://backend:5001/trpc",
});

export const trpc = createTRPCReact<AppRouter>();

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      wsLink({ client: wsClient }),
      httpBatchLink({
        url: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
}
