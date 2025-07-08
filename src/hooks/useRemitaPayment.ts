import { useCallback, useEffect, useState } from "react";
import {
  Environment,
  ErrorResponse,
  PaymentCloseCallback,
  PaymentErrorCallback,
  PaymentRequest,
  PaymentResponse,
  PaymentSuccessCallback, // Re-added this import
  RemitaConfig,
  UseRemitaPaymentReturn,
} from "../types";
import { loadRemitaScript } from "../utils/script-loader";
import {
  validatePaymentRequest,
  validateRemitaConfig,
} from "../utils/validation";

// Interface for the hook's props
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
export const useRemitaPayment = (
  props: UseRemitaPaymentProps
): UseRemitaPaymentReturn => {
  const { config, environment = "demo", onSuccess, onError, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Effect to track client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to validate config once mounted
  useEffect(() => {
    if (!isMounted) return;

    const configErrors = validateRemitaConfig(config);
    if (configErrors.length > 0) {
      setError(`Configuration errors: ${configErrors.join(", ")}`);
    }
  }, [isMounted, config]);

  /**
   * Initiate payment with Remita.
   * Handles validation, script loading, and payment processing.
   */
  const initiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      // Ensure we are in a client-side environment
      if (typeof window === "undefined" || !isMounted) {
        console.error(
          "Payment initiation called in a non-browser environment."
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Validate payment data
        const paymentErrors = validatePaymentRequest(paymentData);
        if (paymentErrors.length > 0) {
          throw new Error(`Payment data errors: ${paymentErrors.join(", ")}`);
        }

        // 2. Load the Remita script using the centralized loader
        await loadRemitaScript(environment);
        setIsScriptLoaded(true);

        // 3. Check if the Remita engine is available
        if (
          typeof window.RmPaymentEngine?.init !== "function" ||
          typeof window.RmPaymentEngine?.showPaymentWidget !== "function"
        ) {
          throw new Error(
            "Remita Payment Engine failed to initialize correctly."
          );
        }

        console.log("Remita engine is ready.");

        // 4. Prepare payment options
        const paymentOptions = {
          key: config.publicKey,
          processRrr: true,
          transactionId: paymentData.transactionId ?? `TXN_${Date.now()}`,
          amount: paymentData.amount,
          currency: config.currency || "NGN",
          customerId: paymentData.email,
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          email: paymentData.email,
          phoneNumber: paymentData.phoneNumber ?? "",
          narration:
            paymentData.narration ||
            `Payment for ${paymentData.transactionId ?? "transaction"}`,
          onSuccess: (response: Record<string, unknown>) => {
            setIsLoading(false);
            const successResponse: PaymentResponse = {
              status: "success",
              transactionId: paymentData.transactionId ?? "",
              paymentReference:
                (response.paymentReference as string) ||
                (response.transactionId as string),
              message: (response.message as string) || "Payment successful",
              amount: paymentData.amount,
              currency: config.currency || "NGN",
              channel: response.channel as string,
              gatewayResponseCode: response.gatewayResponseCode as string,
              gatewayResponseMessage: response.gatewayResponseMessage as string,
            };
            onSuccess(successResponse);
          },
          onError: (errorResponse: Record<string, unknown>) => {
            setIsLoading(false);
            const err: ErrorResponse = {
              status: "error",
              message: (errorResponse.message as string) || "Payment failed",
              code: errorResponse.code as string,
              details: errorResponse,
            };
            setError(err.message);
            onError(err);
          },
          onClose: () => {
            setIsLoading(false);
            onClose();
          },
        };

        // 5. Initialize and show the payment widget
        console.log("Initializing payment widget...");
        window.RmPaymentEngine.init(paymentOptions);

        console.log("Showing payment widget...");
        window.RmPaymentEngine.showPaymentWidget();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        setIsLoading(false);
        onError({
          status: "error",
          message: errorMessage,
        });
      }
    },
    [config, environment, isMounted, onSuccess, onError, onClose]
  );

  return {
    initiatePayment,
    isLoading,
    error,
    isScriptLoaded,
  };
};
