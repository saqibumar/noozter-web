import { Observer, PartialObserver, TeardownLogic } from 'rxjs/internal/types';
import { Subscription } from './Subscription';
export declare class Subscriber<T> extends Subscription implements Observer<T> {
    /** @internal */ syncErrorValue: any;
    /** @internal */ syncErrorThrown: boolean;
    /** @internal */ syncErrorThrowable: boolean;
    protected isStopped: boolean;
    protected destination: PartialObserver<any>;
    private _parentSubscription;
    /**
     * @param {Observer|function(value: T): void} [destinationOrNext] A partially
     * defined Observer or a `next` callback function.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     */
    constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void), error?: (e?: any) => void, complete?: () => void);
    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param {T} [value] The `next` value.
     * @return {void}
     */
    next(value?: T): void;
    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached `Error`. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param {any} [err] The `error` exception.
     * @return {void}
     */
    error(err?: any): void;
    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     * @return {void}
     */
    complete(): void;
    unsubscribe(): void;
    protected _next(value: T): void;
    protected _error(err: any): void;
    protected _complete(): void;
    /** @deprecated This is an internal implementation detail, do not use. */
    _addParentTeardownLogic(parentTeardownLogic: TeardownLogic): void;
    /** @deprecated This is an internal implementation detail, do not use. */
    _unsubscribeParentSubscription(): void;
    /** @deprecated This is an internal implementation detail, do not use. */
    _unsubscribeAndRecycle(): Subscriber<T>;
}
