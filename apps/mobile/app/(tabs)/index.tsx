import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  type Book,
  generateStoryData,
  getStreak,
  getTodayPages,
  type Profile,
  type ReadingSession,
} from '@marcapagina/shared';
import { useRouter } from 'expo-router';
import { BookOpen, Flame, Plus, TrendingUp } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { AnimatedHeaderPage } from '@/components/ui/AnimatedHeaderPage';
import { BookCard } from '@/components/ui/BookCard';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/ui/FadeInView';
import { GoalCard } from '@/components/ui/GoalCard';
import { ReadingLogSheet } from '@/components/ui/ReadingLogSheet';
import { StatTile } from '@/components/ui/StatTile';
import { StoryCard } from '@/components/ui/StoryCard';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getFabBottomOffset } from '@/constants/Layout';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const [_loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fabBottom = getFabBottomOffset(insets);

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, sessionsRes, booksRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'reading'),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (booksRes.data) setBooks(booksRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSaveLog = async (bookId: string, pages: number) => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('reading_sessions').insert({
        user_id: user.id,
        book_id: bookId,
        pages_read: pages,
        date: new Date().toISOString().split('T')[0],
        duration_minutes: 0,
      });

      if (error) throw error;

      await fetchData();
      bottomSheetModalRef.current?.dismiss();
      Alert.alert('Sucesso', 'Leitura registrada com sucesso!');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao salvar registro';
      Alert.alert('Erro', message);
    } finally {
      setIsSaving(false);
    }
  };

  const todayPagesNum = getTodayPages(sessions);
  const streakNum = getStreak(sessions);
  const dailyGoalNum = profile?.goal_pages_per_day || 20;
  const currentBookObj = books[0];
  const storyDataObj = generateStoryData(sessions, books);
  const saudation =
    new Date().getHours() < 12
      ? 'Bom dia'
      : new Date().getHours() < 18
        ? 'Boa tarde'
        : 'Boa noite';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AnimatedHeaderPage
        title={`${saudation}, ${profile?.display_name?.split(' ')[0] || 'Leitor'}`}
        subtitle={`Você já leu ${todayPagesNum} páginas hoje.`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <FadeInView delay={100} duration={600}>
          <GoalCard
            title="Meta Diária"
            currentValue={todayPagesNum}
            goalValue={dailyGoalNum}
            unit="pág"
          />
        </FadeInView>

        <FadeInView delay={200} duration={600}>
          <View style={styles.statsRow}>
            <StatTile
              label="Streak"
              value={streakNum}
              icon={<Flame size={16} color={theme.warning} />}
            />
            <StatTile
              label="Total"
              value={sessions.reduce((acc, s) => acc + s.pages_read, 0)}
              icon={<BookOpen size={16} color={theme.primary} />}
            />
          </View>
        </FadeInView>

        {storyDataObj.bestTimeName !== 'indefinido' && (
          <FadeInView delay={300} duration={600}>
            <View style={styles.insightSection}>
              <StoryCard
                title="Insight de hábito"
                description={`Você costuma ler mais no período da ${storyDataObj.bestTimeName}.`}
                icon={<TrendingUp size={24} color={theme.warning} />}
              />
            </View>
          </FadeInView>
        )}

        <FadeInView delay={400} duration={600}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lendo agora
            </Text>
            <Button
              variant="ghost"
              title="Ver todos"
              size="sm"
              onPress={() => router.push('/library')}
            />
          </View>
        </FadeInView>

        <FadeInView delay={500} duration={600}>
          {currentBookObj ? (
            <BookCard
              title={currentBookObj.title}
              author={currentBookObj.author}
              currentPage={currentBookObj.current_page}
              totalPages={currentBookObj.total_pages}
              onPress={() => {}}
            />
          ) : (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                Nenhum livro em leitura.
              </Text>
              <Button
                variant="outline"
                title="Adicionar Livro"
                onPress={() => {}}
                size="sm"
                style={styles.emptyButton}
              />
            </View>
          )}
        </FadeInView>
      </AnimatedHeaderPage>

      <View style={[styles.fabContainer, { bottom: fabBottom }]}>
        <Button
          title="Registrar leitura"
          onPress={() => bottomSheetModalRef.current?.present()}
          icon={<Plus size={20} color={theme.primaryForeground} />}
          style={styles.fab}
        />
      </View>

      <ReadingLogSheet
        ref={bottomSheetModalRef}
        books={books}
        onSave={handleSaveLog}
        loading={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150, // Only bottom padding needed now
  },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSize.lg,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.xs,
  },
  insightSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  emptyButton: {
    paddingHorizontal: Spacing.xl,
  },
  fabContainer: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'transparent',
  },
  fab: {
    height: 56,
    borderRadius: Radius.full,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
});
