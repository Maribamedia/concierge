'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { CreditCard, CheckCircle } from '@mui/icons-material';

interface PayfastPaymentFormProps {
  plan: 'premium' | 'enterprise';
  amount: number;
  itemName: string;
  itemDescription: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  frequency?: '3' | '6'; // 3 = Monthly, 6 = Annual
}

export default function PayfastPaymentForm({
  plan,
  amount,
  itemName,
  itemDescription,
  userId,
  userEmail = '',
  userName = '',
  frequency = '3',
}: PayfastPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get payment data from API
      const response = await fetch('/api/payfast/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userName.split(' ')[0] || 'User',
          lastName: userName.split(' ')[1] || 'Name',
          email: userEmail,
          amount,
          itemName,
          itemDescription,
          userId,
          subscriptionType: true,
          frequency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare payment');
      }

      const data = await response.json();
      setPaymentData(data);

      // Auto-submit the form
      setTimeout(() => {
        const form = document.getElementById('payfast-form') as HTMLFormElement;
        if (form) {
          form.submit();
        }
      }, 100);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CreditCard sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Subscribe to {plan === 'premium' ? 'Premium' : 'Enterprise'} Plan
          </Typography>
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
            R{amount.toLocaleString()}
          </Typography>
          <Typography color="text.secondary">
            {frequency === '3' ? 'per month' : 'per year'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Features included:
          </Typography>
          {plan === 'premium' && (
            <Box>
              {[
                '10,000 automation minutes/month',
                'Unlimited browser sessions',
                'Advanced AI capabilities',
                'Priority support 24/7',
                'Custom integrations',
                'Analytics dashboard',
                'Team collaboration tools',
              ].map((feature, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">{feature}</Typography>
                </Box>
              ))}
            </Box>
          )}
          {plan === 'enterprise' && (
            <Box>
              {[
                'Unlimited automation minutes',
                'Multi-tenant organization management',
                'Custom branding & whitelabel',
                'Custom domain support',
                'Team management & roles',
                'Advanced analytics & reporting',
                'Dedicated account manager',
                'Priority support & SLA',
                'API access & integrations',
              ].map((feature, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">{feature}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handlePayment}
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : <CreditCard />}
        >
          {isProcessing ? 'Redirecting to Payment...' : 'Pay with Payfast'}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block', textAlign: 'center' }}
        >
          Secure payment powered by Payfast. Your payment is processed securely.
        </Typography>
      </CardContent>

      {/* Hidden form for Payfast redirect */}
      {paymentData && (
        <form
          id="payfast-form"
          action={paymentData.payfastUrl}
          method="POST"
          style={{ display: 'none' }}
        >
          {Object.entries(paymentData.formData).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value as string} />
          ))}
        </form>
      )}
    </Card>
  );
}
