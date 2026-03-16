import { Lightbulb } from 'lucide-react-native';
import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';

interface StoryCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function StoryCard({ title, description, icon }: StoryCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
        ]}
      >
        {icon || <Lightbulb size={24} color={theme.warning} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.mutedForeground }]}>
          {description}
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
});
