import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatTile({ label, value, icon }: StatTileProps) {
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
        <Text style={[styles.label, { color: theme.mutedForeground }]}>
          {label}
        </Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  iconContainer: {
    opacity: 0.8,
  },
});
