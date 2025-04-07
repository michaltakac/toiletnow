export interface Toilet {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    distance?: number; // in miles
    rating?: number; // 1-5
    isFree: boolean;
    isAccessible: boolean;
    hasChangingTable: boolean;
    lastVisited?: string; // ISO date string
    visitCount?: number;
  }
  
  export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    goal?: number;
  }
  
  export type UnitSystem = 'Miles' | 'Kilometers';