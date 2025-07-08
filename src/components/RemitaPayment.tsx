import React, { useState } from "react";
import { useRemitaPayment } from "../hooks/useRemitaPayment";
import { RemitaPaymentProps } from "../types";
import { generateTransactionRef } from "../utils/validation";

/**
 * RemitaPayment component for processing inline payments with Remita
 * Enhanced with full SSR support for Next.js and other frameworks
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
const RemitaPayment: React.FC<RemitaPaymentProps> = ({
  config,
  paymentData,
  environment = "demo",
  onSuccess,
  onError,
  onClose,
  disabled = false,
  className = "",
  children,
}) => {
  // Enhanced SSR detection using multiple strategies
  const [isBrowser, setIsBrowser] = useState(false);
  const [isFullyMounted, setIsFullyMounted] = useState(false);
  const hasHydrated = React.useRef(false);
  
  // Two-stage mounting process to handle SSR:
  // 1. First detect if we're in a browser
  // 2. Then confirm we've fully mounted after hydration
  
  // Set browser state immediately (affects first render)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setIsBrowser(true);
      
      // Using requestAnimationFrame ensures we're in a paint cycle
      // This helps avoid hydration mismatches in strict frameworks
      const raf = requestAnimationFrame(() => {
        // Add a small delay to ensure full hydration
        setTimeout(() => {
          hasHydrated.current = true;
          setIsFullyMounted(true);
        }, 10);
      });
      
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  // Use the hook with SSR safeguards
  const { initiatePayment, isLoading, error, isScriptLoaded } =
    useRemitaPayment({
      config,
      environment,
      onSuccess,
      onError,
      onClose,
      // Only provide window object in browser environment
      win: isBrowser ? window : undefined,
    });

  // Safe payment handler with additional SSR & hydration checks
  const handlePayment = async () => {
    // Guard against calls during SSR or before hydration completes
    if (disabled || isLoading || !isScriptLoaded || !isFullyMounted || !isBrowser || !hasHydrated.current) {
      return;
    }

    // Generate transaction reference if not provided
    const paymentWithRef = {
      ...paymentData,
      transactionId: paymentData.transactionId || generateTransactionRef(),
    };

    await initiatePayment(paymentWithRef);
  };

  // Show different button text based on component state
  const buttonText = isLoading
    ? "Processing..."
    : !isFullyMounted || !isScriptLoaded
    ? "Loading..."
    : children || "Pay Now";

  // Button remains disabled during SSR and until fully mounted
  const isButtonDisabled =
    disabled || isLoading || !isScriptLoaded || !isFullyMounted || !isBrowser || !!error;

  return (
    <div className={`remita-payment-container ${className}`}>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isButtonDisabled}
        className="remita-payment-button"
        aria-label="Initiate Remita payment"
        style={{
          cursor: isButtonDisabled ? "not-allowed" : "pointer",
          opacity: isButtonDisabled ? 0.7 : 1,
        }}
      >
        {buttonText}
      </button>
      {error && isFullyMounted && (
        <div className="remita-payment-error" role="alert">
          <span>Payment Error: {error}</span>
        </div>
      )}
    </div>
  );
};

export default RemitaPayment;
