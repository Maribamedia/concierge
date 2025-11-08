# Convex.dev Integration Guide

This guide explains how to set up and use Convex.dev as the backend for Concierge AI.

## What is Convex.dev?

Convex is a backend platform that provides:
- **Real-time Database**: Reactive queries with automatic updates
- **Serverless Functions**: TypeScript functions that run on Convex servers
- **Type Safety**: Full TypeScript support with automatic type generation
- **Real-time Updates**: Live query subscriptions
- **Built-in Authentication**: User management
- **File Storage**: Asset storage and CDN

## Why Convex for Concierge AI?

1. **Real-time Task Updates**: Tasks update live across all connected clients
2. **Type Safety**: Full TypeScript integration prevents runtime errors
3. **Scalability**: Automatically scales with your usage
4. **Developer Experience**: Hot reloading, dev dashboard, and great DX
5. **Cost Effective**: Generous free tier, pay-as-you-grow pricing

## Setup Steps

### 1. Create Convex Account

1. Visit [convex.dev](https://convex.dev)
2. Sign up with GitHub or Google
3. Create a new project named "concierge-ai"

### 2. Install Convex CLI

```bash
npm install -g convex
# or
pnpm add -g convex
```

### 3. Initialize Convex in Your Project

From the project root:

```bash
cd /workspace/concierge-v2
npx convex dev
```

This will:
- Link your local project to Convex cloud
- Create `.env.local` with deployment credentials
- Deploy schema and functions
- Start watching for changes

### 4. Verify Deployment

Your terminal should show:
```
✓ Deployment URL: https://your-deployment.convex.cloud
✓ Schema deployed
✓ Functions deployed: tasks.ts, users.ts
```

### 5. Configure Next.js

The generated `.env.local` will have:
```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

## Database Schema

### Tables Overview

#### profiles
Stores user profile information and subscription status.

```typescript
{
  userId: string;           // Unique user identifier
  email: string;            // User email
  name: string;             // Full name
  company?: string;         // Company name (optional)
  subscriptionStatus: "free" | "premium" | "enterprise";
  usageMinutes: number;     // Total minutes used
  tasksCompleted: number;   // Total tasks completed
  createdAt: number;        // Timestamp
  updatedAt: number;        // Timestamp
}
```

#### tasks
Automation tasks with status tracking.

```typescript
{
  userId: string;
  organizationId?: string;
  title: string;
  description: string;
  type: "research" | "extraction" | "monitoring" | "custom";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;         // 0-100
  result?: any;             // Task output
  error?: string;           // Error message if failed
  usageMinutes: number;     // Minutes consumed
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}
```

#### organizations
Company/team accounts.

```typescript
{
  name: string;
  domain: string;
  subscriptionTier: "premium" | "enterprise";
  settings: {
    whiteLabel?: boolean;
    customDomain?: string;
    maxUsers?: number;
  };
  createdAt: number;
  updatedAt: number;
}
```

#### subscriptions
Billing and subscription data.

```typescript
{
  userId: string;
  organizationId?: string;
  plan: "premium" | "enterprise";
  status: "active" | "cancelled" | "expired";
  monthlyMinutes: number;
  usedMinutes: number;
  price: number;
  currency: string;
  billingCycle: "monthly" | "annual";
  nextBillingDate: number;
  createdAt: number;
  updatedAt: number;
}
```

## Available Functions

### Task Management (`convex/tasks.ts`)

#### createTask
Create a new automation task.

```typescript
const taskId = await convex.mutation(api.tasks.createTask, {
  userId: "user_123",
  title: "Market Research",
  description: "Analyze competitor pricing",
  type: "research"
});
```

#### getUserTasks
Get all tasks for a user.

```typescript
const tasks = await convex.query(api.tasks.getUserTasks, {
  userId: "user_123"
});
```

#### updateTaskStatus
Update task progress and status.

```typescript
await convex.mutation(api.tasks.updateTaskStatus, {
  taskId: taskId,
  status: "running",
  progress: 50
});
```

### User Management (`convex/users.ts`)

#### upsertProfile
Create or update user profile.

```typescript
await convex.mutation(api.users.upsertProfile, {
  userId: "user_123",
  email: "user@company.com",
  name: "John Doe",
  company: "Acme Corp"
});
```

#### getProfile
Get user profile data.

```typescript
const profile = await convex.query(api.users.getProfile, {
  userId: "user_123"
});
```

#### trackUsage
Track task execution usage.

```typescript
await convex.mutation(api.users.trackUsage, {
  userId: "user_123",
  taskId: "task_456",
  minutesUsed: 5
});
```

#### getUsageAnalytics
Get usage analytics for reporting.

```typescript
const analytics = await convex.query(api.users.getUsageAnalytics, {
  userId: "user_123",
  startTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  endTime: Date.now()
});
```

## Frontend Integration

### 1. Install Convex Client

Already installed in package.json:
```bash
pnpm add convex
```

### 2. Set Up Convex Provider

Create `app/providers.tsx`:

```typescript
'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

Update `app/layout.tsx`:

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3. Use Convex Hooks

```typescript
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export function TaskList({ userId }: { userId: string }) {
  // Real-time query - updates automatically
  const tasks = useQuery(api.tasks.getUserTasks, { userId });
  
  // Mutation for creating tasks
  const createTask = useMutation(api.tasks.createTask);

  const handleCreateTask = async () => {
    await createTask({
      userId,
      title: "New Task",
      description: "Task description",
      type: "research"
    });
  };

  if (tasks === undefined) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreateTask}>Create Task</button>
      {tasks.map(task => (
        <div key={task._id}>{task.title} - {task.status}</div>
      ))}
    </div>
  );
}
```

## Real-time Updates

Convex queries are reactive:

```typescript
// This component will automatically re-render when tasks change
function LiveTaskMonitor({ userId }: { userId: string }) {
  const tasks = useQuery(api.tasks.getUserTasks, { userId });
  const runningCount = tasks?.filter(t => t.status === 'running').length;

  return <div>Running Tasks: {runningCount}</div>;
}
```

## Development Workflow

### Local Development

1. Start Convex dev server:
   ```bash
   npx convex dev
   ```

2. Start Next.js dev server (in another terminal):
   ```bash
   pnpm dev
   ```

3. Make changes to schema or functions - they hot reload automatically

### View Dashboard

```bash
npx convex dashboard
```

This opens the Convex dashboard where you can:
- View all database tables
- Run queries manually
- Monitor function calls
- View logs and errors

## Production Deployment

### Deploy Convex Functions

```bash
npx convex deploy --prod
```

This deploys to production and gives you a production URL:
```
Production URL: https://your-prod-deployment.convex.cloud
```

### Update Production Environment Variables

In your hosting provider (Vercel, Netlify, etc.), set:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

### Deploy Frontend

```bash
pnpm build
# Deploy the out/ directory to your hosting provider
```

## Monitoring and Debugging

### View Logs

```bash
npx convex logs --prod
```

### Function Performance

Check the Convex dashboard for:
- Function execution times
- Database query performance
- Error rates
- Usage metrics

## Best Practices

1. **Use Indexes**: Add indexes for frequently queried fields
2. **Batch Operations**: Use transactions for multiple related updates
3. **Type Safety**: Use generated types from `convex/_generated`
4. **Error Handling**: Wrap mutations in try-catch blocks
5. **Real-time**: Use queries for data that needs live updates
6. **Pagination**: Use `.take()` and `.skip()` for large datasets

## Troubleshooting

### "CONVEX_DEPLOYMENT not found"

Run `npx convex dev` to generate `.env.local`

### "Unable to connect to Convex"

Check that `NEXT_PUBLIC_CONVEX_URL` is set correctly in environment variables

### Schema Changes Not Applying

1. Save the schema file
2. Convex dev should auto-deploy
3. Check terminal for errors
4. Try `npx convex dev --once` to force redeploy

## Pricing

- **Free Tier**: Up to 1M function calls/month
- **Hobby**: $25/month for more usage
- **Pro**: Custom pricing for enterprise

See [convex.dev/pricing](https://convex.dev/pricing)

## Support

- Documentation: [docs.convex.dev](https://docs.convex.dev)
- Discord: [convex.dev/community](https://convex.dev/community)
- Email: support@convex.dev

---

This integration provides a robust, scalable backend for Concierge AI with real-time capabilities and excellent developer experience.
