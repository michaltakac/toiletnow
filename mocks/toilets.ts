import { Achievement } from '@/types/toilet';

export const mockAchievements: Achievement[] = [
  {
    id: 'first_plush',
    title: 'First Plush',
    description: 'Visit your first toilet',
    icon: 'smile',
    unlocked: false,
    progress: 0,
    goal: 1,
  },
  {
    id: 'speedy_peeper',
    title: 'Speedy Peeper',
    description: 'Get to the toilet in under 3 minutes',
    icon: 'zap',
    unlocked: false,
    progress: 0,
    goal: 1,
  },
  {
    id: 'marathon',
    title: 'Marathon',
    description: 'Use 3 toilets in 7 days',
    icon: 'flag',
    unlocked: false,
    progress: 0,
    goal: 3,
  },
  {
    id: 'halfway_there',
    title: 'Halfway There',
    description: 'Find 50 toilets',
    icon: 'lock',
    unlocked: false,
    progress: 0,
    goal: 50,
  },
  {
    id: 'golden_throne',
    title: 'Golden Throne',
    description: 'Visit a 5-star rated toilet',
    icon: 'crown',
    unlocked: false,
    progress: 0,
    goal: 1,
  },
];