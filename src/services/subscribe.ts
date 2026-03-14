// PHASE 2 SERVICE -- Not active in MVP
// Subscription management for publisher-subscriber relationships
// This file defines the interface. Database operations require Phase 2 tables.

import type { Visibility } from '../shared/enums.js';

export interface SubscriptionRequest {
  subscriberOrgId: string;
  publisherOrgId: string;
  tier: Visibility;
}

export interface SubscriptionResult {
  id: string;
  subscriberOrgId: string;
  publisherOrgId: string;
  tier: Visibility;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: Date;
  expiresAt: Date | null;
}

// Visibility filtering logic
// Determines which claims a subscriber can see based on their subscription tier

export function canAccessClaim(
  claimVisibility: Visibility | null,
  fileVisibility: Visibility,
  subscriberTier: Visibility | null // null = anonymous/free browser
): boolean {
  const effectiveVisibility = claimVisibility || fileVisibility;

  // Free claims are visible to everyone
  if (effectiveVisibility === 'free') return true;

  // No subscription = free access only
  if (!subscriberTier) return false;

  // Paid claims visible to paid and premium subscribers
  if (effectiveVisibility === 'paid') {
    return subscriberTier === 'paid' || subscriberTier === 'premium';
  }

  // Premium claims visible to premium subscribers only
  if (effectiveVisibility === 'premium') {
    return subscriberTier === 'premium';
  }

  return false;
}
