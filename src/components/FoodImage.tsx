// src/components/FoodImage.tsx
// Yerel require ve remote uri kaynaklarını otomatik ayrıştırıp render eden optimize görsel bileşeni
import React from 'react';
import { Image, ImageStyle, StyleProp, View, Text, StyleSheet } from 'react-native';
import { resolveFoodImageSource } from '../utils/foodImageResolver';

interface FoodImageProps {
  source?: any;
  name?: string;
  category?: string;
  style?: StyleProp<ImageStyle>;
  defaultEmoji?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  source,
  name,
  category,
  style,
  defaultEmoji = '🍲',
}) => {
  const imageSource = resolveFoodImageSource(source, name, category);

  if (!imageSource) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderEmoji}>{defaultEmoji}</Text>
      </View>
    );
  }

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1E1B18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 22,
  },
});
