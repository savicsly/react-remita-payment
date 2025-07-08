import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as useRemitaPaymentModule from "../../hooks/useRemitaPayment";
import { PaymentRequest, RemitaConfig } from "../../types";
import RemitaPayment from "../RemitaPayment";

jest.mock("../../hooks/useRemitaPayment");

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
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
      initiatePayment: jest.fn(),
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
    expect(
      screen.getByRole("button", { name: /initiate remita payment/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Pay Now")).toBeInTheDocument();
  });

  it("renders custom children when provided", () => {
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
      initiatePayment: jest.fn(),
      isLoading: false,
      error: null,
      isScriptLoaded: true,
    });
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
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
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
    expect(screen.getByText("Processing Payment...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows pay now button when script is not loaded but allows interaction", () => {
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
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
    expect(screen.getByText("Pay Now")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("displays error message when error exists", () => {
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
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
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
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
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
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
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
      initiatePayment: jest.fn(),
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
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
      initiatePayment: jest.fn(),
      isLoading: false,
      error: null,
      isScriptLoaded: true,
    });
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
    (useRemitaPaymentModule.useRemitaPayment as jest.Mock).mockReturnValue({
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
