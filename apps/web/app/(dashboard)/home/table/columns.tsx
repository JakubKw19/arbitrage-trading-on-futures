"use client";

import { Button } from "@/components/ui/button";
import { getTrpcClient } from "@/lib/trpc";
import { ColumnDef } from "@tanstack/react-table";
import { trpcClient } from "../page";

export type ExchangeData = {
  id: string;
  pair: string;
  pairKey: string;
  valueLong: number;
  valueShort: number;
  quantity: number;
  arbitragePercent: string;
  arbitrageNumber: number;
  timeFrom: string;
  timeTo: string;
  finalTime: string;
  fundingRateFrom?: string;
  fundingRateTo?: string;
  takerFeeFrom?: string;
  takerFeeTo?: string;
};

export const addPairToTracking = async (
  pairKey: string,
  symbol: string,
  quantity: number,
  initialArbitrage: number,
  entryPriceA: number,
  entryPriceB: number
) => {
  console.log(
    `Added pair: ${pairKey}, ${symbol}, ${initialArbitrage} ${entryPriceA} ${entryPriceB}`
  );
  await trpcClient.MarketRouter.addMarketPairToTracking.mutate({
    pairKey,
    symbol,
    quantity,
    initialArbitrage,
    entryPriceA,
    entryPriceB,
  });
};

export const getColumns = (
  onAfterAddPair: () => Promise<void>
): ColumnDef<ExchangeData>[] => [
  {
    accessorKey: "id",
    header: "",
    cell: ({ row }) => (
      <div className="w-[40px] text-right">
        <Button
          variant="outline"
          className="text-accent"
          onClick={async () => {
            await addPairToTracking(
              row.original.pairKey,
              row.original.pair,
              row.original.quantity,
              row.original.arbitrageNumber,
              row.original.valueLong,
              row.original.valueShort
            );
            await onAfterAddPair?.();
          }}
        >
          +
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "pair",
    header: "Symbols",
    cell: ({ row }) => <div className="truncate">{row.getValue("pair")}</div>,
  },
  {
    accessorKey: "valueLong",
    header: "Long",
    cell: ({ row }) => <div>{row.getValue("valueLong")}</div>,
  },
  {
    accessorKey: "valueShort",
    header: "Short",
    cell: ({ row }) => <div>{row.getValue("valueShort")}</div>,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "arbitragePercentFees",
    header: "Arbitrage %",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div>{row.original.arbitragePercent}</div>
        <div>{row.getValue("arbitragePercentFees") + " (fees)"}</div>
      </div>
    ),
  },
  {
    accessorKey: "fundingRateFrom",
    header: "Funding rate",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div>{row.getValue("fundingRateFrom") + " %"}</div>
        <div>{row.original.fundingRateTo + " %"}</div>
      </div>
    ),
  },
  {
    accessorKey: "takerFeeFrom",
    header: "Taker Fees",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div>{row.getValue("takerFeeFrom")}</div>
        <div>{row.original.takerFeeTo}</div>
      </div>
    ),
  },
  {
    accessorKey: "timeFrom",
    header: "Time from",

    cell: ({ row }) => <div>{row.getValue("timeFrom")}</div>,
  },
  {
    accessorKey: "timeTo",
    header: "Time to",
    cell: ({ row }) => <div>{row.getValue("timeTo")}</div>,
  },
];

// const columns = getColumns(onAfterAddPair);
