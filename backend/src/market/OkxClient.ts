import { Injectable, OnModuleInit } from '@nestjs/common';
import { MarketGateway } from 'src/gateway/market.gateway';
import WebSocket from 'ws';

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
      console.log(json);
      this.gateway.broadcastUpdate('okx', json);
    });
  }
}
