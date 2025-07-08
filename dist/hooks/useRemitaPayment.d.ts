import { Environment, PaymentCloseCallback, PaymentErrorCallback, PaymentSuccessCallback, // Re-added this import
RemitaConfig, UseRemitaPaymentReturn } from "../types";
interface UseRemitaPaymentProps {
    config: RemitaConfig;
    environment?: Environment;
    onSuccess: PaymentSuccessCallback;
    onError: PaymentErrorCallback;
    onClose: PaymentCloseCallback;
}
/**
 * Custom hook for Remita payment integration.
 * This hook abstracts the complexity of loading the Remita script
 * and initiating a payment, designed to work seamlessly in
 * both standard React and Next.js (SSR) applications.
 */
export declare const useRemitaPayment: (props: UseRemitaPaymentProps) => UseRemitaPaymentReturn;
export {};
