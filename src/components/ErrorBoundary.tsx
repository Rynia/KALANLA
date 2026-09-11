import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, radius } from '../theme/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KALANLA Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={28} color={colors.risk} />
            </View>

            <Text style={styles.title}>Bir Şeyler Ters Gitti</Text>
            
            <View style={styles.safeNoticeBox}>
              <ShieldCheck size={16} color={colors.emerald} />
              <Text style={styles.safeNoticeText}>
                Dolabındaki tüm kayıtlar güvende.
              </Text>
            </View>

            <Text style={styles.desc}>
              Beklenmeyen bir arayüz hatası oluştu. Yeniden deneyerek kaldığın yerden devam edebilirsin.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleReload}
              activeOpacity={0.85}
            >
              <RefreshCw size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.riskSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  safeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.emeraldSoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  safeNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald,
  },
  desc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.terracotta,
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
