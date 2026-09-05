// src/components/ReceiptScanModal.tsx
// Market Fişi Okuma (Receipt OCR) ve Envantere Toplu Aktarma Modalı
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
import { Receipt, Camera, Image as ImageIcon, Check, X, Sparkles, Store } from 'lucide-react-native';
import { FoodItem } from '../types/models';
import {
  prepareReceiptImage,
  parseMarketReceipt,
  ScannedReceiptFood,
} from '../services/receiptScannerService';
import { colors, spacing, radius } from '../theme/theme';

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatchItems: (items: Omit<FoodItem, 'id' | 'addedAt'>[]) => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({
  isOpen,
  onClose,
  onAddBatchItems,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [marketName, setMarketName] = useState<string>('');
  const [scannedItems, setScannedItems] = useState<ScannedReceiptFood[]>([]);

  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fişi tarayabilmek için kamera izni vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processReceipt(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Receipt camera error:', e);
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçebilmek için galeri izni vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processReceipt(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Receipt gallery error:', e);
    }
  };

  const processReceipt = async (uri: string) => {
    setCapturedUri(uri);
    setLoading(true);

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const base64 = await prepareReceiptImage(uri);
      const res = await parseMarketReceipt(base64);

      setMarketName(res.marketName);
      setScannedItems(res.items);
    } catch (e) {
      Alert.alert('Hata', 'Market fişi taranırken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelect = (id: string) => {
    setScannedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleConfirmBatch = () => {
    const selected = scannedItems.filter((i) => i.selected);
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
    setScannedItems([]);
    setMarketName('');
    setLoading(false);
  };

  const selectedCount = scannedItems.filter((d) => d.selected).length;
  const totalValueTL = scannedItems
    .filter((d) => d.selected)
    .reduce((sum, d) => sum + d.priceTL, 0);

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>05 // MARKET FİŞİ TARAYICI</Text>
              <Text style={styles.subtitle}>BİM • A101 • ŞOK • MİGROS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Fiş Çekilmediyse Seçim Ekranı */}
          {!capturedUri && (
            <View style={styles.pickerBody}>
              <View style={styles.iconCircle}>
                <Receipt size={40} color="#10B981" />
              </View>
              <Text style={styles.pickerTitle}>Market Fişini Fotoğrafla</Text>
              <Text style={styles.pickerDesc}>
                Fişteki kısaltmaları (örn: KAS PEY, DOMAT) gerçek gıda isimlerine çevirir; fiyat ve miktarlarıyla tek tıkla dolabına aktarır.
              </Text>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.cameraBtn} onPress={handleLaunchCamera} activeOpacity={0.85}>
                  <Camera size={18} color="#0A0A0E" />
                  <Text style={styles.cameraBtnText}>Fişi Çek</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.galleryBtn} onPress={handleLaunchGallery} activeOpacity={0.85}>
                  <ImageIcon size={18} color="#F8FAFC" />
                  <Text style={styles.galleryBtnText}>Galeriden Seç</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Analiz Ediliyor Ekranı */}
          {loading && (
            <View style={styles.loadingBody}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingTitle}>Fiş Satırları Okunuyor...</Text>
              <Text style={styles.loadingDesc}>Kısaltmalar açılıyor, gıdalar ayrıştırılıyor.</Text>
            </View>
          )}

          {/* Fiş Ayrıştırma Sonucu */}
          {!loading && scannedItems.length > 0 && (
            <View style={styles.resultContainer}>
              <View style={styles.summaryBar}>
                <View style={styles.marketBadge}>
                  <Store size={14} color="#10B981" />
                  <Text style={styles.marketBadgeText}>{marketName}</Text>
                </View>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.reScanText}>Yeni Fiş Çek</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.itemSummary}>
                {selectedCount} Gıda Ayrıştırıldı • ₺{totalValueTL} Toplam
              </Text>

              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {scannedItems.map((item) => (
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
                  Fişi Dolaba Aktar (+₺{totalValueTL})
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
    fontWeight: '700',
    fontFamily: 'monospace',
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
    marginBottom: spacing.sm,
  },
  marketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  marketBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  reScanText: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  itemSummary: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
  itemsList: {
    maxHeight: 260,
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
