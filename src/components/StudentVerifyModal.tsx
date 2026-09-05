// src/components/StudentVerifyModal.tsx
// Üniversite Öğrencisi Doğrulama Modalı (.edu.tr)
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GraduationCap, CheckCircle, X, ShieldCheck } from 'lucide-react-native';
import { verifyStudentEmail } from '../services/entitlements';
import { UserSubscription } from '../types/subscription';
import { colors, spacing, radius } from '../theme/theme';

interface StudentVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (updatedSub: UserSubscription) => void;
}

export const StudentVerifyModal: React.FC<StudentVerifyModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = async () => {
    if (!email.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen üniversite e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyStudentEmail(email);
      if (res.success) {
        Alert.alert('Tebrikler! 🎓', res.message, [
          {
            text: 'Harika!',
            onPress: () => {
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert('Doğrulama Başarısız', res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <GraduationCap size={44} color="#60A5FA" />
          </View>

          <Text style={styles.title}>Üniversite Öğrencisi Paketi</Text>
          <Text style={styles.subtitle}>100% ÜCRETSİZ • SIFIR ATIK DESTEĞİ</Text>

          <Text style={styles.desc}>
            Türkiye'deki üniversite öğrencilerine özel: Sınırsız AI Kamera taraması, sınırsız kiler takibi ve öğrenci evi pratik kurtarma reçeteleri!
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Üniversite E-Posta Adresiniz (.edu.tr)</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@itu.edu.tr veya boun.edu.tr"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0E" />
            ) : (
              <>
                <ShieldCheck size={18} color="#0A0A0E" />
                <Text style={styles.verifyBtnText}>Öğrenci Paketini Aktif Et</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Doğrulama 1 yıl süreyle geçerlidir. Kişisel verileriniz hiçbir kurumla paylaşılmaz.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: '#121217',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#1F1F26',
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: '#1C1C24',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#1C1C24',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  verifyBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#60A5FA',
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
    marginBottom: spacing.md,
  },
  verifyBtnText: {
    color: '#0A0A0E',
    fontWeight: '800',
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
});
