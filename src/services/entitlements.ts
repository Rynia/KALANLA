// src/services/entitlements.ts
// Kullanıcı yetkilendirme ve .edu.tr Öğrenci Doğrulama Servisi
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription, UserTier, TIER_LIMITS, TierEntitlements } from '../types/subscription';

const SUB_STORAGE_KEY = '@kalanla/user_subscription_v1';

export const INITIAL_SUBSCRIPTION: UserSubscription = {
  tier: 'FREE',
  studentVerified: false,
  monthlyVisionScansUsed: 0,
  lastScanResetDate: new Date().toISOString().slice(0, 7), // YYYY-MM
};

export async function loadSubscription(): Promise<UserSubscription> {
  try {
    const raw = await AsyncStorage.getItem(SUB_STORAGE_KEY);
    if (!raw) return INITIAL_SUBSCRIPTION;
    const sub: UserSubscription = JSON.parse(raw);

    // Ay değiştiğinde sayaç sıfırlama kontrolü
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (sub.lastScanResetDate !== currentMonth) {
      sub.monthlyVisionScansUsed = 0;
      sub.lastScanResetDate = currentMonth;
      await saveSubscription(sub);
    }
    return sub;
  } catch {
    return INITIAL_SUBSCRIPTION;
  }
}

export async function saveSubscription(sub: UserSubscription): Promise<void> {
  try {
    await AsyncStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(sub));
  } catch (e) {
    console.warn('[KALANLA] Subscription save error:', e);
  }
}

/**
 * Üniversite Öğrencisi Doğrulaması (.edu.tr E-Posta)
 */
export async function verifyStudentEmail(email: string): Promise<{ success: boolean; message: string }> {
  const clean = email.trim().toLowerCase();
  
  // .edu.tr veya üniversite domain kontrolü
  const isEdu = clean.endsWith('.edu.tr') || clean.includes('.edu.');
  if (!isEdu) {
    return {
      success: false,
      message: 'Lütfen geçerli bir üniversite e-posta adresi girin (örn: ogrenci@itu.edu.tr).',
    };
  }

  // Başarılı doğrulama (1 Yıllık Öğrenci Paketi hediye edilir)
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const updatedSub: UserSubscription = {
    tier: 'STUDENT',
    studentVerified: true,
    studentEmail: clean,
    verifiedUntil: oneYearLater.toISOString(),
    monthlyVisionScansUsed: 0,
    lastScanResetDate: new Date().toISOString().slice(0, 7),
  };

  await saveSubscription(updatedSub);

  return {
    success: true,
    message: 'Tebrikler! Üniversite Öğrencisi Paketiniz tanımlandı. Sınırsız AI Kamera ve dolap kapasitesi aktif!',
  };
}

export function canPerformVisionScan(sub: UserSubscription): boolean {
  const limits = TIER_LIMITS[sub.tier];
  if (limits.monthlyVisionScanLimit === Infinity) return true;
  return sub.monthlyVisionScansUsed < limits.monthlyVisionScanLimit;
}

export function getRemainingScans(sub: UserSubscription): number {
  const limits = TIER_LIMITS[sub.tier];
  if (limits.monthlyVisionScanLimit === Infinity) return 9999;
  return Math.max(0, limits.monthlyVisionScanLimit - sub.monthlyVisionScansUsed);
}

export async function incrementVisionScanUsage(sub: UserSubscription): Promise<UserSubscription> {
  const updated: UserSubscription = {
    ...sub,
    monthlyVisionScansUsed: sub.monthlyVisionScansUsed + 1,
  };
  await saveSubscription(updated);
  return updated;
}
