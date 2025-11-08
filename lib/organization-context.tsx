'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface Organization {
  _id?: Id<"organizations">;
  name?: string;
  slug?: string;
  domain?: string;
  subscriptionTier?: 'premium' | 'enterprise';
  status?: 'active' | 'suspended' | 'cancelled';
  memberRole?: 'owner' | 'admin' | 'manager' | 'member';
  memberPermissions?: string[];
}

interface OrganizationContextType {
  selectedOrgId: Id<"organizations"> | null;
  setSelectedOrgId: (orgId: Id<"organizations"> | null) => void;
  organizations: Organization[] | undefined;
  currentOrganization: Organization | undefined;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId?: string;
}) {
  const [selectedOrgId, setSelectedOrgId] = useState<Id<"organizations"> | null>(null);

  // For demo purposes, use a mock userId if none provided
  // In production, this would come from WorkOS authentication
  const effectiveUserId = userId || (typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null);

  // Fetch user's organizations
  const organizations = useQuery(
    api.organizations.getUserOrganizations,
    effectiveUserId ? { userId: effectiveUserId } : 'skip'
  );

  const isLoading = organizations === undefined && effectiveUserId !== null;

  // Auto-select first organization if none selected
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId && organizations[0]?._id) {
      setSelectedOrgId(organizations[0]._id);
    }
  }, [organizations, selectedOrgId]);

  // Get current organization
  const currentOrganization = organizations?.find(org => org._id && org._id === selectedOrgId);

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!currentOrganization) return false;
    
    // Owner has all permissions
    if (currentOrganization.memberRole === 'owner') return true;
    
    // Check if permission is in user's permission list
    return currentOrganization.memberPermissions?.includes(permission) || false;
  };

  const value: OrganizationContextType = {
    selectedOrgId,
    setSelectedOrgId,
    organizations,
    currentOrganization,
    isLoading,
    hasPermission,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
