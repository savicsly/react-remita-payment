import { PaymentRequest, RemitaConfig } from "../../types";
import {
  generateTransactionRef,
  maskSensitiveData,
  sanitizeString,
  validateAmount,
  validateEmail,
  validatePaymentRequest,
  validatePhoneNumber,
  validateRemitaConfig,
  validateTransactionId,
} from "../validation";
describe("Validation Utils", () => {
  describe("validateEmail", () => {
    it("should validate correct email formats", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(validateEmail("user+tag@example.org")).toBe(true);
    });
    it("should reject invalid email formats", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test.example.com")).toBe(false);
    });
  });
  describe("validatePhoneNumber", () => {
    it("should validate Nigerian phone number formats", () => {
      expect(validatePhoneNumber("+2348012345678")).toBe(true);
      expect(validatePhoneNumber("2348012345678")).toBe(true);
      expect(validatePhoneNumber("08012345678")).toBe(true);
      expect(validatePhoneNumber("07012345678")).toBe(true);
      expect(validatePhoneNumber("09012345678")).toBe(true);
    });
    it("should reject invalid phone number formats", () => {
      expect(validatePhoneNumber("123456789")).toBe(false);
      expect(validatePhoneNumber("+1234567890")).toBe(false);
      expect(validatePhoneNumber("08012345")).toBe(false);
      expect(validatePhoneNumber("080123456789")).toBe(false);
    });
  });
  describe("validateAmount", () => {
    it("should validate positive amounts within limits", () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(1000.5)).toBe(true);
      expect(validateAmount(9999999)).toBe(true);
    });
    it("should reject invalid amounts", () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
      expect(validateAmount(10000001)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
    });
  });
  describe("validateTransactionId", () => {
    it("should validate correct transaction ID formats", () => {
      expect(validateTransactionId("TXN123456")).toBe(true);
      expect(validateTransactionId("transaction-id_123")).toBe(true);
      expect(validateTransactionId("123456789012345")).toBe(true);
    });
    it("should reject invalid transaction ID formats", () => {
      expect(validateTransactionId("TX123")).toBe(false);
      expect(validateTransactionId("a".repeat(51))).toBe(false);
      expect(validateTransactionId("txn@123")).toBe(false);
      expect(validateTransactionId("")).toBe(false);
    });
  });
  describe("sanitizeString", () => {
    it("should sanitize potentially dangerous strings", () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        "scriptalert(xss)/script"
      );
      expect(sanitizeString("Hello & World")).toBe("Hello &amp; World");
      expect(sanitizeString('Test "quote" string')).toBe("Test quote string");
      expect(sanitizeString("  Extra spaces  ")).toBe("Extra spaces");
    });
  });
  describe("validatePaymentRequest", () => {
    const validPaymentRequest: PaymentRequest = {
      amount: 1000,
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      transactionId: "TXN123456",
      phoneNumber: "+2348012345678",
    };
    it("should validate a correct payment request", () => {
      const errors = validatePaymentRequest(validPaymentRequest);
      expect(errors).toHaveLength(0);
    });
    it("should return errors for invalid payment request", () => {
      const invalidPaymentRequest: PaymentRequest = {
        amount: -100,
        email: "invalid-email",
        firstName: "J",
        lastName: "D",
        transactionId: "TX",
        phoneNumber: "123",
      };
      const errors = validatePaymentRequest(invalidPaymentRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain(
        "Invalid amount. Amount must be a positive number and not exceed 10,000,000"
      );
      expect(errors).toContain("Invalid email address format");
      expect(errors).toContain("First name must be at least 2 characters long");
      expect(errors).toContain("Last name must be at least 2 characters long");
      expect(errors).toContain(
        "Invalid transaction ID. Must be 6-50 alphanumeric characters"
      );
      expect(errors).toContain("Invalid phone number format");
    });
  });
  describe("validateRemitaConfig", () => {
    const validConfig: RemitaConfig = {
      publicKey: "pk_test_1234567890",
      serviceTypeId: "service123",
      currency: "NGN",
    };
    it("should validate a correct Remita config", () => {
      const errors = validateRemitaConfig(validConfig);
      expect(errors).toHaveLength(0);
    });
    it("should return errors for invalid config", () => {
      const invalidConfig: RemitaConfig = {
        publicKey: "",
        serviceTypeId: "",
        currency: "INVALID",
      };
      const errors = validateRemitaConfig(invalidConfig);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain("Public key is required");
      expect(errors).toContain("Service type ID is required");
      expect(errors).toContain(
        "Invalid currency. Supported currencies: NGN, USD, GBP, EUR"
      );
    });
  });
  describe("generateTransactionRef", () => {
    it("should generate unique transaction references", () => {
      const ref1 = generateTransactionRef();
      const ref2 = generateTransactionRef();
      expect(ref1).not.toBe(ref2);
      expect(ref1).toMatch(/^RMT_/);
    });
    it("should use custom prefix", () => {
      const ref = generateTransactionRef("CUSTOM");
      expect(ref).toMatch(/^CUSTOM_/);
    });
  });
  describe("maskSensitiveData", () => {
    it("should mask email addresses", () => {
      const data = { email: "test@example.com" };
      const masked = maskSensitiveData(data);
      expect(masked.email).toBe("t***@example.com");
    });
    it("should mask phone numbers", () => {
      const data = { phoneNumber: "+2348012345678" };
      const masked = maskSensitiveData(data);
      expect(masked.phoneNumber).toBe("***5678");
    });
    it("should mask public keys", () => {
      const data = { publicKey: "pk_test_1234567890abcdef" };
      const masked = maskSensitiveData(data);
      expect(masked.publicKey).toBe("pk_t***cdef");
    });
    it("should handle objects without sensitive data", () => {
      const data = { amount: 1000, currency: "NGN" };
      const masked = maskSensitiveData(data);
      expect(masked).toEqual(data);
    });
  });
});
