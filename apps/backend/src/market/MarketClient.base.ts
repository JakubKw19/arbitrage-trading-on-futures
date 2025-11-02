import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import WebSocket from 'ws';

@Injectable()
export abstract class MarketClient {
  protected client: WebSocket | null = null;
  protected exchangeName: 'binance' | 'okx';
  protected reconnectAttempts = 0;
  protected reconnectTimeout: NodeJS.Timeout | null = null;
  protected pingInterval: NodeJS.Timeout | null = null;
  protected isConnected = false;
  protected shouldReconnect = true;
  protected subscriptionParams: any = [];

  constructor(
    protected readonly configService: ConfigService,
    exchangeName: 'binance' | 'okx',
  ) {
    this.exchangeName = exchangeName;
  }

  protected connect(wsUrl: string) {
    if (this.client) {
      this.cleanup();
    }

    this.client = new WebSocket(wsUrl);

    this.client.on('open', () => this.handleOpen());
    this.client.on('message', (msg: WebSocket.Data) => this.handleMessage(msg));
    this.client.on('error', (error: Error) => this.handleError(error));
    this.client.on('close', (code: number, reason: Buffer) =>
      this.handleClose(code, reason),
    );
    this.client.on('ping', () => this.handlePing());
    this.client.on('pong', () => this.handlePong());
  }

  protected cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      this.client.removeAllListeners();
      if (this.client.readyState === WebSocket.OPEN) {
        this.client.close();
      }
      this.client = null;
    }
  }

  protected handleOpen() {
    this.isConnected = true;
    this.reconnectAttempts = 0;

    console.log('Websocket connected', this.exchangeName);
    this.startPingInterval();
  }

  protected abstract handleMessage(msg: WebSocket.Data): void;

  protected handleError(error: Error) {
    console.error(error);
  }

  protected handleClose(code: number, reason: Buffer) {
    this.isConnected = false;
    console.log('Websocket closed ', code, reason.toString());
    this.cleanup();
  }

  protected handlePing() {
    console.log('Received ping', this.exchangeName);
    // this.logger.debug("Received ping", { exchange: "binance" })
  }

  protected handlePong() {
    console.log('Received pong', this.exchangeName);
    // this.logger.debug("Received pong", { exchange: "binance" })
  }

  protected startPingInterval() {
    const config = this.configService.exchanges[this.exchangeName];
    this.pingInterval = setInterval(() => {
      if (this.client && this.isConnected) {
        this.client.ping();
      }
    }, config.pingInterval);
  }

  protected abstract subscribe(message: any): void;

  protected abstract reconnect(): void;

  protected subsriptionInit() {
    if (this.subscriptionParams.length > 0) {
      this.subscribe(this.subscriptionParams);
    } else {
      console.error('Subscription Params not set.');
    }
  }

  public abstract subscribeToClient(exchanges): void;

  public destroy() {
    this.shouldReconnect = false;
    this.cleanup();
    console.log('Client destroyed', this.exchangeName);
  }
}
