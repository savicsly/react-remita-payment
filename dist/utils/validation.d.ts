import { PaymentRequest, RemitaConfig } from "../types";
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhoneNumber: (phoneNumber: string) => boolean;
export declare const validateAmount: (amount: number) => boolean;
export declare const validateTransactionId: (transactionId: string) => boolean;
export declare const sanitizeString: (input: string) => string;
export declare const validatePaymentRequest: (paymentData: PaymentRequest) => string[];
export declare const validateRemitaConfig: (config: RemitaConfig) => string[];
export declare const generateTransactionRef: (prefix?: string) => string;
/**
 * Validates that we are in an appropriate environment for payment processing.
 * In SSR environments, always returns true and defers validation to client.
 * In browser environments, performs additional checks for security.
 *
 * @param win Optional window object to use instead of global window
 * @returns boolean indicating if the environment is valid
 */
export declare const validateEnvironment: (win?: typeof window) => boolean;
export declare const maskSensitiveData: (data: unknown) => Record<string, unknown>;
