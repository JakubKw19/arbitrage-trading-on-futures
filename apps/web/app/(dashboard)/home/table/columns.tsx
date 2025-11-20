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

const addPairToTracking = async (
  pairKey: string,
  symbol: string,
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
    initialArbitrage,
    entryPriceA,
    entryPriceB,
  });
};

export const columns: ColumnDef<ExchangeData>[] = [
  {
    accessorKey: "id",
    header: "",
    cell: ({ row }) => (
      <div className="w-[40px] text-right">
        <Button
          variant="outline"
          className=" text-accent"
          onClick={() =>
            addPairToTracking(
              row.original.pairKey,
              row.original.pair,
              row.original.arbitrageNumber,
              row.original.valueLong,
              row.original.valueShort
            )
          }
        >
          +
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "pair",
    header: "Symbols",
    cell: ({ row }) => (
      <div className="w-[120px] truncate">{row.getValue("pair")}</div>
    ),
  },
  {
    accessorKey: "valueLong",
    header: "Long",
    cell: ({ row }) => (
      <div className="w-[80px] text-right">{row.getValue("valueLong")}</div>
    ),
  },
  {
    accessorKey: "valueShort",
    header: "Short",
    cell: ({ row }) => (
      <div className="w-[80px] text-right">{row.getValue("valueShort")}</div>
    ),
  },
  {
    accessorKey: "arbitragePercent",
    header: "Arbitrage %",
    cell: ({ row }) => (
      <div className="w-[100px] text-right">
        {row.getValue("arbitragePercent")}
      </div>
    ),
  },
  {
    accessorKey: "arbitragePercentFees",
    header: "Arbitrage % + Fees",
    cell: ({ row }) => (
      <div className="w-[100px] text-right">
        {row.getValue("arbitragePercentFees")}
      </div>
    ),
  },
  {
    accessorKey: "fundingRateFrom",
    header: "Funding rate ->",
    cell: ({ row }) => (
      <div className="w-[130px]">{row.getValue("fundingRateFrom")}</div>
    ),
  },
  {
    accessorKey: "fundingRateTo",
    header: "Funding rate <-",
    cell: ({ row }) => (
      <div className="w-[130px]">{row.getValue("fundingRateTo")}</div>
    ),
  },
  {
    accessorKey: "takerFeeFrom",
    header: "Fee 1st",
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("takerFeeFrom")}</div>
    ),
  },
  {
    accessorKey: "takerFeeTo",
    header: "Fee 2nd",
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("takerFeeTo")}</div>
    ),
  },
  {
    accessorKey: "timeFrom",
    header: "Time from",

    cell: ({ row }) => (
      <div className="w-[70px]">{row.getValue("timeFrom")}</div>
    ),
  },
  {
    accessorKey: "timeTo",
    header: "Time to",
    cell: ({ row }) => <div className="w-[70px]">{row.getValue("timeTo")}</div>,
  },
];
