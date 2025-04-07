import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toilet, Achievement, UnitSystem } from '@/types/toilet';
import { mockAchievements } from '@/mocks/toilets';
import { generateToiletsNearLocation, calculateDistance } from '@/utils/location';

interface ToiletState {
  toilets: Toilet[];
  savedToilets: Toilet[];
  achievements: Achievement[];
  currentLocation: { latitude: number; longitude: number } | null;
  selectedToilet: Toilet | null;
  isLoading: boolean;
  error: string | null;
  unitSystem: UnitSystem;
  notificationsEnabled: boolean;
  appearance: 'System' | 'Light' | 'Dark';
  
  // Actions
  saveToilet: (toilet: Toilet) => void;
  removeSavedToilet: (id: string) => void;
  setCurrentLocation: (location: { latitude: number; longitude: number }) => void;
  setSelectedToilet: (toilet: Toilet | null) => void;
  visitToilet: (id: string) => void;
  setUnitSystem: (system: UnitSystem) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAppearance: (appearance: 'System' | 'Light' | 'Dark') => void;
  resetAchievements: () => void;
  fetchToiletsNearby: (latitude: number, longitude: number) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useToiletStore = create<ToiletState>()(
  persist(
    (set, get) => ({
      toilets: [],
      savedToilets: [],
      achievements: mockAchievements,
      currentLocation: null,
      selectedToilet: null,
      isLoading: false,
      error: null,
      unitSystem: 'Miles',
      notificationsEnabled: true,
      appearance: 'System',
      
      saveToilet: (toilet) => {
        const savedToilets = get().savedToilets;
        if (!savedToilets.some(t => t.id === toilet.id)) {
          set({ savedToilets: [...savedToilets, toilet] });
        }
      },
      
      removeSavedToilet: (id) => {
        set({ savedToilets: get().savedToilets.filter(t => t.id !== id) });
      },
      
      setCurrentLocation: (location) => {
        set({ currentLocation: location });
        
        // Fetch toilets near this location
        get().fetchToiletsNearby(location.latitude, location.longitude);
      },
      
      setSelectedToilet: (toilet) => {
        set({ selectedToilet: toilet });
      },
      
      visitToilet: (id) => {
        // Update toilet visit count
        const updatedToilets = get().toilets.map(toilet => 
          toilet.id === id 
            ? { 
                ...toilet, 
                visitCount: (toilet.visitCount || 0) + 1,
                lastVisited: new Date().toISOString()
              } 
            : toilet
        );
        
        // Check for achievements
        const achievements = [...get().achievements];
        
        // First Plush achievement
        const firstPlushAchievement = achievements.find(a => a.id === 'first_plush');
        if (firstPlushAchievement && !firstPlushAchievement.unlocked) {
          firstPlushAchievement.unlocked = true;
          firstPlushAchievement.progress = 1;
        }
        
        // Marathon achievement - count unique toilets visited in last 7 days
        const marathonAchievement = achievements.find(a => a.id === 'marathon');
        if (marathonAchievement) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const recentToilets = updatedToilets.filter(t => 
            t.lastVisited && new Date(t.lastVisited) >= sevenDaysAgo
          );
          
          marathonAchievement.progress = recentToilets.length;
          if (marathonAchievement.progress >= (marathonAchievement.goal || 3)) {
            marathonAchievement.unlocked = true;
          }
        }
        
        // Halfway There achievement
        const halfwayAchievement = achievements.find(a => a.id === 'halfway_there');
        if (halfwayAchievement) {
          halfwayAchievement.progress = updatedToilets.filter(t => t.visitCount && t.visitCount > 0).length;
          if (halfwayAchievement.progress >= (halfwayAchievement.goal || 50)) {
            halfwayAchievement.unlocked = true;
          }
        }
        
        // Golden Throne achievement
        const goldenThroneAchievement = achievements.find(a => a.id === 'golden_throne');
        if (goldenThroneAchievement && !goldenThroneAchievement.unlocked) {
          const visitedHighRatedToilet = updatedToilets.some(t => 
            t.id === id && t.rating && t.rating >= 4.5 && t.visitCount && t.visitCount > 0
          );
          
          if (visitedHighRatedToilet) {
            goldenThroneAchievement.unlocked = true;
            goldenThroneAchievement.progress = 1;
          }
        }
        
        set({ 
          toilets: updatedToilets,
          achievements: achievements
        });
      },
      
      setUnitSystem: (system) => {
        const currentSystem = get().unitSystem;
        
        // If changing unit system, update all distances
        if (system !== currentSystem) {
          const toilets = get().toilets.map(toilet => {
            if (toilet.distance) {
              // Convert miles to km or km to miles
              const newDistance = system === 'Kilometers' 
                ? toilet.distance * 1.60934  // Miles to km
                : toilet.distance / 1.60934; // Km to miles
                
              return { ...toilet, distance: parseFloat(newDistance.toFixed(2)) };
            }
            return toilet;
          });
          
          set({ unitSystem: system, toilets });
        } else {
          set({ unitSystem: system });
        }
      },
      
      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
      },
      
      setAppearance: (appearance) => {
        set({ appearance: appearance });
      },
      
      resetAchievements: () => {
        set({ achievements: mockAchievements });
      },
      
      fetchToiletsNearby: (latitude, longitude) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          // For this demo, we'll generate random toilets near the location
          const toilets = generateToiletsNearLocation(latitude, longitude, 15, 10);
          
          // If we have saved toilets, make sure they're included and marked as saved
          const savedToilets = get().savedToilets;
          
          // Update distances for saved toilets based on new location
          const updatedSavedToilets = savedToilets.map(toilet => {
            const distance = calculateDistance(
              latitude, 
              longitude, 
              toilet.latitude, 
              toilet.longitude,
              get().unitSystem === 'Kilometers'
            );
            
            return { ...toilet, distance };
          });
          
          // Make sure saved toilets are in the list
          const combinedToilets = [...toilets];
          
          updatedSavedToilets.forEach(savedToilet => {
            if (!combinedToilets.some(t => t.id === savedToilet.id)) {
              combinedToilets.push(savedToilet);
            }
          });
          
          // Sort by distance
          const sortedToilets = combinedToilets.sort((a, b) => 
            (a.distance || Infinity) - (b.distance || Infinity)
          );
          
          set({ 
            toilets: sortedToilets,
            savedToilets: updatedSavedToilets,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching toilets:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch toilets',
            isLoading: false 
          });
        }
      },
      
      setError: (error) => {
        set({ error });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      }
    }),
    {
      name: 'toilet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedToilets: state.savedToilets,
        achievements: state.achievements,
        unitSystem: state.unitSystem,
        notificationsEnabled: state.notificationsEnabled,
        appearance: state.appearance,
      }),
    }
  )
);