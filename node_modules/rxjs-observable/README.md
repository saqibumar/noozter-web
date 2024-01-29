# rxjs-observable

> Standalone [`Observable`](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts), pulled out of RxJS 6.3.1.

## Why would anyone want this?

You probably don't want this. This package is convenient if your bundler doesn't support tree-shaking, and you want to use `Observable` without pulling in 150kb of other RxJS stuff.

## How big is it?

5.5kb, uglified and gzipped (with plans to cut that down even more).

## Wait, why is `rxjs` a dependency?

It's just for the types (look at the code if you don't believe me).

## TODO

- Generate this package automatically from rxjs.

## Tests?

`yarn test`

## License

MIT
