# React Remita Payment

A modern, secure React component library for processing payments using Remita's inline payment script with TypeScript support and comprehensive security features.

[![npm version](https://badge.fury.io/js/react-remita-payment.svg)](https://badge.fury.io/js/react-remita-payment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/yourusername/react-remita-payment/workflows/CI/badge.svg)](https://github.com/yourusername/react-remita-payment/actions)

## Features

- 🔒 **Security First**: Built with security best practices, input validation, and data sanitization
- 🎯 **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🧪 **Thoroughly Tested**: High test coverage with Jest and React Testing Library
- 🎨 **Customizable**: Flexible styling and custom button content support
- 📱 **Responsive**: Works seamlessly across different screen sizes
- 🔧 **Developer Friendly**: Easy to integrate with clear API and helpful error messages
- 🌍 **Environment Support**: Separate demo and live environments

## Installation

```bash
npm install react-remita-payment
```

or

```bash
yarn add react-remita-payment
```

## Quick Start

```tsx
import React from 'react';
import { RemitaPayment, RemitaConfig, PaymentRequest } from 'react-remita-payment';

const App: React.FC = () => {
  const config: RemitaConfig = {
    publicKey: 'your-remita-public-key',
    serviceTypeId: 'your-service-type-id',
    currency: 'NGN', // Optional, defaults to NGN
  };

  const paymentData: PaymentRequest = {
    amount: 10000, // Amount in kobo (100 kobo = 1 Naira)
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    transactionId: 'TXN123456789', // Optional, will be auto-generated if not provided
    phoneNumber: '+2348012345678', // Optional
    narration: 'Payment for services', // Optional
  };

  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    // Handle successful payment
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
    // Handle payment error
  };

  const handleClose = () => {
    console.log('Payment dialog closed');
    // Handle dialog close
  };

  return (
    <div>
      <h1>My App</h1>
      <RemitaPayment
        config={config}
        paymentData={paymentData}
        environment="demo" // Use "live" for production
        onSuccess={handleSuccess}
        onError={handleError}
        onClose={handleClose}
      >
        Pay ₦100.00
      </RemitaPayment>
    </div>
  );
};

export default App;
```

## Advanced Usage

### Using the Hook Directly

For more control over the payment flow, you can use the `useRemitaPayment` hook directly:

```tsx
import React from 'react';
import { useRemitaPayment, generateTransactionRef } from 'react-remita-payment';

const CustomPaymentComponent: React.FC = () => {
  const { initiatePayment, isLoading, error, isScriptLoaded } = useRemitaPayment({
    config: {
      publicKey: 'your-public-key',
      serviceTypeId: 'your-service-type-id',
    },
    environment: 'demo',
    onSuccess: (response) => console.log('Success:', response),
    onError: (error) => console.error('Error:', error),
    onClose: () => console.log('Closed'),
  });

  const handlePay = async () => {
    await initiatePayment({
      amount: 5000,
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      transactionId: generateTransactionRef('CUSTOM'),
    });
  };

  return (
    <div>
      <button 
        onClick={handlePay} 
        disabled={!isScriptLoaded || isLoading}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### Custom Validation

```tsx
import { validatePaymentRequest, validateRemitaConfig } from 'react-remita-payment';

const paymentData = {
  amount: 1000,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  transactionId: 'TXN123',
};

// Validate payment data
const errors = validatePaymentRequest(paymentData);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}

// Validate configuration
const configErrors = validateRemitaConfig(config);
if (configErrors.length > 0) {
  console.error('Config errors:', configErrors);
}
```

## API Reference

### RemitaPayment Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `RemitaConfig` | Yes | Remita configuration object |
| `paymentData` | `PaymentRequest` | Yes | Payment information |
| `environment` | `'demo' \| 'live'` | No | Environment (default: 'demo') |
| `onSuccess` | `PaymentSuccessCallback` | Yes | Success callback function |
| `onError` | `PaymentErrorCallback` | Yes | Error callback function |
| `onClose` | `PaymentCloseCallback` | Yes | Close callback function |
| `disabled` | `boolean` | No | Disable the payment button |
| `className` | `string` | No | Additional CSS classes |
| `children` | `React.ReactNode` | No | Custom button content |

### RemitaConfig

```tsx
interface RemitaConfig {
  publicKey: string;          // Your Remita public key
  serviceTypeId: string;      // Your service type ID
  currency?: string;          // Currency code (NGN, USD, GBP, EUR)
  customFields?: CustomField[]; // Additional custom fields
  split?: SplitPayment[];     // Split payment configuration
}
```

### PaymentRequest

```tsx
interface PaymentRequest {
  amount: number;           // Amount in smallest currency unit (kobo for NGN)
  email: string;           // Customer email
  firstName: string;       // Customer first name
  lastName: string;        // Customer last name
  transactionId: string;   // Unique transaction identifier
  phoneNumber?: string;    // Customer phone number (optional)
  narration?: string;      // Payment description (optional)
  customFields?: CustomField[]; // Additional fields (optional)
}
```

### Response Types

```tsx
interface PaymentResponse {
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  paymentReference?: string;
  message: string;
  amount?: number;
  currency?: string;
  channel?: string;
  gatewayResponseCode?: string;
  gatewayResponseMessage?: string;
}

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

## Security Considerations

This library implements several security best practices:

### 1. Input Validation
- All user inputs are validated before processing
- Email format validation using comprehensive regex
- Phone number validation for Nigerian formats
- Amount validation with reasonable limits
- Transaction ID format validation

### 2. Data Sanitization
- String inputs are sanitized to prevent XSS attacks
- Special characters are escaped or removed
- Sensitive data is masked in logs

### 3. Script Loading Security
- Remita scripts are loaded with security attributes
- Cross-origin and referrer policies are enforced
- Script integrity checks are performed

### 4. Environment Validation
- HTTPS enforcement in production
- Environment-specific script URLs
- Proper error handling and logging

### 5. Secure Data Handling
- Sensitive information is never logged in plain text
- Payment data is validated before transmission
- No sensitive data is stored in component state

## Testing

The library includes comprehensive tests with high coverage:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [documentation](https://github.com/yourusername/react-remita-payment#readme)
2. Search [existing issues](https://github.com/yourusername/react-remita-payment/issues)
3. Create a [new issue](https://github.com/yourusername/react-remita-payment/issues/new)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details about changes in each version.

## Remita Documentation

For more information about Remita's payment API, visit:
- [Remita Developer Center](https://www.remita.net/developers/)
- [Inline Payment Documentation](https://www.remita.net/developers/#/payment/inline)

---

**Note**: This is an unofficial React wrapper for Remita's payment system. Make sure to test thoroughly in the demo environment before going live.
