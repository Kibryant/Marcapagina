import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { AnimatedProgressBar } from './AnimatedProgressBar';

interface GoalCardProps {
  title: string;
  currentValue: number;
  goalValue: number;
  unit: string;
}

export function GoalCard({
  title,
  currentValue,
  goalValue,
  unit,
}: GoalCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const progress = (currentValue / goalValue) * 100;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.mutedForeground }]}>
        {title}
      </Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.text }]}>
          {currentValue}
          <Text style={styles.unit}>
            {' '}
            / {goalValue} {unit}
          </Text>
        </Text>
        <Text style={[styles.percent, { color: theme.primary }]}>
          {Math.round(progress)}%
        </Text>
      </View>
      <AnimatedProgressBar progress={progress} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 28, // Exception: Very large number, might need xxxl later
    fontWeight: '700',
  },
  unit: {
    fontSize: FontSize.lg,
    fontWeight: '500',
    opacity: 0.5,
  },
  percent: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
});
