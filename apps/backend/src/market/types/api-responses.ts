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
