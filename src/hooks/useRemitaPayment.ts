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
  // We still import validateEnvironment for type checking
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
  win?: typeof window;
}

const SCRIPT_URLS = {
  demo: "https://remitademo.net/payment/v1/remita-pay-inline.bundle.js",
  live: "https://login.remita.net/payment/v1/remita-pay-inline.bundle.js",
};

// Type guard for RmPaymentEngine
type RmPaymentEngineWin = typeof window & {
  RmPaymentEngine: {
    init: (options: unknown) => void;
    showPaymentWidget: () => void;
  };
};
function hasRmPaymentEngine(obj: unknown): obj is RmPaymentEngineWin {
  return (
    !!obj &&
    typeof obj === "object" &&
    "RmPaymentEngine" in obj &&
    typeof (obj as RmPaymentEngineWin).RmPaymentEngine?.init === "function" &&
    typeof (obj as RmPaymentEngineWin).RmPaymentEngine?.showPaymentWidget ===
      "function"
  );
}

export const useRemitaPayment = (
  props: UseRemitaPaymentProps
): UseRemitaPaymentReturn => {
  const {
    config,
    environment = "demo",
    onSuccess,
    onError,
    onClose,
    win = typeof window !== "undefined" ? window : undefined,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const setErrorSafe = useCallback((val: string | null) => {
    // Only set errors when mounted to prevent hydration issues
    if (isMounted) {
      setError(val);
    }
  }, [isMounted]);
  
  // Handle initial mount for SSR
  useEffect(() => {
    // Robust check to ensure we're fully hydrated in the browser
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Perform validation only after component is safely mounted
  useEffect(() => {
    if (!isMounted) return;
    
    // Now that we're mounted in the client, perform validation
    let nextError: string | null = null;
    const configErrs = validateRemitaConfig(config);
    if (configErrs.length > 0) {
      nextError = `Configuration errors: ${configErrs.join(", ")}`;
    }
    
    if (nextError) setErrorSafe(nextError);
  }, [isMounted, config, setErrorSafe]);

  // We've removed the redundant effect as we're handling validation in the previous effect

  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const configErrors = useRef<string[]>([]);

  const loadRemitaScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if we're in browser environment
      const currentWindow =
        win || (typeof window !== "undefined" ? window : undefined);

      if (!currentWindow) {
        // We're in SSR and can't load scripts, resolve without error as this will be retried client-side
        console.warn(
          "RemitaPayment: Detected SSR environment, deferring script loading to client"
        );
        setIsScriptLoaded(false);
        resolve();
        return;
      }

      if (hasRmPaymentEngine(currentWindow) && isScriptLoaded) {
        resolve();
        return;
      }

      try {
        const existingScript = currentWindow.document.querySelector(
          `script[src="${SCRIPT_URLS[environment]}"]`
        );

        if (existingScript) {
          existingScript.addEventListener("load", () => {
            setIsScriptLoaded(true);
            resolve();
          });
          existingScript.addEventListener("error", () => {
            setErrorSafe("Failed to load Remita payment script");
            reject(new Error("Failed to load Remita payment script"));
          });
          return;
        }

        const script = currentWindow.document.createElement("script");
        script.src = SCRIPT_URLS[environment];
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsScriptLoaded(true);
          scriptRef.current = script;
          resolve();
        };
        script.onerror = () => {
          setErrorSafe("Failed to load Remita payment script");
          reject(new Error("Failed to load Remita payment script"));
        };
        script.setAttribute("crossorigin", "anonymous");
        script.setAttribute(
          "referrerpolicy",
          "strict-origin-when-cross-origin"
        );
        currentWindow.document.body.appendChild(script);
      } catch (error) {
        // Handle any DOM errors that might occur in different environments
        console.error("RemitaPayment: Error loading script:", error);
        setErrorSafe("Failed to load Remita payment script");
        reject(new Error("Failed to load Remita payment script"));
      }
    });
  }, [environment, isScriptLoaded, win, setErrorSafe]);

  useEffect(() => {
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  const initiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      // Get the current window object, either from props or global
      const currentWindow =
        win || (typeof window !== "undefined" ? window : undefined);

      // Safety check for SSR environments
      if (!currentWindow) {
        setErrorSafe("Payment can only be initiated in a browser environment");
        return;
      }

      try {
        setIsLoading(true);
        setErrorSafe(null);
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
        if (!currentWindow || !hasRmPaymentEngine(currentWindow)) {
          throw new Error("Remita payment engine not available");
        }
        const paymentOptions = {
          key: config.publicKey,
          processRrr: true,
          transactionId: paymentData.transactionId ?? "",
          amount: paymentData.amount,
          currency: config.currency || "NGN",
          customerId: paymentData.email,
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          email: paymentData.email,
          phoneNumber: paymentData.phoneNumber ?? "",
          narration:
            paymentData.narration ||
            `Payment for ${paymentData.transactionId ?? ""}`,
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
          onError: (error: Record<string, unknown>) => {
            setIsLoading(false);
            const errorResponse: ErrorResponse = {
              status: "error",
              message: (error.message as string) || "Payment failed",
              code: error.code as string,
              details: error,
            };
            setErrorSafe(errorResponse.message);
            onError(errorResponse);
          },
          onClose: () => {
            setIsLoading(false);
            onClose();
          },
        };

        // We've already verified currentWindow and RmPaymentEngine exist
        currentWindow.RmPaymentEngine.init(paymentOptions);
        currentWindow.RmPaymentEngine.showPaymentWidget();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setErrorSafe(errorMessage);
        setIsLoading(false);
        onError({
          status: "error",
          message: errorMessage,
        });
      }
    },
    [config, isScriptLoaded, loadRemitaScript, onSuccess, onError, onClose, win, setErrorSafe]
  );

  const alwaysSafeInitiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      // Get the current window object, either from props or global
      const currentWindow =
        win || (typeof window !== "undefined" ? window : undefined);

      // In SSR, defer validation until client-side
      if (typeof window === "undefined") {
        return Promise.resolve(); // We're in SSR, will retry on client-side
      }

      // Use validateEnvironment to ensure we're in a browser context
      if (!validateEnvironment(currentWindow)) {
        const errorMsg =
          "Payment can only be initiated in a browser environment";
        setErrorSafe(errorMsg);
        onError({
          status: "error",
          message: errorMsg,
        });
        return Promise.resolve();
      }

      const configErrs = validateRemitaConfig(config);
      if (configErrs.length > 0) {
        const errorMsg = `Configuration errors: ${configErrs.join(", ")}`;
        setErrorSafe(errorMsg);
        onError({
          status: "error",
          message: errorMsg,
        });
        return Promise.resolve();
      }

      const paymentErrors = validatePaymentRequest(paymentData);
      if (paymentErrors.length > 0) {
        const errorMsg = `Payment data errors: ${paymentErrors.join(", ")}`;
        setErrorSafe(errorMsg);
        onError({
          status: "error",
          message: errorMsg,
        });
        return Promise.resolve();
      }

      return initiatePayment(paymentData);
    },
    [win, config, initiatePayment, onError, setErrorSafe]
  );

  return {
    initiatePayment: alwaysSafeInitiatePayment,
    isLoading,
    error,
    isScriptLoaded,
  };
};
