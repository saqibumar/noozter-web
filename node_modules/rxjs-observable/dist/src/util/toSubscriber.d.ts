import { PartialObserver } from 'rxjs/internal/types';
import { Subscriber } from '../Subscriber';
export declare function toSubscriber<T>(nextOrObserver?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscriber<T>;
