import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Alert,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToiletStore } from '@/store/toilet-store';
import { ToiletMascot } from '@/components/ToiletMascot';
import { ClayButton } from '@/components/ClayButton';
import { colors } from '@/constants/colors';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Clock, 
  DollarSign, 
  Accessibility,
  Bookmark,
  Share2
} from 'lucide-react-native';

export default function ToiletDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { 
    toilets, 
    savedToilets,
    saveToilet,
    removeSavedToilet,
    visitToilet,
    currentLocation,
    unitSystem
  } = useToiletStore();
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Find the toilet by ID
  const toilet = toilets.find((t: { id: string }) => t.id === id);
  
  // Check if toilet is saved
  const isSaved = savedToilets.some((t: { id: string }) => t.id === id);
  
  // Handle if toilet not found
  if (!toilet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Toilet not found</Text>
          <ClayButton
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedToilet(toilet.id);
    } else {
      saveToilet(toilet);
    }
  };
  
  const handleShare = () => {
    // In a real app, we would use the Share API
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Share',
        `Sharing "${toilet.name}" would open the share dialog in a real app.`
      );
    } else {
      alert(`Sharing "${toilet.name}" would open the share dialog in a real app.`);
    }
  };
  
  const handleNavigate = () => {
    if (!currentLocation) {
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Unable to get your current location');
      } else {
        alert('Unable to get your current location');
      }
      return;
    }
    
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
        visitToilet(toilet.id);
        Linking.openURL(url);
      } else {
        if (Platform.OS !== 'web') {
          Alert.alert('Error', "Can't open maps application");
        } else {
          alert("Can't open maps application");
        }
      }
    });
  };
  
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    
    if (unitSystem === 'Kilometers') {
      return `${distance.toFixed(1)} km`;
    }
    
    return `${distance.toFixed(1)} mi`;
  };
  
  // Generate a realistic description based on toilet properties
  const generateDescription = () => {
    const timeOpen = Math.floor(Math.random() * 3) + 6; // 6-8 AM
    const timeClose = Math.floor(Math.random() * 3) + 9; // 9-11 PM
    
    const stalls = Math.floor(Math.random() * 5) + 1;
    const sinks = Math.floor(Math.random() * 3) + 1;
    
    const cleanliness = ['well-maintained', 'regularly cleaned', 'spotless', 'clean', 'adequately maintained'][Math.floor(Math.random() * 5)];
    
    let description = `This ${toilet.isFree ? 'free' : 'paid'} toilet is located at ${toilet.address}. It is ${toilet.isAccessible ? '' : 'not '}wheelchair accessible and ${toilet.hasChangingTable ? 'has' : 'does not have'} a changing table.
    
The facility is ${cleanliness} with ${stalls} ${stalls === 1 ? 'stall' : 'stalls'} and ${sinks} ${sinks === 1 ? 'sink' : 'sinks'} available.

Opening hours: ${timeOpen}:00 AM - ${timeClose}:00 PM daily.`;

    if (toilet.rating && toilet.rating > 4) {
      description += '\n\nThis is one of the highest-rated toilets in the area!';
    }
    
    if (!toilet.isFree) {
      const price = (Math.floor(Math.random() * 3) + 1) * 0.5;
      description += `\n\nUsage fee: $${price.toFixed(2)}`;
    }

    return description;
  };
  
  const description = generateDescription();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ToiletMascot 
            expression="happy" 
            size="medium"
          />
          <Text style={styles.title}>{toilet.name}</Text>
          <View style={styles.addressContainer}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.address}>{toilet.address}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.statValue}>
              {formatDistance(toilet.distance)}
            </Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          
          <View style={styles.statItem}>
            <Star size={20} color={colors.warning} />
            <Text style={styles.statValue}>
              {toilet.rating ? toilet.rating.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <DollarSign size={20} color={toilet.isFree ? colors.success : colors.gray} />
            <Text style={styles.statValue}>
              {toilet.isFree ? 'Free' : 'Paid'}
            </Text>
            <Text style={styles.statLabel}>Cost</Text>
          </View>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={[styles.featureItem, toilet.isAccessible ? styles.featureEnabled : styles.featureDisabled]}>
              <Accessibility size={20} color={toilet.isAccessible ? colors.success : colors.gray} />
              <Text style={styles.featureText}>
                {toilet.isAccessible ? 'Accessible' : 'Not Accessible'}
              </Text>
            </View>
            
            <View style={[styles.featureItem, toilet.hasChangingTable ? styles.featureEnabled : styles.featureDisabled]}>
              <Text style={[styles.featureIcon, { color: toilet.hasChangingTable ? colors.success : colors.gray }]}>
                {toilet.hasChangingTable ? '✓' : '✗'}
              </Text>
              <Text style={styles.featureText}>
                {toilet.hasChangingTable ? 'Changing Table' : 'No Changing Table'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {showFullDescription ? description : `${description.substring(0, 100)}...`}
          </Text>
          <TouchableOpacity 
            onPress={() => setShowFullDescription(!showFullDescription)}
            style={styles.readMoreButton}
          >
            <Text style={styles.readMoreText}>
              {showFullDescription ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.visitInfo}>
          <Text style={styles.sectionTitle}>Visit Information</Text>
          <View style={styles.visitRow}>
            <Text style={styles.visitLabel}>Last Visited:</Text>
            <Text style={styles.visitValue}>
              {toilet.lastVisited 
                ? new Date(toilet.lastVisited).toLocaleDateString() 
                : 'Never'}
            </Text>
          </View>
          <View style={styles.visitRow}>
            <Text style={styles.visitLabel}>Visit Count:</Text>
            <Text style={styles.visitValue}>
              {toilet.visitCount || 0} times
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleToggleSave}
        >
          <Bookmark 
            size={24} 
            color={isSaved ? colors.primary : colors.gray}
            fill={isSaved ? colors.primary : 'transparent'}
          />
          <Text style={styles.actionText}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share2 size={24} color={colors.gray} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <ClayButton
          title="Navigate"
          icon={<Navigation size={16} color={colors.white} />}
          onPress={handleNavigate}
          style={styles.navigateButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 0.48,
    borderWidth: 1,
  },
  featureEnabled: {
    borderColor: colors.success,
  },
  featureDisabled: {
    borderColor: colors.lightGray,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    color: colors.text,
  },
  featureIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: '600',
  },
  visitInfo: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  visitLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  visitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  navigateButton: {
    flex: 1,
    marginLeft: 'auto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.accent,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
});