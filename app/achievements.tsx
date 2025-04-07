import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToiletStore } from '@/store/toilet-store';
import { AchievementCard } from '@/components/AchievementCard';
import { ToiletMascot } from '@/components/ToiletMascot';
import { colors } from '@/constants/colors';

export default function AchievementsScreen() {
  const { achievements } = useToiletStore();
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  
  const renderHeader = () => (
    <View style={styles.header}>
      <ToiletMascot 
        expression={unlockedCount > 0 ? 'happy' : 'normal'} 
        size="small"
        style={styles.mascot}
      />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Your Achievements</Text>
        <Text style={styles.headerSubtitle}>
          {unlockedCount} of {totalCount} unlocked
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AchievementCard achievement={item} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  mascot: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondary,
  },
  listContent: {
    padding: 16,
  },
});