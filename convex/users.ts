import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user profile
export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        company: args.company,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("profiles", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        company: args.company,
        subscriptionStatus: "free",
        usageMinutes: 0,
        tasksCompleted: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get user profile
export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Update subscription status
export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("enterprise")
    ),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        subscriptionStatus: args.subscriptionStatus,
        updatedAt: Date.now(),
      });
    }
  },
});

// Track usage
export const trackUsage = mutation({
  args: {
    userId: v.string(),
    taskId: v.string(),
    minutesUsed: v.number(),
  },
  handler: async (ctx, args) => {
    // Update profile usage
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        usageMinutes: profile.usageMinutes + args.minutesUsed,
        updatedAt: Date.now(),
      });
    }

    // Create analytics record
    await ctx.db.insert("usageAnalytics", {
      userId: args.userId,
      taskId: args.taskId,
      action: "task_execution",
      minutesUsed: args.minutesUsed,
      timestamp: Date.now(),
    });
  },
});

// Get usage analytics
export const getUsageAnalytics = query({
  args: {
    userId: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let analyticsQuery = ctx.db
      .query("usageAnalytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.startTime && args.endTime) {
      analyticsQuery = analyticsQuery.filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTime!),
          q.lte(q.field("timestamp"), args.endTime!)
        )
      );
    }

    return await analyticsQuery.order("desc").take(100);
  },
});
