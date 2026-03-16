import { Platform } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { Spacing } from './Tokens';

export const TAB_BAR_HEIGHT = 64;

export const getTabBarMarginBottom = (insets: EdgeInsets) => {
  return Platform.OS === 'ios'
    ? Math.max(insets.bottom, Spacing.md)
    : Spacing.xl;
};

export const getFabBottomOffset = (insets: EdgeInsets) => {
  return getTabBarMarginBottom(insets) + TAB_BAR_HEIGHT + Spacing.md;
};
