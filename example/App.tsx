import React, { useState } from "react";
import {
  ErrorResponse,
  generateTransactionRef,
  PaymentRequest,
  PaymentResponse,
  RemitaConfig,
  RemitaPayment,
} from "react-remita-payment";

const ExampleApp: React.FC = () => {
  const [paymentResult, setPaymentResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Example Remita configuration (replace with your actual keys in production)
  const config: RemitaConfig = {
    publicKey: "your-remita-public-key",
    serviceTypeId: "your-service-type-id",
    currency: "NGN",
  };

  // Example payment data
  const paymentData: PaymentRequest = {
    amount: 10000,
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    transactionId: generateTransactionRef("DEMO"),
    phoneNumber: "+2348012345678",
    narration: "Payment for premium services",
  };

  // Handles successful payment callback
  const handlePaymentSuccess = (response: PaymentResponse) => {
    console.log("Payment successful:", response);
    setPaymentResult(
      `Payment successful! Reference: ${response.paymentReference}`
    );
    setIsLoading(false);
  };

  // Handles payment error callback
  const handlePaymentError = (error: ErrorResponse) => {
    console.error("Payment failed:", error);
    setPaymentResult(`Payment failed: ${error.message}`);
    setIsLoading(false);
  };

  // Handles payment dialog close event
  const handlePaymentClose = () => {
    console.log("Payment dialog closed");
    setIsLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>React Remita Payment Example</h1>

      <div style={{ marginBottom: "30px" }}>
        <h2>Payment Details</h2>
        <div
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <p>
            <strong>Amount:</strong> ₦{(paymentData.amount / 100).toFixed(2)}
          </p>
          <p>
            <strong>Customer:</strong> {paymentData.firstName}{" "}
            {paymentData.lastName}
          </p>
          <p>
            <strong>Email:</strong> {paymentData.email}
          </p>
          <p>
            <strong>Transaction ID:</strong> {paymentData.transactionId}
          </p>
          <p>
            <strong>Environment:</strong> Demo
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <RemitaPayment
          config={config}
          paymentData={paymentData}
          environment="demo"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={handlePaymentClose}
          className="custom-payment-button"
        >
          Pay ₦{(paymentData.amount / 100).toFixed(2)} with Remita
        </RemitaPayment>
      </div>

      {paymentResult && (
        <div
          style={{
            padding: "15px",
            borderRadius: "5px",
            backgroundColor: paymentResult.includes("successful")
              ? "#d4edda"
              : "#f8d7da",
            color: paymentResult.includes("successful") ? "#155724" : "#721c24",
            border: `1px solid ${
              paymentResult.includes("successful") ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          <h3>Payment Result:</h3>
          <p>{paymentResult}</p>
        </div>
      )}

      <div style={{ marginTop: "30px", fontSize: "12px", color: "#999" }}>
        <p>
          <strong>Note:</strong> This example uses demo keys. Replace with your
          actual Remita public key and service type ID for production use.
        </p>
      </div>
    </div>
  );
};

export default ExampleApp;
