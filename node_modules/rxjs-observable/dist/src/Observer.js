"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hostReportError_1 = require("./util/hostReportError");
exports.empty = {
    closed: true,
    next: function (value) {
        /* noop */
    },
    error: function (err) {
        hostReportError_1.hostReportError(err);
    },
    complete: function () {
        /*noop*/
    }
};
//# sourceMappingURL=Observer.js.map