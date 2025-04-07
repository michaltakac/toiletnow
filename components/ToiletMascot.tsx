import React from 'react';
import { Image, StyleSheet, ImageProps, StyleProp, ViewStyle } from 'react-native';

// Placeholder URLs for different mascot expressions
// TODO: Replace with actual exported 3D clay mascot images
const mascotImages = {
  normal: 'https://img.freepik.com/premium-photo/toilet-paper-roll-character-with-big-eyes-3d-rendering_983490-27271.jpg?w=740', // Replace with appropriate image URL
  happy: 'https://img.freepik.com/premium-photo/toilet-paper-roll-character-with-big-eyes-smiling-3d-rendering_983490-27278.jpg?w=740', // Replace with appropriate image URL
  panic: 'https://img.freepik.com/premium-photo/scared-toilet-paper-roll-character-with-wide-eyes-3d-rendering_983490-27280.jpg?w=740', // Replace with appropriate image URL
  celebrate: 'https://img.freepik.com/premium-photo/happy-toilet-paper-roll-character-jumping-joy-3d-rendering_983490-27275.jpg?w=740', // Replace with appropriate image URL
  thinking: 'https://img.freepik.com/premium-photo/toilet-paper-roll-character-with-thoughtful-expression-3d-rendering_983490-27285.jpg?w=740', // Replace with appropriate image URL
  worried: 'https://img.freepik.com/premium-photo/worried-toilet-paper-roll-character-with-furrowed-brow-3d-rendering_983490-27282.jpg?w=740', // Replace with appropriate image URL
};

type MascotExpression = keyof typeof mascotImages;
type MascotSize = 'small' | 'medium' | 'large';

interface ToiletMascotProps extends Omit<ImageProps, 'source' | 'style'> {
  expression?: MascotExpression;
  size?: MascotSize;
  style?: StyleProp<ViewStyle>; // Allow passing ViewStyle for positioning container
}

const sizeMap: Record<MascotSize, number> = {
  small: 60,
  medium: 120,
  large: 200,
};

export function ToiletMascot({ 
  expression = 'normal', 
  size = 'medium', 
  style,
  ...rest 
}: ToiletMascotProps) {
  const imageSize = sizeMap[size];
  const imageUrl = mascotImages[expression] || mascotImages.normal;

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[
        styles.image, 
        { width: imageSize, height: imageSize },
        style // Apply passed styles to the Image directly if needed for specific image styling
      ]}
      resizeMode="contain" 
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    // Basic styling, can be overridden by passed style prop if necessary
  },
});