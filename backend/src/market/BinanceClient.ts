import { Injectable, OnModuleInit } from '@nestjs/common';
import WebSocket from 'ws';
import { MarketGateway } from '../gateway/market.gateway';

@Injectable()
export class BinanceClient implements OnModuleInit {
  private client: WebSocket;

  constructor(private readonly gateway: MarketGateway) {
    this.client = new WebSocket(
      'wss://fstream.binance.com/ws/bnbusdt@depth5/btcusdt@depth5',
    );
  }

  onModuleInit() {
    console.log('hi');
    this.client.on('open', () => console.log('Binance connected'));
    this.client.on('message', (msg: WebSocket.Data) => {
      const json = JSON.parse(msg.toString());
      // console.log(json);
      // this.gateway.broadcastUpdate('binance', json);
    });
  }
}
