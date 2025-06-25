import React$1 from 'react';

interface RemitaConfig {
    publicKey: string;
    serviceTypeId: string;
    currency?: string;
    customFields?: CustomField[];
    split?: SplitPayment[];
}
interface CustomField {
    name: string;
    value: string;
}
interface SplitPayment {
    lineItemsId: string;
    beneficiaryName: string;
    beneficiaryAccount: string;
    bankCode: string;
    beneficiaryAmount: number;
    deductFeeFrom: number;
}
interface PaymentRequest {
    amount: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    narration?: string;
    transactionId?: string;
    customFields?: CustomField[];
}
interface PaymentResponse {
    status: "success" | "failed" | "pending";
    transactionId: string;
    paymentReference?: string;
    message: string;
    amount?: number;
    currency?: string;
    channel?: string;
    gatewayResponseCode?: string;
    gatewayResponseMessage?: string;
}
interface ErrorResponse {
    status: "error";
    message: string;
    code?: string;
    details?: Record<string, any>;
}
type Environment = "live" | "demo";
type PaymentSuccessCallback = (response: PaymentResponse) => void;
type PaymentErrorCallback = (error: ErrorResponse) => void;
type PaymentCloseCallback = () => void;
interface RemitaPaymentProps {
    config: RemitaConfig;
    paymentData: PaymentRequest;
    environment?: Environment;
    onSuccess: PaymentSuccessCallback;
    onError: PaymentErrorCallback;
    onClose: PaymentCloseCallback;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}
interface UseRemitaPaymentReturn {
    initiatePayment: (paymentData: PaymentRequest) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    isScriptLoaded: boolean;
}
declare global {
    interface Window {
        RmPaymentEngine?: {
            init: (options: RemitaInitOptions) => void;
            showPaymentWidget: () => void;
            hidePaymentWidget: () => void;
        };
    }
}
interface RemitaInitOptions {
    key: string;
    processRrr: boolean;
    transactionId: string;
    amount: number;
    currency: string;
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    narration?: string;
    onSuccess: (response: any) => void;
    onError: (response: any) => void;
}

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
declare const RemitaPayment: React$1.FC<RemitaPaymentProps>;

interface UseRemitaPaymentProps {
    config: RemitaConfig;
    environment?: Environment;
    onSuccess: PaymentSuccessCallback;
    onError: PaymentErrorCallback;
    onClose: PaymentCloseCallback;
    win?: typeof window;
}
declare const useRemitaPayment: (props: UseRemitaPaymentProps) => UseRemitaPaymentReturn;

declare const validateEmail: (email: string) => boolean;
declare const validatePhoneNumber: (phoneNumber: string) => boolean;
declare const validateAmount: (amount: number) => boolean;
declare const validateTransactionId: (transactionId: string) => boolean;
declare const sanitizeString: (input: string) => string;
declare const validatePaymentRequest: (paymentData: PaymentRequest) => string[];
declare const validateRemitaConfig: (config: RemitaConfig) => string[];
declare const generateTransactionRef: (prefix?: string) => string;
declare const validateEnvironment: (win?: typeof window) => boolean;
declare const maskSensitiveData: (data: unknown) => Record<string, unknown>;

export { CustomField, Environment, ErrorResponse, PaymentCloseCallback, PaymentErrorCallback, PaymentRequest, PaymentResponse, PaymentSuccessCallback, RemitaConfig, RemitaInitOptions, RemitaPayment, RemitaPaymentProps, SplitPayment, UseRemitaPaymentReturn, generateTransactionRef, maskSensitiveData, sanitizeString, useRemitaPayment, validateAmount, validateEmail, validateEnvironment, validatePaymentRequest, validatePhoneNumber, validateRemitaConfig, validateTransactionId };
