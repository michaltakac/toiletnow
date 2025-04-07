import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Platform,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToiletStore } from '@/store/toilet-store';
import { ToiletCard } from '@/components/ToiletCard';
import { ClayButton } from '@/components/ClayButton';
import { ToiletMascot } from '@/components/ToiletMascot';
import { CountdownTimer } from '@/components/CountdownTimer';
import { colors } from '@/constants/colors';
import { MapPin, Navigation, RefreshCw } from 'lucide-react-native';
// import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getCurrentLocation } from '@/utils/location';

export default function FindToiletScreen() {
  const router = useRouter();
  const { 
    toilets, 
    setCurrentLocation, 
    currentLocation,
    setSelectedToilet,
    visitToilet,
    isLoading,
    error: storeError,
    setError,
    setLoading
  } = useToiletStore();
  
  const [error, setLocalError] = useState<string | null>(null);
  const [selectedToiletId, setSelectedToiletId] = useState<string | null>(null);
  
  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  useEffect(() => {
    // Update local error state when store error changes
    if (storeError) {
      setLocalError(storeError);
    }
  }, [storeError]);
  
  const requestLocationPermission = async () => {
    setLoading(true);
    setError(null);
    setLocalError(null);
    
    try {
      const locationResult = await getCurrentLocation();
      
      if (locationResult.error) {
        setLocalError(locationResult.error);
        setLoading(false);
        return;
      }
      
      setCurrentLocation({
        latitude: locationResult.latitude,
        longitude: locationResult.longitude
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setLocalError(errorMessage);
      setLoading(false);
      console.error(err);
    }
  };
  
  const handleSelectToilet = (id: string) => {
    const toilet = toilets.find((t: { id: string }) => t.id === id);
    if (toilet) {
      setSelectedToilet(toilet);
      setSelectedToiletId(id);
      
      // Navigate to toilet detail page
      router.push(`/toilet/${id}`);
    }
  };
  
  const openMapsWithDirections = (toilet: any) => {
    if (!currentLocation) return;
    
    const { latitude, longitude } = toilet;
    const destination = `${latitude},${longitude}`;
    const label = toilet.name;
    
    let url = '';
    
    if (Platform.OS === 'ios') {
      url = `maps:?q=${label}&ll=${destination}`;
    } else if (Platform.OS === 'android') {
      url = `geo:0,0?q=${destination}(${label})`;
    } else {
      // Web fallback
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`;
    }
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
        visitToilet(toilet.id);
      } else {
        setLocalError("Can't open maps application");
      }
    });
  };
  
  const handleNavigateToNearest = () => {
    if (toilets.length > 0) {
      const nearestToilet = toilets[0];
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Navigate to Nearest',
          `Would you like directions to ${nearestToilet.name}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Navigate',
              onPress: () => {
                openMapsWithDirections(nearestToilet);
              },
            },
          ]
        );
      } else {
        // Web fallback
        if (confirm(`Would you like directions to ${nearestToilet.name}?`)) {
          openMapsWithDirections(nearestToilet);
        }
      }
    }
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <ToiletMascot 
        expression={selectedToiletId ? 'happy' : 'normal'} 
        size="medium"
      />
      
      {selectedToiletId ? (
        <View style={styles.selectedContainer}>
          <Text style={styles.motivationalText}>
            You will make it in time, relax!
          </Text>
          <CountdownTimer />
        </View>
      ) : (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>ToiletNOW</Text>
          <Text style={styles.welcomeSubtitle}>
            Find the nearest toilet when you need it most!
          </Text>
        </View>
      )}
    </View>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ToiletMascot expression="panic" size="large" />
      <Text style={styles.emptyTitle}>No toilets found nearby</Text>
      <Text style={styles.emptySubtitle}>
        Try refreshing or expanding your search area
      </Text>
      <ClayButton
        title="Refresh"
        icon={<RefreshCw size={16} color={colors.white} />}
        onPress={requestLocationPermission}
        style={styles.refreshButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding toilets near you...</Text>
        </View>
      ) : error || storeError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || storeError}</Text>
          <ClayButton
            title="Try Again"
            onPress={requestLocationPermission}
            style={styles.errorButton}
          />
        </View>
      ) : (
        <FlatList
          data={toilets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ToiletCard
              toilet={item}
              onPress={() => handleSelectToilet(item.id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {!isLoading && !error && !storeError && toilets.length > 0 && (
        <View style={styles.buttonContainer}>
          <ClayButton
            title="Find Nearest"
            icon={<Navigation size={16} color={colors.white} />}
            onPress={handleNavigateToNearest}
            style={styles.findButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },
  selectedContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 16,
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
  refreshButton: {
    marginTop: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  findButton: {
    paddingHorizontal: 32,
  },
});