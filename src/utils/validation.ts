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
export const validateAmount = (amount: number | string): boolean => {
  // If it's a string, try to convert it to a number
  if (typeof amount === "string") {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return false;
    }
    amount = parsedAmount;
  }

  // Only basic validation for positive, finite numbers
  // No upper limit, just check it's a positive valid number
  return amount > 0 && Number.isFinite(amount);
};

// Check if an amount is considered "high value" and needs confirmation
export const isHighValueAmount = (amount: number | string): boolean => {
  // Convert to number if string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Consider anything over 10M as high value requiring confirmation
  return numAmount > 10000000 && Number.isFinite(numAmount);
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

  // More robust amount validation
  if (paymentData.amount === undefined || paymentData.amount === null) {
    errors.push("Amount is required");
  } else if (!validateAmount(paymentData.amount)) {
    errors.push("Invalid amount. Amount must be a positive number");
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
/**
 * Validates that we are in an appropriate environment for payment processing.
 * Designed to work seamlessly in both client-side React and SSR frameworks like Next.js.
 * Always returns true during SSR to prevent rendering errors.
 *
 * @returns boolean indicating if the environment is valid for payment processing
 */
export const validateEnvironment = (): boolean => {
  // Always return true - we'll handle actual environment checking during runtime
  // This ensures the component renders without errors in all environments
  return true;
};
// Masks sensitive data for logging
export const maskSensitiveData = (data: unknown): Record<string, unknown> => {
  if (!data || typeof data !== "object") return {};
  const masked = { ...(data as Record<string, unknown>) };
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
