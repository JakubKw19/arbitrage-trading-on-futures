import { Injectable, OnModuleInit } from '@nestjs/common';
import { MarketGateway } from 'src/gateway/market.gateway';
import WebSocket from 'ws';
import { MarketExchange } from './types/marketExchanges';
import { addExchange, marketExchangesSubject } from './market.pubsub';

@Injectable()
export class OkxClient implements OnModuleInit {
  private client: WebSocket;

  constructor(private readonly gateway: MarketGateway) {
    this.client = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
  }

  async getAllTrades() {
    const res = await fetch(
      'https://www.okx.com/api/v5/public/instruments?instType=SWAP',
    );
    const data = await res.json();

    const instruments = data.data
      .filter((inst) => inst.state === 'live')
      .map((inst) => inst.instFamily);

    addExchange({
      name: 'okx',
      cryptoPairs: instruments.map((s) => {
        return {
          pair: s,
          pairCode:
            s.split('-')[0].toLowerCase() + s.split('-')[1].toLowerCase(),
        };
      }),
    });
    return instruments;
  }

  async onModuleInit() {
    const trades = await this.getAllTrades();
    this.client.on('open', () => {
      const subscribe = {
        op: 'subscribe',
        args: trades.map((s) => {
          return { channel: 'books5', instType: 'SWAP', instId: s };
        }),
      };
      this.client.send(JSON.stringify(subscribe));
    });
    this.client.on('message', (msg: WebSocket.Data) => {
      const json = JSON.parse(msg.toString());
      const data = json.data;
      if (!data) return;

      const dataToSend: MarketExchange = data.map((entry: any) => ({
        exchange: 'okx',
        symbol: entry.instId.replace('-', ''),
        bids: entry.bids.map((bid: any) => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1]),
        })),
        asks: entry.asks.map((ask: any) => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1]),
        })),
        timestamp: Date.now(),
      }));

      // console.log(json);
      // this.gateway.broadcastUpdate('okx', json);
      marketExchangesSubject.next(dataToSend[0]);
    });
  }
}
