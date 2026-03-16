import {
  calculateGoalsSuggestions,
  type Goal,
  getMonthPages,
  getTodayPages,
  type ReadingSession,
} from '@marcapagina/shared';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { AnimatedHeaderPage } from '@/components/ui/AnimatedHeaderPage';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/ui/FadeInView';
import { GoalCard } from '@/components/ui/GoalCard';
import { GoalSuggestionCard } from '@/components/ui/GoalSuggestionCard';
import { Input } from '@/components/ui/Input';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

export default function GoalsScreen() {
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  const [dailyGoalStr, setDailyGoalStr] = useState('');
  const [monthlyGoalStr, setMonthlyGoalStr] = useState('');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [goalRes, sessionsRes] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .maybeSingle(),
        supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
      ]);

      if (goalRes.data) {
        setGoal(goalRes.data);
        setDailyGoalStr(String(goalRes.data.daily_pages || ''));
        setMonthlyGoalStr(String(goalRes.data.monthly_pages || ''));
      }
      if (sessionsRes.data) setSessions(sessionsRes.data);
    } catch (error) {
      console.error('Error fetching goals data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplySuggestion = async (
    suggestion: ReturnType<typeof calculateGoalsSuggestions>
  ) => {
    setIsApplying(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate current goals
      await supabase
        .from('goals')
        .update({ active: false })
        .eq('user_id', user.id);

      // Insert new goal
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        daily_pages: suggestion.suggestedDaily,
        monthly_pages: suggestion.suggestedMonthly,
        suggested_daily_pages: suggestion.suggestedDaily,
        suggested_monthly_pages: suggestion.suggestedMonthly,
        suggested_reason: suggestion.reason,
        active: true,
      });

      if (error) throw error;

      await fetchData();
      Alert.alert(
        'Sucesso',
        'Suas metas foram atualizadas com recomendação da IA!'
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      Alert.alert('Erro', message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleManualSave = async () => {
    const d = parseInt(dailyGoalStr, 10);
    const m = parseInt(monthlyGoalStr, 10);

    if (Number.isNaN(d) || Number.isNaN(m) || d <= 0 || m <= 0) {
      Alert.alert('Erro', 'Valores inválidos. Use números maiores que zero.');
      return;
    }

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('goals')
        .update({ active: false })
        .eq('user_id', user.id);

      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        daily_pages: d,
        monthly_pages: m,
        active: true,
      });

      if (error) throw error;

      await fetchData();
      Alert.alert(
        'Sucesso',
        'Suas metas manuais foram registradas com sucesso.'
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      Alert.alert('Erro', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.container, styles.center, { backgroundColor: theme.bg }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const currentMonthPages = getMonthPages(sessions);
  const todayPages = getTodayPages(sessions);
  const suggestion = calculateGoalsSuggestions(sessions, currentMonthPages);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <AnimatedHeaderPage
          title="Metas"
          subtitle="Acompanhe e ajuste seus objetivos."
        >
          {goal && (
            <FadeInView delay={100} duration={600}>
              <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
                PROGRESSO ATUAL
              </Text>
            <GoalCard
              title="Meta Diária"
              currentValue={todayPages}
              goalValue={goal.daily_pages || 0}
              unit="pág"
            />
            <GoalCard
              title="Meta Mensal"
              currentValue={currentMonthPages}
              goalValue={goal.monthly_pages || 0}
              unit="pág"
            />
            </FadeInView>
          )}

          <View style={{ height: Spacing.xl }} />

          <FadeInView delay={200} duration={600}>
            <GoalSuggestionCard
              suggestedDaily={suggestion.suggestedDaily}
              suggestedMonthly={suggestion.suggestedMonthly}
              reason={suggestion.reason}
              isApplying={isApplying}
              onApply={() => handleApplySuggestion(suggestion)}
            />
          </FadeInView>

          <View style={{ height: Spacing.xl }} />

          <FadeInView delay={300} duration={600}>
            <View
              style={[
                styles.manualSection,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, marginBottom: Spacing.lg },
                ]}
              >
                Ajuste Manual
              </Text>

              <Input
                label="Meta Diária (Páginas)"
                value={dailyGoalStr}
                onChangeText={setDailyGoalStr}
                keyboardType="numeric"
                placeholder="Ex: 20"
              />
              <Input
                label="Meta Mensal (Páginas)"
                value={monthlyGoalStr}
                onChangeText={setMonthlyGoalStr}
                keyboardType="numeric"
                placeholder="Ex: 600"
              />

              <Button
                title="Salvar Metas Manuais"
                onPress={handleManualSave}
                loading={isSaving}
                style={{ marginTop: Spacing.md }}
              />
            </View>
          </FadeInView>
        </AnimatedHeaderPage>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSize.lg,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  manualSection: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
});
