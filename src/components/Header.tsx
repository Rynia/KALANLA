import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '../theme/theme';

interface HeaderProps {
  activeTab: string;
  urgentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ urgentCount }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>KALANLA</Text>
          <View style={styles.osBadge}>
            <Text style={styles.osBadgeText}>RYNIA // OS</Text>
          </View>
        </View>
        <Text style={styles.tagline}>"Ne kaldıysa, ondan başla."</Text>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.clockRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.clockText}>{time}</Text>
        </View>
        {urgentCount > 0 ? (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>⚡ {urgentCount} RİSKTE</Text>
          </View>
        ) : (
          <View style={styles.safeBadge}>
            <Text style={styles.safeBadgeText}>✓ GÜVENLİ</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0E',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F24',
  },
  leftCol: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#F8FAFC',
  },
  osBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#1C1C24',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#262633',
  },
  osBadgeText: {
    color: '#94A3B8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  tagline: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  clockText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94A3B8',
    fontWeight: '700',
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  urgentBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  safeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  safeBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
});
