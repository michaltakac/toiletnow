import * as Location from 'expo-location';
import { Toilet } from '@/types/toilet';

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number,
  inKilometers = false
): number {
  const R = inKilometers ? 6371 : 3958.8; // Radius of the Earth in km or miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Generate random toilets around a location
export function generateToiletsNearLocation(
  latitude: number,
  longitude: number,
  count: number = 10,
  maxDistance: number = 5 // miles
): Toilet[] {
  const toilets: Toilet[] = [];
  
  // Names and features for random toilets
  const names = [
    'Central Park Restroom',
    'City Mall Facilities',
    'Downtown Public Toilet',
    'Green Park Restroom',
    'Train Station Facilities',
    'Bus Terminal Restroom',
    'Library Toilet',
    'Museum Facilities',
    'Coffee Shop Restroom',
    'Gas Station Toilet',
    'Fast Food Restroom',
    'Hotel Lobby Facilities',
    'Beach Public Toilet',
    'Shopping Center Restroom',
    'Hospital Visitor Facilities'
  ];
  
  const streets = [
    'Main St',
    'Broadway',
    'Park Ave',
    'Oak Lane',
    'Maple Rd',
    'Washington Blvd',
    'Lincoln Ave',
    'Market St',
    'River Rd',
    'Highland Ave',
    'Center St',
    'Church St',
    'Lake Dr',
    'Pine St',
    'Cedar Ln'
  ];
  
  // Generate random toilets
  for (let i = 0; i < count; i++) {
    // Random offset in miles (converted to lat/lng)
    // 1 degree of latitude is approximately 69 miles
    // 1 degree of longitude varies, but at 40° latitude it's about 53 miles
    const latOffset = (Math.random() * 2 - 1) * (maxDistance / 69);
    const lngOffset = (Math.random() * 2 - 1) * (maxDistance / 53);
    
    const toiletLat = latitude + latOffset;
    const toiletLng = longitude + lngOffset;
    
    // Calculate actual distance using Haversine formula
    const distance = calculateDistance(latitude, longitude, toiletLat, toiletLng);
    
    // Only include if within maxDistance
    if (distance <= maxDistance) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const streetNumber = Math.floor(Math.random() * 1000) + 1;
      
      toilets.push({
        id: `toilet-${i}`,
        name: randomName,
        address: `${streetNumber} ${randomStreet}, ${distance.toFixed(1)} miles away`,
        latitude: toiletLat,
        longitude: toiletLng,
        distance: distance,
        rating: Math.floor(Math.random() * 40 + 10) / 10, // Random rating between 1.0 and 5.0
        isFree: Math.random() > 0.3, // 70% chance of being free
        isAccessible: Math.random() > 0.2, // 80% chance of being accessible
        hasChangingTable: Math.random() > 0.5, // 50% chance of having changing table
        visitCount: Math.floor(Math.random() * 5), // Random visit count between 0 and 4
      });
    }
  }
  
  // Sort by distance
  return toilets.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// Get current location with error handling
export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      error: null
    };
  } catch (error) {
    console.error('Error getting location:', error);
    
    // Return default location (New York City) if error
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      error: error instanceof Error ? error.message : 'Unknown error getting location'
    };
  }
}