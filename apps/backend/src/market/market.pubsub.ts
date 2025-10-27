import { BehaviorSubject, Subject } from 'rxjs';
import { AvailableExchanges, MarketExchange } from './types/marketExchanges';

export const marketExchangesSubject = new Subject<MarketExchange>();
export const availableExchangesSubject =
  new BehaviorSubject<AvailableExchanges>([]);

export function addExchange(newExchange: AvailableExchanges[number]) {
  const current = availableExchangesSubject.getValue();
  availableExchangesSubject.next([...current, newExchange]);
}
