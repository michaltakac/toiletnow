import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from '@/constants/colors';

interface ToiletMascotProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
  expression?: 'normal' | 'happy' | 'panic';
}

export const ToiletMascot: React.FC<ToiletMascotProps> = ({ 
  size = 'medium',
  style,
  expression = 'normal'
}) => {
  // Using placeholder images from Unsplash for the mascot
  // In a real app, you'd use custom illustrations
  const getMascotImage = () => {
    switch (expression) {
      case 'happy':
        return 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop';
      case 'panic':
        return 'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=300&auto=format&fit=crop';
      case 'normal':
      default:
        return 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=300&auto=format&fit=crop';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          width: 60,
          height: 60,
          borderRadius: 30,
        };
      case 'large':
        return {
          width: 160,
          height: 160,
          borderRadius: 80,
        };
      case 'medium':
      default:
        return {
          width: 100,
          height: 100,
          borderRadius: 50,
        };
    }
  };

  return (
    <View style={[styles.container, getSizeStyle(), style]}>
      <Image
        source={{ uri: getMascotImage() }}
        style={[styles.image, getSizeStyle()]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  image: {
    resizeMode: 'cover',
  },
});