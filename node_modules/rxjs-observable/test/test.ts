import {test} from 'ava'
import {map} from 'rxjs/operators'
import {Observable} from '../src'

test('the basics', t => {
  let o = new Observable<number>(_ => _.next(10))
  o.pipe(map(_ => _ * 2)).subscribe(_ => t.is(_, 20))
})
