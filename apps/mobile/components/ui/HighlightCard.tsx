import { Quote } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';

interface HighlightCardProps {
  content: string;
  bookTitle: string;
  page?: number | null;
}

export function HighlightCard({
  content,
  bookTitle,
  page,
}: HighlightCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.quoteIcon}>
        <Quote size={20} color={theme.muted} />
      </View>
      <Text style={[styles.content, { color: theme.text }]}>"{content}"</Text>
      <View style={styles.footer}>
        <Text style={[styles.bookTitle, { color: theme.muted }]}>
          {bookTitle}
        </Text>
        {page && (
          <Text style={[styles.page, { color: theme.muted }]}>Pág. {page}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  quoteIcon: {
    marginBottom: Spacing.sm,
    opacity: 0.5,
  },
  content: {
    fontSize: FontSize.lg,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.sm,
  },
  bookTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  page: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
