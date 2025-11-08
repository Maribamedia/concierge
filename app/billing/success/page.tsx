'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Dashboard, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking payment status
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 3 }}>Verifying your payment...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 12 }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ p: 5, textAlign: 'center' }}>
            <CardContent>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircle sx={{ fontSize: 48 }} />
              </Box>

              <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
                Payment Successful!
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Your subscription has been activated. Welcome to Concierge AI Premium!
              </Typography>

              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 3,
                  borderRadius: 2,
                  mb: 4,
                  textAlign: 'left',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Subscription Details
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Plan:</Typography>
                  <Typography fontWeight={600}>Premium</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Amount:</Typography>
                  <Typography fontWeight={600}>R15,000/month</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Status:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#FFFFFF' }}>
                    Active
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Next Billing:</Typography>
                  <Typography fontWeight={600}>
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
                      'en-ZA'
                    )}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Dashboard />}
                  onClick={() => router.push('/tasks')}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 4, display: 'block' }}
              >
                A confirmation email has been sent to your registered email address.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
