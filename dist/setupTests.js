var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import "@testing-library/jest-dom";
global.window.RmPaymentEngine = {
    init: jest.fn(),
    showPaymentWidget: jest.fn(),
    hidePaymentWidget: jest.fn(),
};
global.console = __assign(__assign({}, console), { log: jest.fn(), warn: jest.fn(), error: jest.fn() });
