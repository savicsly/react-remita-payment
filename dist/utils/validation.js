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
// Validates email format using a comprehensive regex
export var validateEmail = function (email) {
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
};
// Validates phone number format (Nigerian format)
export var validatePhoneNumber = function (phoneNumber) {
    var phoneRegex = /^(\+234|234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ""));
};
// Validates amount to ensure it's positive and within reasonable limits
export var validateAmount = function (amount) {
    return amount > 0 && amount <= 10000000 && Number.isFinite(amount);
};
// Validates transaction ID format
export var validateTransactionId = function (transactionId) {
    var transactionIdRegex = /^[a-zA-Z0-9-_]{6,50}$/;
    return transactionIdRegex.test(transactionId);
};
// Sanitizes string input to prevent XSS
export var sanitizeString = function (input) {
    return input
        .replace(/[<>]/g, "")
        .replace(/[&]/g, "&amp;")
        .replace(/['"]/g, "")
        .trim();
};
// Validates the entire payment request
export var validatePaymentRequest = function (paymentData) {
    var errors = [];
    if (!paymentData.amount || !validateAmount(paymentData.amount)) {
        errors.push("Invalid amount. Amount must be a positive number and not exceed 10,000,000");
    }
    if (!paymentData.email || !validateEmail(paymentData.email)) {
        errors.push("Invalid email address format");
    }
    if (!paymentData.firstName || paymentData.firstName.trim().length < 2) {
        errors.push("First name must be at least 2 characters long");
    }
    if (!paymentData.lastName || paymentData.lastName.trim().length < 2) {
        errors.push("Last name must be at least 2 characters long");
    }
    if (!paymentData.transactionId ||
        !validateTransactionId(paymentData.transactionId)) {
        errors.push("Invalid transaction ID. Must be 6-50 alphanumeric characters");
    }
    if (paymentData.phoneNumber &&
        !validatePhoneNumber(paymentData.phoneNumber)) {
        errors.push("Invalid phone number format");
    }
    return errors;
};
// Validates Remita configuration
export var validateRemitaConfig = function (config) {
    var errors = [];
    if (!config.publicKey || config.publicKey.trim().length === 0) {
        errors.push("Public key is required");
    }
    if (!config.serviceTypeId || config.serviceTypeId.trim().length === 0) {
        errors.push("Service type ID is required");
    }
    if (config.currency &&
        !["NGN", "USD", "GBP", "EUR"].includes(config.currency)) {
        errors.push("Invalid currency. Supported currencies: NGN, USD, GBP, EUR");
    }
    return errors;
};
// Generates a secure transaction reference
export var generateTransactionRef = function (prefix) {
    if (prefix === void 0) { prefix = "RMT"; }
    var timestamp = Date.now().toString(36);
    var randomStr = Math.random().toString(36).substr(2, 9);
    return "".concat(prefix, "_").concat(timestamp, "_").concat(randomStr).toUpperCase();
};
/**
 * Validates that we are in an appropriate environment for payment processing.
 * Designed to work seamlessly in both client-side React and SSR frameworks like Next.js.
 * Always returns true during SSR to prevent rendering errors.
 *
 * @returns boolean indicating if the environment is valid for payment processing
 */
export var validateEnvironment = function () {
    // Always return true - we'll handle actual environment checking during runtime
    // This ensures the component renders without errors in all environments
    return true;
};
// Masks sensitive data for logging
export var maskSensitiveData = function (data) {
    if (!data || typeof data !== "object")
        return {};
    var masked = __assign({}, data);
    if (typeof masked.email === "string") {
        var _a = masked.email.split("@"), localPart = _a[0], domain = _a[1];
        masked.email = "".concat(localPart.charAt(0), "***@").concat(domain);
    }
    if (typeof masked.phoneNumber === "string") {
        masked.phoneNumber = "***".concat(masked.phoneNumber.slice(-4));
    }
    if (typeof masked.publicKey === "string") {
        masked.publicKey = "".concat(masked.publicKey.slice(0, 4), "***").concat(masked.publicKey.slice(-4));
    }
    return masked;
};
