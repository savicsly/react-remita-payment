export interface RemitaConfig {
  publicKey: string;
  serviceTypeId: string;
  currency?: string;
  customFields?: CustomField[];
  split?: SplitPayment[];
}
export interface CustomField {
  name: string;
  value: string;
}
export interface SplitPayment {
  lineItemsId: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  bankCode: string;
  beneficiaryAmount: number;
  deductFeeFrom: number;
}
export interface PaymentRequest {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  narration?: string;
  transactionId?: string; // Made optional for test flexibility
  customFields?: CustomField[];
}
export interface PaymentResponse {
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
export interface ErrorResponse {
  status: "error";
  message: string;
  code?: string;
  details?: Record<string, any>; // Details can be any object returned from Remita error
}
export type Environment = "live" | "demo";
export type PaymentSuccessCallback = (response: PaymentResponse) => void;
export type PaymentErrorCallback = (error: ErrorResponse) => void;
export type PaymentCloseCallback = () => void;
export interface RemitaPaymentProps {
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
export interface UseRemitaPaymentReturn {
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
export interface RemitaInitOptions {
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
  onSuccess: (response: any) => void; // Remita returns dynamic response object
  onError: (response: any) => void; // Remita returns dynamic error object
}
