import { PaymentRequest, RemitaConfig } from "../types";
// Validates email format using a comprehensive regex
export const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};
// Validates phone number format (Nigerian format)
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^(\+234|234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ""));
};
// Validates amount to ensure it's positive and within reasonable limits
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000000 && Number.isFinite(amount);
};
// Validates transaction ID format
export const validateTransactionId = (transactionId: string): boolean => {
  const transactionIdRegex = /^[a-zA-Z0-9-_]{6,50}$/;
  return transactionIdRegex.test(transactionId);
};
// Sanitizes string input to prevent XSS
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, "")
    .replace(/[&]/g, "&amp;")
    .replace(/['"]/g, "")
    .trim();
};
// Validates the entire payment request
export const validatePaymentRequest = (
  paymentData: PaymentRequest
): string[] => {
  const errors: string[] = [];
  if (!paymentData.amount || !validateAmount(paymentData.amount)) {
    errors.push(
      "Invalid amount. Amount must be a positive number and not exceed 10,000,000"
    );
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
  if (
    !paymentData.transactionId ||
    !validateTransactionId(paymentData.transactionId)
  ) {
    errors.push("Invalid transaction ID. Must be 6-50 alphanumeric characters");
  }
  if (
    paymentData.phoneNumber &&
    !validatePhoneNumber(paymentData.phoneNumber)
  ) {
    errors.push("Invalid phone number format");
  }
  return errors;
};
// Validates Remita configuration
export const validateRemitaConfig = (config: RemitaConfig): string[] => {
  const errors: string[] = [];
  if (!config.publicKey || config.publicKey.trim().length === 0) {
    errors.push("Public key is required");
  }
  if (!config.serviceTypeId || config.serviceTypeId.trim().length === 0) {
    errors.push("Service type ID is required");
  }
  if (
    config.currency &&
    !["NGN", "USD", "GBP", "EUR"].includes(config.currency)
  ) {
    errors.push("Invalid currency. Supported currencies: NGN, USD, GBP, EUR");
  }
  return errors;
};
// Generates a secure transaction reference
export const generateTransactionRef = (prefix: string = "RMT"): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`.toUpperCase();
};
// Validates that required environment variables are set
export const validateEnvironment = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  // Warn if not using HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    window.location.protocol !== "https:"
  ) {
    console.warn("HTTPS is recommended for production payment processing");
  }
  return true;
};
// Masks sensitive data for logging
export const maskSensitiveData = (
  data: Record<string, unknown>
): Record<string, unknown> => {
  const masked = { ...data };
  if (typeof masked.email === "string") {
    const [localPart, domain] = masked.email.split("@");
    masked.email = `${localPart.charAt(0)}***@${domain}`;
  }
  if (typeof masked.phoneNumber === "string") {
    masked.phoneNumber = `***${masked.phoneNumber.slice(-4)}`;
  }
  if (typeof masked.publicKey === "string") {
    masked.publicKey = `${masked.publicKey.slice(
      0,
      4
    )}***${masked.publicKey.slice(-4)}`;
  }
  return masked;
};
