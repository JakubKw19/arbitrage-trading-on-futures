import { BehaviorSubject } from 'rxjs';
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
const allArbitrageSpreads = new Map<string, ArbitrageSpread>();

let isProcessingUpdate = false;
let hasPendingUpdate = false;
let debounceTimer: NodeJS.Timeout | null = null;

export function updatePairExchange(pairExchange: MarketExchange) {
  const key = `${pairExchange.exchange}:${pairExchange.symbol}`;
  pairMap.set(key, pairExchange);

  marketExchangesSubject.next(Array.from(pairMap.values()));

  scheduleArbitrageCalculation();
}

function scheduleArbitrageCalculation() {
  if (isProcessingUpdate) {
    hasPendingUpdate = true;
    return;
  }

  if (debounceTimer) {
    return;
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    processUpdates();
  }, 20); // 20ms debounce
}

async function processUpdates() {
  if (isProcessingUpdate) {
    hasPendingUpdate = true;
    return;
  }

  isProcessingUpdate = true;
  hasPendingUpdate = false;

  try {
    updateArbitrageSpread();
  } catch (error) {
    console.error('Error calculating arbitrage spread:', error);
  } finally {
    isProcessingUpdate = false;

    if (hasPendingUpdate) {
      scheduleArbitrageCalculation();
    }
  }
}

function groupArbitrageByExchangePair(spreads: ArbitrageSpread[]) {
  const pairGroups = new Map<string, ArbitrageSpread[]>();

  for (const spread of spreads) {
    const pairKey = `${spread.exchangeFrom}-${spread.exchangeTo}`;

    if (!pairGroups.has(pairKey)) {
      pairGroups.set(pairKey, []);
    }

    pairGroups.get(pairKey)!.push(spread);
  }

  for (const [pairKey, opportunities] of pairGroups.entries()) {
    pairGroups.set(
      pairKey,
      opportunities.sort((a, b) => b.spreadPercent - a.spreadPercent),
    );
  }

  const groupedData: GroupedArbitrage = Array.from(pairGroups.entries()).map(
    ([pairKey, opportunities]) => ({
      pairKey,
      opportunities,
    }),
  );
  // console.log(
  //   groupedData[0].opportunities.length,
  //   groupedData[1].opportunities.length,
  // );
  groupedArbitrageSubject.next(groupedData);
}

export function updateArbitrageSpread() {
  const pairs = marketExchangesSubject.getValue();
  const grouped = new Map<string, MarketExchange[]>();

  for (const p of pairs) {
    if (!grouped.has(p.symbol)) grouped.set(p.symbol, []);
    grouped.get(p.symbol)!.push(p);
  }

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

        const quantityBidA = exA.bids[0]?.quantity;
        const quantityAskA = exA.asks[0]?.quantity;
        const quantityBidB = exB.asks[0]?.quantity;
        const quantityAskB = exB.asks[0]?.quantity;

        if (!bestBidA || !bestAskA || !bestBidB || !bestAskB) continue;

        const minQuantityAB = Math.min(quantityBidA ?? 0, quantityAskB ?? 0);
        const minQuantityBA = Math.min(quantityBidB ?? 0, quantityAskA ?? 0);

        const spreadAB = bestBidA - bestAskB;
        const spreadPercentAB = (spreadAB / bestAskB) * 100;

        const spreadBA = bestBidB - bestAskA;
        const spreadPercentBA = (spreadBA / bestAskA) * 100;

        const feeAskA = bestAskA * (1 + (exA.takerFee ? exA.takerFee : 0));
        const feeBidA = bestBidA * (1 - (exA.takerFee ? exA.takerFee : 0));

        const feeAskB = bestAskB * (1 + (exB.takerFee ? exB.takerFee : 0));
        const feeBidB = bestBidB * (1 - (exB.takerFee ? exB.takerFee : 0));

        const spreadABWithFees = feeBidA - feeAskB;
        const spreadPercentABWithFees = (spreadABWithFees / feeAskB) * 100;

        const spreadBAWithFees = feeBidB - feeAskA;
        const spreadPercentBAWithFees = (spreadBAWithFees / feeAskA) * 100;

        const keyAB = `${exB.exchange}->${exA.exchange}:${symbol}`;
        const keyBA = `${exA.exchange}->${exB.exchange}:${symbol}`;

        // Direction 1: Buy on B (at ask), Sell on A (at bid)
        // if (spreadPercentAB > 0) {
        allArbitrageSpreads.set(keyAB, {
          exchangeFrom: exB.exchange,
          exchangeTo: exA.exchange,
          symbol,
          spread: spreadAB,
          quantity: minQuantityAB,
          spreadPercent: spreadPercentAB,
          spreadPercentFees: spreadPercentABWithFees,
          bids: exA.bids,
          asks: exB.asks,
          updateTimestamp: [exA.updateTimestamp, exB.updateTimestamp],
          timestampComputed: [exA.timestamp, exB.timestamp],
          timestamp,
          fundingRateFrom: exB.fundingRate,
          fundingRateTo: exA.fundingRate,
          takerFeeFrom: exB.takerFee,
          takerFeeTo: exA.takerFee,
        });
        // } else {
        // allArbitrageSpreads.delete(keyAB);
        // }

        // if (spreadPercentBA > 0) {
        allArbitrageSpreads.set(keyBA, {
          exchangeFrom: exA.exchange,
          exchangeTo: exB.exchange,
          symbol,
          spread: spreadBA,
          quantity: minQuantityBA,
          spreadPercent: spreadPercentBA,
          spreadPercentFees: spreadPercentBAWithFees,
          bids: exB.bids,
          asks: exA.asks,
          updateTimestamp: [exA.updateTimestamp, exB.updateTimestamp],
          timestampComputed: [exA.timestamp, exB.timestamp],
          timestamp,
          fundingRateFrom: exA.fundingRate,
          fundingRateTo: exB.fundingRate,
          takerFeeFrom: exA.takerFee,
          takerFeeTo: exB.takerFee,
        });
        // } else {
        //   allArbitrageSpreads.delete(keyBA);
        // }
      }
    }
  }

  const currentSpreads = Array.from(allArbitrageSpreads.values());
  arbitrageSpreadSubject.next(currentSpreads);
  groupArbitrageByExchangePair(currentSpreads);
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
