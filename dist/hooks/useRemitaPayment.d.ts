import { Environment, PaymentCloseCallback, PaymentErrorCallback, PaymentSuccessCallback, RemitaConfig, UseRemitaPaymentReturn } from "../types";
interface UseRemitaPaymentProps {
    config: RemitaConfig;
    environment?: Environment;
    onSuccess: PaymentSuccessCallback;
    onError: PaymentErrorCallback;
    onClose: PaymentCloseCallback;
    win?: typeof window;
}
export declare const useRemitaPayment: (props: UseRemitaPaymentProps) => UseRemitaPaymentReturn;
export {};
