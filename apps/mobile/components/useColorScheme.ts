import { useThemeContext } from './AppThemeProvider';

export const useColorScheme = () => {
  return useThemeContext().colorScheme;
};
