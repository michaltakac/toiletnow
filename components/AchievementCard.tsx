import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Achievement } from '@/types/toilet';
import { Lock, Smile, Zap, Flag, Crown } from 'lucide-react-native';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const renderIcon = () => {
    switch (achievement.icon) {
      case 'smile':
        return <Smile size={24} color={colors.primary} />;
      case 'zap':
        return <Zap size={24} color={colors.warning} />;
      case 'flag':
        return <Flag size={24} color={colors.primary} />;
      case 'crown':
        return <Crown size={24} color={colors.warning} />;
      case 'lock':
      default:
        return <Lock size={24} color={colors.gray} />;
    }
  };

  const progressPercentage = achievement.goal 
    ? Math.min(100, (achievement.progress || 0) / achievement.goal * 100) 
    : 0;

  return (
    <View style={[
      styles.container, 
      achievement.unlocked ? styles.unlockedContainer : styles.lockedContainer
    ]}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{achievement.title}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
        
        {achievement.goal && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` },
                  achievement.unlocked && styles.progressComplete
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress || 0}/{achievement.goal}
            </Text>
          </View>
        )}
      </View>
      
      {achievement.unlocked && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  },
  unlockedContainer: {
    borderColor: colors.primary,
  },
  lockedContainer: {
    borderColor: colors.gray,
    opacity: 0.8,
  },
  iconContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray,
    width: 40,
    textAlign: 'right',
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  completedText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});