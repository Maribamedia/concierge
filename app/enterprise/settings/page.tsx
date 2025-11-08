'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Save,
  Delete,
  Upload,
  Business,
  Security,
  Notifications,
  Payment,
} from '@mui/icons-material';

export default function EnterpriseSettings() {
  const [activeSection, setActiveSection] = useState('organization');

  // Mock organization data
  const mockOrganization = {
    name: 'Acme Corporation',
    slug: 'acme-corp',
    domain: 'acme.com',
    billingEmail: 'billing@acme.com',
    plan: 'Enterprise',
    maxUsers: -1, // Unlimited
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
            Organization Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your enterprise organization configuration
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Sidebar Navigation */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Button
                  fullWidth
                  variant={activeSection === 'organization' ? 'contained' : 'text'}
                  startIcon={<Business />}
                  onClick={() => setActiveSection('organization')}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  Organization
                </Button>
                <Button
                  fullWidth
                  variant={activeSection === 'billing' ? 'contained' : 'text'}
                  startIcon={<Payment />}
                  onClick={() => setActiveSection('billing')}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  Billing
                </Button>
                <Button
                  fullWidth
                  variant={activeSection === 'security' ? 'contained' : 'text'}
                  startIcon={<Security />}
                  onClick={() => setActiveSection('security')}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  Security
                </Button>
                <Button
                  fullWidth
                  variant={activeSection === 'notifications' ? 'contained' : 'text'}
                  startIcon={<Notifications />}
                  onClick={() => setActiveSection('notifications')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Notifications
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {/* Organization Settings */}
            {activeSection === 'organization' && (
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Organization Details
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Organization Name"
                        defaultValue={mockOrganization.name}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Organization Slug"
                        defaultValue={mockOrganization.slug}
                        helperText="Used in URLs: slug.concierge.ai"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Primary Domain"
                        defaultValue={mockOrganization.domain}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Billing Email"
                        type="email"
                        defaultValue={mockOrganization.billingEmail}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Plan Information
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Current Plan:
                        </Typography>
                        <Chip
                          label={mockOrganization.plan}
                          sx={{
                            bgcolor: '#000000',
                            color: '#FFFFFF',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Monthly Cost:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          R25,000
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Enterprise features include: Unlimited usage, custom branding, team
                        management, advanced analytics, and dedicated support.
                      </Alert>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" startIcon={<Save />}>
                          Save Changes
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<Delete />}>
                          Delete Organization
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Billing Settings */}
            {activeSection === 'billing' && (
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Billing & Subscription
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Enterprise Plan
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Unlimited usage with all premium features
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                              R25,000<Typography component="span" variant="body2">/mo</Typography>
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Payment Method
                      </Typography>
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Payfast Subscription
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Recurring monthly payment
                              </Typography>
                            </Box>
                            <Chip label="Active" color="success" />
                          </Box>
                        </CardContent>
                      </Card>
                      <Button variant="outlined">Update Payment Method</Button>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Billing History
                      </Typography>
                      <Card>
                        <CardContent>
                          {[
                            { date: '2025-11-01', amount: 'R25,000', status: 'Paid' },
                            { date: '2025-10-01', amount: 'R25,000', status: 'Paid' },
                            { date: '2025-09-01', amount: 'R25,000', status: 'Paid' },
                          ].map((invoice, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 2,
                                borderBottom:
                                  index < 2 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                              }}
                            >
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {invoice.date}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {invoice.amount}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip label={invoice.status} color="success" size="small" />
                                <Button size="small">Download</Button>
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="warning">
                        Cancelling your subscription will downgrade your account at the end of
                        the current billing period.
                      </Alert>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ mt: 2 }}
                        href="/billing"
                      >
                        Manage Subscription
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Security Settings
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Require two-factor authentication for all members"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enforce strong password policy"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch />}
                        label="Enable IP whitelist"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Audit logging"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Session Management
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Session Timeout</InputLabel>
                        <Select defaultValue={30} label="Session Timeout">
                          <MenuItem value={15}>15 minutes</MenuItem>
                          <MenuItem value={30}>30 minutes</MenuItem>
                          <MenuItem value={60}>1 hour</MenuItem>
                          <MenuItem value={480}>8 hours</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Button variant="contained" startIcon={<Save />}>
                        Save Security Settings
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Notification Preferences
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Email Notifications
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Task completion notifications"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Task failure alerts"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Usage limit warnings"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Billing and payment updates"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Weekly usage reports"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Team activity updates"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Slack Integration
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Connect Slack to receive real-time notifications in your workspace
                      </Alert>
                      <Button variant="outlined">Connect Slack</Button>
                    </Grid>

                    <Grid item xs={12}>
                      <Button variant="contained" startIcon={<Save />}>
                        Save Preferences
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
