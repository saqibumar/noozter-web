"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Lifted from https://github.com/ReactiveX/rxjs/blob/5.3.0/src/symbol/observable.ts
/** Symbol.observable or a string "@@observable". Used for interop */
function getSymbolObservable(context) {
    var $$observable;
    var Symbol = context.Symbol;
    if (typeof Symbol === 'function') {
        if (Symbol.observable) {
            $$observable = Symbol.observable;
        }
        else {
            $$observable = Symbol('observable');
            Symbol.observable = $$observable;
        }
    }
    else {
        $$observable = '@@observable';
    }
    return $$observable;
}
exports.getSymbolObservable = getSymbolObservable;
exports.observable = getSymbolObservable(typeof window === 'undefined' ? {} : window);
//# sourceMappingURL=observable.js.map