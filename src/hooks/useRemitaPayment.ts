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
    win,
  } = props;

  let initialError: string | null = null;
  if (!validateEnvironment(win)) {
    initialError = "Invalid environment for payment processing";
  } else {
    const configErrs = validateRemitaConfig(config);
    if (configErrs.length > 0) {
      initialError = `Configuration errors: ${configErrs.join(", ")}`;
    }
  }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const setErrorSafe = (val: string | null) => {
    setError(val);
  };

  useEffect(() => {
    let nextError: string | null = null;
    if (!validateEnvironment(win)) {
      nextError = "Invalid environment for payment processing";
    } else {
      const configErrs = validateRemitaConfig(config);
      if (configErrs.length > 0) {
        nextError = `Configuration errors: ${configErrs.join(", ")}`;
      }
    }
    if (error === null && nextError !== null) setErrorSafe(nextError);
  }, [win, config, error]);

  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const configErrors = useRef<string[]>([]);

  const loadRemitaScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (win && hasRmPaymentEngine(win) && isScriptLoaded) {
        resolve();
        return;
      }
      if (!win) {
        setErrorSafe("Invalid environment for payment processing");
        reject(new Error("Invalid environment for payment processing"));
        return;
      }
      const existingScript = win.document.querySelector(
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
      const script = win.document.createElement("script");
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
      script.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      win.document.body.appendChild(script);
    });
  }, [environment, isScriptLoaded, win]);

  useEffect(() => {
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, []);

  const initiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      if (!validateEnvironment(win)) {
        setErrorSafe("Invalid environment for payment processing");
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
        if (!win || !hasRmPaymentEngine(win)) {
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

        win.RmPaymentEngine.init(paymentOptions);
        win.RmPaymentEngine.showPaymentWidget();
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
    [config, isScriptLoaded, loadRemitaScript, onSuccess, onError, onClose, win]
  );

  const alwaysSafeInitiatePayment = useCallback(
    async (paymentData: PaymentRequest): Promise<void> => {
      if (!validateEnvironment(win)) {
        setErrorSafe("Invalid environment for payment processing");
        onError({
          status: "error",
          message: "Invalid environment for payment processing",
        });
        return Promise.resolve();
      }
      const configErrs = validateRemitaConfig(config);
      if (configErrs.length > 0) {
        setErrorSafe(`Configuration errors: ${configErrs.join(", ")}`);
        onError({
          status: "error",
          message: `Configuration errors: ${configErrs.join(", ")}`,
        });
        return Promise.resolve();
      }
      const paymentErrors = validatePaymentRequest(paymentData);
      if (paymentErrors.length > 0) {
        setErrorSafe(`Payment data errors: ${paymentErrors.join(", ")}`);
        onError({
          status: "error",
          message: `Payment data errors: ${paymentErrors.join(", ")}`,
        });
        return Promise.resolve();
      }
      return initiatePayment(paymentData);
    },
    [win, config, initiatePayment, onError]
  );

  return {
    initiatePayment: alwaysSafeInitiatePayment,
    isLoading,
    error,
    isScriptLoaded,
  };
};
