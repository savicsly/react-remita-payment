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
- 🖥️ **Framework Agnostic**: Works with React, Next.js, Remix, and other frameworks with robust SSR support

## Server-Side Rendering Support

This package has first-class support for SSR frameworks like Next.js, Remix, and others. It handles hydration safely and ensures payment components only activate in the browser.

### Next.js Usage

The package works directly in Next.js apps without any special wrapper components:

```tsx
'use client'; // If using App Router

import { RemitaPayment, RemitaConfig, PaymentRequest } from 'react-remita-payment';

export default function PaymentPage() {
  const config: RemitaConfig = {
    publicKey: process.env.NEXT_PUBLIC_REMITA_PUBLIC_KEY,
    serviceTypeId: 'your-service-type-id',
  };

  const paymentData: PaymentRequest = {
    amount: 5000,
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    transactionId: 'TXN-123456',
    narration: 'Payment for services',
  };

  const handleSuccess = (response) => {
    console.log('Payment successful', response);
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
        onClose={() => console.log('Payment closed')}
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
