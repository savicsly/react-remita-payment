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
import { 
// We still import validateEnvironment for type checking
validateEnvironment, validatePaymentRequest, validateRemitaConfig, } from "../utils/validation";
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
    var config = props.config, _a = props.environment, environment = _a === void 0 ? "demo" : _a, onSuccess = props.onSuccess, onError = props.onError, onClose = props.onClose, _b = props.win, win = _b === void 0 ? typeof window !== "undefined" ? window : undefined : _b;
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    var _e = useState(false), isScriptLoaded = _e[0], setIsScriptLoaded = _e[1];
    // Use refs to track hydration and mounting states for SSR compatibility
    var _f = useState(false), isMounted = _f[0], setIsMounted = _f[1];
    var hydrationComplete = useRef(false);
    // Safe error setter that only works after component is mounted
    var setErrorSafe = useCallback(function (val) {
        // Only set errors when mounted to prevent hydration issues
        if (isMounted) {
            setError(val);
        }
    }, [isMounted]);
    // Handle initial mount and hydration for SSR
    useEffect(function () {
        // Detect if we're in browser environment
        if (typeof window === "undefined" || typeof document === "undefined") {
            return; // Skip in SSR context
        }
        // For NextJS and other frameworks with hydration
        if (document.readyState === "complete" || document.readyState === "interactive") {
            hydrationComplete.current = true;
        }
        else {
            // Wait for complete DOM loading if not already complete
            var completeHydration_1 = function () {
                hydrationComplete.current = true;
                // Using a small delay ensures all React hydration is complete too
                setTimeout(function () { return setIsMounted(true); }, 20);
            };
            window.addEventListener("DOMContentLoaded", completeHydration_1);
            return function () { return window.removeEventListener("DOMContentLoaded", completeHydration_1); };
        }
        // Small delay to ensure React hydration is complete
        var timer = setTimeout(function () {
            setIsMounted(true);
        }, 20);
        return function () { return clearTimeout(timer); };
    }, []);
    // Perform validation only after component is safely mounted
    useEffect(function () {
        if (!isMounted)
            return;
        // Now that we're mounted in the client, perform validation
        var nextError = null;
        var configErrs = validateRemitaConfig(config);
        if (configErrs.length > 0) {
            nextError = "Configuration errors: ".concat(configErrs.join(", "));
        }
        if (nextError)
            setErrorSafe(nextError);
    }, [isMounted, config, setErrorSafe]);
    // We've removed the redundant effect as we're handling validation in the previous effect
    var scriptRef = useRef(null);
    var configErrors = useRef([]);
    /**
     * Load the Remita payment script with improved SSR handling
     * This function is resilient to both SSR and browser environments
     */
    var loadRemitaScript = useCallback(function () {
        return new Promise(function (resolve, reject) {
            // Robust check if we're in browser environment
            var isClient = typeof window !== "undefined" && typeof document !== "undefined";
            var currentWindow = isClient ? (win || window) : undefined;
            if (!currentWindow) {
                // We're in SSR environment - gracefully resolve without error
                console.log("RemitaPayment: SSR environment detected, deferring script loading to client");
                // Don't set any state in SSR to avoid hydration issues
                resolve();
                return;
            }
            // If we already have the Remita engine loaded, we can skip loading
            if (hasRmPaymentEngine(currentWindow) && isScriptLoaded) {
                resolve();
                return;
            }
            // Extra check to ensure DOM is fully available
            if (!currentWindow.document || !currentWindow.document.body) {
                console.warn("RemitaPayment: Document body not available yet, deferring script load");
                // Set a short timeout to retry after hydration
                setTimeout(function () {
                    loadRemitaScript().then(resolve).catch(reject);
                }, 50);
                return;
            }
            try {
                // Check if script is already loaded or loading
                var scriptUrl = SCRIPT_URLS[environment];
                var existingScript_1 = currentWindow.document.querySelector("script[src=\"".concat(scriptUrl, "\"]"));
                if (existingScript_1) {
                    // Script already exists, listen for its load/error events
                    if (existingScript_1.hasAttribute("data-loaded") || hasRmPaymentEngine(currentWindow)) {
                        // Script is already loaded
                        setIsScriptLoaded(true);
                        resolve();
                        return;
                    }
                    var onLoad_1 = function () {
                        existingScript_1.setAttribute("data-loaded", "true");
                        setIsScriptLoaded(true);
                        resolve();
                        cleanup_1();
                    };
                    var onError_1 = function () {
                        setErrorSafe("Failed to load Remita payment script");
                        reject(new Error("Failed to load Remita payment script"));
                        cleanup_1();
                    };
                    var cleanup_1 = function () {
                        existingScript_1.removeEventListener("load", onLoad_1);
                        existingScript_1.removeEventListener("error", onError_1);
                    };
                    existingScript_1.addEventListener("load", onLoad_1);
                    existingScript_1.addEventListener("error", onError_1);
                    return;
                }
                // Create and append the script
                var script_1 = currentWindow.document.createElement("script");
                script_1.src = scriptUrl;
                script_1.async = true;
                script_1.defer = true;
                script_1.id = "remita-payment-script-".concat(environment);
                script_1.onload = function () {
                    script_1.setAttribute("data-loaded", "true");
                    setIsScriptLoaded(true);
                    scriptRef.current = script_1;
                    resolve();
                };
                script_1.onerror = function () {
                    setErrorSafe("Failed to load Remita payment script");
                    reject(new Error("Failed to load Remita payment script"));
                };
                // Security attributes
                script_1.setAttribute("crossorigin", "anonymous");
                script_1.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
                script_1.setAttribute("data-remita", "payment-script");
                currentWindow.document.body.appendChild(script_1);
            }
            catch (error) {
                // Handle any DOM errors that might occur in different environments
                console.error("RemitaPayment: Error loading script:", error);
                setErrorSafe("Failed to load Remita payment script");
                reject(new Error("Failed to load Remita payment script"));
            }
        });
    }, [environment, isScriptLoaded, win, setErrorSafe]);
    useEffect(function () {
        return function () {
            if (scriptRef.current && scriptRef.current.parentNode) {
                scriptRef.current.parentNode.removeChild(scriptRef.current);
            }
        };
    }, []);
    var initiatePayment = useCallback(function (paymentData) { return __awaiter(void 0, void 0, void 0, function () {
        var currentWindow, paymentErrors, paymentOptions, err_1, errorMessage;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    currentWindow = win || (typeof window !== "undefined" ? window : undefined);
                    // Safety check for SSR environments
                    if (!currentWindow) {
                        setErrorSafe("Payment can only be initiated in a browser environment");
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
                    if (!currentWindow || !hasRmPaymentEngine(currentWindow)) {
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
                    // We've already verified currentWindow and RmPaymentEngine exist
                    currentWindow.RmPaymentEngine.init(paymentOptions);
                    currentWindow.RmPaymentEngine.showPaymentWidget();
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
    }); }, [
        config,
        isScriptLoaded,
        loadRemitaScript,
        setErrorSafe,
        onSuccess,
        onError,
        onClose,
        setIsLoading,
        win
    ]);
    var alwaysSafeInitiatePayment = useCallback(function (paymentData) { return __awaiter(void 0, void 0, void 0, function () {
        var currentWindow, errorMsg, configErrs, errorMsg, paymentErrors, errorMsg;
        return __generator(this, function (_a) {
            currentWindow = win || (typeof window !== "undefined" ? window : undefined);
            // In SSR, defer validation until client-side
            if (typeof window === "undefined") {
                return [2 /*return*/, Promise.resolve()]; // We're in SSR, will retry on client-side
            }
            // Use validateEnvironment to ensure we're in a browser context
            if (!validateEnvironment(currentWindow)) {
                errorMsg = "Payment can only be initiated in a browser environment";
                setErrorSafe(errorMsg);
                onError({
                    status: "error",
                    message: errorMsg,
                });
                return [2 /*return*/, Promise.resolve()];
            }
            configErrs = validateRemitaConfig(config);
            if (configErrs.length > 0) {
                errorMsg = "Configuration errors: ".concat(configErrs.join(", "));
                setErrorSafe(errorMsg);
                onError({
                    status: "error",
                    message: errorMsg,
                });
                return [2 /*return*/, Promise.resolve()];
            }
            paymentErrors = validatePaymentRequest(paymentData);
            if (paymentErrors.length > 0) {
                errorMsg = "Payment data errors: ".concat(paymentErrors.join(", "));
                setErrorSafe(errorMsg);
                onError({
                    status: "error",
                    message: errorMsg,
                });
                return [2 /*return*/, Promise.resolve()];
            }
            return [2 /*return*/, initiatePayment(paymentData)];
        });
    }); }, [win, config, initiatePayment, onError, setErrorSafe]);
    return {
        initiatePayment: alwaysSafeInitiatePayment,
        isLoading: isLoading,
        error: error,
        isScriptLoaded: isScriptLoaded,
    };
};
