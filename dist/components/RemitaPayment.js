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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRemitaPayment } from '../hooks/useRemitaPayment';
import { generateTransactionRef } from '../utils/validation';
/**
 * RemitaPayment component for processing inline payments with Remita
 *
 * @param config - Remita configuration including public key and service type ID
 * @param paymentData - Payment information including amount, customer details, etc.
 * @param environment - Environment to use ('demo' or 'live')
 * @param onSuccess - Callback function called on successful payment
 * @param onError - Callback function called on payment error
 * @param onClose - Callback function called when payment dialog is closed
 * @param disabled - Whether the payment button should be disabled
 * @param className - Additional CSS classes for styling
 * @param children - Child elements to render (typically a button)
 */
var RemitaPayment = function (_a) {
    var config = _a.config, paymentData = _a.paymentData, _b = _a.environment, environment = _b === void 0 ? 'demo' : _b, onSuccess = _a.onSuccess, onError = _a.onError, onClose = _a.onClose, _c = _a.disabled, disabled = _c === void 0 ? false : _c, _d = _a.className, className = _d === void 0 ? '' : _d, children = _a.children;
    var _e = useRemitaPayment({
        config: config,
        environment: environment,
        onSuccess: onSuccess,
        onError: onError,
        onClose: onClose,
    }), initiatePayment = _e.initiatePayment, isLoading = _e.isLoading, error = _e.error, isScriptLoaded = _e.isScriptLoaded;
    var handlePayment = function () { return __awaiter(void 0, void 0, void 0, function () {
        var paymentWithRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (disabled || isLoading || !isScriptLoaded) {
                        return [2 /*return*/];
                    }
                    paymentWithRef = __assign(__assign({}, paymentData), { transactionId: paymentData.transactionId || generateTransactionRef() });
                    return [4 /*yield*/, initiatePayment(paymentWithRef)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var buttonText = isLoading
        ? 'Processing...'
        : !isScriptLoaded
            ? 'Loading...'
            : children || 'Pay Now';
    var isButtonDisabled = disabled || isLoading || !isScriptLoaded || !!error;
    return (_jsxs("div", { className: "remita-payment-container ".concat(className), children: [_jsx("button", { type: "button", onClick: handlePayment, disabled: isButtonDisabled, className: "remita-payment-button", "aria-label": "Initiate Remita payment", children: buttonText }), error && (_jsx("div", { className: "remita-payment-error", role: "alert", children: _jsxs("span", { children: ["Payment Error: ", error] }) }))] }));
};
export default RemitaPayment;
