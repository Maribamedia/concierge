'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  People,
  Assessment,
  Settings,
  Palette,
  Language,
  TrendingUp,
  CheckCircle,
  Error,
  PlayArrow,
  MoreVert,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization } from '@/lib/organization-context';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnterpriseDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { selectedOrgId, currentOrganization, hasPermission } = useOrganization();

  // Fetch real data from Convex
  const dashboardData = useQuery(
    api.enterpriseAnalytics.getDashboardData,
    selectedOrgId ? { organizationId: selectedOrgId } : 'skip'
  );

  const members = useQuery(
    api.organizationMembers.getOrganizationMembers,
    selectedOrgId ? { organizationId: selectedOrgId, status: 'active' } : 'skip'
  );

  const whitelabelSettings = useQuery(
    api.whitelabel.getWhitelabelSettings,
    selectedOrgId ? { organizationId: selectedOrgId } : 'skip'
  );

  const customDomains = useQuery(
    api.whitelabel.getCustomDomains,
    selectedOrgId ? { organizationId: selectedOrgId } : 'skip'
  );

  // Mutations
  const updateBranding = useMutation(api.whitelabel.updateBranding);
  const inviteMember = useMutation(api.organizationMembers.inviteMember);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Loading state
  if (!currentOrganization || !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has enterprise tier
  const isEnterprise = currentOrganization.subscriptionTier === 'enterprise';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              Enterprise Dashboard
            </Typography>
            {hasPermission('organization.manage') && (
              <Button
                variant="contained"
                startIcon={<Settings />}
                href="/enterprise/settings"
              >
                Settings
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: '#000000' }}>
              <Business />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentOrganization.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentOrganization.subscriptionTier?.toUpperCase() || 'ENTERPRISE'} Plan
              </Typography>
            </Box>
            <Chip
              label={currentOrganization.status || 'active'}
              color={(currentOrganization.status || 'active') === 'active' ? 'success' : 'warning'}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>

        {/* Show alert if not enterprise tier */}
        {!isEnterprise && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Upgrade to Enterprise plan to access unlimited usage, custom branding, and advanced features.
            <Button href="/billing" sx={{ ml: 2 }}>Upgrade Now</Button>
          </Alert>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="text.secondary" variant="body2">
                    Team Members
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {dashboardData.team.totalMembers}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Active users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography color="text.secondary" variant="body2">
                    Tasks Completed
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {dashboardData.tasks.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {dashboardData.tasks.total} total tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="text.secondary" variant="body2">
                    Usage (7 Days)
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {dashboardData.usage.last7DaysMinutes.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  minutes used
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="text.secondary" variant="body2">
                    Cost Savings
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  R{dashboardData.usage.last7DaysSavings.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Last 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 3,
              pt: 2,
            }}
          >
            <Tab icon={<Assessment />} label="Analytics" iconPosition="start" />
            <Tab icon={<People />} label="Team" iconPosition="start" />
            {isEnterprise && <Tab icon={<Palette />} label="Whitelabel" iconPosition="start" />}
            {isEnterprise && <Tab icon={<Language />} label="Domains" iconPosition="start" />}
          </Tabs>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Organization Analytics
              </Typography>

              {/* Subscription Info */}
              <Card sx={{ mb: 3, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Monthly Usage
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {dashboardData.subscription.monthlyMinutes === -1
                          ? 'Unlimited'
                          : `${dashboardData.subscription.usedMinutes.toLocaleString()} / ${dashboardData.subscription.monthlyMinutes.toLocaleString()}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData.subscription.monthlyMinutes === -1
                          ? `${dashboardData.subscription.usedMinutes.toLocaleString()} minutes used this month`
                          : 'Minutes used'}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        dashboardData.subscription.monthlyMinutes === -1
                          ? 'Enterprise - Unlimited'
                          : `${dashboardData.subscription.plan} Plan`
                      }
                      sx={{
                        bgcolor: '#000000',
                        color: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  {dashboardData.subscription.monthlyMinutes !== -1 && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (dashboardData.subscription.usedMinutes /
                            dashboardData.subscription.monthlyMinutes) *
                          100
                        }
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Task Statistics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Running Tasks
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {dashboardData.tasks.running}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Completed
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {dashboardData.tasks.completed}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Failed
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {dashboardData.tasks.failed}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        Total
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {dashboardData.tasks.total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Button variant="outlined" fullWidth href="/tasks">
                View All Tasks
              </Button>
            </Box>
          </TabPanel>

          {/* Team Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Team Members ({members?.length || 0})
                </Typography>
                {hasPermission('members.manage') && (
                  <Button variant="contained">
                    Invite Member
                  </Button>
                )}
              </Box>

              {members && members.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Joined</TableCell>
                        {hasPermission('members.manage') && <TableCell>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {member.userName?.charAt(0) || 'U'}
                              </Avatar>
                              {member.userName || 'Unknown User'}
                            </Box>
                          </TableCell>
                          <TableCell>{member.userEmail || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip label={member.role} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={member.status}
                              size="small"
                              color={member.status === 'active' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </TableCell>
                          {hasPermission('members.manage') && (
                            <TableCell>
                              <IconButton size="small">
                                <MoreVert />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No team members yet. Invite your first member to get started!
                </Alert>
              )}
            </Box>
          </TabPanel>

          {/* Whitelabel Tab (Enterprise only) */}
          {isEnterprise && (
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Whitelabel Configuration
                </Typography>

                {whitelabelSettings ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Alert severity={whitelabelSettings.isActive ? 'success' : 'info'} sx={{ mb: 2 }}>
                        {whitelabelSettings.isActive
                          ? 'Whitelabel is active'
                          : 'Configure your branding below and activate whitelabel'}
                      </Alert>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Branding
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Company Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {whitelabelSettings.branding.companyName}
                            </Typography>
                          </Box>
                          {whitelabelSettings.branding.logoUrl && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Logo
                              </Typography>
                              <img
                                src={whitelabelSettings.branding.logoUrl}
                                alt="Company Logo"
                                style={{ maxWidth: '200px', height: 'auto' }}
                              />
                            </Box>
                          )}
                          {hasPermission('whitelabel.manage') && (
                            <Button variant="outlined" fullWidth>
                              Update Branding
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Customization
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Hide "Powered by"
                            </Typography>
                            <Chip
                              label={whitelabelSettings.customization.hidePoweredBy ? 'Enabled' : 'Disabled'}
                              color={whitelabelSettings.customization.hidePoweredBy ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                          {hasPermission('whitelabel.manage') && (
                            <Button variant="outlined" fullWidth>
                              Configure Settings
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Whitelabel settings are being configured for your organization...
                  </Alert>
                )}
              </Box>
            </TabPanel>
          )}

          {/* Domains Tab (Enterprise only) */}
          {isEnterprise && (
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Custom Domains
                  </Typography>
                  {hasPermission('whitelabel.manage') && (
                    <Button variant="contained">
                      Add Domain
                    </Button>
                  )}
                </Box>

                {customDomains && customDomains.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Domain</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>DNS Verified</TableCell>
                          <TableCell>SSL</TableCell>
                          <TableCell>Added</TableCell>
                          {hasPermission('whitelabel.manage') && <TableCell>Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customDomains.map((domain) => (
                          <TableRow key={domain._id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {domain.domain}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={domain.status}
                                color={domain.status === 'active' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={domain.dnsVerified ? <CheckCircle /> : <Error />}
                                label={domain.dnsVerified ? 'Verified' : 'Pending'}
                                size="small"
                                color={domain.dnsVerified ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={domain.sslConfigured ? <CheckCircle /> : <Error />}
                                label={domain.sslConfigured ? 'Configured' : 'Pending'}
                                size="small"
                                color={domain.sslConfigured ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(domain.createdAt).toLocaleDateString()}
                            </TableCell>
                            {hasPermission('whitelabel.manage') && (
                              <TableCell>
                                <IconButton size="small">
                                  <MoreVert />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    No custom domains configured. Add your first domain to get started!
                  </Alert>
                )}

                <Card sx={{ mt: 3, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Setup Instructions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      To connect a custom domain, add the following DNS records:
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: '#000000',
                        color: '#FFFFFF',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                      }}
                    >
                      {`CNAME   @   concierge.ai
CNAME   www   concierge.ai`}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
          )}
        </Card>
      </Container>
    </Box>
  );
}
