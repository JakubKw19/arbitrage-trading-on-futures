import { Injectable, OnModuleInit } from '@nestjs/common';
import { MarketGateway } from 'src/gateway/market.gateway';
import WebSocket from 'ws';
import { MarketExchange } from './types/marketExchanges';
import { marketExchangesSubject } from './market.pubsub';

@Injectable()
export class OkxClient implements OnModuleInit {
  private client: WebSocket;

  constructor(private readonly gateway: MarketGateway) {
    this.client = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
  }

  onModuleInit() {
    console.log('hi');
    this.client.on('open', () => {
      const subscribe = {
        op: 'subscribe',
        args: [
          { channel: 'books5', instType: 'FUTURES', instId: 'BNB-USDT' },
          { channel: 'books5', instType: 'FUTURES', instId: 'BTC-USDT' },
        ],
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
