// src/components/PackagesModal.tsx
// Paketler & Abonelik Karşılaştırma Modalı (Teenage Engineering Hardware UI)
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Check,
  X,
  Sparkles,
  GraduationCap,
  Crown,
  ShieldCheck,
  Camera,
  Receipt,
  Users,
} from 'lucide-react-native';
import { UserSubscription, UserTier, TIER_LIMITS } from '../types/subscription';
import { getRemainingScans } from '../services/entitlements';
import { colors, spacing, radius } from '../theme/theme';

interface PackagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onOpenStudentVerify: () => void;
}

export const PackagesModal: React.FC<PackagesModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onOpenStudentVerify,
}) => {
  const currentTier = subscription.tier;
  const remainingScans = getRemainingScans(subscription);

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>06 // PAKETLER & YETKİLER</Text>
              <Text style={styles.subtitle}>
                Mevcut Plan:{' '}
                <Text style={styles.currentTierText}>
                  {TIER_LIMITS[currentTier].tierName}
                </Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Mevcut Durum Barı */}
            <View style={styles.statusBox}>
              <Text style={styles.statusBoxLabel}>AYLIK AI DOLAP & FİŞ TARAMA HAKKI</Text>
              <Text style={styles.statusBoxVal}>
                {currentTier === 'FREE'
                  ? `${remainingScans} / 5 Hak Kaldı`
                  : 'Sınırsız (Limitsiz AI)'}
              </Text>
            </View>

            {/* 1. ÜCRETSİZ STANDART PAKET */}
            <View style={[styles.packageCard, currentTier === 'FREE' && styles.packageCardActive]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconCircle}>
                  <Sparkles size={20} color="#94A3B8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>STANDART</Text>
                  <Text style={styles.cardPrice}>0 ₺ / Ömür Boyu</Text>
                </View>
                {currentTier === 'FREE' && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>MEVCUT PLAN</Text>
                  </View>
                )}
              </View>

              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.featureText}>20 Malzemeye Kadar Dolap Takibi</Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.featureText}>Ayda 5 AI Kamera Taraması</Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.featureText}>Deterministik Sentetik Şef Reçeteleri</Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.featureText}>Termal Kurtarma Fişi Paylaşımı</Text>
                </View>
              </View>
            </View>

            {/* 2. ÜNİVERSİTE ÖĞRENCİSİ PAKETİ (100% ÜCRETSİZ) */}
            <View style={[styles.packageCard, styles.studentCard, currentTier === 'STUDENT' && styles.packageCardActive]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3B82F6' }]}>
                  <GraduationCap size={20} color="#60A5FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.cardTitle}>ÜNİVERSİTELİ</Text>
                    <View style={styles.freePill}>
                      <Text style={styles.freePillText}>100% ÜCRETSİZ</Text>
                    </View>
                  </View>
                  <Text style={[styles.cardPrice, { color: '#60A5FA' }]}>.edu.tr ile 1 Yıl Sınırsız</Text>
                </View>
                {currentTier === 'STUDENT' && (
                  <View style={[styles.activePill, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' }]}>
                    <Text style={[styles.activePillText, { color: '#60A5FA' }]}>AKTİF PLAN</Text>
                  </View>
                )}
              </View>

              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <Check size={14} color="#60A5FA" />
                  <Text style={[styles.featureText, { color: '#F8FAFC', fontWeight: '700' }]}>
                    SINIRSIZ AI Dolap & Fiş Taraması
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#60A5FA" />
                  <Text style={[styles.featureText, { color: '#F8FAFC', fontWeight: '700' }]}>
                    SINIRSIZ Kiler & Dolap Kapasitesi
                  </Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#60A5FA" />
                  <Text style={styles.featureText}>"Öğrenci Evi Pratik Menüleri" Kilidi Açık</Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#60A5FA" />
                  <Text style={styles.featureText}>Öğrenci Hayatta Kalma & Dürüm Endeksi</Text>
                </View>
              </View>

              {currentTier !== 'STUDENT' && (
                <TouchableOpacity
                  style={styles.studentVerifyBtn}
                  onPress={() => {
                    onClose();
                    onOpenStudentVerify();
                  }}
                  activeOpacity={0.85}
                >
                  <GraduationCap size={16} color="#0A0A0E" />
                  <Text style={styles.studentVerifyBtnText}>.edu.tr ile Ücretsiz Aktif Et 🎓</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 3. PRO PAKET */}
            <View style={[styles.packageCard, currentTier === 'PRO' && styles.packageCardActive]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' }]}>
                  <Crown size={20} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>KALANLA PRO</Text>
                  <Text style={[styles.cardPrice, { color: '#F59E0B' }]}>49.99 ₺ / Ay veya 399 ₺ / Yıl</Text>
                </View>
                {currentTier === 'PRO' && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>AKTİF PLAN</Text>
                  </View>
                )}
              </View>

              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <Check size={14} color="#F59E0B" />
                  <Text style={styles.featureText}>Sınırsız AI Kamera & BİM/A101 Fiş OCR</Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#F59E0B" />
                  <Text style={styles.featureText}>Ortak Aile Dolabı (Çoklu Cihaz Senkronu)</Text>
                </View>
                <View style={styles.featureRow}>
                  <Check size={14} color="#F59E0B" />
                  <Text style={styles.featureText}>Gelişmiş Karbon & Aylık Finansal Telemetri</Text>
                </View>
              </View>

              {currentTier !== 'PRO' && (
                <TouchableOpacity
                  style={styles.proUpgradeBtn}
                  onPress={() => {
                    Alert.alert('Yakında!', 'PRO abonelik ödeme altyapısı çok yakında App Store & Google Play lansmanı ile aktif olacak.');
                  }}
                  activeOpacity={0.85}
                >
                  <Crown size={16} color="#0A0A0E" />
                  <Text style={styles.proUpgradeBtnText}>PRO'ya Yükselt</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#121217',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#1F1F26',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  currentTierText: {
    color: '#10B981',
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: '#1C1C24',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  statusBox: {
    backgroundColor: '#0A0A0E',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#262633',
    marginBottom: spacing.lg,
  },
  statusBoxLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748B',
    fontWeight: '700',
  },
  statusBoxVal: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#10B981',
    fontWeight: '800',
    marginTop: 2,
  },
  packageCard: {
    backgroundColor: '#181820',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#242430',
    marginBottom: spacing.md,
  },
  studentCard: {
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  packageCardActive: {
    borderColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C24',
    borderWidth: 1,
    borderColor: '#2E2E3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  cardPrice: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  freePill: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freePillText: {
    color: '#0A0A0E',
    fontSize: 9,
    fontWeight: '900',
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  activePillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  featureList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#242430',
    paddingTop: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  studentVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#60A5FA',
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: 8,
  },
  studentVerifyBtnText: {
    color: '#0A0A0E',
    fontWeight: '800',
    fontSize: 13,
  },
  proUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: 8,
  },
  proUpgradeBtnText: {
    color: '#0A0A0E',
    fontWeight: '800',
    fontSize: 13,
  },
});
