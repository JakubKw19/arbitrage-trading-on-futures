import { Entity } from 'typeorm';
import { BaseMarketData } from './baseMarketData.entity';

@Entity('okx_market_data')
export class OkxMarketData extends BaseMarketData {
  constructor() {
    super('okx');
  }
}
