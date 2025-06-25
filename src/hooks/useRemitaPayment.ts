import { useCallback, useEffect, useRef, useState } from "react";
import {
  Environment,
  ErrorResponse,
  PaymentCloseCallback,
  PaymentErrorCallback,
  PaymentRequest,
  PaymentResponse,
  PaymentSuccessCallback,
  RemitaConfig,
  UseRemitaPaymentReturn,
} from "../types";
import {
  maskSensitiveData,
  validateEnvironment,
  validatePaymentRequest,
  validateRemitaConfig,
} from "../utils/validation";

interface UseRemitaPaymentProps {
  config: RemitaConfig;
  environment?: Environment;
  onSuccess: PaymentSuccessCallback;
  onError: PaymentErrorCallback;
  onClose: PaymentCloseCallback;
}

const SCRIPT_URLS = {
  demo: "https://remitademo.net/payment/v1/remita-pay-inline.bundle.js",
  live: "https://login.remita.net/payment/v1/remita-pay-inline.bundle.js",
};

export const useRemitaPayment = ({
  config,
  environment = "demo",
  onSuccess,
  onError,
  onClose,
}: UseRemitaPaymentProps): UseRemitaPaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const configErrors = useRef<string[]>([]);

  useEffect(() => {
    if (!validateEnvironment()) {
      setError("Invalid environment for payment processing");
    }
  }, []);

  useEffect(() => {
    configErrors.current = validateRemitaConfig(config);
    if (configErrors.current.length > 0) {
      setError(`Configuration errors: ${configErrors.current.join(", ")}`);
    } else {
      setError(null);
    }
  }, [config]);

  // Loads the Remita payment script dynamically if not already loaded
  const loadRemitaScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.RmPaymentEngine && isScriptLoaded) {
        resolve();
        return;
      }
      const existingScript = document.querySelector(
        `script[src="${SCRIPT_URLS[environment]}"]`
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsScriptLoaded(true);
          resolve();
        });
        existingScript.addEventListener("error", () => {
          reject(new Error("Failed to load Remita payment script"));
        });
        return;
      }
      const script = document.createElement("script");
      script.src = SCRIPT_URLS[environment];
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        scriptRef.current = script;
        resolve();
      };
      script.onerror = () => {
        setError("Failed to load Remita payment script");
        reject(new Error("Failed to load Remita payment script"));
      };
      script.setAttribute("crossorigin", "anonymous");
      script.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      document.body.appendChild(script);
    });
  }, [environment, isScriptLoaded]);

  // Cleanup script on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  // Initiates the Remita payment process
  const initiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        if (configErrors.current.length > 0) {
          throw new Error(
            `Configuration errors: ${configErrors.current.join(", ")}`
          );
        }
        const paymentErrors = validatePaymentRequest(paymentData);
        if (paymentErrors.length > 0) {
          throw new Error(`Payment data errors: ${paymentErrors.join(", ")}`);
        }
        if (!isScriptLoaded) {
          await loadRemitaScript();
        }
        if (!window.RmPaymentEngine) {
          throw new Error("Remita payment engine not available");
        }
        // Mask sensitive data before logging for security
        console.log(
          "Initiating payment with data:",
          maskSensitiveData(paymentData)
        );
        const paymentOptions = {
          key: config.publicKey,
          processRrr: true,
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          currency: config.currency || "NGN",
          customerId: paymentData.email,
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          email: paymentData.email,
          phoneNumber: paymentData.phoneNumber,
          narration:
            paymentData.narration || `Payment for ${paymentData.transactionId}`,
          onSuccess: (response: any) => {
            // Handle successful payment
            console.log("Payment successful:", maskSensitiveData(response));
            setIsLoading(false);
            const successResponse: PaymentResponse = {
              status: "success",
              transactionId: paymentData.transactionId,
              paymentReference:
                response.paymentReference || response.transactionId,
              message: response.message || "Payment successful",
              amount: paymentData.amount,
              currency: config.currency || "NGN",
              channel: response.channel,
              gatewayResponseCode: response.gatewayResponseCode,
              gatewayResponseMessage: response.gatewayResponseMessage,
            };
            onSuccess(successResponse);
          },
          onError: (error: any) => {
            // Handle payment error
            console.error("Payment error:", maskSensitiveData(error));
            setIsLoading(false);
            const errorResponse: ErrorResponse = {
              status: "error",
              message: error.message || "Payment failed",
              code: error.code,
              details: error,
            };
            setError(errorResponse.message);
            onError(errorResponse);
          },
          onClose: () => {
            console.log("Payment dialog closed");
            setIsLoading(false);
            onClose();
          },
        };

        window.RmPaymentEngine.init(paymentOptions);
        window.RmPaymentEngine.showPaymentWidget();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Payment initiation error:", errorMessage);
        setError(errorMessage);
        setIsLoading(false);

        onError({
          status: "error",
          message: errorMessage,
        });
      }
    },
    [config, isScriptLoaded, loadRemitaScript, onSuccess, onError, onClose]
  );

  const wrappedInitiatePayment = useCallback(
    (paymentData: PaymentRequest) => initiatePayment(paymentData),
    [initiatePayment]
  );

  return {
    initiatePayment: wrappedInitiatePayment,
    isLoading,
    error,
    isScriptLoaded,
  };
};
