import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { X, Clock, Flame, Dumbbell } from 'lucide-react-native';
import { RescueRecipe } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface RecipeDetailModalProps {
  recipe: RescueRecipe | null;
  onClose: () => void;
  onCookRecipe: (recipe: RescueRecipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onCookRecipe,
}) => {
  if (!recipe) return null;

  const handleCook = () => {
    onCookRecipe(recipe);
    onClose();
  };

  return (
    <Modal visible={!!recipe} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header Image */}
          {recipe.imageUrl && (
            <View style={styles.imageBox}>
              <Image source={{ uri: recipe.imageUrl }} style={styles.headerImage} />
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={18} color="#F8FAFC" />
              </TouchableOpacity>
              <View style={styles.savingsPill}>
                <Text style={styles.savingsPillText}>+₺{recipe.savedTL} CEPTE</Text>
              </View>
            </View>
          )}

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Title & Macros */}
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.desc}>{recipe.description}</Text>

            <View style={styles.macrosRow}>
              <View style={styles.macroPill}>
                <Clock size={14} color="#10B981" />
                <Text style={styles.macroText}>{recipe.durationMinutes} Dk</Text>
              </View>
              <View style={styles.macroPill}>
                <Flame size={14} color="#FFB95F" />
                <Text style={styles.macroText}>{recipe.calories} kcal</Text>
              </View>
              <View style={styles.macroPill}>
                <Dumbbell size={14} color="#A855F7" />
                <Text style={styles.macroText}>{recipe.protein} Protein</Text>
              </View>
            </View>

            {/* Step-by-Step Instructions */}
            <Text style={styles.sectionTitle}>ADIM ADIM PİŞİRME</Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Cook Button */}
            <TouchableOpacity style={styles.cookBtn} onPress={handleCook} activeOpacity={0.85}>
              <Text style={styles.cookBtnText}>Yemeği Yaptım & Kurtardım 🍳</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#14141A',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262633',
  },
  imageBox: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(10,10,14,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  savingsPillText: {
    color: '#0A0A0E',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  contentScroll: {
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1C1C26',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#262633',
  },
  macroText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  instructionsList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#0A0A0E',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  stepText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
  },
  cookBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  cookBtnText: {
    color: '#0A0A0E',
    fontSize: 14,
    fontWeight: '900',
  },
});
