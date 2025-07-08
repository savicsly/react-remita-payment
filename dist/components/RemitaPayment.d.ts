import React from "react";
import { RemitaPaymentProps } from "../types";
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
declare const RemitaPayment: React.FC<RemitaPaymentProps>;
export default RemitaPayment;
