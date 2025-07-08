import { PaymentRequest, RemitaConfig } from "../types";
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhoneNumber: (phoneNumber: string) => boolean;
export declare const validateAmount: (amount: number | string) => boolean;
export declare const isHighValueAmount: (amount: number | string) => boolean;
export declare const validateTransactionId: (transactionId: string) => boolean;
export declare const sanitizeString: (input: string) => string;
export declare const validatePaymentRequest: (paymentData: PaymentRequest) => string[];
export declare const validateRemitaConfig: (config: RemitaConfig) => string[];
export declare const generateTransactionRef: (prefix?: string) => string;
/**
 * Validates that we are in an appropriate environment for payment processing.
 * Designed to work seamlessly in both client-side React and SSR frameworks like Next.js.
 * Always returns true during SSR to prevent rendering errors.
 *
 * @returns boolean indicating if the environment is valid for payment processing
 */
export declare const validateEnvironment: () => boolean;
export declare const maskSensitiveData: (data: unknown) => Record<string, unknown>;
