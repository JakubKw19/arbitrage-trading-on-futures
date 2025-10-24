"use client";

import { getTrpcClient } from "@/lib/trpc";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const trpcClient = getTrpcClient();
    const subscription = trpcClient.MarketRouter.onMarketUpdate.subscribe(
      {},
      {
        onData(data) {
          console.log("Market update:", data);
        },
        onError(err) {
          console.error(err);
        },
      }
    );

    return () => subscription.unsubscribe(); // unsubscribe on unmount
  }, []);
  return <main>{/* Page content */}</main>;
}
