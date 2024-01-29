"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var operators_1 = require("rxjs/operators");
var src_1 = require("../src");
ava_1.test('the basics', function (t) {
    var o = new src_1.Observable(function (_) { return _.next(10); });
    o.pipe(operators_1.map(function (_) { return _ * 2; })).subscribe(function (_) { return t.is(_, 20); });
});
//# sourceMappingURL=test.js.map