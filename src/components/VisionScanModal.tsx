// src/components/VisionScanModal.tsx
// Fotoğraf ile Dolap Tarama ve Batch Staging Onay Modalı
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera, Image as ImageIcon, Check, Sparkles, X, AlertCircle } from 'lucide-react-native';
import { FoodItem } from '../types/models';
import { UserSubscription } from '../types/subscription';
import {
  compressAndBase64,
  detectFoodItemsFromImage,
  DetectedFoodItem,
} from '../services/visionInventoryService';
import { FoodImage } from './FoodImage';
import {
  canPerformVisionScan,
  getRemainingScans,
  incrementVisionScanUsage,
} from '../services/entitlements';
import { colors, spacing, radius } from '../theme/theme';

interface VisionScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatchItems: (items: Omit<FoodItem, 'id' | 'addedAt'>[]) => void;
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
  onOpenStudentVerify: () => void;
  onOpenQuickAdd?: () => void;
}

export const VisionScanModal: React.FC<VisionScanModalProps> = ({
  isOpen,
  onClose,
  onAddBatchItems,
  subscription,
  onSubscriptionUpdate,
  onOpenStudentVerify,
  onOpenQuickAdd,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [detectedList, setDetectedList] = useState<DetectedFoodItem[]>([]);
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  const remainingScans = getRemainingScans(subscription);
  const hasQuota = canPerformVisionScan(subscription);

  const handleLaunchCamera = async () => {
    if (!hasQuota) {
      showQuotaExceededAlert();
      return;
    }

    try {
      // Google Play Prominent Disclosure (Kamera Belirgin Açıklaması)
      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Kamera Erişimi ve Gizlilik',
          'KALANLA, buzdolabınızdaki yiyecekleri tespit etmek için kameranızı kullanır. Çekilen fotoğraflar yalnızca anlık malzeme ayrıştırma için işlenir ve sunucularımızda saklanmaz.',
          [
            { text: 'Vazgeç', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Devam Et', onPress: () => resolve(true) },
          ]
        );
      });
      if (!proceed) return;

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Buzdolabınızı fotoğraflayabilmek için kamera izni vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processCapturedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Camera launch error:', e);
    }
  };

  const handleLaunchGallery = async () => {
    if (!hasQuota) {
      showQuotaExceededAlert();
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçebilmek için galeri izni vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processCapturedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Gallery launch error:', e);
    }
  };

  const processCapturedImage = async (uri: string) => {
    setCapturedUri(uri);
    setLoading(true);
    setHasScanned(true);

    try {
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
      }

      const base64 = await compressAndBase64(uri);
      const items = await detectFoodItemsFromImage(base64);
      setDetectedList(items);

      if (items.length > 0) {
        const nextSub = await incrementVisionScanUsage(subscription);
        onSubscriptionUpdate(nextSub);
      }
    } catch (e) {
      setDetectedList([]);
    } finally {
      setLoading(false);
    }
  };

  const showQuotaExceededAlert = () => {
    Alert.alert(
      'Aylık Tarama Kotanız Doldu',
      'Ücretsiz planda ayda 5 kez yapay zeka kamera taraması yapabilirsiniz.\n\nÜniversite öğrencisi misiniz? Öğrenci belgeniz veya .edu.tr adresinizle 100% ÜCRETSİZ sınırsız paketi hemen aktif edebilirsiniz!',
      [
        { text: 'Kapat', style: 'cancel' },
        { text: 'Öğrenci Doğrula', onPress: onOpenStudentVerify },
      ]
    );
  };

  const toggleItemSelect = (id: string) => {
    setDetectedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleConfirmBatch = () => {
    const selected = detectedList.filter((d) => d.selected);
    if (selected.length === 0) {
      Alert.alert('Uyarı', 'Lütfen eklenecek en az bir ürün seçin.');
      return;
    }

    const payload = selected.map((item) => ({
      name: item.name,
      category: item.category,
      amount: item.amount,
      location: item.location,
      hoursLeft: item.hoursLeft,
      riskPercentage: item.riskPercentage,
      priceTL: item.priceTL,
      imageUrl: item.imageUrl,
    }));

    onAddBatchItems(payload);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCapturedUri(null);
    setDetectedList([]);
    setHasScanned(false);
    setLoading(false);
  };

  const selectedCount = detectedList.filter((d) => d.selected).length;
  const totalValueTL = detectedList
    .filter((d) => d.selected)
    .reduce((sum, item) => sum + item.priceTL, 0);

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Fotoğraftan Ekle</Text>
              <Text style={styles.subtitle}>
                {subscription.tier === 'STUDENT'
                  ? '🎓 Üniversite Öğrencisi (Sınırsız AI)'
                  : `Kalan Tarama Hakkı: ${remainingScans} / 5`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.faint} />
            </TouchableOpacity>
          </View>

          {/* AI Disclosure Banner (Apple Store Guideline 5.1.1 Uyumlu) */}
          <View style={styles.disclosureBanner}>
            <Sparkles size={13} color={colors.emerald} />
            <Text style={styles.disclosureBannerText}>
              Fotoğraflarınız anlık analiz için işlenir, sunucularda kalıcı olarak saklanmaz.
            </Text>
          </View>

          {/* 1. v1.1 Yakında Bilgilendirme Ekranı (Apple 2.1 & Store Compliance) */}
          <View style={styles.pickerBody}>
            <View style={styles.iconCircle}>
              <Sparkles size={34} color={colors.emerald} />
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>🚀 v1.1 GÜNCELLEMESİNDE GELİYOR</Text>
            </View>
            <Text style={styles.pickerTitle}>Yapay Zeka ile Dolap Tarama</Text>
            <Text style={styles.pickerDesc}>
              Buzdolabınızı veya market poşetinizi tek karede tarayıp malzemeleri otomatik ayrıştıran Vision AI motorumuz çok yakında v1.1 sürümüyle sizlerle buluşacak!
              {'\n\n'}
              Şu an malzemelerinizi akıllı gramaj ve raf ömrü tahmini sunan Hızlı Ekle ile anında kilerinize ekleyebilirsiniz.
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => {
                  onClose();
                  if (onOpenQuickAdd) onOpenQuickAdd();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.cameraBtnText}>✍️ Malzemeleri Hızlı Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Analiz Yükleniyor Ekranı */}
          {loading && (
            <View style={styles.loadingBody}>
              <ActivityIndicator size="large" color={colors.emerald} />
              <Text style={styles.loadingTitle}>Yapay Zeka Dolabı İnceliyor...</Text>
              <Text style={styles.loadingDesc}>Malzemeler, gramajlar ve fiyatlar tespit ediliyor.</Text>
            </View>
          )}

          {/* 3. Başarılı Sonuç Ekranı (Batch Staging) */}
          {!loading && hasScanned && detectedList.length > 0 && (
            <View style={styles.resultContainer}>
              <View style={styles.summaryBar}>
                <Text style={styles.summaryBarText}>
                  {selectedCount} Ürün Seçildi • ₺{totalValueTL} Değer
                </Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.reScanText}>Tekrar Çek</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {detectedList.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, item.selected && styles.itemCardSelected]}
                    onPress={() => toggleItemSelect(item.id)}
                    activeOpacity={0.8}
                  >
                    <FoodImage
                      source={item.imageUrl}
                      name={item.name}
                      category={item.category}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>
                        {item.amount} • {item.location} • ₺{item.priceTL}
                      </Text>
                    </View>
                    <View style={[styles.checkCircle, item.selected && styles.checkCircleSelected]}>
                      {item.selected && <Check size={14} color="#141210" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBatch} activeOpacity={0.85}>
                <Sparkles size={18} color="#141210" />
                <Text style={styles.confirmBtnText}>
                  Seçilenleri Dolaba Ekle (+₺{totalValueTL})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 4. Gıda Bulunamadı / Başarısız Boş Durum (Apple Guideline 2.3 Uyumlu) */}
          {!loading && hasScanned && detectedList.length === 0 && (
            <View style={styles.emptyScanBody}>
              <AlertCircle size={42} color={colors.amber} />
              <Text style={styles.emptyScanTitle}>Görselde Gıda Tespit Edilemedi</Text>
              <Text style={styles.emptyScanDesc}>
                Lütfen buzdolabınızın içini aydınlık bir ortamda tekrar fotoğraflayın veya malzemelerinizi doğrudan Hızlı Ekle ile kaydedin.
              </Text>

              <View style={styles.emptyActionsRow}>
                <TouchableOpacity style={styles.retryBtn} onPress={handleReset} activeOpacity={0.85}>
                  <Text style={styles.retryBtnText}>Tekrar Çek 📷</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.manualBtn}
                  onPress={() => {
                    handleReset();
                    onClose();
                    if (onOpenQuickAdd) onOpenQuickAdd();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.manualBtnText}>Hızlı Ekle ✍️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclosureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  disclosureBannerText: {
    fontSize: 10,
    color: colors.muted,
    flex: 1,
    lineHeight: 14,
  },
  pickerBody: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  badgeText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  pickerDesc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  cameraBtnText: {
    color: '#141210',
    fontWeight: '900',
    fontSize: 14,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  galleryBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  studentBanner: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  studentBannerText: {
    fontSize: 11,
    color: colors.terracotta,
    fontWeight: '700',
  },
  loadingBody: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  loadingDesc: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  resultContainer: {
    width: '100%',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  summaryBarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  reScanText: {
    fontSize: 11,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  itemsList: {
    maxHeight: 280,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardSelected: {
    borderColor: colors.emerald,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: 8,
  },
  confirmBtnText: {
    color: '#141210',
    fontWeight: '900',
    fontSize: 14,
  },

  // Boş Durum (Deterministik)
  emptyScanBody: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyScanTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyScanDesc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: spacing.xl,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryBtn: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  retryBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  manualBtn: {
    flex: 1,
    backgroundColor: colors.emerald,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  manualBtnText: {
    color: '#141210',
    fontSize: 13,
    fontWeight: '900',
  },
});
