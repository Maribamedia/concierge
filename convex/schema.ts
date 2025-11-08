import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User Profiles
  profiles: defineTable({
    userId: v.string(),
    workosUserId: v.optional(v.string()),
    workosOrganizationId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    company: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("enterprise")
    ),
    usageMinutes: v.number(),
    tasksCompleted: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_workos_user", ["workosUserId"]),

  // Organizations
  organizations: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly identifier
    domain: v.string(),
    ownerId: v.string(), // Primary owner userId
    subscriptionTier: v.union(v.literal("premium"), v.literal("enterprise")),
    subscriptionId: v.optional(v.string()),
    settings: v.object({
      whiteLabel: v.optional(v.boolean()),
      customDomain: v.optional(v.string()),
      maxUsers: v.optional(v.number()),
    }),
    billingEmail: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_domain", ["domain"])
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  // Organization Members (Team Management)
  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member")
    ),
    permissions: v.array(v.string()), // ["tasks.create", "tasks.view", "billing.view", etc.]
    invitedBy: v.optional(v.string()),
    invitedAt: v.optional(v.number()),
    joinedAt: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("suspended")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_and_user", ["organizationId", "userId"])
    .index("by_status", ["status"]),

  // Whitelabel Settings
  whitelabelSettings: defineTable({
    organizationId: v.id("organizations"),
    branding: v.object({
      companyName: v.string(),
      logoUrl: v.optional(v.string()),
      faviconUrl: v.optional(v.string()),
      primaryColor: v.optional(v.string()), // Hex color
      accentColor: v.optional(v.string()),
    }),
    customization: v.object({
      customDomain: v.optional(v.string()),
      customCss: v.optional(v.string()),
      hidePoweredBy: v.boolean(),
      customEmailTemplates: v.optional(v.boolean()),
    }),
    seo: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
      })
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_custom_domain", ["customization.customDomain"]),

  // Custom Domains
  customDomains: defineTable({
    organizationId: v.id("organizations"),
    domain: v.string(), // e.g., "client.concierge.ai"
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("failed"),
      v.literal("suspended")
    ),
    dnsVerified: v.boolean(),
    sslConfigured: v.boolean(),
    verificationToken: v.string(),
    lastCheckedAt: v.optional(v.number()),
    activatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_domain", ["domain"])
    .index("by_status", ["status"]),

  // Enterprise Features & Usage Limits
  enterpriseFeatures: defineTable({
    organizationId: v.id("organizations"),
    features: v.object({
      unlimitedUsage: v.boolean(),
      customBranding: v.boolean(),
      advancedAnalytics: v.boolean(),
      dedicatedSupport: v.boolean(),
      apiAccess: v.boolean(),
      ssoIntegration: v.boolean(),
      customIntegrations: v.boolean(),
      priorityProcessing: v.boolean(),
    }),
    limits: v.object({
      maxTeamMembers: v.number(),
      maxConcurrentTasks: v.number(),
      dataRetentionDays: v.number(),
    }),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organization", ["organizationId"]),

  // Tasks (Stagehand AI Integration)
  tasks: defineTable({
    userId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    title: v.string(),
    description: v.string(), // Natural language task description
    type: v.union(
      v.literal("research"),
      v.literal("extraction"),
      v.literal("monitoring"),
      v.literal("automation"),
      v.literal("custom")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("initializing"),
      v.literal("running"),
      v.literal("extracting"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("timeout")
    ),
    progress: v.number(), // 0-100
    currentStep: v.optional(v.string()), // Current AI action being performed
    stagehandSessionId: v.optional(v.string()),
    result: v.optional(
      v.object({
        extractedData: v.optional(v.any()),
        screenshots: v.optional(v.array(v.string())),
        errors: v.optional(v.array(v.string())),
        executionTime: v.optional(v.number()),
        pagesVisited: v.optional(v.array(v.string())),
      })
    ),
    stagehandMetrics: v.optional(
      v.object({
        actionsPerformed: v.number(),
        pagesVisited: v.number(),
        dataPointsExtracted: v.number(),
        success: v.boolean(),
      })
    ),
    error: v.optional(v.string()),
    usage: v.object({
      minutesUsed: v.number(),
      cost: v.number(),
    }),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_organization", ["organizationId"])
    .index("by_created", ["createdAt"]),

  // Subscriptions
  subscriptions: defineTable({
    userId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    plan: v.union(v.literal("premium"), v.literal("enterprise")),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("pending")
    ),
    monthlyMinutes: v.number(), // 10000 for premium, -1 for unlimited enterprise
    usedMinutes: v.number(),
    price: v.number(),
    currency: v.string(),
    billingCycle: v.union(v.literal("monthly"), v.literal("annual")),
    nextBillingDate: v.number(),
    // Payfast specific fields
    payfastToken: v.optional(v.string()),
    payfastSubscriptionId: v.optional(v.string()),
    payfastStatus: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_payfast_token", ["payfastToken"]),

  // Payment Transactions (Payfast)
  payments: defineTable({
    userId: v.string(),
    subscriptionId: v.optional(v.string()),
    payfastPaymentId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    payfastData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"])
    .index("by_payfast_payment", ["payfastPaymentId"]),

  // Usage Analytics
  usageAnalytics: defineTable({
    userId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    taskId: v.string(),
    action: v.string(),
    minutesUsed: v.number(),
    costsaved: v.optional(v.number()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_task", ["taskId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_organization_and_timestamp", ["organizationId", "timestamp"]),

  // Browser Sessions (for Browserbase integration)
  browserSessions: defineTable({
    userId: v.string(),
    taskId: v.string(),
    sessionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("failed")
    ),
    browserbaseSessionId: v.optional(v.string()),
    createdAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_status", ["status"]),
});
