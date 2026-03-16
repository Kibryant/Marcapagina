import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Radius } from '@/constants/Tokens';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  style?: ViewStyle;
  duration?: number;
}

export function AnimatedProgressBar({
  progress,
  height = 8,
  color,
  style,
  duration = 800,
}: AnimatedProgressBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, duration, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
    height: '100%',
    backgroundColor: color || theme.primary,
    borderRadius: Radius.full,
  }));

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          height,
          borderRadius: Radius.full,
          overflow: 'hidden',
          backgroundColor: theme.border,
        },
        style,
      ]}
    >
      <Animated.View style={fillStyle} />
    </Animated.View>
  );
}
