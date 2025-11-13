import { BehaviorSubject, Subject, throttleTime } from 'rxjs';
import {
  ArbitrageSpread,
  AvailableExchanges,
  GroupedArbitrage,
  MarketExchange,
} from './types/marketExchanges';
import { GetSupportedExchangesDataInput } from './market.router';

export const marketExchangesSubject = new BehaviorSubject<MarketExchange[]>([]);
export const availableExchangesSubject =
  new BehaviorSubject<AvailableExchanges>([]);
export const arbitrageSpreadSubject = new BehaviorSubject<ArbitrageSpread[]>(
  [],
);
export const groupedArbitrageSubject = new BehaviorSubject<GroupedArbitrage>(
  [],
);

const pairMap = new Map<string, MarketExchange>();

let isProcessingUpdate = false;

setInterval(() => {
  marketExchangesSubject.next(Array.from(pairMap.values()));
  if (isProcessingUpdate) {
    return;
  }
  isProcessingUpdate = true;
  try {
    updateArbitrageSpread();
  } catch (err) {
    console.error('Failed during arbitrage update:', err);
  } finally {
    isProcessingUpdate = false;
  }
}, 50);

export function updatePairExchange(pairExchange: MarketExchange) {
  const key = `${pairExchange.exchange}:${pairExchange.symbol}`;
  pairMap.set(key, pairExchange);
}

function groupArbitrageByExchangePair(spreads: ArbitrageSpread[]) {
  const pairGroups = new Map<string, ArbitrageSpread[]>();

  for (const spread of spreads) {
    const pairKey = `${spread.exchangeFrom}-${spread.exchangeTo}`;
    const pairKeyInversed = `${spread.exchangeTo}-${spread.exchangeFrom}`;
    if (!pairGroups.has(pairKey)) {
      pairGroups.set(pairKey, []);
    }
    if (!pairGroups.has(pairKeyInversed)) {
      pairGroups.set(pairKeyInversed, []);
    }
    pairGroups.get(pairKey)!.push(spread);
    pairGroups.get(pairKeyInversed)!.push(spread);
  }

  const groupedData: GroupedArbitrage = Array.from(pairGroups.entries()).map(
    ([pairKey, opportunities]) => ({
      pairKey,
      opportunities,
    }),
  );

  groupedArbitrageSubject.next(groupedData);
}

export function updateArbitrageSpread() {
  const pairs = marketExchangesSubject.getValue();
  const grouped = new Map<string, MarketExchange[]>();

  for (const p of pairs) {
    if (!grouped.has(p.symbol)) grouped.set(p.symbol, []);
    grouped.get(p.symbol)!.push(p);
  }

  let newSpreads: ArbitrageSpread[] = [];
  const timestamp = Date.now();

  for (const [symbol, exchanges] of grouped.entries()) {
    if (exchanges.length < 2) continue;

    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const exA = exchanges[i];
        const exB = exchanges[j];

        const bestBidA = exA.bids[0]?.price;
        const bestAskA = exA.asks[0]?.price;
        const bestBidB = exB.bids[0]?.price;
        const bestAskB = exB.asks[0]?.price;

        if (!bestBidA || !bestAskA || !bestBidB || !bestAskB) continue;

        const spreadAB = bestBidA - bestAskB;
        const spreadBA = bestBidB - bestAskA;

        if (spreadAB > 0) {
          newSpreads.push({
            exchangeFrom: exB.exchange,
            exchangeTo: exA.exchange,
            symbol,
            spread: spreadAB,
            spreadPercent: (spreadAB / bestAskB) * 100,
            bids: exB.bids,
            asks: exA.asks,
            updateTimestamp: [exA.updateTimestamp, exB.updateTimestamp],
            timestampComputed: [exA.timestamp, exB.timestamp],
            timestamp,
          });
        }

        if (spreadBA > 0) {
          newSpreads.push({
            exchangeFrom: exA.exchange,
            exchangeTo: exB.exchange,
            symbol,
            spread: spreadBA,
            spreadPercent: (spreadBA / bestAskA) * 100,
            bids: exA.bids,
            asks: exB.asks,
            updateTimestamp: [exA.updateTimestamp, exB.updateTimestamp],
            timestampComputed: [exA.timestamp, exB.timestamp],
            timestamp,
          });
        }
      }
    }
  }

  newSpreads = newSpreads.sort((a, b) => b.spreadPercent - a.spreadPercent);

  arbitrageSpreadSubject.next(newSpreads);

  groupArbitrageByExchangePair(newSpreads);
}

export function addExchange(newExchange: AvailableExchanges[number]) {
  const current = availableExchangesSubject.getValue();

  const isDuplicated = current.some((ex) => ex.name === newExchange.name);
  if (isDuplicated) {
    return;
  }

  availableExchangesSubject.next([...current, newExchange]);
}

export function getAvailableExchanges(input: GetSupportedExchangesDataInput) {
  const exchanges = availableExchangesSubject.getValue();

  const pairsFrom = exchanges
    .filter((ex) => ex.name === input.exchangeFrom)
    .flatMap((ex) => ex.cryptoPairs);

  const pairsTo = exchanges
    .filter((ex) => ex.name === input.exchangeTo)
    .flatMap((ex) => ex.cryptoPairs);

  const commonPairs = pairsFrom.filter((pairFrom) =>
    pairsTo.some((pairTo) => pairTo.pairCode === pairFrom.pairCode),
  );

  return [
    {
      name: `${input.exchangeFrom}-${input.exchangeTo}`,
      cryptoPairs: commonPairs,
    },
  ] satisfies AvailableExchanges;
}
