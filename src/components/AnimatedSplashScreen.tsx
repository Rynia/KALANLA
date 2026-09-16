import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationFinish,
}) => {
  // Animasyon değerleri
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;
  const textShine = useRef(new Animated.Value(0.5)).current;

  const containerScale = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    const timers: NodeJS.Timeout[] = [];

    // 1. Logo belirir (0 -> 1 sn)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isMounted) return;
      // 2. 1-2 sn bekleme ve ardından yavaş parıldayarak "Ne kaldıysa, ondan başla!" yazısı
      const t1 = setTimeout(() => {
        if (!isMounted) return;
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          // Parıldama / Işıltı efekti
          Animated.sequence([
            Animated.timing(textShine, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(textShine, {
              toValue: 0.85,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (!isMounted) return;
          // 3. Yazı 1 sn parıldayarak görünür kalır
          const t2 = setTimeout(() => {
            if (!isMounted) return;
            // 4. Logo ve içerik ekrana doğru pürüzsüzce (smooth) zoomlanır ve fade-out olur
            Animated.parallel([
              Animated.timing(containerScale, {
                toValue: 2.8,
                duration: 750,
                useNativeDriver: true,
              }),
              Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
              }),
            ]).start(() => {
              if (isMounted) {
                onAnimationFinish();
              }
            });
          }, 1100);
          timers.push(t2);
        });
      }, 700);
      timers.push(t1);
    });

    return () => {
      isMounted = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [{ scale: containerScale }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        {/* LOGO */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* BAŞLIK & SLOGAN */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Animated.Text style={[styles.appName, { opacity: textShine }]}>
            KALANLA
          </Animated.Text>
          <Animated.Text style={[styles.sloganText, { opacity: textShine }]}>
            "Ne kaldıysa, ondan başla!"
          </Animated.Text>
          <View style={styles.glowLine} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    backgroundColor: '#141210',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(209, 58, 34, 0.4)',
    shadowColor: '#D13A22',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
    backgroundColor: '#1E1B18',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    marginTop: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#FDFBF7',
    marginBottom: 8,
  },
  sloganText: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#E2D9CC',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(209, 58, 34, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  glowLine: {
    marginTop: 12,
    width: 48,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#D13A22',
    shadowColor: '#D13A22',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
