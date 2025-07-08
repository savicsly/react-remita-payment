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
import { useCallback, useEffect, useState } from "react";
import { loadRemitaScript } from "../utils/script-loader";
import { validatePaymentRequest, validateRemitaConfig, } from "../utils/validation";
/**
 * Custom hook for Remita payment integration.
 * This hook abstracts the complexity of loading the Remita script
 * and initiating a payment, designed to work seamlessly in
 * both standard React and Next.js (SSR) applications.
 */
export var useRemitaPayment = function (props) {
    var config = props.config, _a = props.environment, environment = _a === void 0 ? "demo" : _a, onSuccess = props.onSuccess, onError = props.onError, onClose = props.onClose;
    var _b = useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(false), isScriptLoaded = _d[0], setIsScriptLoaded = _d[1];
    var _e = useState(false), isMounted = _e[0], setIsMounted = _e[1];
    // Effect to track client-side mounting
    useEffect(function () {
        setIsMounted(true);
    }, []);
    // Effect to validate config once mounted
    useEffect(function () {
        if (!isMounted)
            return;
        var configErrors = validateRemitaConfig(config);
        if (configErrors.length > 0) {
            setError("Configuration errors: ".concat(configErrors.join(", ")));
        }
    }, [isMounted, config]);
    /**
     * Initiate payment with Remita.
     * Handles validation, script loading, and payment processing.
     */
    var initiatePayment = useCallback(function (paymentData) { return __awaiter(void 0, void 0, void 0, function () {
        var paymentErrors, paymentOptions, err_1, errorMessage;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    // Ensure we are in a client-side environment
                    if (typeof window === "undefined" || !isMounted) {
                        console.error("Payment initiation called in a non-browser environment.");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    paymentErrors = validatePaymentRequest(paymentData);
                    if (paymentErrors.length > 0) {
                        throw new Error("Payment data errors: ".concat(paymentErrors.join(", ")));
                    }
                    // 2. Load the Remita script using the centralized loader
                    return [4 /*yield*/, loadRemitaScript(environment)];
                case 2:
                    // 2. Load the Remita script using the centralized loader
                    _f.sent();
                    setIsScriptLoaded(true);
                    // 3. Check if the Remita engine is available
                    if (typeof ((_a = window.RmPaymentEngine) === null || _a === void 0 ? void 0 : _a.init) !== "function" ||
                        typeof ((_b = window.RmPaymentEngine) === null || _b === void 0 ? void 0 : _b.showPaymentWidget) !== "function") {
                        throw new Error("Remita Payment Engine failed to initialize correctly.");
                    }
                    console.log("Remita engine is ready.");
                    paymentOptions = {
                        key: config.publicKey,
                        processRrr: true,
                        transactionId: (_c = paymentData.transactionId) !== null && _c !== void 0 ? _c : "TXN_".concat(Date.now()),
                        amount: paymentData.amount,
                        currency: config.currency || "NGN",
                        customerId: paymentData.email,
                        firstName: paymentData.firstName,
                        lastName: paymentData.lastName,
                        email: paymentData.email,
                        phoneNumber: (_d = paymentData.phoneNumber) !== null && _d !== void 0 ? _d : "",
                        narration: paymentData.narration ||
                            "Payment for ".concat((_e = paymentData.transactionId) !== null && _e !== void 0 ? _e : "transaction"),
                        onSuccess: function (response) {
                            var _a;
                            setIsLoading(false);
                            var successResponse = {
                                status: "success",
                                transactionId: (_a = paymentData.transactionId) !== null && _a !== void 0 ? _a : "",
                                paymentReference: response.paymentReference ||
                                    response.transactionId,
                                message: response.message || "Payment successful",
                                amount: paymentData.amount,
                                currency: config.currency || "NGN",
                                channel: response.channel,
                                gatewayResponseCode: response.gatewayResponseCode,
                                gatewayResponseMessage: response.gatewayResponseMessage,
                            };
                            onSuccess(successResponse);
                        },
                        onError: function (errorResponse) {
                            setIsLoading(false);
                            var err = {
                                status: "error",
                                message: errorResponse.message || "Payment failed",
                                code: errorResponse.code,
                                details: errorResponse,
                            };
                            setError(err.message);
                            onError(err);
                        },
                        onClose: function () {
                            setIsLoading(false);
                            onClose();
                        },
                    };
                    // 5. Initialize and show the payment widget
                    console.log("Initializing payment widget...");
                    window.RmPaymentEngine.init(paymentOptions);
                    console.log("Showing payment widget...");
                    window.RmPaymentEngine.showPaymentWidget();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _f.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : "An unknown error occurred.";
                    setError(errorMessage);
                    setIsLoading(false);
                    onError({
                        status: "error",
                        message: errorMessage,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [config, environment, isMounted, onSuccess, onError, onClose]);
    return {
        initiatePayment: initiatePayment,
        isLoading: isLoading,
        error: error,
        isScriptLoaded: isScriptLoaded,
    };
};
