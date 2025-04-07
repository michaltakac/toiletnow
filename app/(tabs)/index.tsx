import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
  AppState,
  StyleProp,
  ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToiletStore } from '@/store/toilet-store';
import { ToiletCard } from '@/components/ToiletCard';
import { ClayButton } from '@/components/ClayButton';
import { ToiletMascot } from '@/components/ToiletMascot';
import { CountdownTimer } from '@/components/CountdownTimer';
import { colors } from '@/constants/colors';
import { Navigation, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps'; // Import Mapbox
import { useRouter } from 'expo-router';
// Removed getCurrentLocation import as we'll handle location directly here

// TODO: Move to .env file later
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || ''); 

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
    setError: setStoreError,
    setLoading
  } = useToiletStore();
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedToiletId, setSelectedToiletId] = useState<string | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const appState = useRef(AppState.currentState);

  // Handle App State changes to re-check permissions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, re-check permissions
        checkLocationPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    if (locationPermissionGranted) {
      fetchCurrentLocation();
    }
  }, [locationPermissionGranted]);

  useEffect(() => {
    if (currentLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        zoomLevel: 14, // Adjust zoom level as needed
        animationDuration: 1000,
      });
    }
  }, [currentLocation]);
  
  useEffect(() => {
    if (storeError) {
      setLocalError(storeError);
    }
  }, [storeError]);

  const checkLocationPermission = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      setLocationPermissionGranted(true);
    } else {
      setLocationPermissionGranted(false);
      // Optionally request permission immediately or show a button/message
      requestLocationPermission(); 
    }
  };
  
  const requestLocationPermission = async () => {
    setLoading(true);
    setStoreError(null);
    setLocalError(null);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocalError('Location permission denied. Please enable it in settings to find toilets.');
      setLocationPermissionGranted(false);
      setLoading(false);
      // Guide user to settings
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Permission Denied',
          'ToiletNOW needs location access to find nearby toilets. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return;
    }
    setLocationPermissionGranted(true);
    // Location will be fetched by the useEffect hook watching locationPermissionGranted
  };

  const fetchCurrentLocation = async () => {
    setLoading(true);
    setStoreError(null);
    setLocalError(null);
    try {
      // Using a higher accuracy might take longer but is better for navigation
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }); 
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setLocalError(errorMessage);
      setLoading(false);
      console.error(err);
    }
  }
  
  const handleSelectToilet = (id: string) => {
    const toilet = toilets.find((t: { id: string }) => t.id === id);
    if (toilet) {
      setSelectedToilet(toilet);
      setSelectedToiletId(id);
      // Navigate to toilet detail page or update map focus
      // router.push(`/toilet/${id}`); // Keep commented for now
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [toilet.longitude, toilet.latitude],
          zoomLevel: 16,
          animationDuration: 1000,
        });
      }
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
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
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
      const nearestToilet = toilets[0]; // Assuming toilets are sorted by distance
      
      // Confirmation Dialog
      const navigateAction = () => openMapsWithDirections(nearestToilet);
      const message = `Would you like directions to ${nearestToilet.name}?`;
      if (Platform.OS !== 'web') {
        Alert.alert('Navigate to Nearest', message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Navigate', onPress: navigateAction },
        ]);
      } else {
        if (confirm(message)) {
          navigateAction();
        }
      }
    }
  };

  // Function to render toilet markers on the map
  const renderToiletMarkers = () => {
    // TODO: Fetch and display only the 3 nearest OPEN toilets
    // For now, displays all toilets from the store
    return toilets.map((toilet: any) => (
      <Mapbox.PointAnnotation
        key={toilet.id}
        id={toilet.id}
        coordinate={[toilet.longitude, toilet.latitude]}
        onSelected={() => handleSelectToilet(toilet.id)}
      >
        {/* Custom marker view - use ToiletMascot or a custom clay pin */}
        <View style={styles.markerContainer}>
           {/* Basic Pin for now */}
           <View style={styles.markerPin} />
        </View>
        <Mapbox.Callout title={toilet.name} />
      </Mapbox.PointAnnotation>
    ));
  };
  
  // Simplified header for now, focusing on map
  const renderHeader = () => null; 

  // Simplified empty state
  const renderEmptyState = () => (
    !isLoading && (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>No toilets found nearby yet.</Text>
      </View>
    )
  );

  // Permission Denied View
  if (!locationPermissionGranted && !isLoading && localError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <ToiletMascot expression="worried" size="large" />
          <Text style={styles.errorText}>{localError}</Text>
          <ClayButton
            title="Grant Location Permission"
            onPress={requestLocationPermission}
            style={styles.errorButton}
          />
           <ClayButton
            title="Open Settings"
            onPress={() => Linking.openSettings()}
            style={[styles.errorButton, { marginTop: 10 }]} // Add some space
            variant="secondary" // Example of using a secondary style
          />
        </View>
      </SafeAreaView>
    );
  }

  // Loading State View
  if (isLoading || (!currentLocation && !localError)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {locationPermissionGranted ? 'Finding your location...' : 'Waiting for location permission...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main Map View
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}> 
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street} // TODO: Replace with custom Clay style URL
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, left: 8 }} // Position attribution discreetly
      >
        <Mapbox.Camera
          ref={cameraRef}
          // Initial center might be a default or null until location is found
          centerCoordinate={currentLocation ? [currentLocation.longitude, currentLocation.latitude] : undefined}
          zoomLevel={currentLocation ? 14 : 4} // Start zoomed out if no location
        />
        {currentLocation && (
          <Mapbox.UserLocation 
            visible={true} 
            showsUserHeadingIndicator={true}
            // Custom user location icon could be added here
          />
        )}
        {renderToiletMarkers()}
        {/* TODO: Add route line rendering here */} 
      </Mapbox.MapView>

      {/* Button to navigate to nearest */} 
      {toilets.length > 0 && (
         <View style={styles.buttonContainer}>
           <ClayButton
             title="Directions to Nearest"
             icon={<Navigation size={18} color={colors.white} />}
             onPress={handleNavigateToNearest}
             style={styles.findButton}
           />
         </View>
       )}
      
      {/* Display error messages if any */}
      {(localError || storeError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{localError || storeError}</Text>
        </View>
      )}

      {/* TODO: Reintroduce header/selected state UI later */}
      {/* {renderHeader()} */}
      
      {/* TODO: Integrate FlatList/ToiletCard view later if needed */}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background, // Or primary color if preferred
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
    backgroundColor: colors.background, 
  },
  errorText: {
    fontSize: 16,
    color: colors.accent, // Use accent color for errors
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  errorButton: {
     width: '80%',
     marginTop: 10,
  },
  messageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: colors.gray,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30, // Adjusted for safe area
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  findButton: {
    // Add specific styling if needed, e.g., width
    paddingHorizontal: 24, // Make it slightly wider
    paddingVertical: 14, // Make it taller
  },
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 100, 100, 0.7)', // Temporary marker color
    borderRadius: 15,
    borderColor: colors.white,
    borderWidth: 2,
  },
  markerPin: {
     width: 10,
     height: 10,
     borderRadius: 5,
     backgroundColor: colors.primary,
  },
  errorBanner: {
    position: 'absolute',
    top: 50, // Position below potential notch/status bar
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)', // Red error background
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorBannerText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Remove or comment out unused styles for clarity
  /*
  header: { ... },
  welcomeContainer: { ... },
  welcomeTitle: { ... },
  welcomeSubtitle: { ... },
  selectedContainer: { ... },
  motivationalText: { ... },
  listContent: { ... },
  emptyContainer: { ... },
  emptyTitle: { ... },
  emptySubtitle: { ... },
  refreshButton: { ... },
  */
});