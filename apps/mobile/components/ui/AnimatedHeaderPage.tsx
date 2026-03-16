import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type React from 'react';
import type { ReactNode } from 'react';
import {
  type FlatListProps,
  Platform,
  StyleSheet,
  TouchableOpacity,
  type ViewProps,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Spacing } from '@/constants/Tokens';

interface AnimatedHeaderPageProps<T = any> {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  children?: ReactNode;
  contentContainerStyle?: ViewProps['style'];
  refreshControl?: React.ReactElement<any>;
  extraHeaderContent?: ReactNode;
  showBackButton?: boolean;
  // FlatList support
  isFlatList?: boolean;
  data?: T[];
  renderItem?: FlatListProps<T>['renderItem'];
  keyExtractor?: FlatListProps<T>['keyExtractor'];
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  ListFooterComponent?: FlatListProps<T>['ListFooterComponent'];
}

export function AnimatedHeaderPage<T = any>({
  title,
  subtitle,
  rightElement,
  children,
  contentContainerStyle,
  refreshControl,
  extraHeaderContent,
  showBackButton,
  isFlatList,
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  ListFooterComponent,
}: AnimatedHeaderPageProps<T>) {
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();

  const HEADER_HEIGHT = insets.top + (Platform.OS === 'ios' ? 50 : 60);
  const COLLAPSE_DISTANCE = 50;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const fixedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [40, 70], [0, 1], 'clamp');
    return {
      opacity,
      backgroundColor: theme.surface,
      borderBottomColor: theme.border,
      borderBottomWidth: scrollY.value > 60 ? 1 : 0,
    };
  });

  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [50, 80], [0, 1], 'clamp');
    const translateY = interpolate(scrollY.value, [50, 80], [10, 0], 'clamp');
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [1, 0],
      'clamp'
    );
    const scale = interpolate(scrollY.value, [-50, 0], [1.1, 1], 'clamp');
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const renderLargeHeader = () => (
    <View style={[styles.largeHeader, { paddingTop: insets.top }]}>
      <Animated.View style={largeTitleStyle}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonLarge}
          >
            <ArrowLeft size={28} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.largeTitleRow}>
          <Text style={[styles.largeTitle, { color: theme.text }]}>{title}</Text>
          <View style={styles.rightAction}>{rightElement}</View>
        </View>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>
      {extraHeaderContent}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Sticky Header */}
      <Animated.View
        style={[
          styles.fixedHeader,
          { height: HEADER_HEIGHT, paddingTop: insets.top },
          fixedHeaderStyle,
        ]}
      >
        <View style={styles.fixedContent}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButtonSmall}
            >
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}

          <Animated.Text
            style={[styles.smallTitle, { color: theme.text }, smallTitleStyle]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
          <View style={styles.rightAction}>{rightElement}</View>
        </View>
      </Animated.View>

      {isFlatList ? (
        <Animated.FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
            contentContainerStyle,
          ]}
          refreshControl={refreshControl}
          ListHeaderComponent={renderLargeHeader}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
            contentContainerStyle,
          ]}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          {renderLargeHeader()}
          {children}
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  fixedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  smallTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  largeHeader: {
    paddingTop: 40,
    marginBottom: Spacing.md, // Reduced margin to bring content closer naturally
  },
  backButtonLarge: {
    marginBottom: Spacing.md,
    marginLeft: -Spacing.xs,
  },
  backButtonSmall: {
    width: 40,
    justifyContent: 'center',
  },
  largeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  largeTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSize.lg,
    marginTop: 4,
  },
  rightAction: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: Spacing.xl, // Fixed: Content won't be stuck to edges!
  },
});
