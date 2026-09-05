import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Sparkles, ChefHat, Clock, Flame, ChevronRight } from 'lucide-react-native';
import { RescueRecipe, FoodItem } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface RescueKitchenProps {
  recipes: RescueRecipe[];
  inventory: FoodItem[];
  onCookRecipe: (recipe: RescueRecipe) => void;
  onViewRecipeDetail: (recipe: RescueRecipe) => void;
}

export const RescueKitchen: React.FC<RescueKitchenProps> = ({
  recipes,
  inventory,
  onCookRecipe,
  onViewRecipeDetail,
}) => {
  const urgentCount = inventory.filter((i) => i.hoursLeft <= 48).length;

  return (
    <View style={styles.container}>
      {/* 1. Header & Live Telemetry Banner */}
      <View style={styles.telemetryBanner}>
        <View style={styles.telemetryHeader}>
          <Text style={styles.telemetryTitle}>02 // PİŞİR: SIFIR ZİYAN REÇETELERİ</Text>
          <View style={styles.radarActiveBadge}>
            <Text style={styles.radarActiveText}>RADAR AKTİF</Text>
          </View>
        </View>

        <Text style={styles.telemetryDesc}>
          Dolabındaki riskli malzemelerle 10-15 dakikada hazırlayabileceğin şef kurtarma menüleri:
        </Text>

        <View style={styles.matchStatRow}>
          <View style={styles.matchStatLeft}>
            <Sparkles size={14} color="#10B981" />
            <Text style={styles.matchStatText}>
              {urgentCount} Kritik Malzeme Eşleşti
            </Text>
          </View>
          <View style={styles.matchStatPill}>
            <Text style={styles.matchStatPillText}>SIFIR ATIK DOSTU</Text>
          </View>
        </View>
      </View>

      {/* 2. Recipe Cards Feed */}
      {recipes.map((recipe) => (
        <View key={recipe.id} style={styles.recipeCard}>
          {/* Dish Image Banner */}
          {recipe.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
              {recipe.isChefPick && (
                <View style={styles.chefPickBadge}>
                  <ChefHat size={12} color="#0A0A0E" />
                  <Text style={styles.chefPickText}>ŞEFİN ÖNERİSİ</Text>
                </View>
              )}
              <View style={styles.matchPillBadge}>
                <Text style={styles.matchPillText}>%{recipe.matchPercentage} EŞLEŞME</Text>
              </View>
            </View>
          )}

          <View style={styles.cardBody}>
            {/* Badges Row */}
            <View style={styles.badgeRow}>
              <View style={styles.timeBadge}>
                <Clock size={12} color="#94A3B8" />
                <Text style={styles.timeBadgeText}>{recipe.durationMinutes} DAKİKA</Text>
              </View>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>+₺{recipe.savedTL} CEPTE</Text>
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDesc} numberOfLines={2}>
              {recipe.description}
            </Text>

            {/* Ingredients Tags */}
            <View style={styles.tagsContainer}>
              {recipe.requiredItemNames.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.ingTag,
                    item.rescued ? styles.ingTagRescued : styles.ingTagPantry,
                  ]}
                >
                  <Text
                    style={[
                      styles.ingTagText,
                      item.rescued ? styles.ingTagTextRescued : styles.ingTagTextPantry,
                    ]}
                  >
                    {item.rescued ? '✓ ' : '• '}
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => onViewRecipeDetail(recipe)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailBtnText}>Tarifi İncele</Text>
                <ChevronRight size={14} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cookBtn}
                onPress={() => onCookRecipe(recipe)}
                activeOpacity={0.85}
              >
                <Text style={styles.cookBtnText}>Yaptım & Kurtardım 🍳</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
  },
  telemetryBanner: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.md,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  telemetryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  radarActiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  radarActiveText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  telemetryDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  matchStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0E',
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#262633',
  },
  matchStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchStatText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  matchStatPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  matchStatPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  recipeCard: {
    backgroundColor: '#14141A',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F28',
    marginBottom: spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C24',
  },
  chefPickBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFB95F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  chefPickText: {
    color: '#0A0A0E',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  matchPillBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  matchPillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  cardBody: {
    padding: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1C1C26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#262633',
  },
  timeBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  savingsBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  savingsBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.lg,
  },
  ingTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  ingTagRescued: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ingTagPantry: {
    backgroundColor: '#1C1C24',
    borderColor: '#262633',
  },
  ingTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ingTagTextRescued: {
    color: '#10B981',
  },
  ingTagTextPantry: {
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C26',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#262633',
    gap: 4,
  },
  detailBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  cookBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  cookBtnText: {
    color: '#0A0A0E',
    fontSize: 13,
    fontWeight: '800',
  },
});
