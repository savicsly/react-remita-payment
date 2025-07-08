# React Remita Payment

A modern, secure React component library for processing payments using Remita's inline payment script with TypeScript support and comprehensive security features.

[![npm version](https://badge.fury.io/js/react-remita-payment.svg)](https://badge.fury.io/js/react-remita-payment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/savicsly/react-remita-payment/workflows/CI/badge.svg)](https://github.com/yourusername/react-remita-payment/actions)

## Features

- 🔒 **Security First**: Built with security best practices, input validation, and data sanitization
- 🎯 **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🧪 **Thoroughly Tested**: High test coverage with Jest and React Testing Library
- 🎨 **Customizable**: Flexible styling and custom button content support
- 📱 **Responsive**: Works seamlessly across different screen sizes
- 🔧 **Developer Friendly**: Easy to integrate with clear API and helpful error messages
- 🌍 **Environment Support**: Separate demo and live environments
- � **High-Value Protection**: Built-in confirmation for high-value transactions to prevent accidental payments
- �🖥️ **Framework Agnostic**: Works with React, Next.js, Remix, and other frameworks with robust SSR support

## Server-Side Rendering Support

This package has first-class support for SSR frameworks like Next.js, Remix, and others. It handles hydration safely and ensures payment components only activate in the browser.

### Next.js Usage

The package works directly in Next.js apps without any special wrapper components:

```tsx
"use client"; // If using App Router

import {
  RemitaPayment,
  RemitaConfig,
  PaymentRequest,
} from "react-remita-payment";

export default function PaymentPage() {
  const config: RemitaConfig = {
    publicKey: process.env.NEXT_PUBLIC_REMITA_PUBLIC_KEY,
    serviceTypeId: "your-service-type-id",
  };

  const paymentData: PaymentRequest = {
    amount: 5000,
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    transactionId: "TXN-123456",
    narration: "Payment for services",
  };

  const handleSuccess = (response) => {
    console.log("Payment successful", response);
  };

  return (
    <div>
      <h1>Payment Page</h1>
      <RemitaPayment
        config={config}
        paymentData={paymentData}
        environment="live"
        onSuccess={handleSuccess}
        onError={(error) => console.error(error)}
        onClose={() => console.log("Payment closed")}
      >
        Pay ₦5,000
      </RemitaPayment>
    </div>
  );
}
```

### How SSR Support Works

The package implements multiple safeguards for SSR environments:

1. **Deferred Script Loading**: Scripts only load in the browser environment
2. **Safe Hydration**: Component safely handles hydration to prevent React errors
3. **Progressive Enhancement**: Component starts with a loading state until fully hydrated
4. **Multiple Environment Checks**: Uses various techniques to verify browser environment
5. **Graceful Degradation**: Falls back to safe states when browser features are unavailable

## Version 1.3.3 Improvements

- Enhanced script loading with multiple fallback mechanisms
- Improved resilience to network and initialization issues
- Better handling of engine initialization errors
- Advanced debugging with detailed console logs
- Preemptive script loading for faster payment initiation
- Multiple retries with emergency fallback methods
- Direct script injection when standard methods fail

## Enhanced Script Loading

Version 1.3.4 introduces ultra-robust script loading mechanisms to handle even the most challenging environments:

- 🔄 **Multiple Loading Strategies**: Uses parallel loading strategies to maximize success rate
- 🧠 **Smart Retries**: Automatically attempts multiple strategies when standard loading fails
- 📊 **Detailed Logging**: Provides comprehensive console logging for troubleshooting
- 🛡️ **Error Recovery**: Implements sophisticated error recovery mechanisms
- 🚀 **Emergency Fallbacks**: Includes last-resort loading techniques when standard methods fail

### Troubleshooting Script Loading

If you encounter script loading issues:

1. **Check Console Logs**: The package provides detailed console logs to help diagnose issues
2. **Network Restrictions**: Ensure your network allows loading scripts from Remita domains
3. **Content Security Policy**: If using CSP, allow scripts from `remitademo.net` and `login.remita.net`
4. **Browser Extensions**: Some privacy/ad-blocking extensions may interfere with script loading
5. **Try Alternative Browser**: If issues persist, try a different browser to narrow down the cause
