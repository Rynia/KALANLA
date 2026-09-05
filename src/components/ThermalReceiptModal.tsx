import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Recipe } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface ThermalReceiptModalProps {
  visible: boolean;
  recipe: Recipe | null;
  savedValue: number;
  totalSavedMonth: number;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  visible,
  recipe,
  savedValue,
  totalSavedMonth,
  onClose,
}) => {
  const receiptRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  if (!recipe) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = async () => {
    try {
      setSharing(true);
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
      }

      // Web platform fallback
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: 'KALANLA Kurtarma Fişi',
            text: `Bugün KALANLA ile ${recipe.title} yaparak ₺${savedValue} kurtardım! 🌿`,
            url: 'https://github.com/Rynia/KALANLA',
          });
        } else {
          Alert.alert(
            'KALANLA Paylaşım',
            `Görsel olarak Instagram/WhatsApp paylaşımı mobil cihazlarda desteklenir.\n\nBugün ${recipe.title} ile ₺${savedValue} kurtardın!`,
          );
        }
        setSharing(false);
        return;
      }

      // Native image capture & share sheet
      if (!receiptRef.current) {
        Alert.alert('Hata', 'Fiş görseli yakalanamadı.');
        return;
      }

      const uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1.0,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'KALANLA Kurtarma Fişini Paylaş',
        });
      } else {
        Alert.alert('Paylaşım Kullanılamıyor', 'Bu cihazda dosya paylaşımı desteklenmiyor.');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Alert.alert('Hata', 'Fiş paylaşılırken bir sorun oluştu.');
    } finally {
      setSharing(false);
    }
  };

  const carbonSaved = (savedValue * 0.045).toFixed(1);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* ONLY the receipt card is inside ViewShot so action buttons are NOT captured */}
          <ViewShot
            ref={receiptRef}
            options={{ format: 'png', quality: 1.0 }}
            style={styles.thermalReceipt}
          >
            <Text style={styles.thermalHeader}>*** KALANLA KURTARMA FİŞİ ***</Text>
            <Text style={styles.thermalSub}>RYNIA STUDIOS // ZERO WASTE KITCHEN OS</Text>
            <Text style={styles.thermalMeta}>
              TARİH: {dateStr}  SAAT: {timeStr}
            </Text>

            <View style={styles.thermalDivider} />

            <View style={styles.row}>
              <Text style={styles.monoLabel}>REÇETE:</Text>
              <Text style={styles.monoValueBold} numberOfLines={2}>
                {recipe.title}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.monoLabel}>PİŞİRME SÜRESİ:</Text>
              <Text style={styles.monoValue}>{recipe.timeMin} Dakika</Text>
            </View>

            <View style={styles.thermalDivider} />

            <Text style={styles.sectionHeader}>KURTARILAN MALZEMELER:</Text>
            {recipe.ingredientsUsed.map((ing, idx) => (
              <View key={idx} style={styles.ingredientRow}>
                <Text style={styles.ingredientItem}>[✓] {ing}</Text>
                <Text style={styles.ingredientStatus}>KURTARILDI</Text>
              </View>
            ))}

            <View style={styles.thermalDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>KURTARILAN DEĞER:</Text>
              <Text style={styles.totalSavingBig}>+₺{savedValue}</Text>
            </View>

            <View style={styles.carbonBox}>
              <Text style={styles.carbonText}>
                🌱 Engellenen Karbon Salınımı: ~{carbonSaved} kg CO₂e
              </Text>
            </View>

            <View style={styles.totalRowSmall}>
              <Text style={styles.totalLabelSmall}>AYLIK TOPLAM BİRİKİM:</Text>
              <Text style={styles.totalValueSmall}>₺{totalSavedMonth}</Text>
            </View>

            <View style={styles.thermalDivider} />

            <Text style={styles.barcode}>||| | |||| || ||| |||| | ||||| |||</Text>
            <Text style={styles.thermalFooter}>"Ne kaldıysa, ondan başla."</Text>
            <Text style={styles.brandUrl}>github.com/Rynia/KALANLA</Text>
          </ViewShot>

          {/* Action buttons are OUTSIDE ViewShot */}
          <View style={styles.receiptActionsRow}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              disabled={sharing}
              activeOpacity={0.85}
            >
              {sharing ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.shareButtonText}>📸 Fişi Paylaş (Story / WhatsApp)</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.thermalCloseBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.thermalCloseText}>Kapat & Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  thermalReceipt: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  thermalHeader: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    color: '#111827',
    marginBottom: 2,
  },
  thermalSub: {
    fontSize: 9,
    textAlign: 'center',
    color: '#4B5563',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: '700',
  },
  thermalMeta: {
    fontSize: 10,
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: spacing.xs,
  },
  thermalDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  monoLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  monoValue: {
    fontSize: 11,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  monoValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    maxWidth: '65%',
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  ingredientItem: {
    fontSize: 11,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  ingredientStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  totalSavingBig: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
  },
  carbonBox: {
    backgroundColor: '#ECFDF5',
    padding: 6,
    borderRadius: radius.sm,
    marginTop: 6,
    alignItems: 'center',
  },
  carbonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  totalRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  totalValueSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  barcode: {
    textAlign: 'center',
    letterSpacing: 3,
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  thermalFooter: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 2,
  },
  brandUrl: {
    fontSize: 9,
    textAlign: 'center',
    color: '#9CA3AF',
    fontWeight: '600',
  },
  receiptActionsRow: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  shareButton: {
    backgroundColor: colors.emerald,
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  shareButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '800',
  },
  thermalCloseBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thermalCloseText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
