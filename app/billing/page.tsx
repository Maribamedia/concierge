'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  Receipt,
  Settings,
  Cancel,
  Download,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PayfastPaymentForm from '@/components/PayfastPaymentForm';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function BillingPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userId, setUserId] = useState<string>('demo-user-123'); // In production, get from auth

  // Fetch real data from Convex
  const subscription = useQuery(api.payments.getUserSubscription, { userId });
  const payments = useQuery(api.payments.getUserPayments, { userId, limit: 10 });
  const usageStats = useQuery(api.payments.getUserUsageStats, { userId });

  const isLoading = subscription === undefined || payments === undefined || usageStats === undefined;

  if (showPaymentForm) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 12 }}>
        <Container maxWidth="md">
          <Button
            onClick={() => setShowPaymentForm(false)}
            sx={{ mb: 3 }}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <PayfastPaymentForm
            plan="premium"
            amount={15000}
            itemName="Concierge AI Premium Plan"
            itemDescription="10,000 automation minutes per month with advanced AI capabilities"
            userId={userId}
            frequency="3"
          />
        </Container>
      </Box>
    );
  }

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
        <CircularProgress />
      </Box>
    );
  }

  // If no subscription, show upgrade prompt
  if (!subscription) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 12 }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ p: 5, textAlign: 'center' }}>
              <CardContent>
                <CreditCard sx={{ fontSize: 60, mb: 3 }} />
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
                  No Active Subscription
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Subscribe to unlock premium features and start automating your workflows
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setShowPaymentForm(true)}
                >
                  Subscribe to Premium
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  const usagePercent = usageStats 
    ? (usageStats.usedMinutes / usageStats.totalMinutes) * 100 
    : 0;

  const nextBillingDate = new Date(subscription.nextBillingDate);
  const statusColor = subscription.status === 'active' ? '#FFFFFF' : '#B0B0B0';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 12 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Billing & Subscription
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your subscription, view usage, and payment history
            </Typography>
          </Box>

          {subscription.status === 'cancelled' && (
            <Alert severity="warning" sx={{ mb: 4 }}>
              Your subscription has been cancelled. Access will continue until{' '}
              {nextBillingDate.toLocaleDateString('en-ZA')}.
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Current Plan */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Current Plan
                  </Typography>
                  <Chip
                    label={subscription.status.toUpperCase()}
                    sx={{
                      bgcolor: statusColor,
                      color: '#000000',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" sx={{ mb: 1, fontWeight: 600, textTransform: 'capitalize' }}>
                    {subscription.plan}
                  </Typography>
                  <Typography variant="h4" color="text.secondary">
                    R{subscription.price.toLocaleString()}/{subscription.billingCycle}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Usage this month
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {subscription.usedMinutes.toLocaleString()} /{' '}
                      {subscription.monthlyMinutes.toLocaleString()} minutes
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={usagePercent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#FFFFFF',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {usagePercent.toFixed(1)}% used
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Next billing date
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {nextBillingDate.toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => setShowPaymentForm(true)}
                    disabled={subscription.status !== 'active'}
                  >
                    Update Payment Method
                  </Button>
                  {subscription.status === 'active' && (
                    <Button 
                      variant="outlined" 
                      startIcon={<Cancel />} 
                      color="error"
                      onClick={async () => {
                        // In production, call mutation to cancel
                        alert('Subscription cancellation coming soon');
                      }}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, mb: 3 }}>
                <AccountBalance sx={{ fontSize: 32, mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Spent
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  R{usageStats?.totalSpent.toLocaleString() || 0}
                </Typography>
              </Card>

              <Card sx={{ p: 3, mb: 3 }}>
                <TrendingUp sx={{ fontSize: 32, mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ROI This Month
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  R{((usageStats?.totalSpent || 0) * 3.5).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  3.5x return on investment
                </Typography>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tasks Completed
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {usageStats?.tasksCompleted || 0}
                </Typography>
              </Card>
            </Grid>

            {/* Payment History */}
            <Grid item xs={12}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Payment History
                </Typography>

                {!payments || payments.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    No payment history yet
                  </Typography>
                ) : (
                  payments.map((payment, index) => (
                    <Box key={payment._id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Receipt sx={{ fontSize: 24 }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              Payment #{payment.payfastPaymentId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(payment.createdAt).toLocaleDateString('en-ZA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Typography variant="h6" fontWeight={600}>
                            R{payment.amount.toLocaleString()}
                          </Typography>
                          <Chip
                            label={payment.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor:
                                payment.status === 'complete'
                                  ? 'rgba(255, 255, 255, 0.2)'
                                  : 'rgba(255, 255, 255, 0.1)',
                              color: '#FFFFFF',
                            }}
                          />
                          <Button variant="outlined" size="small" startIcon={<Download />}>
                            Download
                          </Button>
                        </Box>
                      </Box>
                      {index < payments.length - 1 && <Divider />}
                    </Box>
                  ))
                )}
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
