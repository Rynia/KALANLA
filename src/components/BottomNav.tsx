import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Package, PlusCircle, ChefHat, TrendingUp, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TabType } from '../types/models';
import { colors, spacing, radius } from '../theme/theme';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  urgentCount: number;
  onOpenPackages?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  urgentCount,
  onOpenPackages,
}) => {
  const handlePress = (tab: TabType) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      {/* Tab 1: Dolabım */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('gor')}
        activeOpacity={0.7}
      >
        <Package
          size={20}
          color={activeTab === 'gor' ? colors.emerald : colors.faint}
          strokeWidth={activeTab === 'gor' ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, activeTab === 'gor' && styles.tabLabelActive]}>
          Dolabım
        </Text>
        {urgentCount > 0 && activeTab !== 'gor' && (
          <View style={styles.dotBadge} />
        )}
      </TouchableOpacity>

      {/* Tab 2: Pişir */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('pisir')}
        activeOpacity={0.7}
      >
        <ChefHat
          size={20}
          color={activeTab === 'pisir' ? colors.emerald : colors.faint}
          strokeWidth={activeTab === 'pisir' ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, activeTab === 'pisir' && styles.tabLabelActive]}>
          Pişir
        </Text>
      </TouchableOpacity>

      {/* Quick Center Action: EKLE */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => handlePress('ekle' as any)}
        activeOpacity={0.85}
      >
        <PlusCircle size={28} color="#FFFFFF" strokeWidth={2.2} />
      </TouchableOpacity>

      {/* Tab 3: Kazancın */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('kazancin')}
        activeOpacity={0.7}
      >
        <TrendingUp
          size={20}
          color={activeTab === 'kazancin' ? colors.emerald : colors.faint}
          strokeWidth={activeTab === 'kazancin' ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, activeTab === 'kazancin' && styles.tabLabelActive]}>
          Kazancın
        </Text>
      </TouchableOpacity>

      {/* Tab 5: PAKETLER */}
      {onOpenPackages && (
        <TouchableOpacity
          style={styles.tabItem}
          onPress={onOpenPackages}
          activeOpacity={0.7}
        >
          <ShieldCheck size={20} color="#64748B" strokeWidth={1.8} />
          <Text style={styles.tabLabel}>PAKETLER</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.faint,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.emerald,
    fontWeight: '800',
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 4,
  },
  dotBadge: {
    position: 'absolute',
    top: 2,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  centerAddBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  centerAddText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A0A0E',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
