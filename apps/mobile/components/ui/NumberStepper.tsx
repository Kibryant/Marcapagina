import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  label,
}: NumberStepperProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const handleDecrement = () => {
    if (min !== undefined && value <= min) return;
    onChange(value - step);
  };

  const handleIncrement = () => {
    if (max !== undefined && value >= max) return;
    onChange(value + step);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.mutedForeground }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.stepper,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Pressable
          onPress={handleDecrement}
          style={({ pressed }) => [
            styles.button,
            { borderColor: theme.border },
            pressed && { backgroundColor: 'rgba(0,0,0,0.05)' },
          ]}
        >
          <Minus size={20} color={theme.text} />
        </Pressable>

        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        </View>

        <Pressable
          onPress={handleIncrement}
          style={({ pressed }) => [
            styles.button,
            { borderColor: theme.border },
            pressed && { backgroundColor: 'rgba(0,0,0,0.05)' },
          ]}
        >
          <Plus size={20} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    borderWidth: 1,
    height: 64,
    overflow: 'hidden',
  },
  button: {
    width: 64,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0,
    borderLeftWidth: 0,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
});
