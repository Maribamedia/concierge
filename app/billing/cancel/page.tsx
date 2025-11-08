'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Cancel, ArrowBack, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function CancelPage() {
  const router = useRouter();

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
                <Cancel sx={{ fontSize: 48 }} />
              </Box>

              <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
                Payment Cancelled
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Your payment was cancelled. No charges have been made to your account.
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
                  What would you like to do?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  If you experienced any issues during the payment process, please try again or
                  contact our support team for assistance.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your data is safe and no charges were processed.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Refresh />}
                  onClick={() => router.push('/#pricing')}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
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
                Need help? Contact us at support@conciergeai.co.za
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
