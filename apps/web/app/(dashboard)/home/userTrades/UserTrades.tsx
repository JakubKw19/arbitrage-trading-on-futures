"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { trpcClient, UserTrackedMarketPairsOutput } from "../page";
import { Button } from "@/components/ui/button";

interface UserTradesProps {
  userTrackedMarketPairs: UserTrackedMarketPairsOutput;
  getUserTrackedMarketPairs: () => Promise<void>;
}

export const removePairToTracking = async (
  idTrade: string,
  getUserTrackedMarketPairs: () => Promise<void>
) => {
  await trpcClient.MarketRouter.removeUserTrackedMarketPair.mutate({
    tradeId: idTrade,
  });
  await getUserTrackedMarketPairs();
};

export function UserTrades({
  userTrackedMarketPairs,
  getUserTrackedMarketPairs,
}: UserTradesProps) {
  return (
    <Card>
      <CardTitle>Your own Opportunities</CardTitle>
      <CardContent className="">
        {userTrackedMarketPairs.length === 0 ? (
          <div className="text-center p-10 text-muted-foreground">
            You have not added any market pairs to track yet.
          </div>
        ) : (
          <div className="text-center p-10 text-muted-foreground overflow-auto">
            {userTrackedMarketPairs.map((pair, index) => (
              <div key={pair.id} className="mb-4 border-b pb-2">
                <div>
                  Pair: {pair.symbol} ({pair.pairKey})
                </div>
                <div>Initial Arbitrage: {pair.initialArbitrage}%</div>
                <div>Entry Price A: {pair.entryPriceA}</div>
                <div>Entry Price B: {pair.entryPriceB}</div>
                <Button
                  className="m-2"
                  onClick={() =>
                    removePairToTracking(pair.id, getUserTrackedMarketPairs)
                  }
                >
                  Remove Pair
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
