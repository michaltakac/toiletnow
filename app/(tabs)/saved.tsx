import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToiletStore } from '@/store/toilet-store';
import { ToiletCard } from '@/components/ToiletCard';
import { ToiletMascot } from '@/components/ToiletMascot';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function SavedToiletsScreen() {
  const router = useRouter();
  const { savedToilets, setSelectedToilet } = useToiletStore();
  
  const handleSelectToilet = (id: string) => {
    const toilet = savedToilets.find((t: { id: string }) => t.id === id);
    if (toilet) {
      setSelectedToilet(toilet);
      // In a real app, we would navigate to a details screen
      // For now, we'll just log it
      console.log('Selected toilet:', toilet);
    }
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ToiletMascot expression="normal" size="large" />
      <Text style={styles.emptyTitle}>No saved toilets yet</Text>
      <Text style={styles.emptySubtitle}>
        Save your favorite toilets for quick access when you need them
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={savedToilets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ToiletCard
            toilet={item}
            onPress={() => handleSelectToilet(item.id)}
            showActions={false}
          />
        )}
        ListEmptyComponent={renderEmptyState}
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
});