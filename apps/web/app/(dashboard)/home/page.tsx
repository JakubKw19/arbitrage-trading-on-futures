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
  data: string[];
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
            <SelectItem key={item} value={item}>
              {item}
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
    const session = await authClient.getSession(); // fetches /users/me internally
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
  // const [commonPairs, setCommonPairs]
  // const [data, setData] = React.useState<MarketData[]>(mockData);
  const [arbitrageData, setArbitrageData] =
    React.useState<MarketOnGroupedArbitrageUpdateOutputSchemaType>([]);
  const [updateTime] = React.useState(Date.now());

  const latestDataRef = React.useRef(null);
  useEffect(() => {
    const getPairsForExchanges = async () => {
      try {
        const data =
          await trpcClient.MarketRouter.getSupportedExchangesData.query({});
        setExchangesData(data);
        // console.log("Supported exchanges data:", data);
      } catch (err) {
        console.error("Error fetching exchanges:", err);
      }
    };

    getPairsForExchanges();
  }, []);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (filters.length > 0) {
      filters.forEach((filter) => {
        const subscription =
          trpcClient.MarketRouter.onGroupedArbitrageUpdate.subscribe(
            { pairKey: `${filter.exchangeFrom}-${filter.exchangeTo}` },
            {
              onData(data) {
                startTransition(() => {
                  setArbitrageData(data);
                });
              },
              onError(err) {
                console.error(err);
                setStatus("Disconnected");
              },
            }
          );

        return () => subscription.unsubscribe();
      });
    }
  }, [filters]);

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
    setFilters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exchangeFrom: currentExchangeFrom,
        exchangeTo: currentExchangeTo,
        commonPairs: pairs,
      },
    ]);
    const data = await trpcClient.MarketRouter.getCurrentExchangesData.query({
      exchangeFrom: currentExchangeFrom,
      exchangeTo: currentExchangeTo,
    });
    console.log(data);
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
              data={exchangesData.map((ex) => ex.name)}
              name="Exchange from"
              currentValue={currentExchangeFrom}
              setCurrentValue={setCurrentExchangeFrom}
            />
            <SelectScrollable
              data={exchangesData
                .filter(
                  (ex) =>
                    ex.name != currentExchangeFrom &&
                    !filters.some(
                      (ft) =>
                        ft.exchangeFrom === currentExchangeFrom &&
                        ft.exchangeTo === ex.name
                    )
                )
                .map((ex) => ex.name)}
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
              onClick={onFilterAdd}
            >
              Add filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className=" overflow-y-auto">
          {arbitrageData
            ? arbitrageData.map((filter, index) => (
                <div key={index}>
                  <div>{filter.pairKey}</div>
                  {filter.opportunities
                    ? filter.opportunities.map((item, index) => (
                        <Card key={index} className="mb-4 p-4 border">
                          <CardTitle className="text-xl font-semibold mb-2">
                            {item.exchangeFrom} - {item.exchangeTo}{" "}
                            {item.symbol}
                          </CardTitle>
                          <CardContent>
                            Long on {item.exchangeFrom} at {item.bids[0].price}{" "}
                            and short on {item.exchangeTo} at{" "}
                            {item.asks[0].price} - Arbitrage:{" "}
                            {item.spreadPercent}% TimeDiffrence: ExchangeFrom:{" "}
                            {item.timestampComputed[0] -
                              item.updateTimestamp[0]}{" "}
                            ms ExchangeTo:{" "}
                            {item.timestampComputed[1] -
                              item.updateTimestamp[1]}{" "}
                            ms FinalTimeDiffrence:
                            {String(
                              Date.now() - Math.min(...item.timestampComputed)
                            )}{" "}
                            ms
                          </CardContent>
                        </Card>
                      ))
                    : null}
                </div>
              ))
            : null}
        </CardContent>
      </Card>
    </div>
  );
}
