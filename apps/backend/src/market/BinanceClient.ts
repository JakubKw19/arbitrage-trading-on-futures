import { Injectable, OnModuleInit } from '@nestjs/common';
import WebSocket from 'ws';
import { MarketGateway } from '../gateway/market.gateway';
import { MarketExchange } from './types/marketExchanges';
import { addExchange, marketExchangesSubject } from './market.pubsub';

@Injectable()
export class BinanceClient implements OnModuleInit {
  private client: WebSocket;

  constructor(private readonly gateway: MarketGateway) {
    this.client = new WebSocket(
      'wss://fstream.binance.com/ws/bnbusdt@depth5/btcusdt@depth5',
    );
  }

  async getAllTrades() {
    const res = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
    const data = await res.json();
    const symbols = data.symbols
      .filter((s) => s.status === 'TRADING')
      .map((s) => s.symbol.toLowerCase());
    const params = symbols.map((symbol) => `${symbol}@depth5`);
    addExchange({
      name: 'binance',
      cryptoPairs: data.symbols.map((s) => {
        return {
          pair: s.baseAsset + '-' + s.quoteAsset,
          pairCode: s.symbol.toLowerCase(),
        };
      }),
    });
    return params;
  }

  async onModuleInit() {
    const params = await this.getAllTrades();
    this.client.on('open', () => {
      this.client.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params,
          id: 1,
        }),
      );
    });
    this.client.on('message', (msg: WebSocket.Data) => {
      const json = JSON.parse(msg.toString());
      const data = json.data;
      // console.log(json);
      const dataToSend: MarketExchange = {
        exchange: 'binance',
        symbol: json.s,
        bids: json.b.map((bid: any) => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1]),
        })),
        asks: json.a.map((ask: any) => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1]),
        })),
        timestamp: Date.now(),
      };
      // this.gateway.broadcastUpdate('binance', json);
      marketExchangesSubject.next(dataToSend);
    });
  }
}
