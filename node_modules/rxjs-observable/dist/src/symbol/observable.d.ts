declare global {
    interface SymbolConstructor {
        readonly observable: symbol;
    }
}
/** Symbol.observable or a string "@@observable". Used for interop */
export declare function getSymbolObservable(context: any): any;
export declare const observable: any;
