import React, { useEffect, useState } from "react";
import { useRemitaPayment } from "../hooks/useRemitaPayment";
import { RemitaPaymentProps } from "../types";
import { generateTransactionRef } from "../utils/validation";

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
  // Track if component is mounted in client environment for SSR support
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { initiatePayment, isLoading, error, isScriptLoaded } =
    useRemitaPayment({
      config,
      environment,
      onSuccess,
      onError,
      onClose,
      // Pass the window object explicitly only on client-side
      win: typeof window !== "undefined" ? window : undefined,
    });

  const handlePayment = async () => {
    if (disabled || isLoading || !isScriptLoaded || !isMounted) {
      return;
    }

    // Generate transaction reference if not provided
    const paymentWithRef = {
      ...paymentData,
      transactionId: paymentData.transactionId || generateTransactionRef(),
    };

    await initiatePayment(paymentWithRef);
  };

  const buttonText = isLoading
    ? "Processing..."
    : !isMounted || !isScriptLoaded
    ? "Loading..."
    : children || "Pay Now";

  const isButtonDisabled =
    disabled || isLoading || !isScriptLoaded || !isMounted || !!error;

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
      {error && isMounted && (
        <div className="remita-payment-error" role="alert">
          <span>Payment Error: {error}</span>
        </div>
      )}
    </div>
  );
};

export default RemitaPayment;
