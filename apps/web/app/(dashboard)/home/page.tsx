"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrpcClient, trpc } from "@/lib/trpc";
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
  // MarketOnMarketUpdateOutputSchemaType,
} from "@repo/trpc/server/server";
import { inferRouterOutputs } from "@trpc/server";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "./table/data-table";
import { useMemo } from "react";
import { UserTrades } from "./userTrades/UserTrades";

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

export type UserTrackedMarketPairsOutput =
  RouterOutput["MarketRouter"]["getUserTrackedMarketPairs"];

export const trpcClient = getTrpcClient();

export default function Page() {
  const [status, setStatus] = React.useState<string>("Disconnected");
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
  const [userTrackedMarketPairs, setUserTrackedMarketPairs] =
    React.useState<UserTrackedMarketPairsOutput>([]);
  // const {
  //   data: userTrackedMarketPairs,
  //   isLoading,
  //   error,
  // } = trpc.MarketRouter.getUserTrackedMarketPairs.useQuery({});
  // console.log(error);
  // const [commonPairs, setCommonPairs]
  // const [data, setData] = React.useState<MarketData[]>(mockData);
  const [tick, setTick] = React.useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const arbitrageData =
    React.useRef<MarketOnGroupedArbitrageUpdateOutputSchemaType>([]);

  // const [arbitrageData, setArbitrageData] =
  //   React.useState<MarketOnGroupedArbitrageUpdateOutputSchemaType>([]);

  const subscriptionRef = React.useRef<ReturnType<
    typeof trpcClient.MarketRouter.onGroupedArbitrageUpdate.subscribe
  > | null>(null);

  const lastRenderTime = React.useRef(0);

  const pairKey = useMemo(() => {
    if (!currentFilter) return null;
    return `${currentFilter.exchangeFrom}-${currentFilter.exchangeTo}`;
  }, [currentFilter]);

  const subscribeToPair = (pairKey: string) => {
    if (!pairKey) return;

    const sub = trpcClient.MarketRouter.onGroupedArbitrageUpdate.subscribe(
      { pairKey },
      {
        onData: (data) => {
          arbitrageData.current = data;
          const now = Date.now();
          if (now - lastRenderTime.current > 33) {
            lastRenderTime.current = now;
            forceRender();
          }
        },
        onError(err) {
          console.error(err);
        },
      }
    );
    subscriptionRef.current = sub;
  };

  useEffect(() => {
    if (currentFilter)
      subscribeToPair(
        `${currentFilter.exchangeFrom}-${currentFilter.exchangeTo}`
      );
    return () => subscriptionRef.current?.unsubscribe();
  }, [currentFilter]);

  const [updateTime] = React.useState(Date.now());

  const getUserTrackedMarketPairs = async () => {
    console.log("Fetching user tracked market pairs...");
    try {
      const userTrackedMarketPairs =
        await trpcClient.MarketRouter.getUserTrackedMarketPairs.query({});
      console.log("Fetched user tracked market pairs:", userTrackedMarketPairs);
      setUserTrackedMarketPairs(userTrackedMarketPairs);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };
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
    getUserTrackedMarketPairs();
    getPairsForExchanges();
  }, []);

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
    setStatus("Connected");
  };

  const onUpdatesClose = async () => {
    if (!subscriptionRef.current) return;
    setStatus("Disconnected");
    subscriptionRef.current.unsubscribe();
  };

  const onUpdatesResume = async () => {
    if (!pairKey) return;
    setStatus("Connected");
    subscribeToPair(
      `${currentFilter.exchangeFrom}-${currentFilter.exchangeTo}`
    );
  };

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(Date.now());
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  const tableDataByFilter = useMemo(() => {
    // console.log(arbitrageData);
    if (!currentFilter || !arbitrageData) return;
    const filter = currentFilter;
    const forwardKey = `${filter.exchangeFrom}-${filter.exchangeTo}`;
    const backwardKey = `${filter.exchangeTo}-${filter.exchangeFrom}`;

    const forwardData = arbitrageData.current.filter(
      (item) => item.pairKey === forwardKey
    );
    const backwardData = arbitrageData.current.filter(
      (item) => item.pairKey === backwardKey
    );
    const precison = 4;
    const forwardTableData =
      forwardData[0]?.opportunities.slice(0, 15).map((item, index) => ({
        id: index.toString(),
        pair: item.symbol,
        pairKey: forwardKey,
        valueLong: item.asks[0].price,
        valueShort: item.bids[0].price,
        quantity: item.quantity,
        arbitragePercent: `${item.spreadPercent.toFixed(3)} %`,
        arbitragePercentFees: `${item.spreadPercentFees.toFixed(3)} %`,
        arbitrageNumber: item.spreadPercent,
        timeFrom: `${item.timestampComputed[0] - item.updateTimestamp[0]} ms`,
        timeTo: `${item.timestampComputed[1] - item.updateTimestamp[1]} ms`,
        finalTime: `1 ms`,
        fundingRateFrom: item.fundingRateFrom?.toFixed(precison + 2),
        fundingRateTo: item.fundingRateTo?.toFixed(precison + 2),
        takerFeeFrom: item.takerFeeFrom?.toFixed(precison),
        takerFeeTo: item.takerFeeTo?.toFixed(precison),
      })) || [];

    const backwardTableData =
      backwardData[0]?.opportunities.slice(0, 15).map((item, index) => ({
        id: index.toString(),
        pair: item.symbol,
        pairKey: backwardKey,
        valueLong: item.asks[0].price,
        valueShort: item.bids[0].price,
        quantity: item.quantity,
        arbitragePercent: `${item.spreadPercent.toFixed(3)} %`,
        arbitragePercentFees: `${item.spreadPercentFees.toFixed(3)} %`,
        arbitrageNumber: item.spreadPercent,
        timeFrom: `${item.timestampComputed[0] - item.updateTimestamp[0]} ms`,
        timeTo: `${item.timestampComputed[1] - item.updateTimestamp[1]} ms`,
        finalTime: `1 ms`,
        fundingRateFrom: item.fundingRateFrom?.toFixed(precison + 2),
        fundingRateTo: item.fundingRateTo?.toFixed(precison + 2),
        takerFeeFrom: item.takerFeeFrom?.toFixed(precison),
        takerFeeTo: item.takerFeeTo?.toFixed(precison),
      })) || [];

    return { forwardKey, backwardKey, forwardTableData, backwardTableData };
  }, [currentFilter, tick]);

  const MemoTable = React.memo(DataTable);

  return (
    <div>
      <Card className=" border-0 overflow-y-auto">
        <CardTitle className="text-2xl mb-4 flex">
          Live Market Updates{" "}
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
        <CardContent className=" overflow-y-auto w-full flex">
          <div className="w-2/3 justify-between h-[80vh] relative">
            <div className="flex justify-between w-full border rounded-xl p-4 content-center">
              <div className=" 2xl:text-xl font-semibold mt-1 flex w-fit">
                <Status
                  className="rounded-full px-3 mb-1"
                  status={status === "Connected" ? "online" : "offline"}
                  // variant="outline"
                >
                  <StatusIndicator />
                </Status>
                Current Trade Stream Arbitrage Opportunities USD-M
              </div>
              <div className=" flex gap-2 items-center">
                <Button
                  onClick={() => {
                    onUpdatesClose();
                  }}
                >
                  Pause
                </Button>
                <Button
                  onClick={() => {
                    onUpdatesResume();
                  }}
                >
                  Resume
                </Button>
                <Button
                  onClick={() => {
                    (onUpdatesClose(), (arbitrageData.current = []));
                  }}
                >
                  Stop
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto h-9/10 pt-5">
              {tableDataByFilter && (
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardTitle>{tableDataByFilter.forwardKey}</CardTitle>
                    <CardContent className="m-0 p-0">
                      <MemoTable
                        data={tableDataByFilter.forwardTableData}
                        onAfterAddPair={getUserTrackedMarketPairs}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardTitle>{tableDataByFilter.backwardKey}</CardTitle>
                    <CardContent className="m-0 p-0">
                      <MemoTable
                        data={tableDataByFilter.backwardTableData}
                        onAfterAddPair={getUserTrackedMarketPairs}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
          <div className="w-1/3 justify-between h-9/10 px-4 overflow-y-auto">
            <UserTrades
              userTrackedMarketPairs={userTrackedMarketPairs}
              getUserTrackedMarketPairs={getUserTrackedMarketPairs}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
