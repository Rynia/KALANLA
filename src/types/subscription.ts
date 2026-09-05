// src/types/subscription.ts
// KALANLA Paketleme, Yetkilendirme & Öğrenci Doğrulama Modeli

export type UserTier = 'FREE' | 'STUDENT' | 'PRO';

export interface UserSubscription {
  tier: UserTier;
  studentVerified: boolean;
  studentEmail?: string;
  verifiedUntil?: string; // ISO String
  monthlyVisionScansUsed: number;
  lastScanResetDate: string; // YYYY-MM
}

export interface TierEntitlements {
  tierName: string;
  maxInventoryItems: number;
  monthlyVisionScanLimit: number; // Sınırsız için Infinity
  hasStudentDiscountRecipes: boolean;
  hasPriorityAiGeneration: boolean;
  hasExportThermalStory: boolean;
}

export const TIER_LIMITS: Record<UserTier, TierEntitlements> = {
  FREE: {
    tierName: 'Standart (Ücretsiz)',
    maxInventoryItems: 20,
    monthlyVisionScanLimit: 5,
    hasStudentDiscountRecipes: false,
    hasPriorityAiGeneration: false,
    hasExportThermalStory: true,
  },
  STUDENT: {
    tierName: 'Üniversite Öğrencisi (100% Ücretsiz)',
    maxInventoryItems: Infinity,
    monthlyVisionScanLimit: Infinity,
    hasStudentDiscountRecipes: true,
    hasPriorityAiGeneration: true,
    hasExportThermalStory: true,
  },
  PRO: {
    tierName: 'KALANLA PRO',
    maxInventoryItems: Infinity,
    monthlyVisionScanLimit: Infinity,
    hasStudentDiscountRecipes: true,
    hasPriorityAiGeneration: true,
    hasExportThermalStory: true,
  },
};
