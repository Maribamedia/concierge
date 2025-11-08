import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get comprehensive organization analytics
export const getOrganizationAnalytics = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all tasks in date range
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      )
      .collect();

    // Get usage analytics
    const usageRecords = await ctx.db
      .query("usageAnalytics")
      .withIndex("by_organization_and_timestamp", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .gte("timestamp", args.startDate)
      )
      .filter((q) => q.lte(q.field("timestamp"), args.endDate))
      .collect();

    // Calculate task metrics
    const tasksByStatus = {
      completed: tasks.filter((t) => t.status === "completed").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      running: tasks.filter((t) => t.status === "running").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      cancelled: tasks.filter((t) => t.status === "cancelled").length,
    };

    const tasksByType = {
      research: tasks.filter((t) => t.type === "research").length,
      extraction: tasks.filter((t) => t.type === "extraction").length,
      monitoring: tasks.filter((t) => t.type === "monitoring").length,
      automation: tasks.filter((t) => t.type === "automation").length,
      custom: tasks.filter((t) => t.type === "custom").length,
    };

    // Calculate usage metrics
    const totalMinutesUsed = usageRecords.reduce(
      (sum, record) => sum + record.minutesUsed,
      0
    );
    const totalCostSaved = usageRecords.reduce(
      (sum, record) => sum + (record.costsaved || 0),
      0
    );

    // Calculate average execution time for completed tasks
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const avgExecutionTime =
      completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => {
            const execTime = t.result?.executionTime || 0;
            return sum + execTime;
          }, 0) / completedTasks.length
        : 0;

    // Get daily breakdown
    const dailyStats = getDailyBreakdown(
      tasks,
      usageRecords,
      args.startDate,
      args.endDate
    );

    return {
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasksByStatus.completed,
        failedTasks: tasksByStatus.failed,
        completionRate:
          tasks.length > 0
            ? Math.round((tasksByStatus.completed / tasks.length) * 100)
            : 0,
        totalMinutesUsed: Math.round(totalMinutesUsed),
        totalCostSaved: Math.round(totalCostSaved),
        avgExecutionTime: Math.round(avgExecutionTime),
        roi: totalCostSaved > 0 ? Math.round(totalCostSaved / 25000) : 0, // Assuming R25,000 monthly cost
      },
      tasksByStatus,
      tasksByType,
      dailyStats,
    };
  },
});

// Get team member performance analytics
export const getTeamPerformance = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all active members
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get performance for each member
    const memberPerformance = await Promise.all(
      members.map(async (member) => {
        // Get member's tasks
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .filter((q) =>
            q.and(
              q.gte(q.field("createdAt"), args.startDate),
              q.lte(q.field("createdAt"), args.endDate)
            )
          )
          .collect();

        // Get member's usage
        const usageRecords = await ctx.db
          .query("usageAnalytics")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .filter((q) =>
            q.and(
              q.gte(q.field("timestamp"), args.startDate),
              q.lte(q.field("timestamp"), args.endDate)
            )
          )
          .collect();

        const completedTasks = tasks.filter(
          (t) => t.status === "completed"
        ).length;
        const minutesUsed = usageRecords.reduce(
          (sum, r) => sum + r.minutesUsed,
          0
        );
        const costSaved = usageRecords.reduce(
          (sum, r) => sum + (r.costsaved || 0),
          0
        );

        // Get user profile
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .first();

        return {
          userId: member.userId,
          userName: profile?.name || "Unknown",
          userEmail: profile?.email || "",
          role: member.role,
          totalTasks: tasks.length,
          completedTasks,
          minutesUsed: Math.round(minutesUsed),
          costSaved: Math.round(costSaved),
          completionRate:
            tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        };
      })
    );

    // Sort by cost saved descending
    memberPerformance.sort((a, b) => b.costSaved - a.costSaved);

    return memberPerformance;
  },
});

// Get usage trends over time
export const getUsageTrends = query({
  args: {
    organizationId: v.id("organizations"),
    days: v.number(), // Number of days to look back
  },
  handler: async (ctx, args) => {
    const endDate = Date.now();
    const startDate = endDate - args.days * 24 * 60 * 60 * 1000;

    // Get all usage records
    const usageRecords = await ctx.db
      .query("usageAnalytics")
      .withIndex("by_organization_and_timestamp", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .gte("timestamp", startDate)
      )
      .collect();

    // Group by day
    const dailyUsage: { [date: string]: { minutes: number; cost: number; tasks: number } } = {};

    usageRecords.forEach((record) => {
      const date = new Date(record.timestamp).toISOString().split("T")[0];
      if (!dailyUsage[date]) {
        dailyUsage[date] = { minutes: 0, cost: 0, tasks: 0 };
      }
      dailyUsage[date].minutes += record.minutesUsed;
      dailyUsage[date].cost += record.costsaved || 0;
      dailyUsage[date].tasks += 1;
    });

    // Convert to array and sort by date
    const trends = Object.entries(dailyUsage)
      .map(([date, data]) => ({
        date,
        minutes: Math.round(data.minutes),
        cost: Math.round(data.cost),
        tasks: data.tasks,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  },
});

// Get cost savings by task type
export const getCostSavingsByType = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate)
        )
      )
      .collect();

    // Get usage for each task
    const savingsByType: { [type: string]: number } = {
      research: 0,
      extraction: 0,
      monitoring: 0,
      automation: 0,
      custom: 0,
    };

    await Promise.all(
      tasks.map(async (task) => {
        const usageRecords = await ctx.db
          .query("usageAnalytics")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        const costSaved = usageRecords.reduce(
          (sum, r) => sum + (r.costsaved || 0),
          0
        );

        savingsByType[task.type] += costSaved;
      })
    );

    return Object.entries(savingsByType).map(([type, savings]) => ({
      type,
      savings: Math.round(savings),
    }));
  },
});

// Get real-time organization dashboard data
export const getDashboardData = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const last30Days = now - 30 * 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    // Get active subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    // Get team size
    const activeMembers = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get tasks (last 30 days)
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.gte(q.field("createdAt"), last30Days))
      .collect();

    // Get running tasks
    const runningTasks = tasks.filter((t) => t.status === "running").length;

    // Get usage (last 7 days for quick view)
    const recentUsage = await ctx.db
      .query("usageAnalytics")
      .withIndex("by_organization_and_timestamp", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .gte("timestamp", last7Days)
      )
      .collect();

    const last7DaysMinutes = recentUsage.reduce(
      (sum, r) => sum + r.minutesUsed,
      0
    );
    const last7DaysSavings = recentUsage.reduce(
      (sum, r) => sum + (r.costsaved || 0),
      0
    );

    return {
      subscription: {
        plan: subscription?.plan || "none",
        status: subscription?.status || "none",
        monthlyMinutes: subscription?.monthlyMinutes || 0,
        usedMinutes: subscription?.usedMinutes || 0,
        nextBillingDate: subscription?.nextBillingDate,
      },
      team: {
        totalMembers: activeMembers.length,
      },
      tasks: {
        total: tasks.length,
        running: runningTasks,
        completed: tasks.filter((t) => t.status === "completed").length,
        failed: tasks.filter((t) => t.status === "failed").length,
      },
      usage: {
        last7DaysMinutes: Math.round(last7DaysMinutes),
        last7DaysSavings: Math.round(last7DaysSavings),
      },
    };
  },
});

// Helper function to get daily breakdown
function getDailyBreakdown(
  tasks: any[],
  usageRecords: any[],
  startDate: number,
  endDate: number
): any[] {
  const dailyData: { [date: string]: { tasks: number; minutes: number; cost: number } } = {};

  // Initialize all dates in range
  const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate + i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    dailyData[date] = { tasks: 0, minutes: 0, cost: 0 };
  }

  // Add task data
  tasks.forEach((task) => {
    const date = new Date(task.createdAt).toISOString().split("T")[0];
    if (dailyData[date]) {
      dailyData[date].tasks += 1;
    }
  });

  // Add usage data
  usageRecords.forEach((record) => {
    const date = new Date(record.timestamp).toISOString().split("T")[0];
    if (dailyData[date]) {
      dailyData[date].minutes += record.minutesUsed;
      dailyData[date].cost += record.costsaved || 0;
    }
  });

  // Convert to array
  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      tasks: data.tasks,
      minutes: Math.round(data.minutes),
      cost: Math.round(data.cost),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
