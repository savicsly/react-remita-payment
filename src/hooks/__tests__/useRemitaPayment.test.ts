/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { PaymentRequest, RemitaConfig, RemitaInitOptions } from "../../types";
import { useRemitaPayment } from "../useRemitaPayment";

// Helper to mock DOMStringList
const mockDOMStringList = {
  length: 0,
  item: () => null,
  contains: () => false,
  [Symbol.iterator]: function* () {},
};

interface ScriptWithOnError extends HTMLScriptElement {
  _onerror?: (e: Event) => void;
}

describe("useRemitaPayment", () => {
  const config: RemitaConfig = {
    publicKey: "pk_test_1234567890",
    serviceTypeId: "service123",
    currency: "NGN",
  };
  const validPayment: PaymentRequest = {
    amount: 1000,
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    transactionId: "TXN123456",
  };
  const onSuccess = jest.fn();
  const onError = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(window, {
      location: {
        protocol: "https:",
        ancestorOrigins: mockDOMStringList,
        hash: "",
        host: "localhost",
        hostname: "localhost",
        href: "https://localhost/",
        origin: "https://localhost",
        pathname: "/",
        port: "443",
        search: "",
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
      },
      navigator: { userAgent: "jsdom" },
    });
    delete window.RmPaymentEngine;
  });

  it("sets error if environment is invalid", async () => {
    const { result } = renderHook(() =>
      useRemitaPayment({ config, onSuccess, onError, onClose, win: undefined })
    );
    await act(async () => {
      await waitFor(() => {
        expect(result.current.error).toBe(
          "Invalid environment for payment processing"
        );
      });
    });
    expect(typeof result.current.initiatePayment).toBe("function");
  });

  it("sets error if config is invalid", () => {
    const badConfig = { ...config, publicKey: "" };
    const { result } = renderHook(() =>
      useRemitaPayment({
        config: badConfig,
        onSuccess,
        onError,
        onClose,
        win: window,
      })
    );
    expect(result.current.error).toMatch(/Configuration errors/);
  });

  it("sets error if payment data is invalid", async () => {
    const { result } = renderHook(() =>
      useRemitaPayment({ config, onSuccess, onError, onClose, win: window })
    );
    await act(async () => {
      await result.current.initiatePayment({ ...validPayment, amount: 0 });
    });
    await waitFor(() => {
      expect(result.current.error).toMatch(
        /Payment data errors: Invalid amount/
      );
    });
  });

  it("sets error if Remita script is not loaded", async () => {
    jest.useRealTimers();
    window.document.querySelector = jest.fn().mockReturnValue(undefined);
    window.RmPaymentEngine = undefined;
    let scriptEl: ScriptWithOnError | null = null;
    const origCreateElement = window.document.createElement;
    window.document.createElement = function (tag: string) {
      if (tag === "script") {
        scriptEl = origCreateElement.call(
          window.document,
          tag
        ) as ScriptWithOnError;
        setTimeout(() => {
          if (scriptEl) {
            scriptEl.onerror && scriptEl.onerror(new Event("error"));
          }
        }, 10);
        return scriptEl;
      }
      return origCreateElement.call(window.document, tag);
    };
    const { result } = renderHook(() =>
      useRemitaPayment({ config, onSuccess, onError, onClose, win: window })
    );
    await act(async () => {
      await result.current?.initiatePayment(validPayment);
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await act(async () => {});
    await waitFor(
      () => {
        expect(result.current?.error).toMatch(
          /Remita payment engine not available|Failed to load Remita payment script/
        );
      },
      { timeout: 5000 }
    );
  }, 15000);

  it("calls onSuccess on payment success", async () => {
    Object.assign(window, {
      document: Object.assign(document, {
        querySelector: jest.fn().mockReturnValue({
          addEventListener: (event: string, cb: () => void) => {
            if (event === "load") setTimeout(cb, 0);
          },
        }),
        createElement: document.createElement,
        body: document.body,
      }),
      navigator: { userAgent: "jsdom" },
      location: {
        protocol: "https:",
        ancestorOrigins: {
          length: 0,
          item: () => null,
          contains: () => false,
          [Symbol.iterator]: function* () {},
        },
        hash: "",
        host: "localhost",
        hostname: "localhost",
        href: "https://localhost/",
        origin: "https://localhost",
        pathname: "/",
        port: "443",
        search: "",
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
      },
    });
    let paymentOptions:
      | (RemitaInitOptions & { onClose?: () => void })
      | undefined;
    const showPaymentWidget = jest.fn();
    window.RmPaymentEngine = {
      init: (opts) => {
        paymentOptions = opts;
      },
      showPaymentWidget,
      hidePaymentWidget: jest.fn(),
    };
    const onSuccessPromise = new Promise<void>((resolve) => {
      onSuccess.mockImplementation(() => {
        resolve();
      });
    });
    const { result } = renderHook(() =>
      useRemitaPayment({ config, onSuccess, onError, onClose, win: window })
    );
    expect(result.current && typeof result.current.initiatePayment).toBe(
      "function"
    );
    await act(async () => {
      await result.current?.initiatePayment(validPayment);
    });
    expect(showPaymentWidget).toHaveBeenCalled();
    if (paymentOptions && paymentOptions.onSuccess) {
      paymentOptions.onSuccess({ paymentReference: "REF123", message: "ok" });
    }
    await onSuccessPromise;
    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls onError on payment error", async () => {
    window.RmPaymentEngine = {
      init: (options: RemitaInitOptions & { onClose?: () => void }) => {
        options.onError({ message: "fail" });
      },
      showPaymentWidget: jest.fn(),
      hidePaymentWidget: jest.fn(),
    };
    const { result } = renderHook(() =>
      useRemitaPayment({ config, onSuccess, onError, onClose, win: window })
    );
    expect(result.current && typeof result.current.initiatePayment).toBe(
      "function"
    );
    await act(async () => {
      await result.current?.initiatePayment(validPayment);
    });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("calls onClose on payment close", async () => {
    Object.assign(window, {
      document: Object.assign(document, {
        querySelector: jest.fn().mockReturnValue({
          addEventListener: (event: string, cb: () => void) => {
            if (event === "load") setTimeout(cb, 0);
          },
        }),
        createElement: document.createElement,
        body: document.body,
      }),
      navigator: { userAgent: "jsdom" },
      location: {
        protocol: "https:",
        ancestorOrigins: {
          length: 0,
          item: () => null,
          contains: () => false,
          [Symbol.iterator]: function* () {},
        },
        hash: "",
        host: "localhost",
        hostname: "localhost",
        href: "https://localhost/",
        origin: "https://localhost",
        pathname: "/",
        port: "443",
        search: "",
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
      },
    });
    let paymentOptions:
      | (RemitaInitOptions & { onClose?: () => void })
      | undefined;
    const showPaymentWidget = jest.fn();
    window.RmPaymentEngine = {
      init: (opts) => {
        paymentOptions = opts;
      },
      showPaymentWidget,
      hidePaymentWidget: jest.fn(),
    };
    const onClosePromise = new Promise<void>((resolve) => {
      onClose.mockImplementation(() => {
        resolve();
      });
    });
    const { result } = renderHook(() =>
      useRemitaPayment({ config, onSuccess, onError, onClose, win: window })
    );
    expect(result.current && typeof result.current.initiatePayment).toBe(
      "function"
    );
    await act(async () => {
      await result.current?.initiatePayment(validPayment);
    });
    expect(showPaymentWidget).toHaveBeenCalled();
    if (paymentOptions && paymentOptions.onClose) {
      paymentOptions.onClose();
    }
    await onClosePromise;
    expect(onClose).toHaveBeenCalled();
  });
});
