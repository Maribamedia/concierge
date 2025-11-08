'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import { ConvexClientProvider } from '@/lib/convex-client-provider';
import { OrganizationProvider } from '@/lib/organization-context';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Concierge AI - AI Browser Agent That Saves R187,500+ Per Employee Annually</title>
        <meta
          name="description"
          content="Enterprise-grade AI browser automation platform powered by Stagehand. 95% time reduction, 3.5x ROI, 24/7 operations. Automate research, data extraction, and compliance tasks."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ConvexClientProvider>
          <OrganizationProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </OrganizationProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
