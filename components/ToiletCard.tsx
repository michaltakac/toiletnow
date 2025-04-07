import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Star, Accessibility, DollarSign } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Toilet } from '@/types/toilet';
import { useToiletStore } from '@/store/toilet-store';

interface ToiletCardProps {
  toilet: Toilet;
  onPress?: () => void;
  showActions?: boolean;
}

export const ToiletCard: React.FC<ToiletCardProps> = ({ 
  toilet, 
  onPress,
  showActions = true
}) => {
  const { saveToilet, removeSavedToilet, savedToilets, unitSystem } = useToiletStore();
  
  const isSaved = savedToilets.some(t => t.id === toilet.id);
  
  const toggleSave = () => {
    if (isSaved) {
      removeSavedToilet(toilet.id);
    } else {
      saveToilet(toilet);
    }
  };
  
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    
    if (unitSystem === 'Kilometers') {
      return `${distance.toFixed(1)} km`;
    }
    
    return `${distance.toFixed(1)} mi`;
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MapPin color={colors.primary} size={20} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{toilet.name}</Text>
          <Text style={styles.address} numberOfLines={1}>{toilet.address}</Text>
        </View>
        <Text style={styles.distance}>{formatDistance(toilet.distance)}</Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.feature}>
          {toilet.isFree ? (
            <DollarSign color={colors.success} size={16} />
          ) : (
            <DollarSign color={colors.gray} size={16} />
          )}
          <Text style={styles.featureText}>{toilet.isFree ? 'Free' : 'Paid'}</Text>
        </View>
        
        <View style={styles.feature}>
          {toilet.isAccessible ? (
            <Accessibility color={colors.success} size={16} />
          ) : (
            <Accessibility color={colors.gray} size={16} />
          )}
          <Text style={styles.featureText}>{toilet.isAccessible ? 'Accessible' : 'Not Accessible'}</Text>
        </View>
        
        <View style={styles.feature}>
          {/* Using text instead of icon for changing table */}
          <Text style={[styles.featureText, { color: toilet.hasChangingTable ? colors.success : colors.gray }]}>
            {toilet.hasChangingTable ? '✓ Changing Table' : '✗ No Changing Table'}
          </Text>
        </View>
        
        {toilet.rating && (
          <View style={styles.feature}>
            <Star color={colors.warning} fill={colors.warning} size={16} />
            <Text style={styles.featureText}>{toilet.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      
      {showActions && (
        <TouchableOpacity 
          style={[styles.saveButton, isSaved && styles.savedButton]} 
          onPress={toggleSave}
        >
          <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  address: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 4,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  savedButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  savedButtonText: {
    color: colors.white,
  },
});