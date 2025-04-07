import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToiletStore } from '@/store/toilet-store';
import { SettingsItem } from '@/components/SettingsItem';
import { colors } from '@/constants/colors';
import { 
  Bell, 
  Ruler, 
  Palette, 
  Info, 
  Award, 
  Trash2, 
  Heart 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { 
    unitSystem, 
    setUnitSystem, 
    notificationsEnabled, 
    setNotificationsEnabled,
    appearance,
    setAppearance,
    resetAchievements
  } = useToiletStore();
  
  const handleResetAchievements = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to reset all achievements?')) {
        resetAchievements();
      }
    } else {
      Alert.alert(
        'Reset Achievements',
        'Are you sure you want to reset all achievements?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            onPress: () => resetAchievements(),
            style: 'destructive',
          },
        ]
      );
    }
  };
  
  const handleUnitSystemChange = () => {
    setUnitSystem(unitSystem === 'Miles' ? 'Kilometers' : 'Miles');
  };
  
  const handleAppearanceChange = () => {
    const options = ['System', 'Light', 'Dark'];
    const currentIndex = options.indexOf(appearance);
    const nextIndex = (currentIndex + 1) % options.length;
    setAppearance(options[nextIndex] as 'System' | 'Light' | 'Dark');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingsItem
            title="Notifications"
            icon={<Bell size={20} color={colors.primary} />}
            isSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          
          <SettingsItem
            title="Units"
            icon={<Ruler size={20} color={colors.primary} />}
            value={unitSystem}
            onPress={handleUnitSystemChange}
          />
          
          <SettingsItem
            title="Appearance"
            icon={<Palette size={20} color={colors.primary} />}
            value={appearance}
            onPress={handleAppearanceChange}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <SettingsItem
            title="Reset Achievements"
            icon={<Award size={20} color={colors.accent} />}
            onPress={handleResetAchievements}
          />
          
          <SettingsItem
            title="Clear Saved Toilets"
            icon={<Trash2 size={20} color={colors.accent} />}
            onPress={() => {
              // Implementation would go here
              if (Platform.OS !== 'web') {
                Alert.alert('Not implemented', 'This feature is not implemented in the demo');
              } else {
                alert('This feature is not implemented in the demo');
              }
            }}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingsItem
            title="About ToiletNOW"
            icon={<Info size={20} color={colors.primary} />}
            onPress={() => {
              // Implementation would go here
              if (Platform.OS !== 'web') {
                Alert.alert('About ToiletNOW', 'ToiletNOW v1.0.0\nThe #1 app for your #2 needs!');
              } else {
                alert('ToiletNOW v1.0.0\nThe #1 app for your #2 needs!');
              }
            }}
          />
          
          <SettingsItem
            title="Rate the App"
            icon={<Heart size={20} color={colors.primary} />}
            onPress={() => {
              // Implementation would go here
              if (Platform.OS !== 'web') {
                Alert.alert('Not implemented', 'This feature is not implemented in the demo');
              } else {
                alert('This feature is not implemented in the demo');
              }
            }}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ToiletNOW v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            The #1 app for your #2 needs!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    paddingLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: colors.gray,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
});