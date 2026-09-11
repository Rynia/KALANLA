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
  ScrollView,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Share2, X, Check, Instagram } from 'lucide-react-native';
import { ThermalReceiptData } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';
import { calculateDurumIndex } from '../utils/durumIndex';

interface ThermalReceiptModalProps {
  receipt: ThermalReceiptData | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const modalReceiptRef = useRef<any>(null);
  const storyCanvasRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);

  if (!receipt) return null;

  const durumInfo = calculateDurumIndex(receipt.totalSavedTL);

  const handleShare = async (isStoryMode: boolean = false) => {
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
            text: `🍳 Bugün Kalanla ile "${receipt.recipeTitle}" hazırlayarak ₺${receipt.totalSavedTL} (${durumInfo.durumCount} Dürüm / ${durumInfo.kahveCount} Kahve) kurtardım! 🌿 "Ne kaldıysa, ondan başla."`,
            url: 'https://github.com/Rynia/KALANLA',
          });
        } else {
          Alert.alert(
            'KALANLA Kurtarma Fişi',
            `Bugün "${receipt.recipeTitle}" ile ₺${receipt.totalSavedTL} (~${durumInfo.durumCount} Dürüm değeri) çöpe gitmekten kurtarıldı!`,
          );
        }
        setSharing(false);
        return;
      }

      const targetRef = isStoryMode && storyCanvasRef.current ? storyCanvasRef : modalReceiptRef;
      if (!targetRef.current) return;

      const uri = await captureRef(targetRef, {
        format: 'png',
        quality: 1.0,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: isStoryMode ? 'Instagram Hikayesi Paylaş' : 'KALANLA Kurtarma Fişini Paylaş',
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
              <Check size={12} color={colors.accentEmerald} />
              <Text style={styles.confirmedText}>KURTARMA ONAYLANDI</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* PHYSICAL THERMAL RECEIPT (Modal UI View) */}
          <ViewShot
            ref={modalReceiptRef}
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

              {/* DÜRÜM / KAHVE ENDEKSİ (2026 BENCHMARK) */}
              <View style={styles.relatableIndexBox}>
                <View style={styles.indexHeaderBadge}>
                  <Text style={styles.badgeEmoji}>{durumInfo.badgeEmoji}</Text>
                  <Text style={styles.relatableIndexTitle}>{durumInfo.title.toUpperCase()}</Text>
                </View>
                <Text style={styles.relatableIndexText}>
                  🌯 ~{durumInfo.durumCount} Tavuk Dürüm Değerinde
                </Text>
                <Text style={styles.relatableIndexSub}>
                  ☕ veya ~{durumInfo.kahveCount} Filtre Kahve Parası Cepte
                </Text>
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
              style={styles.storyBtn}
              onPress={() => handleShare(true)}
              disabled={sharing}
              activeOpacity={0.85}
            >
              {sharing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Instagram size={16} color="#FFFFFF" />
                  <Text style={styles.storyBtnText}>📸 9:16 INSTAGRAM STORY PAYLAŞ</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => handleShare(false)}
              disabled={sharing}
              activeOpacity={0.85}
            >
              <Share2 size={16} color="#0A0A0E" />
              <Text style={styles.shareBtnText}>FİŞİ GÖRSEL OLARAK KAYDET / PAYLAŞ</Text>
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

        {/* 9:16 OFFSCREEN CANVAS (Captured for Instagram Story, 360x640 ratio = 9:16) */}
        <View
          style={styles.offscreenContainer}
          pointerEvents="none"
          collapsable={false}
        >
          <ViewShot
            ref={storyCanvasRef}
            options={{ format: 'png', quality: 1.0 }}
            style={styles.storyCanvas}
          >
            {/* Ambient Background Gradient Glow Simulation */}
            <View style={styles.storyHeader}>
              <Text style={styles.storyStudio}>RYNIA LABS PRESENTS</Text>
              <Text style={styles.storyAppTitle}>KALANLA</Text>
              <Text style={styles.storyTagline}>Sıfır İsraf · Akıllı Mutfak Raporu</Text>
            </View>

            {/* The Story Thermal Paper */}
            <View style={styles.storyReceiptPaper}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptBrand}>KALANLA ZERO-WASTE</Text>
                <Text style={styles.receiptSub}>{receipt.date} · {receipt.txCode || 'TR-IST-034'}</Text>
                <View style={styles.dashedLine} />
              </View>

              <View style={styles.dishBox}>
                <Text style={styles.dishLabel}>PİŞİRİLEN LEZZET</Text>
                <Text style={styles.dishTitle}>{receipt.recipeTitle}</Text>
              </View>

              <View style={styles.storyHighlights}>
                <View style={styles.storyHighlightCol}>
                  <Text style={styles.storyHighlightVal}>₺{receipt.totalSavedTL.toFixed(0)}</Text>
                  <Text style={styles.storyHighlightLbl}>Kurtarılan</Text>
                </View>
                <View style={styles.storyHighlightDivider} />
                <View style={styles.storyHighlightCol}>
                  <Text style={styles.storyHighlightVal}>🌯 {durumInfo.durumCount}</Text>
                  <Text style={styles.storyHighlightLbl}>Dürüm Eşiti</Text>
                </View>
                <View style={styles.storyHighlightDivider} />
                <View style={styles.storyHighlightCol}>
                  <Text style={styles.storyHighlightVal}>~{receipt.co2SavedKg}kg</Text>
                  <Text style={styles.storyHighlightLbl}>CO₂ Önleme</Text>
                </View>
              </View>

              <View style={styles.relatableIndexBox}>
                <Text style={styles.relatableIndexText}>
                  {durumInfo.badgeEmoji} {durumInfo.title}
                </Text>
                <Text style={styles.relatableIndexSub}>
                  "{durumInfo.description}"
                </Text>
              </View>

              <View style={styles.barcodeBox}>
                <View style={styles.barcodeBlack} />
                <Text style={styles.barcodeText}>{receipt.barcodeNumber || '8 690123 456789'}</Text>
              </View>
            </View>

            {/* Bottom Callout */}
            <View style={styles.storyFooter}>
              <Text style={styles.storyFooterUrl}>kalanla.app · App Store & Google Play</Text>
              <Text style={styles.storyFooterPunchline}>"Dolabında ne kaldıysa, ziyafet ondan başlar."</Text>
            </View>
          </ViewShot>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 14, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accentEmerald,
  },
  confirmedText: {
    color: colors.accentEmerald,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thermalReceipt: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 4,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E7DFD5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptBrand: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 2,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  receiptSub: {
    fontSize: 8,
    color: '#78716C',
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  dashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderStyle: 'dashed',
    marginVertical: spacing.xs,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 8,
    color: '#78716C',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  dishBox: {
    backgroundColor: '#F5F0EB',
    padding: spacing.xs,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E7DFD5',
    borderRadius: 3,
  },
  dishLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#78716C',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    letterSpacing: 0.8,
  },
  dishTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1C1917',
    marginTop: 2,
  },
  itemsTable: {
    gap: 3,
    marginVertical: 4,
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
    fontSize: 9,
    fontWeight: '800',
    color: '#A8A29E',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  itemName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1917',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCheck: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accentEmerald,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  itemPrice: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  totalBlock: {
    gap: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1C1917',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.accentEmerald,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ecoLabel: {
    fontSize: 8,
    color: '#78716C',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  ecoVal: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1C1917',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  relatableIndexBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E7DFD5',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  indexHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  relatableIndexTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.brandTerracotta,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    letterSpacing: 1,
  },
  relatableIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1917',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  relatableIndexSub: {
    fontSize: 8,
    color: '#78716C',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    marginTop: 1,
    textAlign: 'center',
  },
  barcodeBox: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  barcodeBlack: {
    width: 150,
    height: 24,
    backgroundColor: '#1C1917',
  },
  barcodeText: {
    fontSize: 7,
    letterSpacing: 2,
    color: '#78716C',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    marginTop: 3,
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#D6D3D1',
    borderStyle: 'dashed',
  },
  slogan: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#78716C',
  },
  brandTag: {
    fontSize: 7,
    fontWeight: '800',
    color: '#A8A29E',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    letterSpacing: 1,
    marginTop: 2,
  },
  actionsDeck: {
    width: '100%',
    marginTop: spacing.md,
    gap: 8,
  },
  storyBtn: {
    backgroundColor: '#E1306C',
    paddingVertical: 12,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#E1306C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  storyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  shareBtn: {
    backgroundColor: colors.accentEmerald,
    paddingVertical: 12,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareBtnText: {
    color: '#0A0A0E',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  closeActionBtn: {
    backgroundColor: colors.surfaceCard,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  closeActionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  // 9:16 Offscreen Canvas Styles
  offscreenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  storyCanvas: {
    width: 360,
    height: 640,
    backgroundColor: '#141210',
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyHeader: {
    alignItems: 'center',
    marginTop: 12,
  },
  storyStudio: {
    fontSize: 9,
    color: colors.brandTerracotta,
    letterSpacing: 2,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  storyAppTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginTop: 2,
  },
  storyTagline: {
    fontSize: 10,
    color: '#A8A29E',
    marginTop: 2,
  },
  storyReceiptPaper: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7DFD5',
  },
  storyHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingVertical: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
  storyHighlightCol: {
    alignItems: 'center',
  },
  storyHighlightVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1917',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  storyHighlightLbl: {
    fontSize: 8,
    color: '#78716C',
    marginTop: 2,
  },
  storyHighlightDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D6D3D1',
  },
  storyFooter: {
    alignItems: 'center',
    marginBottom: 12,
  },
  storyFooterUrl: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentEmerald,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    letterSpacing: 1,
  },
  storyFooterPunchline: {
    fontSize: 9,
    color: '#78716C',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
