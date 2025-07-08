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
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  // Use state to track client-side mounting
  const [isMounted, setIsMounted] = useState(false);
  
  // Safe error setter that only works after component is mounted
  const setErrorSafe = useCallback(
    (val: string | null) => {
      // Only set errors when mounted to prevent hydration issues
      if (isMounted) {
        setError(val);
      }
    },
    [isMounted]
  );
  
  // Handle initial mount for any environment
  useEffect(() => {
    // Skip in SSR context
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
    // Simple mounting detection - works in all React environments
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

  /**
   * Load the Remita payment script with improved SSR handling
   * This function is resilient to both SSR and browser environments
   */
  const loadRemitaScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Robust check if we're in browser environment
      const isClient = typeof window !== "undefined" && typeof document !== "undefined";

      if (!isClient) {
        // We're in SSR environment - gracefully resolve without error
        // Don't set any state in SSR to avoid hydration issues
        resolve();
        return;
      }
      
      // If we already have the Remita engine loaded, we can skip loading
      if (window.RmPaymentEngine && isScriptLoaded) {
        resolve();
        return;
      }

      // Extra check to ensure DOM is fully available
      if (!document || !document.body) {
        // Set a short timeout to retry after hydration
        setTimeout(() => {
          loadRemitaScript().then(resolve).catch(reject);
        }, 50);
        return;
      }

      try {
        // Check if script is already loaded or loading
        const scriptUrl = SCRIPT_URLS[environment];
        const existingScript = document.querySelector(
          `script[src="${scriptUrl}"]`
        );

        if (existingScript) {
          // Script already exists, listen for its load/error events
          if (existingScript.hasAttribute("data-loaded") || window.RmPaymentEngine) {
            // Script is already loaded
            setIsScriptLoaded(true);
            resolve();
            return;
          }
          
          const onLoad = () => {
            existingScript.setAttribute("data-loaded", "true");
            setIsScriptLoaded(true);
            resolve();
            cleanup();
          };
          
          const onError = () => {
            setErrorSafe("Failed to load Remita payment script");
            reject(new Error("Failed to load Remita payment script"));
            cleanup();
          };
          
          const cleanup = () => {
            existingScript.removeEventListener("load", onLoad);
            existingScript.removeEventListener("error", onError);
          };
          
          existingScript.addEventListener("load", onLoad);
          existingScript.addEventListener("error", onError);
          return;
        }

        // Create and append the script
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        script.id = `remita-payment-script-${environment}`;
        
        script.onload = () => {
          script.setAttribute("data-loaded", "true");
          setIsScriptLoaded(true);
          scriptRef.current = script;
          resolve();
        };
        
        script.onerror = () => {
          setErrorSafe("Failed to load Remita payment script");
          reject(new Error("Failed to load Remita payment script"));
        };
        
        // Security attributes
        script.setAttribute("crossorigin", "anonymous");
        script.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        script.setAttribute("data-remita", "payment-script");
        
        document.body.appendChild(script);
      } catch (error) {
        // Handle any DOM errors that might occur in different environments
        console.error("RemitaPayment: Error loading script:", error);
        setErrorSafe("Failed to load Remita payment script");
        reject(new Error("Failed to load Remita payment script"));
      }
    });
  }, [environment, isScriptLoaded, setErrorSafe]);

  useEffect(() => {
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  const initiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      // Safety check for SSR environments
      if (typeof window === "undefined") {
        // We're in SSR, do nothing
        return;
      }

      try {
        setIsLoading(true);
        setErrorSafe(null);
        
        // Validate configuration and payment data
        const paymentErrors = validatePaymentRequest(paymentData);
        if (paymentErrors.length > 0) {
          throw new Error(`Payment data errors: ${paymentErrors.join(", ")}`);
        }
        
        // Load the script if not already loaded
        if (!isScriptLoaded) {
          await loadRemitaScript();
        }
        
        // Check if Remita engine is available
        if (!window.RmPaymentEngine) {
          throw new Error("Remita payment engine not available");
        }
        
        // Prepare payment options
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

        // Initialize and show payment widget
        window.RmPaymentEngine.init(paymentOptions);
        window.RmPaymentEngine.showPaymentWidget();
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
    [
      config,
      isScriptLoaded,
      loadRemitaScript,
      setErrorSafe,
      onSuccess,
      onError,
      onClose,
      setIsLoading
    ]
  );

  const alwaysSafeInitiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      // In SSR, defer validation until client-side
      if (typeof window === "undefined") {
        return Promise.resolve(); // We're in SSR, will retry on client-side
      }

      // Do an early check for configuration errors
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

      // Check for payment data errors
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

      // If we pass all checks, proceed with payment
      return initiatePayment(paymentData);
    },
    [config, initiatePayment, onError, setErrorSafe]
  );

  return {
    initiatePayment: alwaysSafeInitiatePayment,
    isLoading,
    error,
    isScriptLoaded,
  };
};
