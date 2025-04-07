import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ToiletMascot } from '@/components/ToiletMascot';
import { colors } from '@/constants/colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    // TODO: Add custom rounded font matching the moodboard, e.g., Nunito or Quicksand
    'AppFont-Bold': require('@/assets/fonts/SpaceMono-Regular.ttf'), // Placeholder
    'AppFont-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'), // Placeholder
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading time or initial data fetching
        await new Promise(resolve => setTimeout(resolve, 2500)); 
      } catch (e) {
        console.warn(e);
      } finally {
        // Navigate after loading is complete
        router.replace('/(tabs)');
      }
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      prepare();
    }
  }, [fontsLoaded, fontError, router]);

  const getLoadingMessage = () => {
    const messages = [
      "Don't panic, relief is on the way!",
      "Locating the nearest porcelain throne...",
      "Hang tight, finding facilities!",
      "Hold on, scanning for restrooms!",
    ];
    // Simple way to pick one, could be randomized
    return messages[0]; // Use the first message for now as per PRD example
  };

  if (!fontsLoaded && !fontError) {
    return null; // Render nothing until fonts are loaded or error occurs
  }

  return (
    <View style={styles.container}>
      <ToiletMascot expression="normal" size="large" />
      <Text style={styles.title}>ToiletNOW</Text>
      <Text style={styles.tagline}>{getLoadingMessage()}</Text>
      <ActivityIndicator size="small" color={colors.white} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary, // Use primary color from moodboard
    padding: 20,
  },
  title: {
    fontSize: 48,
    // fontFamily: 'AppFont-Bold', // Uncomment when font is added
    fontWeight: 'bold', // Fallback
    color: colors.white,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    // fontFamily: 'AppFont-Regular', // Uncomment when font is added
    color: colors.secondary, // Use secondary/lighter color
    textAlign: 'center',
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
});