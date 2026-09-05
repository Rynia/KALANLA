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
import { Share2, X, Check } from 'lucide-react-native';
import { ThermalReceiptData } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface ThermalReceiptModalProps {
  receipt: ThermalReceiptData | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const receiptRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);

  if (!receipt) return null;

  const handleShare = async () => {
    try {
      setSharing(true);
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
      }

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: `KALANLA Kurtarma Fişi ₺${receipt.totalSavedTL}`,
            text: `🍳 Bugün Kalanla ile "${receipt.recipeTitle}" hazırlayarak ₺${receipt.totalSavedTL} mutfak bütçesini ve ~${receipt.co2SavedKg} kg CO₂e karbon salınımını kurtardım! 🌿 "Ne kaldıysa, ondan başla."`,
            url: 'https://github.com/Rynia/KALANLA',
          });
        } else {
          Alert.alert(
            'KALANLA Kurtarma Fişi',
            `Bugün "${receipt.recipeTitle}" ile ₺${receipt.totalSavedTL} çöpe gitmekten kurtarıldı!`,
          );
        }
        setSharing(false);
        return;
      }

      if (!receiptRef.current) return;

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
      Alert.alert('Hata', 'Fiş paylaşılırken bir sorun oluştu.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={!!receipt} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.confirmedPill}>
              <Check size={12} color="#10B981" />
              <Text style={styles.confirmedText}>KURTARMA ONAYLANDI</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* PHYSICAL THERMAL RECEIPT (Only this element is captured by ViewShot) */}
          <ViewShot
            ref={receiptRef}
            options={{ format: 'png', quality: 1.0 }}
            style={styles.thermalReceipt}
          >
            {/* Header */}
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptBrand}>KALANLA ZERO-WASTE</Text>
              <Text style={styles.receiptSub}>TERMINAL #04 · RYNIA KITCHEN OS</Text>

              <View style={styles.dashedLine} />

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{receipt.txCode || 'TR-IST-034 // #8821'}</Text>
                <Text style={styles.metaText}>
                  {receipt.date} · {receipt.time}
                </Text>
              </View>
            </View>

            {/* Dish Title Box */}
            <View style={styles.dishBox}>
              <Text style={styles.dishLabel}>HAZIRLANAN TARİF // SIFIR ZİYAN</Text>
              <Text style={styles.dishTitle}>{receipt.recipeTitle}</Text>
            </View>

            {/* Itemized Table */}
            <View style={styles.itemsTable}>
              {receipt.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIdx}>0{idx + 1}.</Text>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemCheck}>[✓ %100]</Text>
                    <Text style={styles.itemPrice}>₺{item.priceTL.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.dashedLine} />

            {/* Total & Eco Savings */}
            <View style={styles.totalBlock}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOPLAM TASARRUF</Text>
                <Text style={styles.totalAmount}>₺{receipt.totalSavedTL.toFixed(2)}</Text>
              </View>

              <View style={styles.ecoRow}>
                <Text style={styles.ecoLabel}>CO2 SALINIM ENGELİ</Text>
                <Text style={styles.ecoVal}>~{receipt.co2SavedKg.toFixed(1)} kg CO₂e</Text>
              </View>

              <View style={styles.ecoRow}>
                <Text style={styles.ecoLabel}>HAZIRLIK SÜRESİ</Text>
                <Text style={styles.ecoVal}>{receipt.durationMinutes} DAKİKA</Text>
              </View>
            </View>

            {/* Mockup Barcode */}
            <View style={styles.barcodeBox}>
              <View style={styles.barcodeBlack} />
              <Text style={styles.barcodeText}>
                {receipt.barcodeNumber || '8 690123 456789'}
              </Text>
            </View>

            {/* Footer Slogan */}
            <View style={styles.receiptFooter}>
              <Text style={styles.slogan}>"Ne kaldıysa, ondan başla."</Text>
              <Text style={styles.brandTag}>KALANLA // KITCHEN OS</Text>
            </View>
          </ViewShot>

          {/* Action buttons (Outside ViewShot) */}
          <View style={styles.actionsDeck}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              disabled={sharing}
              activeOpacity={0.85}
            >
              {sharing ? (
                <ActivityIndicator color="#0A0A0E" size="small" />
              ) : (
                <>
                  <Share2 size={16} color="#0A0A0E" />
                  <Text style={styles.shareBtnText}>📸 FİŞİ PAYLAŞ (STORY / WHATSAPP)</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeActionBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.closeActionText}>Kapat & Devam Et</Text>
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
    backgroundColor: 'rgba(10, 10, 14, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  confirmedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1C24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thermalReceipt: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  receiptBrand: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A0A0E',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  receiptSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  dashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginVertical: spacing.sm,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  dishBox: {
    backgroundColor: '#F1F5F9',
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dishLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },
  dishTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A0A0E',
    marginTop: 2,
  },
  itemsTable: {
    gap: 4,
    marginVertical: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingRight: 6,
  },
  itemIdx: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  itemName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0E',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemCheck: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A0A0E',
    fontFamily: 'monospace',
  },
  totalBlock: {
    gap: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A0A0E',
    fontFamily: 'monospace',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ecoLabel: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  ecoVal: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A0A0E',
    fontFamily: 'monospace',
  },
  barcodeBox: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  barcodeBlack: {
    width: 170,
    height: 30,
    backgroundColor: '#0A0A0E',
  },
  barcodeText: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  slogan: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#64748B',
  },
  brandTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 2,
  },
  actionsDeck: {
    width: '100%',
    marginTop: spacing.lg,
    gap: 8,
  },
  shareBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareBtnText: {
    color: '#0A0A0E',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  closeActionBtn: {
    backgroundColor: '#1C1C24',
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262633',
  },
  closeActionText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
});
