import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Alert, Platform, Linking } from 'react-native';
import { ShieldAlert, Trash2, AlertTriangle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COPY } from '../constants/copy';
import { colors, spacing, radius } from '../theme/theme';

interface LegalFooterProps {
  onResetData: () => void;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({ onResetData }) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleConfirmReset = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
    }
    setShowConfirmModal(false);
    onResetData();
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.noticeHeader}>
        <ShieldAlert size={14} color={colors.terracotta} />
        <Text style={styles.noticeHeaderText}>Güvenlik & Hatırlatma Bildirimi</Text>
      </View>

      <Text style={styles.noticeBody}>
        {COPY.notices.foodSafety}
      </Text>

      <TouchableOpacity
        style={styles.supportButton}
        onPress={async () => {
          const playStoreUrl = 'market://details?id=com.rynia.kalanla';
          const webPlayStoreUrl = 'https://play.google.com/store/apps/details?id=com.rynia.kalanla';
          try {
            const supported = await Linking.canOpenURL(playStoreUrl);
            if (supported) {
              await Linking.openURL(playStoreUrl);
            } else {
              await Linking.openURL(webPlayStoreUrl);
            }
          } catch {
            await Linking.openURL(webPlayStoreUrl);
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.supportButtonText}>⭐ KALANLA'yı Değerlendir</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => setShowConfirmModal(true)}
        activeOpacity={0.7}
      >
        <Trash2 size={13} color={colors.risk} />
        <Text style={styles.resetButtonText}>{COPY.actions.reset}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.privacyButton}
        onPress={() => Linking.openURL('https://ryniastudios.netlify.app/privacy.html')}
        activeOpacity={0.7}
      >
        <Text style={styles.privacyButtonText}>Gizlilik Politikası (Privacy Policy) ↗</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>
        KALANLA v1.0 • Rynia Studios • Yerel Veri Modeli
      </Text>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.alertIconBox}>
                <AlertTriangle size={20} color={colors.risk} />
              </View>
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.faint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{COPY.notices.resetConfirmTitle}</Text>
            <Text style={styles.modalDesc}>{COPY.notices.resetConfirmDesc}</Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmReset}
              >
                <Text style={styles.deleteConfirmBtnText}>Her Şeyi Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  noticeHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.faint,
  },
  noticeBody: {
    fontSize: 11,
    color: colors.faint,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 320,
  },
  supportButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  supportButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.risk,
    textDecorationLine: 'underline',
  },
  privacyButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  privacyButtonText: {
    fontSize: 11,
    color: colors.faint,
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 10,
    color: colors.faint,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.riskSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.risk,
    alignItems: 'center',
  },
  deleteConfirmBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

