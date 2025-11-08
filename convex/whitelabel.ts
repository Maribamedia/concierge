import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Id } from "./_generated/dataModel";

// Get whitelabel settings for an organization
export const getWhitelabelSettings = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    return settings;
  },
});

// Update whitelabel branding
export const updateBranding = mutation({
  args: {
    organizationId: v.id("organizations"),
    companyName: v.string(),
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...brandingData } = args;

    // Get existing settings
    const existingSettings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .first();

    if (!existingSettings) {
      throw new Error("Whitelabel settings not found");
    }

    // Update branding
    await ctx.db.patch(existingSettings._id, {
      branding: {
        ...existingSettings.branding,
        ...brandingData,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update whitelabel customization
export const updateCustomization = mutation({
  args: {
    organizationId: v.id("organizations"),
    customDomain: v.optional(v.string()),
    customCss: v.optional(v.string()),
    hidePoweredBy: v.optional(v.boolean()),
    customEmailTemplates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...customizationData } = args;

    // Get existing settings
    const existingSettings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .first();

    if (!existingSettings) {
      throw new Error("Whitelabel settings not found");
    }

    // Update customization
    await ctx.db.patch(existingSettings._id, {
      customization: {
        ...existingSettings.customization,
        ...customizationData,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update SEO settings
export const updateSEO = mutation({
  args: {
    organizationId: v.id("organizations"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...seoData } = args;

    // Get existing settings
    const existingSettings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .first();

    if (!existingSettings) {
      throw new Error("Whitelabel settings not found");
    }

    // Update SEO
    await ctx.db.patch(existingSettings._id, {
      seo: {
        ...existingSettings.seo,
        ...seoData,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Activate whitelabel
export const activateWhitelabel = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Check if organization has enterprise tier
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.subscriptionTier !== "enterprise") {
      throw new Error("Whitelabel is only available for enterprise tier");
    }

    // Get settings
    const settings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    if (!settings) {
      throw new Error("Whitelabel settings not found");
    }

    await ctx.db.patch(settings._id, {
      isActive: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Deactivate whitelabel
export const deactivateWhitelabel = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    if (!settings) {
      throw new Error("Whitelabel settings not found");
    }

    await ctx.db.patch(settings._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get whitelabel settings by custom domain
export const getWhitelabelByDomain = query({
  args: { domain: v.string() },
  handler: async (ctx, args) => {
    // First find the custom domain entry
    const customDomain = await ctx.db
      .query("customDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!customDomain) {
      return null;
    }

    // Get whitelabel settings for this organization
    const settings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", customDomain.organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!settings) {
      return null;
    }

    // Get organization details
    const organization = await ctx.db.get(customDomain.organizationId);

    return {
      settings,
      organization,
    };
  },
});

// Create or update custom domain
export const upsertCustomDomain = mutation({
  args: {
    organizationId: v.id("organizations"),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if organization has enterprise tier
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.subscriptionTier !== "enterprise") {
      throw new Error("Custom domains are only available for enterprise tier");
    }

    // Check if domain already exists for another organization
    const existingDomain = await ctx.db
      .query("customDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();

    if (existingDomain && existingDomain.organizationId !== args.organizationId) {
      throw new Error("Domain is already in use by another organization");
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    if (existingDomain) {
      // Update existing
      await ctx.db.patch(existingDomain._id, {
        status: "pending",
        dnsVerified: false,
        sslConfigured: false,
        verificationToken,
        updatedAt: now,
      });
      return { domainId: existingDomain._id, verificationToken };
    } else {
      // Create new
      const domainId = await ctx.db.insert("customDomains", {
        organizationId: args.organizationId,
        domain: args.domain,
        status: "pending",
        dnsVerified: false,
        sslConfigured: false,
        verificationToken,
        createdAt: now,
        updatedAt: now,
      });
      return { domainId, verificationToken };
    }
  },
});

// Verify custom domain DNS
export const verifyDomainDNS = mutation({
  args: {
    domainId: v.id("customDomains"),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    if (!domain) {
      throw new Error("Domain not found");
    }

    // In production, this would actually check DNS records
    // For now, we'll simulate verification
    const dnsVerified = true; // This would be actual DNS check

    await ctx.db.patch(args.domainId, {
      dnsVerified,
      status: dnsVerified ? "active" : "failed",
      sslConfigured: dnsVerified, // Simulate SSL auto-config
      lastCheckedAt: Date.now(),
      activatedAt: dnsVerified ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    return { dnsVerified, status: dnsVerified ? "active" : "failed" };
  },
});

// Get custom domains for organization
export const getCustomDomains = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const domains = await ctx.db
      .query("customDomains")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    return domains;
  },
});

// Delete custom domain
export const deleteCustomDomain = mutation({
  args: { domainId: v.id("customDomains") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.domainId);
    return { success: true };
  },
});

// Helper function to generate verification token
function generateVerificationToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Preview whitelabel configuration
export const previewWhitelabel = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("whitelabelSettings")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .first();

    const organization = await ctx.db.get(args.organizationId);

    return {
      settings,
      organization,
      previewUrl: `https://${organization?.domain || "preview"}.concierge.ai`,
    };
  },
});
