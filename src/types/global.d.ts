// Type definitions for Remita Payment integration

export interface RemitaPaymentEngine {
  showPaymentWidget(options: unknown): void;
}

declare global {
  interface Window {
    RmPaymentEngine?: RemitaPaymentEngine;
    remitaAsyncInit?: () => void;
    __remitaEmergencyInit?: () => void;
  }
}

// Define OnErrorEventHandler for TypeScript compatibility with script elements
type OnErrorEventHandler = ((event: string | Event) => void) | null;

export {};
