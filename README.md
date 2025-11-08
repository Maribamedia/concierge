# Concierge AI - Enterprise AI Browser Agent Platform

A stunning, production-grade AI browser automation platform powered by Convex.dev, Stagehand AI, and Browserbase.

## Features

- **Beautiful Modern Design**: Premium SaaS aesthetics with glassmorphism, gradients, and smooth animations
- **Convex.dev Backend**: Real-time database and serverless functions
- **WorkOS Authentication**: Enterprise-grade auth with SSO support
- **Stagehand AI**: Intelligent browser automation and web scraping
- **Browserbase**: Scalable browser infrastructure
- **Payfast Integration**: Payment processing for South African businesses
- **ROI-Focused**: Save $12,500+ per employee annually

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Convex.dev (real-time database + serverless functions)
- **Authentication**: WorkOS
- **AI Engine**: Stagehand
- **Browser Automation**: Browserbase
- **Payments**: Payfast
- **Styling**: Tailwind CSS + Framer Motion

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Convex.dev

1. Create account at [convex.dev](https://convex.dev)
2. Install Convex CLI:
   ```bash
   npm install -g convex
   ```
3. Initialize Convex in your project:
   ```bash
   npx convex dev
   ```
4. This will:
   - Create a new Convex project
   - Generate `.env.local` with your deployment URL
   - Deploy your schema and functions

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# From Convex.dev dashboard
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# From WorkOS dashboard
WORKOS_API_KEY=your-workos-api-key
WORKOS_CLIENT_ID=your-workos-client-id
NEXT_PUBLIC_WORKOS_CLIENT_ID=your-workos-client-id

# From Stagehand
STAGEHAND_API_KEY=your-stagehand-key
NEXT_PUBLIC_STAGEHAND_API_KEY=your-stagehand-key

# From Browserbase
BROWSERBASE_API_KEY=your-browserbase-key
BROWSERBASE_PROJECT_ID=your-project-id

# From Payfast
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Deploy to Production

#### Deploy Frontend (Static Export)

```bash
pnpm build
```

The static site will be in the `out/` directory. Deploy to:
- Vercel (recommended for Next.js)
- Netlify
- AWS S3 + CloudFront
- Any static hosting provider

#### Deploy Convex Backend

Convex functions are automatically deployed when you run:

```bash
npx convex deploy
```

## Project Structure

```
concierge-v2/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main landing page
├── components/            # React components (to be added)
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── tasks.ts          # Task management functions
│   └── users.ts          # User management functions
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

### Tables

1. **profiles**: User profiles and subscription status
2. **organizations**: Company/organization data
3. **tasks**: Automation tasks and their status
4. **subscriptions**: Billing and subscription management
5. **usageAnalytics**: Usage tracking and ROI calculation
6. **browserSessions**: Browser automation session tracking

## Key Features

### Landing Page
- Stunning hero section with gradient backgrounds
- Real-time ROI calculator
- Feature showcase with premium cards
- Industry use cases
- Pricing plans (Premium $999/mo, Enterprise custom)
- Cal.com integration for demo scheduling

### Design Elements
- Glassmorphism effects
- Smooth scroll animations
- Responsive mobile-first design
- Custom gradient color scheme (Indigo #3F51B5 + Purple #9C27B0)
- Professional typography and spacing
- Beautiful hover effects and micro-interactions

## Development

### Adding New Features

1. **New Database Tables**: Edit `convex/schema.ts`
2. **New API Functions**: Add to `convex/` directory
3. **New Components**: Add to `components/` directory
4. **Styling**: Use Tailwind utility classes

### Convex Development

Watch for changes:
```bash
npx convex dev
```

View dashboard:
```bash
npx convex dashboard
```

## External Service Setup

### WorkOS Setup
1. Visit [workos.com](https://workos.com)
2. Create new organization
3. Get API key and Client ID
4. Configure redirect URLs

### Stagehand Setup
1. Visit [stagehand.dev](https://docs.stagehand.dev)
2. Sign up for API access
3. Get API credentials

### Browserbase Setup
1. Visit [browserbase.com](https://browserbase.com)
2. Create project
3. Get API key and Project ID

### Payfast Setup
1. Visit [payfast.co.za](https://www.payfast.co.za)
2. Create merchant account
3. Get merchant credentials

## Production Deployment Checklist

- [ ] Set up Convex.dev project
- [ ] Configure WorkOS authentication
- [ ] Add Stagehand API credentials
- [ ] Set up Browserbase project
- [ ] Configure Payfast merchant account
- [ ] Deploy frontend to hosting provider
- [ ] Deploy Convex functions
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure environment variables
- [ ] Test all integrations
- [ ] Set up monitoring and analytics

## Support

For questions or issues:
- Documentation: See inline code comments
- Convex Docs: [docs.convex.dev](https://docs.convex.dev)
- Stagehand Docs: [docs.stagehand.dev](https://docs.stagehand.dev)
- Browserbase Docs: [docs.browserbase.com](https://docs.browserbase.com)

## License

Proprietary - All rights reserved

---

Built with MiniMax Agent
