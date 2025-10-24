import { Subject } from 'rxjs';
import { MarketExchange } from './types/marketExchanges';

export const marketExchangesSubject = new Subject<MarketExchange>();
