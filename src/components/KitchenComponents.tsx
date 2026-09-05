import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ingredient, Recipe, KitchenStats } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brandTitle}>KALANLA</Text>
        <Text style={styles.brandTagline}>Ne kaldıysa, ondan başla.</Text>
      </View>
      <View style={styles.systemBadge}>
        <Text style={styles.systemBadgeText}>RYNIA // OS</Text>
      </View>
    </View>
  );
};

export const StatsRadar: React.FC<KitchenStats> = ({
  totalValue,
  atRiskValue,
  savedValue,
}) => {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>DOLAP DEĞERİ</Text>
        <Text style={styles.statValue}>₺{totalValue}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.risk }]}>48S RİSKTE</Text>
        <Text style={[styles.statValue, { color: colors.risk }]}>₺{atRiskValue}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.emerald }]}>KURTARILAN</Text>
        <Text style={[styles.statValue, { color: colors.emerald }]}>₺{savedValue}</Text>
      </View>
    </View>
  );
};

interface IngredientCardProps {
  item: Ingredient;
  onPress?: () => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.ingredientCard}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.ingredientLeft}>
        <View
          style={[
            styles.statusDot,
            item.critical ? styles.dotCritical : styles.dotSafe,
          ]}
        />
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.name}</Text>
          <Text style={styles.ingredientMeta}>
            {item.daysLeft <= 1 ? '🚨 Son 24 Saat!' : `${item.daysLeft} gün kaldı`} · {item.category}
          </Text>
        </View>
      </View>
      <Text style={styles.ingredientValue}>₺{item.value}</Text>
    </TouchableOpacity>
  );
};

interface RecipeCardProps {
  recipe: Recipe;
  onCook: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onCook }) => {
  return (
    <View style={styles.recipeCard}>
      <View style={styles.recipeBadgeRow}>
        <View style={styles.badgeGroup}>
          <Text style={styles.recipeTimeBadge}>⏱ {recipe.timeMin} DAKİKA</Text>
          {recipe.rescueLevel && (
            <Text
              style={[
                styles.rescueLevelBadge,
                recipe.rescueLevel === 'Acil'
                  ? styles.rescueLevelAcil
                  : styles.rescueLevelOncelikli,
              ]}
            >
              {recipe.rescueLevel}
            </Text>
          )}
        </View>
        <Text style={styles.recipeSavingsBadge}>₺{recipe.savings} CEPTE</Text>
      </View>

      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.recipeDesc}>{recipe.description}</Text>

      <View style={styles.tagsRow}>
        {recipe.ingredientsUsed.map((ing, idx) => (
          <View key={idx} style={styles.ingTag}>
            <Text style={styles.ingTagText}>✓ {ing}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.cookButton}
        activeOpacity={0.85}
        onPress={() => onCook(recipe)}
      >
        <Text style={styles.cookButtonText}>Yemeği Yaptım & Kurtardım 🍳</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.text,
  },
  brandTagline: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  systemBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  systemBadgeText: {
    color: colors.titanium,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  ingredientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },
  dotCritical: {
    backgroundColor: colors.risk,
  },
  dotSafe: {
    backgroundColor: colors.emerald,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  ingredientMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  ingredientValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipeBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipeTimeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rescueLevelBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  rescueLevelAcil: {
    backgroundColor: colors.riskSoft,
    color: colors.risk,
  },
  rescueLevelOncelikli: {
    backgroundColor: colors.amberSoft,
    color: colors.amber,
  },
  recipeSavingsBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald,
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  recipeDesc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.lg,
  },
  ingTag: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingTagText: {
    fontSize: 11,
    color: colors.titanium,
    fontWeight: '500',
  },
  cookButton: {
    backgroundColor: colors.emerald,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cookButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '800',
  },
});
