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
import { useCallback, useEffect, useRef, useState } from "react";
import { validateEnvironment, validatePaymentRequest, validateRemitaConfig, } from "../utils/validation";
var SCRIPT_URLS = {
    demo: "https://remitademo.net/payment/v1/remita-pay-inline.bundle.js",
    live: "https://login.remita.net/payment/v1/remita-pay-inline.bundle.js",
};
function hasRmPaymentEngine(obj) {
    var _a, _b;
    return (!!obj &&
        typeof obj === "object" &&
        "RmPaymentEngine" in obj &&
        typeof ((_a = obj.RmPaymentEngine) === null || _a === void 0 ? void 0 : _a.init) === "function" &&
        typeof ((_b = obj.RmPaymentEngine) === null || _b === void 0 ? void 0 : _b.showPaymentWidget) ===
            "function");
}
export var useRemitaPayment = function (props) {
    var config = props.config, _a = props.environment, environment = _a === void 0 ? "demo" : _a, onSuccess = props.onSuccess, onError = props.onError, onClose = props.onClose, win = props.win;
    var initialError = null;
    if (!validateEnvironment(win)) {
        initialError = "Invalid environment for payment processing";
    }
    else {
        var configErrs = validateRemitaConfig(config);
        if (configErrs.length > 0) {
            initialError = "Configuration errors: ".concat(configErrs.join(", "));
        }
    }
    var _b = useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(initialError), error = _c[0], setError = _c[1];
    var _d = useState(false), isScriptLoaded = _d[0], setIsScriptLoaded = _d[1];
    var setErrorSafe = function (val) {
        setError(val);
    };
    useEffect(function () {
        var nextError = null;
        if (!validateEnvironment(win)) {
            nextError = "Invalid environment for payment processing";
        }
        else {
            var configErrs = validateRemitaConfig(config);
            if (configErrs.length > 0) {
                nextError = "Configuration errors: ".concat(configErrs.join(", "));
            }
        }
        if (error === null && nextError !== null)
            setErrorSafe(nextError);
    }, [win, config, error]);
    var scriptRef = useRef(null);
    var configErrors = useRef([]);
    var loadRemitaScript = useCallback(function () {
        return new Promise(function (resolve, reject) {
            if (win && hasRmPaymentEngine(win) && isScriptLoaded) {
                resolve();
                return;
            }
            if (!win) {
                setErrorSafe("Invalid environment for payment processing");
                reject(new Error("Invalid environment for payment processing"));
                return;
            }
            var existingScript = win.document.querySelector("script[src=\"".concat(SCRIPT_URLS[environment], "\"]"));
            if (existingScript) {
                existingScript.addEventListener("load", function () {
                    setIsScriptLoaded(true);
                    resolve();
                });
                existingScript.addEventListener("error", function () {
                    setErrorSafe("Failed to load Remita payment script");
                    reject(new Error("Failed to load Remita payment script"));
                });
                return;
            }
            var script = win.document.createElement("script");
            script.src = SCRIPT_URLS[environment];
            script.async = true;
            script.defer = true;
            script.onload = function () {
                setIsScriptLoaded(true);
                scriptRef.current = script;
                resolve();
            };
            script.onerror = function () {
                setErrorSafe("Failed to load Remita payment script");
                reject(new Error("Failed to load Remita payment script"));
            };
            script.setAttribute("crossorigin", "anonymous");
            script.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            win.document.body.appendChild(script);
        });
    }, [environment, isScriptLoaded, win]);
    useEffect(function () {
        return function () {
            if (scriptRef.current && scriptRef.current.parentNode) {
                scriptRef.current.parentNode.removeChild(scriptRef.current);
            }
        };
    }, []);
    var initiatePayment = useCallback(function (paymentData) { return __awaiter(void 0, void 0, void 0, function () {
        var paymentErrors, paymentOptions, err_1, errorMessage;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!validateEnvironment(win)) {
                        setErrorSafe("Invalid environment for payment processing");
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    setIsLoading(true);
                    setErrorSafe(null);
                    if (configErrors.current.length > 0) {
                        throw new Error("Configuration errors: ".concat(configErrors.current.join(", ")));
                    }
                    paymentErrors = validatePaymentRequest(paymentData);
                    if (paymentErrors.length > 0) {
                        throw new Error("Payment data errors: ".concat(paymentErrors.join(", ")));
                    }
                    if (!!isScriptLoaded) return [3 /*break*/, 3];
                    return [4 /*yield*/, loadRemitaScript()];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    if (!win || !hasRmPaymentEngine(win)) {
                        throw new Error("Remita payment engine not available");
                    }
                    paymentOptions = {
                        key: config.publicKey,
                        processRrr: true,
                        transactionId: (_a = paymentData.transactionId) !== null && _a !== void 0 ? _a : "",
                        amount: paymentData.amount,
                        currency: config.currency || "NGN",
                        customerId: paymentData.email,
                        firstName: paymentData.firstName,
                        lastName: paymentData.lastName,
                        email: paymentData.email,
                        phoneNumber: (_b = paymentData.phoneNumber) !== null && _b !== void 0 ? _b : "",
                        narration: paymentData.narration ||
                            "Payment for ".concat((_c = paymentData.transactionId) !== null && _c !== void 0 ? _c : ""),
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
                        onError: function (error) {
                            setIsLoading(false);
                            var errorResponse = {
                                status: "error",
                                message: error.message || "Payment failed",
                                code: error.code,
                                details: error,
                            };
                            setErrorSafe(errorResponse.message);
                            onError(errorResponse);
                        },
                        onClose: function () {
                            setIsLoading(false);
                            onClose();
                        },
                    };
                    win.RmPaymentEngine.init(paymentOptions);
                    win.RmPaymentEngine.showPaymentWidget();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _d.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : "Unknown error occurred";
                    setErrorSafe(errorMessage);
                    setIsLoading(false);
                    onError({
                        status: "error",
                        message: errorMessage,
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [config, isScriptLoaded, loadRemitaScript, onSuccess, onError, onClose, win]);
    var alwaysSafeInitiatePayment = useCallback(function (paymentData) { return __awaiter(void 0, void 0, void 0, function () {
        var configErrs, paymentErrors;
        return __generator(this, function (_a) {
            if (!validateEnvironment(win)) {
                setErrorSafe("Invalid environment for payment processing");
                onError({
                    status: "error",
                    message: "Invalid environment for payment processing",
                });
                return [2 /*return*/, Promise.resolve()];
            }
            configErrs = validateRemitaConfig(config);
            if (configErrs.length > 0) {
                setErrorSafe("Configuration errors: ".concat(configErrs.join(", ")));
                onError({
                    status: "error",
                    message: "Configuration errors: ".concat(configErrs.join(", ")),
                });
                return [2 /*return*/, Promise.resolve()];
            }
            paymentErrors = validatePaymentRequest(paymentData);
            if (paymentErrors.length > 0) {
                setErrorSafe("Payment data errors: ".concat(paymentErrors.join(", ")));
                onError({
                    status: "error",
                    message: "Payment data errors: ".concat(paymentErrors.join(", ")),
                });
                return [2 /*return*/, Promise.resolve()];
            }
            return [2 /*return*/, initiatePayment(paymentData)];
        });
    }); }, [win, config, initiatePayment, onError]);
    return {
        initiatePayment: alwaysSafeInitiatePayment,
        isLoading: isLoading,
        error: error,
        isScriptLoaded: isScriptLoaded,
    };
};
