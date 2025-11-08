import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Sync WorkOS user to Convex database
export const syncWorkOSUser = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    name: v.string(),
    emailVerified: v.optional(v.boolean()),
    organizationId: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", args.workosUserId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        emailVerified: args.emailVerified ?? existing.emailVerified,
        workosOrganizationId: args.organizationId ?? existing.workosOrganizationId,
        company: args.company ?? existing.company,
        lastLoginAt: now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new user profile
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return await ctx.db.insert("profiles", {
        userId,
        workosUserId: args.workosUserId,
        workosOrganizationId: args.organizationId,
        email: args.email,
        name: args.name,
        company: args.company,
        emailVerified: args.emailVerified ?? false,
        subscriptionStatus: "free",
        usageMinutes: 0,
        tasksCompleted: 0,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get user profile by WorkOS user ID
export const getProfileByWorkOSId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", args.workosUserId))
      .first();
  },
});

// Update last login time
export const updateLastLogin = mutation({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", args.workosUserId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update email verification status
export const updateEmailVerification = mutation({
  args: {
    workosUserId: v.string(),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", args.workosUserId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        emailVerified: args.verified,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get user stats (for dashboard)
export const getUserStats = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return null;

    // Get task stats
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const runningTasks = tasks.filter((t) => t.status === "running").length;
    const failedTasks = tasks.filter((t) => t.status === "failed").length;

    // Get usage analytics
    const analytics = await ctx.db
      .query("usageAnalytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalMinutesUsed = analytics.reduce((sum, a) => sum + a.minutesUsed, 0);
    const totalCostSaved = analytics.reduce((sum, a) => sum + (a.costsaved || 0), 0);

    return {
      profile,
      stats: {
        totalTasks: tasks.length,
        completedTasks,
        runningTasks,
        failedTasks,
        totalMinutesUsed,
        totalCostSaved,
      },
    };
  },
});
