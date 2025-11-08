# Convex Backend Deployment Guide

## Issue Identified
The Convex CLI has a compatibility issue with the current Node.js v18.19.0 environment (`File is not defined` error). This guide provides multiple deployment methods.

## Prerequisites
- Convex account (sign up at https://convex.dev)
- Node.js v20+ installed locally (recommended)
- Project cloned to your local machine

## Method 1: Deploy from Local Machine (Recommended)

### Step 1: Set Up Convex Project
```bash
cd /path/to/concierge-v2-full

# Initialize Convex project (if not already done)
npx convex init

# This will:
# 1. Create convex.json with your project configuration
# 2. Prompt you to log in via browser
# 3. Link to your Convex project
```

### Step 2: Deploy Schema and Functions
```bash
# Deploy all schema and functions to Convex cloud
npx convex deploy

# This will:
# 1. Push the schema (8 tables total)
# 2. Push all functions (organizations, organizationMembers, whitelabel, enterpriseAnalytics, payments, profiles)
# 3. Generate TypeScript types in convex/_generated/
# 4. Output your NEXT_PUBLIC_CONVEX_URL
```

### Step 3: Update Environment Variables
After deployment, Convex will provide you with a deployment URL. Update `.env.local`:

```bash
# Copy the URL from deployment output
NEXT_PUBLIC_CONVEX_URL=https://your-project-id.convex.cloud
```

### Step 4: Build and Test
```bash
# Install dependencies if needed
pnpm install

# Build the application
pnpm build

# The build should now succeed with generated types
```

## Method 2: Deploy via Convex Dashboard (Manual)

If CLI deployment fails, you can manually deploy through the Convex dashboard:

### Step 1: Create New Project
1. Go to https://dashboard.convex.dev
2. Click "Create Project"
3. Name it "concierge-v2-full"

### Step 2: Copy Schema
1. In the Convex dashboard, go to "Schema"
2. Copy the entire content from `convex/schema.ts`
3. Paste and save

### Step 3: Deploy Functions Manually
For each function file in the `convex/` directory:
1. Go to "Functions" in dashboard
2. Create new function
3. Copy content from local file
4. Save

Files to upload:
- `convex/organizations.ts` (8 functions)
- `convex/organizationMembers.ts` (11 functions)
- `convex/whitelabel.ts` (12 functions)
- `convex/enterpriseAnalytics.ts` (6 functions)
- `convex/payments.ts` (existing, verify updates)
- `convex/profiles.ts` (existing, verify updates)

### Step 4: Get Deployment URL
1. Go to "Settings" → "URL & Keys"
2. Copy your "Deployment URL"
3. Update `.env.local` with `NEXT_PUBLIC_CONVEX_URL`

## Method 3: CI/CD with Deploy Key

### Step 1: Generate Deploy Key
1. Go to Convex Dashboard → Settings → Deploy Keys
2. Generate a new deploy key
3. Copy the key

### Step 2: Set Environment Variable
```bash
export CONVEX_DEPLOY_KEY=your_deploy_key_here
```

### Step 3: Deploy
```bash
npx convex deploy --cmd-url-env-var-name CONVEX_DEPLOY_KEY
```

## Verification Checklist

After deployment, verify:

### 1. Schema Deployed
Check that all 8 tables exist in Convex dashboard:
- ✅ profiles
- ✅ payments
- ✅ subscriptions
- ✅ organizations (NEW)
- ✅ organizationMembers (NEW)
- ✅ whitelabelSettings (NEW)
- ✅ customDomains (NEW)
- ✅ enterpriseFeatures (NEW)

### 2. Functions Deployed
Check that all functions are visible in the dashboard:
- ✅ organizations.* (8 functions)
- ✅ organizationMembers.* (11 functions)
- ✅ whitelabel.* (12 functions)
- ✅ enterpriseAnalytics.* (6 functions)
- ✅ payments.* (existing functions)
- ✅ profiles.* (existing functions)

### 3. Types Generated
Check that `convex/_generated/` directory contains:
- ✅ `api.d.ts` (TypeScript definitions)
- ✅ `api.js` (API exports)
- ✅ `dataModel.d.ts` (Schema types)
- ✅ `server.d.ts` (Server types)

### 4. Build Success
```bash
pnpm build
# Should complete without TypeScript errors
```

## Troubleshooting

### Error: "File is not defined"
**Cause**: Node.js v18 compatibility issue with Convex CLI  
**Solution**: Upgrade to Node.js v20+ or use Method 2 (Dashboard)

### Error: "You are not logged in"
**Cause**: Not authenticated with Convex  
**Solution**: Run `npx convex login` and complete browser authentication

### Error: "Property 'enterpriseAnalytics' does not exist"
**Cause**: TypeScript types not generated  
**Solution**: Complete Convex deployment first, then rebuild

### Error: "Module not found: convex/_generated"
**Cause**: Types not generated after deployment  
**Solution**: Run `npx convex deploy` again to regenerate types

## What Gets Deployed

### New Database Tables (5)
1. **organizations**: Company/tenant data with subscription linking
2. **organizationMembers**: Team members with roles and permissions
3. **whitelabelSettings**: Custom branding configuration
4. **customDomains**: Domain management with DNS verification
5. **enterpriseFeatures**: Feature flags and analytics

### Updated Tables (2)
1. **subscriptions**: Added organizationId field for multi-tenant billing
2. **profiles**: Added enterprise subscription status fields

### New Backend Functions (37)
- **organizations.ts**: CRUD operations for organizations (8 functions)
- **organizationMembers.ts**: Team management with RBAC (11 functions)
- **whitelabel.ts**: Branding configuration (12 functions)
- **enterpriseAnalytics.ts**: Analytics and reporting (6 functions)

### Updated Functions
- **payments.ts**: Enhanced webhook to create organizations on enterprise subscriptions
- **profiles.ts**: Added enterprise status tracking

## Next Steps After Deployment

1. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud
   ```

2. **Build Application**
   ```bash
   pnpm build
   ```

3. **Run Comprehensive Tests**
   Follow the testing plan in `PRODUCTION_DEPLOYMENT_TESTING_REPORT.md`:
   - Payment flow testing
   - Organization creation verification
   - Dashboard functionality
   - Team management
   - Whitelabel configuration

4. **Test Payment Integration**
   - Subscribe to Enterprise plan (R25,000)
   - Verify webhook creates organization
   - Confirm user assigned as owner
   - Check dashboard shows real data

## Support

If deployment issues persist:
1. Check Convex dashboard logs for errors
2. Verify all environment variables are set
3. Ensure Node.js version is v20+
4. Review Convex documentation: https://docs.convex.dev/deployment

## Summary

**Quick Start Command** (if environment is compatible):
```bash
cd /workspace/concierge-v2-full
npx convex deploy
# Copy the deployment URL to .env.local
pnpm build
# Ready for testing!
```

**Manual Alternative**: Use Convex Dashboard (Method 2) if CLI fails

**Result**: TypeScript types generated, application builds successfully, ready for comprehensive testing
