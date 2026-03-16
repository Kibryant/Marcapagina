import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Radius } from '@/constants/Tokens';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 8,
  color,
  style,
}: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: theme.border },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            height: '100%',
            width: `${clampedProgress}%`,
            backgroundColor: color || theme.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
