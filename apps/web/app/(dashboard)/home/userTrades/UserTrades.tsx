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
    <Card className="px-2">
      <CardTitle className="text-center">Your own Opportunities</CardTitle>
      <CardContent className="p-1">
        {userTrackedMarketPairs.length === 0 ? (
          <div className="text-center p-10 text-muted-foreground">
            You have not added any market pairs to track yet.
          </div>
        ) : (
          <div className="p-1 text-muted-foreground overflow-auto">
            {userTrackedMarketPairs.map((pair, index) => (
              <div key={pair.id} className="mb-4 border-b text-xs pb-2">
                <div className="text-white text-sm flex w-full justify-between mb-1">
                  <span className=" text-accent-foreground">{pair.symbol}</span>
                  <span>{pair.pairKey.toUpperCase()}</span>
                </div>
                <div>Arbitrage: {pair.initialArbitrage.toFixed(4)}%</div>
                <div>Long: {pair.entryPriceA}</div>
                <div>Short: {pair.entryPriceB}</div>
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
