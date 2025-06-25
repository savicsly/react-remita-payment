import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PaymentRequest, RemitaConfig } from "../../types";
import RemitaPayment from "../RemitaPayment";

jest.mock("../../hooks/useRemitaPayment", () => ({
  useRemitaPayment: jest.fn(() => ({
    initiatePayment: jest.fn(),
    isLoading: false,
    error: null,
    isScriptLoaded: true,
  })),
}));

const mockConfig: RemitaConfig = {
  publicKey: "pk_test_1234567890",
  serviceTypeId: "service123",
  currency: "NGN",
};

const mockPaymentData: PaymentRequest = {
  amount: 1000,
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  transactionId: "TXN123456",
};

const mockCallbacks = {
  onSuccess: jest.fn(),
  onError: jest.fn(),
  onClose: jest.fn(),
};

describe("RemitaPayment Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders payment button with default text", () => {
    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        {...mockCallbacks}
      />
    );

    expect(
      screen.getByRole("button", { name: /initiate remita payment/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Pay Now")).toBeInTheDocument();
  });

  it("renders custom children when provided", () => {
    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        {...mockCallbacks}
      >
        Custom Payment Text
      </RemitaPayment>
    );

    expect(screen.getByText("Custom Payment Text")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    const { useRemitaPayment } = require("../../hooks/useRemitaPayment");
    useRemitaPayment.mockReturnValue({
      initiatePayment: jest.fn(),
      isLoading: true,
      error: null,
      isScriptLoaded: true,
    });

    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading script state when script is not loaded", () => {
    const { useRemitaPayment } = require("../../hooks/useRemitaPayment");
    useRemitaPayment.mockReturnValue({
      initiatePayment: jest.fn(),
      isLoading: false,
      error: null,
      isScriptLoaded: false,
    });

    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("displays error message when error exists", () => {
    const { useRemitaPayment } = require("../../hooks/useRemitaPayment");
    useRemitaPayment.mockReturnValue({
      initiatePayment: jest.fn(),
      isLoading: false,
      error: "Configuration error",
      isScriptLoaded: true,
    });

    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        {...mockCallbacks}
      />
    );

    expect(
      screen.getByText("Payment Error: Configuration error")
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls initiatePayment when button is clicked", async () => {
    const mockInitiatePayment = jest.fn();
    const { useRemitaPayment } = require("../../hooks/useRemitaPayment");
    useRemitaPayment.mockReturnValue({
      initiatePayment: mockInitiatePayment,
      isLoading: false,
      error: null,
      isScriptLoaded: true,
    });

    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        {...mockCallbacks}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInitiatePayment).toHaveBeenCalledTimes(1);
      expect(mockInitiatePayment).toHaveBeenCalledWith(mockPaymentData);
    });
  });

  it("generates transaction ID if not provided", async () => {
    const mockInitiatePayment = jest.fn();
    const { useRemitaPayment } = require("../../hooks/useRemitaPayment");
    useRemitaPayment.mockReturnValue({
      initiatePayment: mockInitiatePayment,
      isLoading: false,
      error: null,
      isScriptLoaded: true,
    });

    const paymentDataWithoutId = { ...mockPaymentData };
    delete paymentDataWithoutId.transactionId;

    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={paymentDataWithoutId}
        {...mockCallbacks}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInitiatePayment).toHaveBeenCalledTimes(1);
      const calledWith = mockInitiatePayment.mock.calls[0][0];
      expect(calledWith.transactionId).toBeDefined();
      expect(calledWith.transactionId).toMatch(/^RMT_/);
    });
  });

  it("respects disabled prop", () => {
    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        disabled={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        className="custom-class"
        {...mockCallbacks}
      />
    );

    expect(screen.getByRole("button").closest("div")).toHaveClass(
      "remita-payment-container",
      "custom-class"
    );
  });

  it("does not call initiatePayment when disabled", async () => {
    const mockInitiatePayment = jest.fn();
    const { useRemitaPayment } = require("../../hooks/useRemitaPayment");
    useRemitaPayment.mockReturnValue({
      initiatePayment: mockInitiatePayment,
      isLoading: false,
      error: null,
      isScriptLoaded: true,
    });

    render(
      <RemitaPayment
        config={mockConfig}
        paymentData={mockPaymentData}
        disabled={true}
        {...mockCallbacks}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockInitiatePayment).not.toHaveBeenCalled();
  });
});
