export interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface BinanceExchangeInfo {
  symbols: BinanceSymbol[];
}

export interface BinanceDepthUpdate {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID
  u: number; // Final update ID
  b: [string, string][]; // Bids [price, quantity]
  a: [string, string][]; // Asks [price, quantity]
}

export interface OkxInstrument {
  instId: string;
  instFamily: string;
  instType: string;
  state: string;
}

export interface OkxInstrumentsResponse {
  code: string;
  msg: string;
  data: OkxInstrument[];
}

export interface OkxBookEntry {
  instId: string;
  bids: [string, string, string, string][]; // [price, quantity, liquidated orders, number of orders]
  asks: [string, string, string, string][];
  ts: string;
}

export interface OkxWebSocketMessage {
  arg?: {
    channel: string;
    instId: string;
  };
  data?: OkxBookEntry[];
}

export interface MexcSymbol {
  symbol: string;
  displayName: string;
  state: number;
  baseCoin: string;
  quoteCoin: string;
  takerFeeRate: string;
  makerFeeRate: string;
}

export interface MexcExchangeInfo {
  success: boolean;
  code: number;
  data: MexcSymbol[];
}

export interface MexcDepthUpdate {
  channel: string;
  symbol: string;
  ts: number;
  data: {
    asks: [number, number][]; // [price, quantity]
    bids: [number, number][]; // [price, quantity]
  };
}

export interface BinanceFundingRate {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
}

export interface BinanceTradeFee {
  symbol: string;
  makerCommission: string;
  takerCommission: string;
}

export interface OkxFundingRate {
  instId: string;
  fundingRate: string;
  fundingTime: string;
  nextFundingTime: string;
}

export interface OkxTradeFee {
  instId: string;
  makerU: string;
  takerU: string;
  makerUSDC: string;
  takerUSDC: string;
}

export interface MexcFundingRate {
  symbol: string;
  fundingRate: number;
  collectTime: number;
}

export interface MexcTradeFee {
  symbol: string;
  makerFeeRate: string;
  takerFeeRate: string;
}
