import {
  type Book,
  generateStoryData,
  getStreak,
  type ReadingSession,
} from '@marcapagina/shared';
import { useRouter } from 'expo-router';
import { BookOpen, Calendar, Clock, Trophy } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { AnimatedHeaderPage } from '@/components/ui/AnimatedHeaderPage';
import { FadeInView } from '@/components/ui/FadeInView';
import { StoryCard } from '@/components/ui/StoryCard';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

interface GroupedSessions {
  date: string;
  data: (ReadingSession & { bookTitle?: string })[];
}

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [sessionsRes, booksRes] = await Promise.all([
        supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase.from('books').select('*').eq('user_id', user.id),
      ]);

      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (booksRes.data) setBooks(booksRes.data);
    } catch (error) {
      console.error('Error fetching history data:', error);
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

  const storyData = generateStoryData(sessions, books);
  const streak = getStreak(sessions);

  // Group sessions by date
  const groupedSessions: GroupedSessions[] = sessions.reduce(
    (acc: GroupedSessions[], session) => {
      const book = books.find((b) => b.id === session.book_id);
      const sessionWithTitle = {
        ...session,
        bookTitle: book?.title || 'Livro desconhecido',
      };

      const existingGroup = acc.find((g) => g.date === session.date);
      if (existingGroup) {
        existingGroup.data.push(sessionWithTitle);
      } else {
        acc.push({ date: session.date, data: [sessionWithTitle] });
      }
      return acc;
    },
    []
  );

  const renderExtraHeader = () => (
    <View style={styles.extraHeader}>
      <View style={{ height: Spacing.lg }} />
      <FadeInView delay={100} duration={600}>
        <Text style={styles.sectionTitle}>INSIGHTS DA JORNADA</Text>
        <StoryCard
          title="Resumo do Mês"
          description={`Você leu ${storyData.currentMonthPages} páginas este mês.`}
          icon={<BookOpen size={24} color={theme.primary} />}
        />
        <StoryCard
          title="Consistência"
          description={`Lido em ${storyData.uniqueDaysReadThisMonth} dos últimos ${storyData.daysPassedInMonth} dias.`}
          icon={<Calendar size={24} color={theme.success} />}
        />
        <StoryCard
          title="Sequência Atual"
          description={`Você está em uma sequência de ${streak} dias!`}
          icon={<Trophy size={24} color={theme.warning} />}
        />
      </FadeInView>

      <View style={{ height: Spacing.xl }} />
      <Text style={styles.sectionTitle}>ATIVIDADES RECENTES</Text>
    </View>
  );

  const renderSessionItem = ({ item }: { item: GroupedSessions }) => (
    <View style={styles.dateGroup}>
      <Text style={[styles.dateText, { color: theme.mutedForeground }]}>
        {new Date(item.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Text>
      {item.data.map((session, index) => (
        <View
          key={session.id}
          style={[
            styles.sessionCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              marginTop: index === 0 ? Spacing.sm : Spacing.xs,
            },
          ]}
        >
          <View style={styles.sessionInfo}>
            <Text
              style={[styles.bookTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {session.bookTitle}
            </Text>
            <View style={styles.sessionMeta}>
              <Clock
                size={12}
                color={theme.mutedForeground}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.metaText, { color: theme.mutedForeground }]}>
                {session.duration_minutes > 0
                  ? `${session.duration_minutes} min • `
                  : ''}
                {session.pages_read} pág
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, styles.center, { backgroundColor: theme.bg }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AnimatedHeaderPage
        title="Histórico"
        subtitle="Sua jornada literária em detalhes."
        rightElement={
          <TouchableOpacity
            onPress={() => router.push('/library')}
            style={styles.libraryIcon}
          >
            <BookOpen size={24} color={theme.primary} />
          </TouchableOpacity>
        }
        isFlatList
        data={groupedSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item: any) => item.date}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        extraHeaderContent={renderExtraHeader()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.mutedForeground }}>
              Nenhum registro encontrado.
            </Text>
          </View>
        }
      />
    </View>
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
    paddingBottom: 150,
  },
  extraHeader: {
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  libraryIcon: {
    padding: Spacing.xs,
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
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    color: 'rgba(128, 128, 128, 0.8)',
  },
  dateGroup: {
    marginBottom: Spacing.xl,
  },
  dateText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  sessionInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
});
