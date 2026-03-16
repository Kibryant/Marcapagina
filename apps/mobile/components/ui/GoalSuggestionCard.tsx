import { Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { Button } from './Button';

interface GoalSuggestionCardProps {
  suggestedDaily: number;
  suggestedMonthly: number;
  reason: string;
  isApplying: boolean;
  onApply: () => void;
}

export function GoalSuggestionCard({
  suggestedDaily,
  suggestedMonthly,
  reason,
  isApplying,
  onApply,
}: GoalSuggestionCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Zap size={20} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Recomendação da IA</Text>
      </View>

      <Text style={[styles.reason, { color: theme.mutedForeground }]}>{reason}</Text>

      <View style={styles.suggestionBox}>
        <View style={styles.suggestionItem}>
          <Text style={[styles.suggestionValue, { color: theme.text }]}>
            {suggestedDaily} <Text style={styles.suggestionUnit}>pág/dia</Text>
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.suggestionItem}>
          <Text style={[styles.suggestionValue, { color: theme.text }]}>
            {suggestedMonthly} <Text style={styles.suggestionUnit}>pág/mês</Text>
          </Text>
        </View>
      </View>

      <Button
        title={isApplying ? 'Aplicando...' : 'Aplicar Recomendações'}
        onPress={onApply}
        loading={isApplying}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  reason: {
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  suggestionItem: {
    alignItems: 'center',
  },
  suggestionValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  suggestionUnit: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    opacity: 0.6,
  },
  divider: {
    width: 1,
    height: 30,
  },
  button: {
    width: '100%',
  },
});
