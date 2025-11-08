import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Id } from "./_generated/dataModel";

// Invite member to organization
export const inviteMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member")
    ),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if member already exists
    const existingMember = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (existingMember) {
      throw new Error("User is already a member of this organization");
    }

    // Get organization to check limits
    const org = await ctx.db.get(args.organizationId);
    if (!org) {
      throw new Error("Organization not found");
    }

    // Check member limits (if not enterprise unlimited)
    const currentMembers = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const maxUsers = org.settings.maxUsers || 10;
    if (maxUsers !== -1 && currentMembers.length >= maxUsers) {
      throw new Error("Organization member limit reached");
    }

    // Define permissions based on role
    const permissions = getPermissionsByRole(args.role);

    // Create invitation
    const memberId = await ctx.db.insert("organizationMembers", {
      organizationId: args.organizationId,
      userId: args.userId,
      role: args.role,
      permissions,
      invitedBy: args.invitedBy,
      invitedAt: now,
      joinedAt: now,
      status: "invited",
      createdAt: now,
      updatedAt: now,
    });

    return { memberId };
  },
});

// Accept invitation (activate membership)
export const acceptInvitation = mutation({
  args: {
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      status: "active",
      joinedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get organization members
export const getOrganizationMembers = query({
  args: {
    organizationId: v.id("organizations"),
    status: v.optional(
      v.union(v.literal("active"), v.literal("invited"), v.literal("suspended"))
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      );

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const members = await query.collect();

    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .first();

        return {
          ...member,
          userEmail: profile?.email,
          userName: profile?.name,
        };
      })
    );

    return membersWithDetails;
  },
});

// Get member by user ID and organization
export const getMemberByUser = query({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    return member;
  },
});

// Update member role and permissions
export const updateMemberRole = mutation({
  args: {
    memberId: v.id("organizationMembers"),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    const permissions = getPermissionsByRole(args.role);

    await ctx.db.patch(args.memberId, {
      role: args.role,
      permissions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update member custom permissions
export const updateMemberPermissions = mutation({
  args: {
    memberId: v.id("organizationMembers"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      permissions: args.permissions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove member from organization
export const removeMember = mutation({
  args: {
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);

    if (!member) {
      throw new Error("Member not found");
    }

    if (member.role === "owner") {
      throw new Error("Cannot remove organization owner");
    }

    await ctx.db.delete(args.memberId);

    return { success: true };
  },
});

// Suspend member
export const suspendMember = mutation({
  args: {
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);

    if (!member) {
      throw new Error("Member not found");
    }

    if (member.role === "owner") {
      throw new Error("Cannot suspend organization owner");
    }

    await ctx.db.patch(args.memberId, {
      status: "suspended",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reactivate suspended member
export const reactivateMember = mutation({
  args: {
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Check if user has permission
export const checkPermission = query({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!member) {
      return false;
    }

    // Owner has all permissions
    if (member.role === "owner") {
      return true;
    }

    return member.permissions.includes(args.permission);
  },
});

// Helper function to define permissions by role
function getPermissionsByRole(
  role: "admin" | "manager" | "member"
): string[] {
  switch (role) {
    case "admin":
      return [
        "organization.view",
        "organization.manage",
        "members.view",
        "members.manage",
        "billing.view",
        "billing.manage",
        "tasks.create",
        "tasks.view",
        "tasks.manage",
        "analytics.view",
        "whitelabel.view",
        "whitelabel.manage",
      ];
    case "manager":
      return [
        "organization.view",
        "members.view",
        "billing.view",
        "tasks.create",
        "tasks.view",
        "tasks.manage",
        "analytics.view",
        "whitelabel.view",
      ];
    case "member":
      return [
        "organization.view",
        "tasks.create",
        "tasks.view",
        "analytics.view",
      ];
    default:
      return ["organization.view", "tasks.view"];
  }
}

// Get organization member stats
export const getOrganizationMemberStats = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    const activeMembers = members.filter((m) => m.status === "active").length;
    const invitedMembers = members.filter((m) => m.status === "invited").length;
    const suspendedMembers = members.filter(
      (m) => m.status === "suspended"
    ).length;

    const roleBreakdown = {
      owner: members.filter((m) => m.role === "owner").length,
      admin: members.filter((m) => m.role === "admin").length,
      manager: members.filter((m) => m.role === "manager").length,
      member: members.filter((m) => m.role === "member").length,
    };

    return {
      total: members.length,
      active: activeMembers,
      invited: invitedMembers,
      suspended: suspendedMembers,
      roleBreakdown,
    };
  },
});
