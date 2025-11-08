import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or update a payment record
 */
export const createPayment = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if payment already exists
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_payfast_payment", (q) => q.eq("payfastPaymentId", args.payfastPaymentId))
      .first();

    if (existing) {
      // Update existing payment
      await ctx.db.patch(existing._id, {
        status: args.status,
        payfastData: args.payfastData,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new payment
    const paymentId = await ctx.db.insert("payments", {
      userId: args.userId,
      subscriptionId: args.subscriptionId,
      payfastPaymentId: args.payfastPaymentId,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      payfastData: args.payfastData,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

/**
 * Create or update a subscription
 */
export const createOrUpdateSubscription = mutation({
  args: {
    userId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    plan: v.union(v.literal("premium"), v.literal("enterprise")),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("pending")
    ),
    monthlyMinutes: v.optional(v.number()), // -1 for unlimited, otherwise specific number
    price: v.number(),
    currency: v.string(),
    payfastToken: v.optional(v.string()),
    payfastSubscriptionId: v.optional(v.string()),
    payfastStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already has a subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Use provided monthlyMinutes or default based on plan
    const monthlyMinutes = args.monthlyMinutes !== undefined 
      ? args.monthlyMinutes 
      : (args.plan === "premium" ? 10000 : -1); // -1 = unlimited for enterprise
    
    const billingCycle = "monthly";
    const nextBillingDate = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        organizationId: args.organizationId,
        plan: args.plan,
        status: args.status,
        monthlyMinutes,
        price: args.price,
        currency: args.currency,
        payfastToken: args.payfastToken,
        payfastSubscriptionId: args.payfastSubscriptionId,
        payfastStatus: args.payfastStatus,
        nextBillingDate,
        updatedAt: now,
      });

      // Update profile subscription status
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, {
          subscriptionStatus: args.plan,
          updatedAt: now,
        });
      }

      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      organizationId: args.organizationId,
      plan: args.plan,
      status: args.status,
      monthlyMinutes,
      usedMinutes: 0,
      price: args.price,
      currency: args.currency,
      billingCycle,
      nextBillingDate,
      payfastToken: args.payfastToken,
      payfastSubscriptionId: args.payfastSubscriptionId,
      payfastStatus: args.payfastStatus,
      createdAt: now,
      updatedAt: now,
    });

    // Update profile subscription status
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        subscriptionStatus: args.plan,
        updatedAt: now,
      });
    }

    return subscriptionId;
  },
});

/**
 * Get user's active subscription
 */
export const getUserSubscription = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return subscription;
  },
});

/**
 * Get user's payment history
 */
export const getUserPayments = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return payments;
  },
});

/**
 * Get user's usage statistics
 */
export const getUserUsageStats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!subscription) {
      return {
        usedMinutes: 0,
        totalMinutes: 0,
        tasksCompleted: 0,
        totalSpent: 0,
      };
    }

    // Get all completed payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "complete"))
      .collect();

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get tasks completed
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const tasksCompleted = profile?.tasksCompleted || 0;

    return {
      usedMinutes: subscription.usedMinutes,
      totalMinutes: subscription.monthlyMinutes,
      tasksCompleted,
      totalSpent,
    };
  },
});

/**
 * Cancel subscription
 */
export const cancelSubscription = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const now = Date.now();

    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      updatedAt: now,
    });

    // Update profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        subscriptionStatus: "free",
        updatedAt: now,
      });
    }

    return subscription._id;
  },
});
