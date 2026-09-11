import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Undo2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme/theme';

interface UndoToastProps {
  isVisible: boolean;
  recipeTitle: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  isVisible,
  recipeTitle,
  onUndo,
  onDismiss,
  durationMs = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      return;
    }

    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible, durationMs, onDismiss]);

  if (!isVisible) return null;

  const handlePressUndo = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
    onUndo();
  };

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.leftInfo}>
            <View style={styles.iconBox}>
              <Text style={styles.emoji}>🍳</Text>
            </View>
            <View style={styles.textBox}>
              <Text style={styles.titleText}>Malzemeler Dolaptan Düşüldü</Text>
              <Text style={styles.subText} numberOfLines={1}>
                {recipeTitle} pişirildi
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.undoButton}
            onPress={handlePressUndo}
            activeOpacity={0.8}
          >
            <Undo2 size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.undoButtonText}>GERİ AL</Text>
          </TouchableOpacity>
        </View>

        {/* 5-Second Linear Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 85,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(209, 58, 34, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(209, 58, 34, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  emoji: {
    fontSize: 14,
  },
  textBox: {
    flex: 1,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  subText: {
    fontSize: 10,
    color: colors.faint,
    marginTop: 2,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.terracotta,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    gap: 4,
  },
  undoButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: colors.borderMuted,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.terracotta,
  },
});

