import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Id } from "./_generated/dataModel";

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    domain: v.string(),
    ownerId: v.string(),
    subscriptionTier: v.union(v.literal("premium"), v.literal("enterprise")),
    billingEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if slug already exists
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingOrg) {
      throw new Error("Organization slug already exists");
    }

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      domain: args.domain,
      ownerId: args.ownerId,
      subscriptionTier: args.subscriptionTier,
      billingEmail: args.billingEmail,
      settings: {
        whiteLabel: args.subscriptionTier === "enterprise",
        maxUsers: args.subscriptionTier === "enterprise" ? -1 : 10,
      },
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Add owner as member with full permissions
    await ctx.db.insert("organizationMembers", {
      organizationId,
      userId: args.ownerId,
      role: "owner",
      permissions: [
        "organization.manage",
        "members.manage",
        "billing.manage",
        "tasks.create",
        "tasks.view",
        "tasks.manage",
        "analytics.view",
        "whitelabel.manage",
      ],
      joinedAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Create enterprise features if enterprise tier
    if (args.subscriptionTier === "enterprise") {
      await ctx.db.insert("enterpriseFeatures", {
        organizationId,
        features: {
          unlimitedUsage: true,
          customBranding: true,
          advancedAnalytics: true,
          dedicatedSupport: true,
          apiAccess: true,
          ssoIntegration: false,
          customIntegrations: false,
          priorityProcessing: true,
        },
        limits: {
          maxTeamMembers: -1, // Unlimited
          maxConcurrentTasks: 50,
          dataRetentionDays: 365,
        },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Create default whitelabel settings
      await ctx.db.insert("whitelabelSettings", {
        organizationId,
        branding: {
          companyName: args.name,
        },
        customization: {
          hidePoweredBy: false,
        },
        isActive: false, // Needs to be configured
        createdAt: now,
        updatedAt: now,
      });
    }

    return { organizationId };
  },
});

// Get organization by ID
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    return organization;
  },
});

// Get organization by slug
export const getOrganizationBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return organization;
  },
});

// Get user's organizations
export const getUserOrganizations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all memberships
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Fetch organization details
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          memberRole: membership.role,
          memberPermissions: membership.permissions,
        };
      })
    );

    return organizations.filter((org) => org !== null);
  },
});

// Update organization
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    domain: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    settings: v.optional(
      v.object({
        whiteLabel: v.optional(v.boolean()),
        customDomain: v.optional(v.string()),
        maxUsers: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...updates } = args;

    await ctx.db.patch(organizationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get organization subscription details
export const getOrganizationSubscription = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return subscription;
  },
});

// Get organization analytics summary
export const getOrganizationAnalyticsSummary = query({
  args: {
    organizationId: v.id("organizations"),
    timeRange: v.optional(v.number()), // Days to look back
  },
  handler: async (ctx, args) => {
    const timeRange = args.timeRange || 30; // Default 30 days
    const startTime = Date.now() - timeRange * 24 * 60 * 60 * 1000;

    // Get all members count
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get tasks in time range
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();

    // Get usage analytics
    const usageRecords = await ctx.db
      .query("usageAnalytics")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    const totalMinutesUsed = usageRecords.reduce(
      (sum, record) => sum + record.minutesUsed,
      0
    );
    const totalCostSaved = usageRecords.reduce(
      (sum, record) => sum + (record.costsaved || 0),
      0
    );

    // Calculate task completion rate
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completionRate =
      tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return {
      totalMembers: members.length,
      totalTasks: tasks.length,
      completedTasks,
      failedTasks: tasks.filter((t) => t.status === "failed").length,
      completionRate: Math.round(completionRate),
      totalMinutesUsed: Math.round(totalMinutesUsed),
      totalCostSaved: Math.round(totalCostSaved),
      avgMinutesPerTask:
        tasks.length > 0 ? Math.round(totalMinutesUsed / tasks.length) : 0,
    };
  },
});

// Delete organization (soft delete by changing status)
export const deleteOrganization = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.organizationId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Cancel subscription if exists
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
