"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrpcClient } from "@/lib/trpc";
import { useEffect, useTransition } from "react";
import { HiOutlineX } from "react-icons/hi";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Status, StatusIndicator } from "components/kibo-ui/status";
import {
  AppRouter,
  MarketOnGroupedArbitrageUpdateOutputSchemaType,
  MarketOnMarketUpdateOutputSchemaType,
} from "@repo/trpc/server/server";
import { inferRouterOutputs } from "@trpc/server";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "./table/data-table";
import { columns, ExchangeData } from "./table/columns";
import { useMemo } from "react";

const exchanges = [
  "Binance",
  "Coinbase",
  "Kraken",
  "Bitfinex",
  "Huobi",
  "okx",
  "Bybit",
  "FTX",
];

export function SelectScrollable({
  data,
  name,
  currentValue,
  setCurrentValue,
  disabled,
}: {
  data: { name: string; disabled: boolean }[];
  name: string;
  currentValue?: string;
  setCurrentValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}) {
  return (
    <Select
      onValueChange={(value) => setCurrentValue(value)}
      value={currentValue}
      disabled={disabled}
    >
      <SelectTrigger disabled={disabled}>
        <SelectValue placeholder={`${name}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{name}</SelectLabel>
          {data.map((item) => (
            <SelectItem
              key={item.name}
              value={item.name}
              disabled={item.disabled}
            >
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type RouterOutput = inferRouterOutputs<AppRouter>;

export type SupportedExchangesOutput =
  RouterOutput["MarketRouter"]["getSupportedExchangesData"];

async function getSession() {
  try {
    const session = await authClient.getSession();
    console.log("User session:", session);
    return session;
  } catch (err) {
    console.error("Failed to fetch session:", err);
    return null;
  }
}

export default function Page() {
  const trpcClient = getTrpcClient();
  const [status, setStatus] = React.useState<string>("Connected");
  const [currentExchangeFrom, setCurrentExchangeFrom] =
    React.useState<string>("");
  const [currentExchangeTo, setCurrentExchangeTo] = React.useState<string>("");
  const [pairs, setPairs] = React.useState<string[]>([]);
  const [currentPair, setCurrentPair] = React.useState<string>("");
  const [exchangesData, setExchangesData] =
    React.useState<SupportedExchangesOutput>([]);
  const [filters, setFilters] = React.useState<
    {
      id: number | string;
      exchangeFrom: string;
      exchangeTo: string;
      commonPairs: string[];
    }[]
  >([]);
  const [currentFilter, setCurrentFilter] = React.useState<{
    id: number | string;
    exchangeFrom: string;
    exchangeTo: string;
    commonPairs: string[];
  }>();
  // const [commonPairs, setCommonPairs]
  // const [data, setData] = React.useState<MarketData[]>(mockData);
  const [arbitrageData, setArbitrageData] =
    React.useState<MarketOnGroupedArbitrageUpdateOutputSchemaType>([]);

  const subscriptionRef = React.useRef<ReturnType<
    typeof trpcClient.MarketRouter.onGroupedArbitrageUpdate.subscribe
  > | null>(null);

  const pairKey = useMemo(() => {
    if (!currentFilter) return null;
    return `${currentFilter.exchangeFrom}-${currentFilter.exchangeTo}`;
  }, [currentFilter]);

  useEffect(() => {
    if (!pairKey) return;
    console.log(pairKey);
    const sub = trpcClient.MarketRouter.onGroupedArbitrageUpdate.subscribe(
      { pairKey },
      {
        onData: (data) => setArbitrageData(data),
        onError(err) {
          console.error(err);
          setStatus("Disconnected");
        },
      }
    );

    subscriptionRef.current = sub;

    return () => {
      // sub.unsubscribe();
      // subscriptionRef.current = null;
    };
  }, [pairKey]);

  const [updateTime] = React.useState(Date.now());

  const latestDataRef = React.useRef(null);
  useEffect(() => {
    const getPairsForExchanges = async () => {
      try {
        const data =
          await trpcClient.MarketRouter.getSupportedExchangesData.query({});
        setExchangesData(data);
      } catch (err) {
        console.error("Error fetching exchanges:", err);
      }
    };

    getPairsForExchanges();
  }, []);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (currentExchangeFrom === currentExchangeTo) {
      setCurrentExchangeTo("");
    }
    setPairs([]);
    const filtered = exchangesData.filter(
      (ex) => ex.name === currentExchangeFrom || ex.name === currentExchangeTo
    );

    if (filtered.length === 2) {
      const [fromPairs, toPairs] = filtered.map((ex) => ex.cryptoPairs);

      const commonPairs = fromPairs.filter(
        (fp) =>
          toPairs.some((tp) => tp.pairCode === fp.pairCode) &&
          !filters.some(
            (tp) =>
              tp.exchangeFrom === currentExchangeFrom &&
              tp.exchangeTo === currentExchangeTo
          )
      );
      console.log(commonPairs);
      setPairs(commonPairs.map((ex) => ex.pair));
    } else {
      console.log("Could not find both exchanges");
    }
  }, [currentExchangeFrom, currentExchangeTo, exchangesData, filters]);

  const onFilterAdd = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = await trpcClient.MarketRouter.getCurrentExchangesData.query({
      exchangeFrom: currentExchangeFrom,
      exchangeTo: currentExchangeTo,
    });
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    const id = crypto.randomUUID();
    setFilters((prev) => [
      ...prev,
      {
        id: id,
        exchangeFrom: currentExchangeFrom,
        exchangeTo: currentExchangeTo,
        commonPairs: pairs,
      },
    ]);

    setCurrentFilter({
      id: id,
      exchangeFrom: currentExchangeFrom,
      exchangeTo: currentExchangeTo,
      commonPairs: pairs,
    });
    setPairs([]);
    setCurrentPair("");
    setCurrentExchangeTo("");
  };

  const onFilterDelete = (filterToDelete, pairToDelete) => {
    // setFilters((prevFilters) =>
    //   prevFilters
    //     .filter((filter) => filter.id === filterToDelete.id)
    //     .map((filter) => ({
    //       ...filter,
    //       commonPairs: filter.commonPairs.filter(
    //         (pair) => pair !== pairToDelete
    //       ),
    //     }))
    // );
  };

  const onUpdatesClose = async () => {
    if (!subscriptionRef.current) return;
    subscriptionRef.current.unsubscribe();
  };

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(Date.now());
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  const tableDataByFilter = useMemo(() => {
    console.log(arbitrageData);
    if (!currentFilter || !arbitrageData) return;
    const filter = currentFilter;
    const forwardKey = `${filter.exchangeFrom}-${filter.exchangeTo}`;
    const backwardKey = `${filter.exchangeTo}-${filter.exchangeFrom}`;

    const forwardData = arbitrageData.filter(
      (item) => item.pairKey === forwardKey
    );
    const backwardData = arbitrageData.filter(
      (item) => item.pairKey === backwardKey
    );
    const precison = 4;
    const forwardTableData =
      forwardData[0]?.opportunities.slice(0, 20).map((item, index) => ({
        id: index.toString(),
        pair: item.symbol,
        valueLong: item.asks[0].price,
        valueShort: item.bids[0].price,
        arbitragePercent: `${item.spreadPercent.toFixed(3)} %`,
        arbitragePercentFees: `${item.spreadPercentFees.toFixed(3)} %`,
        timeFrom: `${item.timestampComputed[0] - item.updateTimestamp[0]} ms`,
        timeTo: `${item.timestampComputed[1] - item.updateTimestamp[1]} ms`,
        finalTime: `1 ms`,
        fundingRateFrom: item.fundingRateFrom?.toFixed(precison + 2),
        fundingRateTo: item.fundingRateTo?.toFixed(precison + 2),
        takerFeeFrom: item.takerFeeFrom?.toFixed(precison),
        takerFeeTo: item.takerFeeTo?.toFixed(precison),
      })) || [];

    const backwardTableData =
      backwardData[0]?.opportunities.slice(0, 20).map((item, index) => ({
        id: index.toString(),
        pair: item.symbol,
        valueLong: item.asks[0].price,
        valueShort: item.bids[0].price,
        arbitragePercent: `${item.spreadPercent.toFixed(3)} %`,
        arbitragePercentFees: `${item.spreadPercentFees.toFixed(3)} %`,
        timeFrom: `${item.timestampComputed[0] - item.updateTimestamp[0]} ms`,
        timeTo: `${item.timestampComputed[1] - item.updateTimestamp[1]} ms`,
        finalTime: `1 ms`,
        fundingRateFrom: item.fundingRateFrom?.toFixed(precison + 2),
        fundingRateTo: item.fundingRateTo?.toFixed(precison + 2),
        takerFeeFrom: item.takerFeeFrom?.toFixed(precison),
        takerFeeTo: item.takerFeeTo?.toFixed(precison),
      })) || [];

    return { forwardKey, backwardKey, forwardTableData, backwardTableData };
  }, [currentFilter, arbitrageData]);

  return (
    <div>
      <Card className=" border-0 overflow-y-auto">
        <CardTitle className="text-2xl mb-4 flex">
          Live Market Updates{" "}
          <Status
            className="rounded-full px-3 py-2 text-sm"
            status={status === "Connected" ? "online" : "offline"}
            // variant="outline"
          >
            <StatusIndicator />
          </Status>
        </CardTitle>
        <CardHeader className="flex flex-col">
          <div className="flex gap-2">
            <SelectScrollable
              data={exchangesData.map((ex) => ({
                name: ex.name,
                disabled: false,
              }))}
              name="Exchange from"
              currentValue={currentExchangeFrom}
              setCurrentValue={setCurrentExchangeFrom}
            />
            <SelectScrollable
              data={exchangesData
                // .filter(
                //   (ex) =>
                //     ex.name != currentExchangeFrom &&
                //     !filters.some(
                //       (ft) =>
                //         ft.exchangeFrom === currentExchangeFrom &&
                //         ft.exchangeTo === ex.name
                //     )
                // )
                .map((ex) => ({
                  name: ex.name,
                  disabled: !(
                    ex.name != currentExchangeFrom &&
                    !filters.some(
                      (ft) =>
                        ft.exchangeFrom === currentExchangeFrom &&
                        ft.exchangeTo === ex.name
                    )
                  ),
                }))}
              name="Exchange to"
              currentValue={currentExchangeTo}
              setCurrentValue={setCurrentExchangeTo}
            />
            {/* <SelectScrollable
              data={pairs}
              name="Crypto pair"
              currentValue={currentPair}
              setCurrentValue={setCurrentPair}
              disabled={!(currentExchangeFrom && currentExchangeTo)}
            /> */}
            <Button
              disabled={!(currentExchangeFrom && currentExchangeTo)}
              onClick={() => {
                onUpdatesClose();
                onFilterAdd();
              }}
            >
              Add filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className=" overflow-y-auto">
          {tableDataByFilter && (
            <div className="w-full justify-between border p-4">
              <div className="w-full flex justify-end">
                <Button
                  onClick={() => {
                    (onUpdatesClose(), setArbitrageData([]));
                  }}
                >
                  X
                </Button>
              </div>
              <div className="flex flex-col">
                <div className="m-2 rounded-2xl">
                  <div className=" text-2xl m-2">
                    {tableDataByFilter.forwardKey}
                  </div>
                  <DataTable
                    columns={columns}
                    data={tableDataByFilter.forwardTableData}
                  />
                </div>
                <div className="m-2 rounded-2xl">
                  <div className=" text-2xl m-2">
                    {tableDataByFilter.backwardKey}
                  </div>
                  <DataTable
                    columns={columns}
                    data={tableDataByFilter.backwardTableData}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
