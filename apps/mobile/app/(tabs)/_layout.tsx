import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import {
  History,
  Home,
  Settings as SettingsIcon,
  Target,
  Timer as TimerIcon,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getTabBarMarginBottom, TAB_BAR_HEIGHT } from '@/constants/Layout';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Individual animated tab item */
function TabItem({
  isFocused,
  onPress,
  icon: Icon,
  theme,
}: {
  isFocused: boolean;
  onPress: () => void;
  icon?: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
  theme: typeof Colors.light;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    // Bounce the icon when becoming focused
    if (isFocused) {
      iconScale.value = withSpring(
        1.15,
        { damping: 12, stiffness: 300 },
        () => {
          iconScale.value = withSpring(1, { damping: 14, stiffness: 200 });
        }
      );
    }
  }, [isFocused, iconScale, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0)', theme.primary]
    ),
    width: 44,
    height: 44,
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const iconColor = isFocused ? theme.primaryForeground : theme.mutedForeground;

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      style={[styles.tabItem, pillStyle]}
    >
      <Animated.View style={iconAnimStyle}>
        {Icon?.({ color: iconColor, size: 24, focused: isFocused })}
      </Animated.View>
    </AnimatedPressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: theme.surface,
          bottom: getTabBarMarginBottom(insets),
          height: TAB_BAR_HEIGHT,
          shadowColor: colorScheme === 'dark' ? '#000' : theme.primary,
          borderColor: theme.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            icon={options.tabBarIcon}
            theme={theme}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.full,
    marginHorizontal: 1,
    overflow: 'hidden',
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <History size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color }) => <Target size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <TimerIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <SettingsIcon size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
