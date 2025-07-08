import React, { useEffect, useState } from "react";
import { useRemitaPayment } from "../hooks/useRemitaPayment";
import { RemitaPaymentProps } from "../types";
import { generateTransactionRef, isHighValueAmount } from "../utils/validation";

/**
 * RemitaPayment component for processing inline payments with Remita
 * Works universally in both React and Next.js environments
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
  // Client-side mounting detection (for SSR compatibility)
  const [isMounted, setIsMounted] = useState(false);

  // Mount detection - simpler and more reliable
  useEffect(() => {
    // Set mounted flag only in browser
    setIsMounted(true);
  }, []);

  // Use the payment hook
  const { initiatePayment, isLoading, error } = useRemitaPayment({
    config,
    environment,
    onSuccess,
    onError,
    onClose,
  });

  // Handle payment initiation with enhanced safety checks
  const handlePayment = async () => {
    // Skip payment if conditions aren't met
    if (!isMounted || isLoading || disabled) {
      return;
    }

    // Generate transaction reference if not provided
    const paymentWithRef = {
      ...paymentData,
      transactionId: paymentData.transactionId || generateTransactionRef(),
    };

    // Check if this is a high-value transaction
    if (isHighValueAmount(paymentData.amount)) {
      // Format the amount for display
      const formattedAmount =
        typeof paymentData.amount === "number"
          ? paymentData.amount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          : paymentData.amount;

      // Ask for confirmation before proceeding with high-value transaction
      const confirmHighValue = window.confirm(
        `You're about to make a high-value payment of ${formattedAmount}. Are you sure you want to proceed?`
      );

      if (!confirmHighValue) {
        return; // User canceled the high-value transaction
      }
    }

    try {
      // Attempt payment, even if script isn't marked as loaded yet
      // The initiatePayment function will handle loading if needed
      await initiatePayment(paymentWithRef);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      // Error is handled within useRemitaPayment hook
    }
  };

  // Determine button text based on component state with clearer loading states
  const buttonText = !isMounted
    ? "Loading..."
    : isLoading
    ? "Processing Payment..."
    : children || "Pay Now";

  // We only disable the button in critical cases, allowing clicks to trigger script load
  // This improves user experience when script loading is delayed
  const isButtonDisabled = !isMounted || isLoading || disabled || !!error;

  return (
    <div className={`remita-payment-container ${className}`}>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isButtonDisabled}
        className={`remita-payment-button${
          isButtonDisabled ? " remita-payment-button-disabled" : ""
        }`}
        aria-label="Initiate Remita payment"
        style={{
          cursor: isButtonDisabled ? "not-allowed" : "pointer",
          opacity: isButtonDisabled ? 0.7 : 1,
        }}
        data-testid="remita-payment-button"
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
