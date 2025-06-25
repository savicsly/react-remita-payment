import React from 'react';
import { RemitaPaymentProps } from '../types';
import { useRemitaPayment } from '../hooks/useRemitaPayment';
import { generateTransactionRef } from '../utils/validation';

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
  environment = 'demo',
  onSuccess,
  onError,
  onClose,
  disabled = false,
  className = '',
  children,
}) => {
  const { initiatePayment, isLoading, error, isScriptLoaded } = useRemitaPayment({
    config,
    environment,
    onSuccess,
    onError,
    onClose,
  });

  const handlePayment = async () => {
    if (disabled || isLoading || !isScriptLoaded) {
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
    ? 'Processing...' 
    : !isScriptLoaded 
    ? 'Loading...' 
    : children || 'Pay Now';

  const isButtonDisabled = disabled || isLoading || !isScriptLoaded || !!error;

  return (
    <div className={`remita-payment-container ${className}`}>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isButtonDisabled}
        className="remita-payment-button"
        aria-label="Initiate Remita payment"
      >
        {buttonText}
      </button>
      {error && (
        <div className="remita-payment-error" role="alert">
          <span>Payment Error: {error}</span>
        </div>
      )}
    </div>
  );
};

export default RemitaPayment;

