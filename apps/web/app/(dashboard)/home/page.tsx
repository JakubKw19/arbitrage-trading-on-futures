"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrpcClient } from "@/lib/trpc";
import { useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";

const mockData = [
  {
    pairCode: "btcusd",
    pair: "BTC/USD",
    exchangeFrom: { name: "Binance", bestBid: 30000, bestAsk: 30010 },
    exchangeTo: { name: "Coinbase", bestBid: 30100, bestAsk: 30120 },
    arbitragePercentage: 0.33,
  },
  {
    pairCode: "ethusd",
    pair: "ETH/USD",
    exchangeFrom: { name: "Kraken", bestBid: 2000, bestAsk: 2010 },
    exchangeTo: { name: "Bitfinex", bestBid: 2020, bestAsk: 2030 },
    arbitragePercentage: 0.5,
  },
  {
    pairCode: "ltcusd",
    pair: "LTC/USD",
    exchangeFrom: { name: "Binance", bestBid: 150, bestAsk: 151 },
    exchangeTo: { name: "Coinbase", bestBid: 152, bestAsk: 153 },
    arbitragePercentage: 0.66,
  },
];

type MarketData = (typeof mockData)[0];

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
import { AppRouter } from "@repo/trpc/server/server";
import { inferRouterOutputs } from "@trpc/server";

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

export default function Page() {
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
  const [data, setData] = React.useState<MarketData[]>(mockData);
  useEffect(() => {
    const trpcClient = getTrpcClient();
    const getPairsForExchanges = async () => {
      try {
        const data =
          await trpcClient.MarketRouter.getSupportedExchangesData.query({});
        setExchangesData(data);
        console.log("Supported exchanges data:", data);
      } catch (err) {
        console.error("Error fetching exchanges:", err);
      }
    };

    getPairsForExchanges();

    const subscription = trpcClient.MarketRouter.onMarketUpdate.subscribe(
      {},
      {
        onData(data) {
          // console.log("Market update:", data);
        },
        onError(err) {
          console.error(err);
          setStatus("Disconnected");
        },
      }
    );

    return () => subscription.unsubscribe();
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

  const onFilterAdd = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exchangeFrom: currentExchangeFrom,
        exchangeTo: currentExchangeTo,
        commonPairs: pairs,
      },
    ]);
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
      <Card className=" border-0">
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
          <div className="flex flex-col gap-4 overflow-x-auto">
            {filters.map((filter, index) => (
              <div key={index} className="mt-4">
                <span className="text-foreground">
                  {filter.exchangeFrom} - {filter.exchangeTo}
                </span>
                <div className="flex gap-2">
                  {filter.commonPairs.map((pair, index) => (
                    <div
                      key={index}
                      className="mt-2 rounded-md p-2 text-sm font-medium dark:bg-input/30 border flex items-center"
                    >
                      <span className="text-foreground">{pair}</span>
                      <div
                        className="ml-2 rounded bg-input p-1 hover:text-muted hover:cursor-pointer"
                        onClick={() => onFilterDelete(filter, pair)}
                      >
                        <HiOutlineX />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {data.map((item, index) => (
            <Card key={index} className="mb-4 p-4 border">
              <CardTitle className="text-xl font-semibold mb-2">
                {item.pair}
              </CardTitle>
              <CardContent>
                Buy on {item.exchangeFrom.name} at {item.exchangeFrom.bestAsk}{" "}
                and sell on {item.exchangeTo.name} at {item.exchangeTo.bestBid}{" "}
                - Arbitrage: {item.arbitragePercentage}%
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
