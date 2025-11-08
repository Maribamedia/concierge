# Quick Start: Convex Backend Deployment

## Current Status
✅ **Code Complete**: All enterprise features implemented (4,109 lines)  
⚠️ **Blocked**: Requires Convex deployment to generate TypeScript types  
📋 **Ready**: Deployment scripts and comprehensive guides prepared  

## One-Command Deployment (Local Machine Only)

### Linux/Mac:
```bash
cd /path/to/concierge-v2-full
./scripts/deploy-convex.sh
```

### Windows:
```cmd
cd C:\path\to\concierge-v2-full
scripts\deploy-convex.bat
```

### What This Does:
1. ✅ Installs dependencies
2. ✅ Deploys Convex schema (8 tables)
3. ✅ Deploys Convex functions (37 functions across 6 files)
4. ✅ Generates TypeScript types
5. ✅ Updates `.env.local` with deployment URL
6. ✅ Builds the application

## Requirements

### System Requirements:
- **Node.js**: v20+ (recommended) or v18+
- **Package Manager**: pnpm (recommended) or npm
- **Internet**: Required for Convex cloud deployment

### Accounts Needed:
- **Convex Account**: Sign up at https://convex.dev (free tier available)

## Alternative: Manual Deployment via Dashboard

If automated deployment fails, follow the manual guide:
📖 See `CONVEX_DEPLOYMENT_GUIDE.md` → Method 2: Deploy via Convex Dashboard

## Environment Variables Required

After deployment, ensure `.env.local` contains:

```bash
# Convex Backend (automatically set by deployment script)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Stagehand AI (already configured)
STAGEHAND_API_KEY=bb_live_NiBaQmkR9ughxbcf0tcYtW5ZFrg

# WorkOS Authentication (already configured)
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_...

# Application URL
NEXT_PUBLIC_APP_URL=https://your-deployment.space.minimax.io
```

## Deployment Options

### Option 1: Interactive (Recommended for First-Time)
```bash
cd concierge-v2-full
pnpm exec convex deploy
# Opens browser for authentication
# Follow prompts to create/select project
```

### Option 2: CI/CD with Deploy Key
```bash
# Get deploy key from: https://dashboard.convex.dev/settings
export CONVEX_DEPLOY_KEY=your_key_here
pnpm exec convex deploy --yes
```

### Option 3: Manual (Dashboard)
See `CONVEX_DEPLOYMENT_GUIDE.md` for step-by-step instructions

## Verification Checklist

After deployment, verify in Convex Dashboard (https://dashboard.convex.dev):

### ✅ Schema (8 Tables)
- profiles
- payments
- subscriptions
- **organizations** (NEW)
- **organizationMembers** (NEW)
- **whitelabelSettings** (NEW)
- **customDomains** (NEW)
- **enterpriseFeatures** (NEW)

### ✅ Functions (37 Total)
- organizations.* (8 functions)
- organizationMembers.* (11 functions)
- whitelabel.* (12 functions)
- enterpriseAnalytics.* (6 functions)
- payments.* (existing)
- profiles.* (existing)

### ✅ Local Files
- `convex/_generated/api.d.ts` exists
- `convex/_generated/dataModel.d.ts` exists
- `.env.local` has `NEXT_PUBLIC_CONVEX_URL`

### ✅ Build Success
```bash
pnpm build
# Should complete without errors
```

## Troubleshooting

### Error: "File is not defined"
**Solution**: Upgrade to Node.js v20+ or use dashboard deployment (Method 2)

### Error: "You are not logged in"
**Solution**: 
```bash
pnpm exec convex login
# Complete browser authentication
pnpm exec convex deploy
```

### Error: "Property 'enterpriseAnalytics' does not exist"
**Solution**: Types not generated. Redeploy Convex:
```bash
pnpm exec convex deploy --yes
```

## Next Steps After Successful Deployment

1. **Build Application**
   ```bash
   pnpm build
   # Verify no TypeScript errors
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   # Open http://localhost:3000
   ```

3. **Test Enterprise Features**
   Follow comprehensive testing plan in:
   📖 `PRODUCTION_DEPLOYMENT_TESTING_REPORT.md`

4. **Test Payment Flow**
   - Subscribe to Enterprise plan (R25,000/month)
   - Verify webhook creates organization in Convex
   - Confirm user assigned as owner role
   - Check enterprise dashboard shows real data

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `CONVEX_DEPLOYMENT_GUIDE.md` | Detailed deployment instructions with 3 methods |
| `ENTERPRISE_FEATURES_GUIDE.md` | API reference and usage examples (552 lines) |
| `ENTERPRISE_IMPLEMENTATION_SUMMARY.md` | Technical specifications (413 lines) |
| `PRODUCTION_DEPLOYMENT_TESTING_REPORT.md` | Comprehensive testing plan (537 lines) |
| `PAYFAST_INTEGRATION.md` | Payment integration details |

## Implementation Summary

### What's Been Built:

**Backend (1,419 lines)**:
- 8 functions for organization management
- 11 functions for team/member management  
- 12 functions for whitelabel configuration
- 6 functions for enterprise analytics

**Frontend (1,099 lines)**:
- Enterprise dashboard with 4 tabs (Analytics, Team, Whitelabel, Domains)
- Organization settings page
- Real-time data with Convex React hooks
- No mock data - all connected to backend

**State Management (89 lines)**:
- OrganizationContext for multi-tenant state
- Permission checking system
- Auto organization selection

**Payment Integration**:
- Enhanced webhook auto-creates organizations
- Enterprise plan detection (R25,000 threshold)
- Owner role auto-assignment
- Organization-level billing

### Tech Stack:
- **Frontend**: Next.js 14 + React + TypeScript + Material UI
- **Backend**: Convex (real-time database + serverless functions)
- **Payments**: Payfast (South African payment gateway)
- **Auth**: WorkOS (enterprise SSO ready)
- **Design**: Black & white premium aesthetic

## Support

**Deployment Issues**: 
- Check Convex dashboard logs
- Ensure Node.js v20+
- Verify internet connection

**Build Errors**:
- Ensure Convex deployed successfully
- Check `convex/_generated/` exists
- Verify all environment variables set

**Payment Testing**:
- Use Payfast sandbox credentials
- Test webhook with ngrok/localhost
- Check Convex dashboard for new organization entries

## Quick Commands Reference

```bash
# Deploy backend
pnpm exec convex deploy

# Build application
pnpm build

# Run development
pnpm dev

# Check deployment status
pnpm exec convex dev --once

# View Convex logs
# Visit: https://dashboard.convex.dev/logs
```

## Success Criteria

Deployment is complete when:
- ✅ All 8 tables visible in Convex dashboard
- ✅ All 37 functions deployed successfully
- ✅ TypeScript types generated in `convex/_generated/`
- ✅ Application builds without errors (`pnpm build`)
- ✅ Enterprise dashboard loads with real data
- ✅ Payment webhook creates organizations
- ✅ All tests pass per `PRODUCTION_DEPLOYMENT_TESTING_REPORT.md`

---

**Estimated Time**: 5-10 minutes for automated deployment, 20-30 minutes for manual dashboard deployment

**Next Action**: Run `./scripts/deploy-convex.sh` (Linux/Mac) or `scripts\deploy-convex.bat` (Windows)
