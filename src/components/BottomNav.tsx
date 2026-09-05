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
      {/* Tab 1: GÖR */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('gor')}
        activeOpacity={0.7}
      >
        <Package
          size={20}
          color={activeTab === 'gor' ? '#10B981' : '#64748B'}
          strokeWidth={activeTab === 'gor' ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, activeTab === 'gor' && styles.tabLabelActive]}>
          GÖR
        </Text>
        {urgentCount > 0 && activeTab !== 'gor' && (
          <View style={styles.dotBadge} />
        )}
      </TouchableOpacity>

      {/* Tab 2: PİŞİR */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('pisir')}
        activeOpacity={0.7}
      >
        <ChefHat
          size={20}
          color={activeTab === 'pisir' ? '#10B981' : '#64748B'}
          strokeWidth={activeTab === 'pisir' ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, activeTab === 'pisir' && styles.tabLabelActive]}>
          PİŞİR
        </Text>
      </TouchableOpacity>

      {/* Tab 3: EKLE (Center Action Button) */}
      <TouchableOpacity
        style={styles.centerAddBtn}
        onPress={() => handlePress('ekle' as any)}
        activeOpacity={0.85}
      >
        <PlusCircle size={22} color="#0A0A0E" strokeWidth={2.5} />
        <Text style={styles.centerAddText}>EKLE</Text>
      </TouchableOpacity>

      {/* Tab 4: KAZANCIN */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('kazancin')}
        activeOpacity={0.7}
      >
        <TrendingUp
          size={20}
          color={activeTab === 'kazancin' ? '#10B981' : '#64748B'}
          strokeWidth={activeTab === 'kazancin' ? 2.5 : 1.8}
        />
        <Text style={[styles.tabLabel, activeTab === 'kazancin' && styles.tabLabelActive]}>
          KAZANCIN
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
    backgroundColor: '#0E0E14',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1F1F28',
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
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#10B981',
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
