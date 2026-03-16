import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { ScalePressable } from './ScalePressable';

interface BookCardProps {
  title: string;
  author: string | null;
  currentPage: number;
  totalPages: number;
  onPress?: () => void;
}

export function BookCard({
  title,
  author,
  currentPage,
  totalPages,
  onPress,
}: BookCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const progress = (currentPage / totalPages) * 100;

  return (
    <ScalePressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.imagePlaceholder}>
        <Text
          style={[
            styles.imagePlaceholderText,
            { color: theme.mutedForeground },
          ]}
        >
          {title.charAt(0)}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.author, { color: theme.mutedForeground }]}
          numberOfLines={1}
        >
          {author || 'Autor desconhecido'}
        </Text>
        <View style={styles.footer}>
          <AnimatedProgressBar
            progress={progress}
            height={4}
            style={styles.progress}
          />
          <Text style={[styles.progressText, { color: theme.mutedForeground }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  imagePlaceholder: {
    width: 60,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  author: {
    fontSize: FontSize.md,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progress: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
});
