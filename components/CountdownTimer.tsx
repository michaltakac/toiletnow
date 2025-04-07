import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface CountdownTimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
  style?: any;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialMinutes = 2,
  initialSeconds = 15,
  onComplete,
  style,
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          setIsRunning(false);
          if (onComplete) onComplete();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [minutes, seconds, isRunning, onComplete]);

  const getTimeString = () => {
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getColorStyle = () => {
    if (minutes === 0 && seconds <= 30) {
      return { color: colors.accent };
    }
    return { color: colors.text };
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.time, getColorStyle()]}>{getTimeString()}</Text>
      <Text style={styles.label}>until destination!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 4,
  },
});