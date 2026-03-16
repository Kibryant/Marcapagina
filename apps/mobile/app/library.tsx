import type { Book } from '@marcapagina/shared';
import { useRouter } from 'expo-router';
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  Heart,
  Plus,
} from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { AnimatedHeaderPage } from '@/components/ui/AnimatedHeaderPage';
import { BookCard } from '@/components/ui/BookCard';
import { FadeInView } from '@/components/ui/FadeInView';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

type BookStatus = 'reading' | 'next' | 'wishlist' | 'finished';

const SECTIONS: {
  status: BookStatus;
  label: string;
  icon: (props: { size: number; color: string }) => React.ReactNode;
  color: string;
}[] = [
  {
    status: 'reading',
    label: 'Lendo',
    icon: BookOpen,
    color: '#3b82f6', // blue-500
  },
  {
    status: 'next',
    label: 'Próximos',
    icon: BookMarked,
    color: '#0ea5e9', // sky-500
  },
  {
    status: 'wishlist',
    label: 'Desejos',
    icon: Heart,
    color: '#a855f7', // purple-500
  },
  {
    status: 'finished',
    label: 'Lidos',
    icon: CheckCircle2,
    color: '#10b981', // emerald-500
  },
];

export default function LibraryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<BookStatus>('reading');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setBooks(data);
    } catch (error) {
      console.error('Error fetching library data:', error);
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

  const filteredBooks = books.filter((b) => b.status === activeTab);

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {SECTIONS.map((section) => {
        const isActive = activeTab === section.status;
        const count = books.filter((b) => b.status === section.status).length;
        const Icon = section.icon;

        return (
          <TouchableOpacity
            key={section.status}
            onPress={() => setActiveTab(section.status)}
            style={[
              styles.tab,
              isActive && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <View style={styles.tabContent}>
              <Icon
                size={16}
                color={isActive ? theme.primary : theme.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.text : theme.mutedForeground },
                ]}
              >
                {section.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isActive ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isActive
                          ? theme.primaryForeground
                          : theme.mutedForeground,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AnimatedHeaderPage
        title="Biblioteca"
        subtitle="Sua coleção completa de livros."
        showBackButton
        rightElement={
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => alert('Em breve: Adicionar novo livro!')}
          >
            <Plus size={20} color={theme.primaryForeground} />
          </TouchableOpacity>
        }
        extraHeaderContent={renderTabs()}
        isFlatList
        data={filteredBooks}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item, index }: any) => (
          <FadeInView delay={index * 50} duration={400}>
            <BookCard
              title={item.title}
              author={item.author}
              currentPage={item.current_page}
              totalPages={item.total_pages}
              onPress={() => {}}
            />
          </FadeInView>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
              Nenhum livro encontrado nesta categoria.
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -10,
    right: -15,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
