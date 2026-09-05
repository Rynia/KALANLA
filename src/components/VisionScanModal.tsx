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
import { Camera, Image as ImageIcon, Check, Trash2, Sparkles, X, ShieldAlert } from 'lucide-react-native';
import { FoodItem } from '../types/models';
import { UserSubscription } from '../types/subscription';
import {
  compressAndBase64,
  detectFoodItemsFromImage,
  DetectedFoodItem,
} from '../services/visionInventoryService';
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
}

export const VisionScanModal: React.FC<VisionScanModalProps> = ({
  isOpen,
  onClose,
  onAddBatchItems,
  subscription,
  onSubscriptionUpdate,
  onOpenStudentVerify,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [detectedList, setDetectedList] = useState<DetectedFoodItem[]>([]);

  const remainingScans = getRemainingScans(subscription);
  const hasQuota = canPerformVisionScan(subscription);

  const handleLaunchCamera = async () => {
    if (!hasQuota) {
      showQuotaExceededAlert();
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Buzdolabını tarayabilmek için kamera izni vermelisiniz.');
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

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const base64 = await compressAndBase64(uri);
      const items = await detectFoodItemsFromImage(base64);
      setDetectedList(items);

      // Kotayı bir azalt
      const nextSub = await incrementVisionScanUsage(subscription);
      onSubscriptionUpdate(nextSub);
    } catch (e) {
      Alert.alert('Hata', 'Fotoğraf analiz edilirken bir sorun oluştu.');
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
    setLoading(false);
  };

  const selectedCount = detectedList.filter((d) => d.selected).length;
  const totalValueTL = detectedList
    .filter((d) => d.selected)
    .reduce((sum, d) => sum + d.priceTL, 0);

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>04 // AI DOLAP KAMERASI</Text>
              <Text style={styles.subtitle}>
                {subscription.tier === 'STUDENT'
                  ? '🎓 Üniversite Öğrencisi (Sınırsız AI)'
                  : `Kalan Tarama Hakkı: ${remainingScans} / 5`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Kamera Seçim Durumu (Henüz çekilmediyse) */}
          {!capturedUri && (
            <View style={styles.pickerBody}>
              <View style={styles.iconCircle}>
                <Camera size={40} color="#10B981" />
              </View>
              <Text style={styles.pickerTitle}>Dolabını veya Poşetini Fotoğrafla</Text>
              <Text style={styles.pickerDesc}>
                Yapay zeka tüm malzemeleri otomatik tanır, kategori, gramaj ve raf ömrüyle dolabına ekler.
              </Text>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.cameraBtn} onPress={handleLaunchCamera} activeOpacity={0.85}>
                  <Camera size={18} color="#0A0A0E" />
                  <Text style={styles.cameraBtnText}>Kamerayı Aç</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.galleryBtn} onPress={handleLaunchGallery} activeOpacity={0.85}>
                  <ImageIcon size={18} color="#F8FAFC" />
                  <Text style={styles.galleryBtnText}>Galeriden Seç</Text>
                </TouchableOpacity>
              </View>

              {subscription.tier === 'FREE' && (
                <TouchableOpacity style={styles.studentBanner} onPress={onOpenStudentVerify}>
                  <Text style={styles.studentBannerText}>
                    🎓 Üniversite öğrencisi misin? Sınırsız AI için tıkla →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Analiz Yükleniyor Ekranı */}
          {loading && (
            <View style={styles.loadingBody}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingTitle}>Yapay Zeka Dolabı İnceliyor...</Text>
              <Text style={styles.loadingDesc}>Malzemeler, gramajlar ve fiyatlar tespit ediliyor.</Text>
            </View>
          )}

          {/* Sonuç Onay Ekranı (Batch Staging) */}
          {!loading && detectedList.length > 0 && (
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
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>
                        {item.amount} • {item.location} • ₺{item.priceTL}
                      </Text>
                    </View>
                    <View style={[styles.checkCircle, item.selected && styles.checkCircleSelected]}>
                      {item.selected && <Check size={14} color="#0A0A0E" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBatch} activeOpacity={0.85}>
                <Sparkles size={18} color="#0A0A0E" />
                <Text style={styles.confirmBtnText}>
                  Seçilenleri Dolaba Ekle (+₺{totalValueTL})
                </Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(5, 5, 8, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#121217',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
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
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: '#1C1C24',
  },
  pickerBody: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  cameraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  cameraBtnText: {
    color: '#0A0A0E',
    fontWeight: '800',
    fontSize: 14,
  },
  galleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C24',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#262633',
    gap: 8,
  },
  galleryBtnText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  studentBanner: {
    marginTop: spacing.xl,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  studentBannerText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingBody: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 16,
  },
  loadingDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
  resultContainer: {
    maxHeight: 450,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F26',
  },
  summaryBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  reScanText: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  itemsList: {
    maxHeight: 280,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181820',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#242430',
  },
  itemCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: '#262633',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  itemMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: 8,
  },
  confirmBtnText: {
    color: '#0A0A0E',
    fontWeight: '800',
    fontSize: 14,
  },
});
