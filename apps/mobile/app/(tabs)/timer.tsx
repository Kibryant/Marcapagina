import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  type Book,
  getTodayPages,
  type ReadingSession,
} from '@marcapagina/shared';
import {
  BookOpen,
  ChevronRight,
  Timer as TimerIcon,
} from 'lucide-react-native';
import { ReadingTimer } from '@/components/ReadingTimer';
import { Text, View } from '@/components/Themed';
import { AnimatedHeaderPage } from '@/components/ui/AnimatedHeaderPage';
import { FadeInView } from '@/components/ui/FadeInView';
import { StatTile } from '@/components/ui/StatTile';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

export default function TimerScreen() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [booksRes, sessionsRes] = await Promise.all([
        supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'reading'),
        supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (booksRes.data) setBooks(booksRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
    } catch (error) {
      console.error('Error fetching timer data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStop = async (minutes: number) => {
    if (minutes < 1) return;

    // Use current reading book if available
    const bookToLog = books[0];
    if (!bookToLog) {
      Alert.alert(
        'Aviso',
        'Você precisa ter um livro em leitura para registrar a sessão.'
      );
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('reading_sessions').insert({
        user_id: user.id,
        book_id: bookToLog.id,
        pages_read: 0,
        date: new Date().toISOString().split('T')[0],
        duration_minutes: minutes,
      });

      if (error) throw error;

      await fetchData();
      Alert.alert(
        'Sucesso',
        `Sessão de ${minutes} min registrada em "${bookToLog.title}"!`
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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

  const todayMinutes = sessions
    .filter((s) => s.date === new Date().toISOString().split('T')[0])
    .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  const currentBook = books[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AnimatedHeaderPage
        title="Cronômetro"
        subtitle="Foco total na sua leitura."
      >
        <FadeInView delay={100} duration={600}>
          <View style={styles.statsRow}>
            <StatTile
              label="Foco Hoje"
              value={`${todayMinutes} min`}
              icon={<TimerIcon size={16} color={theme.primary} />}
            />
            <StatTile
              label="Páginas"
              value={getTodayPages(sessions)}
              icon={<BookOpen size={16} color={theme.success} />}
            />
          </View>
        </FadeInView>

        {currentBook && (
          <FadeInView delay={200} duration={600}>
            <View
              style={[
                styles.bookSelection,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <View style={styles.bookInfo}>
                <Text
                  style={[styles.bookLabel, { color: theme.mutedForeground }]}
                >
                  LENDO AGORA
                </Text>
                <Text
                  style={[styles.bookTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {currentBook.title}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.muted} />
            </View>
          </FadeInView>
        )}

        <FadeInView delay={300} duration={600}>
          <ReadingTimer onStop={handleStop} />
        </FadeInView>
      </AnimatedHeaderPage>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
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
  bookSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  bookInfo: {
    flex: 1,
  },
  bookLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
