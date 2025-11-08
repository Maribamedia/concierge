// Utility to sync WorkOS users to Convex database
// This will be used after successful authentication

import { WorkOS } from '@workos-inc/node';

interface UserProfile {
  workosUserId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  organizationId?: string;
  company?: string;
}

/**
 * Sync WorkOS user to Convex database
 * 
 * NOTE: This requires Convex to be deployed and configured.
 * To set up Convex:
 * 1. Run: npx convex dev
 * 2. Deploy: npx convex deploy --prod
 * 3. Set NEXT_PUBLIC_CONVEX_URL in environment variables
 * 
 * For now, this function prepares the data but doesn't sync until Convex is configured.
 */
export async function syncUserToConvex(user: UserProfile): Promise<void> {
  // Check if Convex is configured
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.log('[Convex] Not configured yet. User data prepared for sync:', {
      workosUserId: user.workosUserId,
      email: user.email,
      name: user.name,
    });
    
    // TODO: When Convex is deployed, uncomment and configure:
    /*
    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.auth.syncWorkOSUser, {
      workosUserId: user.workosUserId,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      organizationId: user.organizationId,
      company: user.company,
    });
    */
    
    return;
  }

  try {
    // When Convex is configured, sync the user
    // Import ConvexHttpClient and use it here
    console.log('[Convex] Syncing user to database:', user.email);
    
    // TODO: Implement actual Convex sync when deployed
    
  } catch (error) {
    console.error('[Convex] Failed to sync user:', error);
    // Don't throw - authentication should succeed even if Convex sync fails
  }
}

/**
 * Update last login timestamp in Convex
 */
export async function updateLastLogin(workosUserId: string): Promise<void> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.log('[Convex] Not configured. Last login not tracked:', workosUserId);
    return;
  }

  try {
    // TODO: Implement Convex mutation call
    console.log('[Convex] Updating last login for:', workosUserId);
  } catch (error) {
    console.error('[Convex] Failed to update last login:', error);
  }
}
