import { TeardownLogic } from 'rxjs/internal/types';
import { Subscriber } from './Subscriber';
export interface Operator<T, R> {
    call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}
