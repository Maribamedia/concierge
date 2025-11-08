import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new Stagehand task
export const createTask = mutation({
  args: {
    userId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("research"),
      v.literal("extraction"),
      v.literal("monitoring"),
      v.literal("automation"),
      v.literal("custom")
    ),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      userId: args.userId,
      organizationId: args.organizationId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "pending",
      progress: 0,
      usage: {
        minutesUsed: 0,
        cost: 0,
      },
      createdAt: Date.now(),
    });
    return taskId;
  },
});

// Get user tasks with pagination
export const getUserTasks = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("initializing"),
        v.literal("running"),
        v.literal("extracting"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled"),
        v.literal("timeout")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const tasks = await query.order("desc").take(args.limit || 50);
    return tasks;
  },
});

// Update task with Stagehand-specific fields
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("initializing"),
        v.literal("running"),
        v.literal("extracting"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled"),
        v.literal("timeout")
      )
    ),
    progress: v.optional(v.number()),
    currentStep: v.optional(v.string()),
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
    usage: v.optional(
      v.object({
        minutesUsed: v.number(),
        cost: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    const cleanUpdates: any = {};

    // Only include fields that are defined
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    // Auto-set timestamps
    if (cleanUpdates.status === "running" || cleanUpdates.status === "initializing") {
      const task = await ctx.db.get(taskId);
      if (task && !task.startedAt) {
        cleanUpdates.startedAt = Date.now();
      }
    }

    if (
      cleanUpdates.status === "completed" ||
      cleanUpdates.status === "failed" ||
      cleanUpdates.status === "cancelled" ||
      cleanUpdates.status === "timeout"
    ) {
      cleanUpdates.completedAt = Date.now();
    }

    await ctx.db.patch(taskId, cleanUpdates);
  },
});

// Get task by ID
export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

// Get running tasks count
export const getRunningTasksCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "running"),
          q.eq(q.field("status"), "initializing"),
          q.eq(q.field("status"), "extracting")
        )
      )
      .collect();
    return tasks.length;
  },
});

// Get task statistics for user
export const getTaskStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      running: tasks.filter((t) =>
        ["running", "initializing", "extracting"].includes(t.status)
      ).length,
      failed: tasks.filter((t) => t.status === "failed").length,
      totalMinutesUsed: tasks.reduce((sum, t) => sum + t.usage.minutesUsed, 0),
      totalCost: tasks.reduce((sum, t) => sum + t.usage.cost, 0),
    };

    return stats;
  },
});

// Cancel a running task
export const cancelTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (["completed", "failed", "cancelled"].includes(task.status)) {
      throw new Error("Cannot cancel a task that is already finished");
    }

    await ctx.db.patch(args.taskId, {
      status: "cancelled",
      completedAt: Date.now(),
    });
  },
});

// Delete a task
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
