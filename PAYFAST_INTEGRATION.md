# Payfast Payment Integration Guide

## Overview
This application integrates Payfast payment gateway for subscription billing in South African Rands (ZAR). The integration supports recurring monthly subscriptions with full webhook support for payment notifications.

## Features Implemented

### 1. Currency Conversion
- All pricing converted from USD to ZAR (1 USD = 15 ZAR)
- Premium plan: $999/month → R15,000/month
- Annual savings: $12,500 → R187,500
- All industry savings examples updated to ZAR

### 2. Payment Processing
- Secure Payfast integration with MD5 signature validation
- Recurring subscription support (monthly billing)
- Sandbox mode for testing
- Production-ready configuration

### 3. User Interface
- Payment form component with secure redirect to Payfast
- Billing dashboard with subscription management
- Payment success/cancel pages
- Usage tracking and ROI display in ZAR

### 4. Webhook Integration
- ITN (Instant Transaction Notification) handler
- Payment status verification
- Subscription token management
- Security validations (signature, IP, amount)

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file with your Payfast credentials:

```bash
# For sandbox testing (default)
PAYFAST_ENV=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production
PAYFAST_ENV=production
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Sandbox Testing

Sandbox credentials (auto-configured):
- Merchant ID: 10000100
- Merchant Key: 46f0cd694581a
- Passphrase: jt7NOE43FZPn

Test payment method:
- Use "Instant EFT - Test - Wallet" option
- Available balance: R99,999,999.99

### 3. Production Setup

1. Register at https://www.payfast.co.za/
2. Complete merchant verification
3. Get your production credentials from Settings
4. Enable recurring billing in your Payfast dashboard
5. Set webhook URL: `https://yourdomain.com/api/payfast/webhook`
6. Update environment variables

### 4. Testing Webhooks Locally

Use ngrok to expose local server:
```bash
ngrok http 3000
```

Update webhook URL in Payfast dashboard to ngrok URL:
```
https://your-ngrok-url.ngrok.io/api/payfast/webhook
```

## File Structure

```
app/
├── api/
│   └── payfast/
│       ├── prepare/
│       │   └── route.ts          # Prepare payment data
│       └── webhook/
│           └── route.ts          # Handle ITN notifications
├── billing/
│   ├── page.tsx                  # Billing dashboard
│   ├── success/
│   │   └── page.tsx              # Payment success page
│   └── cancel/
│       └── page.tsx              # Payment cancelled page
├── page.tsx                      # Landing page (ZAR pricing)
└── layout.tsx

components/
└── PayfastPaymentForm.tsx        # Payment form component

lib/
└── payfast.ts                    # Payfast utilities

convex/
└── schema.ts                     # Database schema with payment tables
```

## Payment Flow

### 1. User Subscription
1. User clicks "Subscribe Now" on pricing page
2. Redirected to billing dashboard
3. Clicks payment button
4. Payment form prepares data via `/api/payfast/prepare`
5. User redirected to Payfast payment page
6. User completes payment on Payfast

### 2. Payment Notification
1. Payfast sends ITN to webhook URL
2. Webhook validates signature and IP
3. Payment status updated in database
4. User redirected to success/cancel page

### 3. Recurring Billing
1. First payment creates subscription token
2. Payfast automatically charges monthly
3. ITN notifications sent for each payment
4. Database updated with payment records

## Security Features

### 1. Signature Validation
- MD5 signature generated for all requests
- Passphrase included in signature calculation
- Signature verified on webhook notifications

### 2. IP Validation
- Webhook validates Payfast IP addresses
- Prevents unauthorized payment notifications

### 3. Amount Verification
- Payment amounts validated against expected values
- Prevents payment manipulation

## Database Schema

### Subscriptions Table
```typescript
{
  userId: string,
  plan: "premium" | "enterprise",
  status: "active" | "cancelled" | "expired" | "pending",
  price: number,
  currency: "ZAR",
  payfastToken: string,          // Subscription token
  payfastSubscriptionId: string,
  payfastStatus: string,
  nextBillingDate: timestamp,
  // ... other fields
}
```

### Payments Table
```typescript
{
  userId: string,
  subscriptionId: string,
  payfastPaymentId: string,
  amount: number,
  currency: "ZAR",
  status: "pending" | "complete" | "failed" | "cancelled",
  payfastData: object,
  // ... other fields
}
```

## API Endpoints

### POST /api/payfast/prepare
Prepares payment data and generates signature.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "amount": 15000,
  "itemName": "Premium Subscription",
  "itemDescription": "Monthly subscription",
  "userId": "user_123",
  "subscriptionType": true,
  "frequency": "3"
}
```

**Response:**
```json
{
  "formData": {
    "merchant_id": "...",
    "amount": 15000,
    "signature": "...",
    // ... other fields
  },
  "payfastUrl": "https://sandbox.payfast.co.za/eng/process"
}
```

### POST /api/payfast/webhook
Handles ITN notifications from Payfast.

**Validates:**
- Source IP address
- MD5 signature
- Payment amount
- Payment status

## Testing Checklist

- [ ] Sandbox payment form loads correctly
- [ ] Payment redirects to Payfast successfully
- [ ] Test payment completes in sandbox
- [ ] Webhook receives ITN notification
- [ ] Signature validation passes
- [ ] Payment status updates correctly
- [ ] Success page displays properly
- [ ] Subscription token stored
- [ ] Billing dashboard shows subscription
- [ ] Cancel flow works correctly

## Production Deployment

1. Set production environment variables
2. Configure Payfast webhook URL
3. Enable recurring billing in Payfast dashboard
4. Test with small real payment
5. Monitor webhook logs
6. Set up error alerting

## Troubleshooting

### Payment Not Completing
- Check webhook URL is publicly accessible
- Verify signature generation is correct
- Check Payfast dashboard for failed ITN deliveries

### Signature Validation Failing
- Ensure passphrase matches exactly
- Check parameter ordering (alphabetical)
- Verify URL encoding is correct

### Webhook Not Receiving Data
- Use ngrok for local testing
- Check firewall/security rules
- Verify webhook URL in Payfast dashboard

## Support

For Payfast-specific issues:
- Documentation: https://developers.payfast.co.za/
- Support: support@payfast.co.za

For application issues:
- Check logs in `/app/api/payfast/webhook/route.ts`
- Monitor Convex database for payment records
- Review browser console for frontend errors

## Currency Display

All amounts are displayed in ZAR format using South African locale:
- R15,000 (without decimals for whole numbers)
- R15,000.50 (with decimals when needed)

Format function available in `lib/payfast.ts`:
```typescript
formatZAR(15000) // Returns "R15,000"
```

## Next Steps

1. Complete Convex integration for payment storage
2. Add email notifications for payment confirmations
3. Implement subscription management (pause/resume)
4. Add invoice generation and download
5. Set up automated payment retry logic
6. Configure payment failure notifications
