'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  Security,
  Analytics,
  AutoAwesome,
  WbTwilight,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 1 : 0}
        sx={{
          bgcolor: scrolled ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
            <Typography
              variant="h6"
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              sx={{
                fontWeight: 600,
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Concierge AI
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
              <Button href="#features" color="inherit" sx={{ fontSize: '1rem' }}>
                Features
              </Button>
              <Button href="#industries" color="inherit" sx={{ fontSize: '1rem' }}>
                Industries
              </Button>
              <Button href="#pricing" color="inherit" sx={{ fontSize: '1rem' }}>
                Pricing
              </Button>
              <Button variant="contained" sx={{ ml: 2 }} href="/billing">
                Get Started
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          pt: { xs: 20, md: 28 },
          pb: { xs: 12, md: 20 },
          px: 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 4,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              AI Browser Agent That Saves<br />
              Your Business{' '}
              <Box component="span" sx={{ color: '#FFFFFF', position: 'relative' }}>
                R187,500+
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    bgcolor: '#FFFFFF',
                  }}
                />
              </Box>
              <br />
              Per Employee Annually
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 6,
                maxWidth: '800px',
                mx: 'auto',
                fontSize: '1.25rem',
                lineHeight: 1.75,
              }}
            >
              Enterprise-grade AI automation platform powered by Stagehand and Browserbase.
              Automate research, data extraction, and compliance tasks with 95% time reduction.
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                component={motion.a}
                href="/billing"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={motion.a}
                href="https://cal.com/partner-discovery/south-africa"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </Button>
            </Box>

            {/* ROI Stats Card */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              sx={{
                mt: 8,
                maxWidth: '900px',
                mx: 'auto',
                p: 4,
              }}
            >
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                Calculate Your ROI
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    95%
                  </Typography>
                  <Typography color="text.secondary">Time Reduction</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    3.5x
                  </Typography>
                  <Typography color="text.secondary">ROI Multiplier</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    24/7
                  </Typography>
                  <Typography color="text.secondary">Operations</Typography>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {[
              { value: 'R187,500+', label: 'Annual Savings Per Employee' },
              { value: '95%', label: 'Task Automation Rate' },
              { value: '3.5x', label: 'Average ROI' },
              { value: '24/7', label: 'Continuous Operations' },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary">{stat.label}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        component="section"
        sx={{ py: { xs: 12, md: 16 }, px: 3 }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Powerful AI Features
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: '700px', mx: 'auto' }}
            >
              Enterprise-grade automation powered by Stagehand AI and Browserbase
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {[
              {
                icon: <AutoAwesome sx={{ fontSize: 40 }} />,
                title: 'Intelligent Research',
                description:
                  'AI-powered web scraping and data collection across multiple sources with natural language understanding',
              },
              {
                icon: <Analytics sx={{ fontSize: 40 }} />,
                title: 'Automated Data Extraction',
                description:
                  'Extract structured data from any website with 99.9% accuracy using advanced pattern recognition',
              },
              {
                icon: <TrendingUp sx={{ fontSize: 40 }} />,
                title: 'ROI Optimization',
                description:
                  'Real-time analytics and insights to maximize returns on your automation investments',
              },
              {
                icon: <Security sx={{ fontSize: 40 }} />,
                title: 'Enterprise Security',
                description:
                  'Bank-level encryption, SOC 2 compliance, and dedicated cloud infrastructure',
              },
              {
                icon: <Speed sx={{ fontSize: 40 }} />,
                title: 'Custom Workflows',
                description:
                  'Build complex automation workflows with our visual builder and pre-built templates',
              },
              {
                icon: <WbTwilight sx={{ fontSize: 40 }} />,
                title: '24/7 Monitoring',
                description:
                  'Real-time task monitoring, alerts, and automatic error recovery with 99.9% uptime',
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ height: '100%', p: 3 }}
                >
                  <CardContent>
                    <Box sx={{ mb: 3, color: '#FFFFFF' }}>{feature.icon}</Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Industries Section */}
      <Box
        id="industries"
        component="section"
        sx={{
          py: { xs: 12, md: 16 },
          px: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Trusted Across Industries
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: '700px', mx: 'auto' }}
            >
              From startups to Fortune 500 companies
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {[
              {
                industry: 'Market Research',
                description:
                  'Automate competitive analysis, pricing intelligence, and market trend monitoring',
                savings: 'Saves R225,000/mo',
              },
              {
                industry: 'Lead Generation',
                description:
                  'AI-powered prospect discovery, qualification, and enrichment at scale',
                savings: 'Saves R330,000/mo',
              },
              {
                industry: 'Compliance Monitoring',
                description:
                  'Continuous regulatory monitoring and automated compliance reporting',
                savings: 'Saves R277,500/mo',
              },
              {
                industry: 'Price Intelligence',
                description:
                  'Real-time competitor pricing tracking and dynamic pricing optimization',
                savings: 'Saves R180,000/mo',
              },
            ].map((useCase, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ p: 4 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3,
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {useCase.industry}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#FFFFFF',
                      }}
                    >
                      {useCase.savings}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {useCase.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        id="pricing"
        component="section"
        sx={{ py: { xs: 12, md: 16 }, px: 3 }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Simple Pricing
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: '700px', mx: 'auto' }}
            >
              Choose the plan that fits your business needs
            </Typography>
          </motion.div>

          <Grid container spacing={4} sx={{ maxWidth: '1000px', mx: 'auto' }}>
            {/* Premium Plan */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                sx={{ p: 5, position: 'relative', height: '100%' }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: '#FFFFFF',
                    color: '#000000',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Popular
                </Box>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                  Premium
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" component="span" sx={{ fontWeight: 600 }}>
                    R15,000
                  </Typography>
                  <Typography
                    component="span"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    /month
                  </Typography>
                </Box>
                <Box sx={{ mb: 4 }}>
                  {[
                    '10,000 automation minutes/month',
                    'Unlimited browser sessions',
                    'Advanced AI capabilities',
                    'Priority support 24/7',
                    'Custom integrations',
                    'Analytics dashboard',
                    'Team collaboration tools',
                  ].map((feature, i) => (
                    <Box
                      key={i}
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                    >
                      <CheckCircle sx={{ mr: 2, mt: 0.5, fontSize: 20 }} />
                      <Typography color="text.secondary">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  href="/billing"
                >
                  Subscribe Now
                </Button>
              </Card>
            </Grid>

            {/* Enterprise Plan */}
            <Grid item xs={12} md={6}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                sx={{ 
                  p: 5, 
                  bgcolor: '#FFFFFF',
                  color: '#000000',
                  height: '100%',
                  border: '2px solid #000000',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: '#000000',
                    color: '#FFFFFF',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Best Value
                </Box>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#000000' }}>
                  Enterprise
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" component="span" sx={{ fontWeight: 600, color: '#000000' }}>
                    R25,000
                  </Typography>
                  <Typography
                    component="span"
                    color="text.secondary"
                    sx={{ ml: 1, color: '#666666' }}
                  >
                    /month
                  </Typography>
                </Box>
                <Box sx={{ mb: 4 }}>
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
                    <Box
                      key={i}
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                    >
                      <CheckCircle sx={{ mr: 2, mt: 0.5, fontSize: 20, color: '#000000' }} />
                      <Typography sx={{ color: '#333333' }}>{feature}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  href="/billing"
                  sx={{
                    bgcolor: '#000000',
                    color: '#FFFFFF',
                    '&:hover': {
                      bgcolor: '#333333',
                    }
                  }}
                >
                  Subscribe Now
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  component="a"
                  href="https://cal.com/partner-discovery/south-africa"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mt: 2,
                    borderColor: '#000000',
                    color: '#000000',
                    '&:hover': {
                      borderColor: '#333333',
                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                    }
                  }}
                >
                  Schedule Demo
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 12, md: 20 },
          px: 3,
          bgcolor: 'background.paper',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" sx={{ mb: 3, fontWeight: 600 }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 6, fontSize: '1.25rem' }}
            >
              Join hundreds of companies automating their operations with Concierge AI
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" endIcon={<ArrowForward />} href="/billing">
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                component="a"
                href="https://cal.com/partner-discovery/south-africa"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule Consultation
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          py: 8,
          px: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Concierge AI
              </Typography>
              <Typography color="text.secondary">
                Enterprise-grade AI browser automation platform
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button href="#features" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Features
                </Button>
                <Button href="#pricing" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Pricing
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Documentation
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  API
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  About
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Blog
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Careers
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Contact
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Privacy
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Terms
                </Button>
                <Button href="#" color="inherit" sx={{ justifyContent: 'flex-start' }}>
                  Security
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ mb: 4 }} />
          <Typography align="center" color="text.secondary">
            © 2025 Concierge AI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
