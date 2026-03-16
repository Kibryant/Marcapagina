import AsyncStorage from '@react-native-async-storage/async-storage';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  colorScheme: 'light' | 'dark';
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  syncThemeWithSupabase: (supabaseTheme: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themePreference: 'system',
  colorScheme: 'light',
  setThemePreference: async () => {},
  syncThemeWithSupabase: async () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorSchemeRaw = useDeviceColorScheme();
  const deviceColorScheme =
    deviceColorSchemeRaw === 'unspecified' || !deviceColorSchemeRaw
      ? 'light'
      : deviceColorSchemeRaw;
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carrega do AsyncStorage para resposta imediata ao abrir o app
    AsyncStorage.getItem('theme_preference').then((savedTheme) => {
      if (
        savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'system'
      ) {
        setThemePreferenceState(savedTheme);
      }
      setIsLoaded(true);
    });
  }, []);

  const setThemePreference = async (newTheme: ThemePreference) => {
    setThemePreferenceState(newTheme);
    await AsyncStorage.setItem('theme_preference', newTheme);

    // Sincroniza com o Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user.id);
    }
  };

  const syncThemeWithSupabase = async (supabaseTheme: ThemePreference) => {
    // Usado quando baixamos o profile atualizado do supabase
    setThemePreferenceState(supabaseTheme);
    await AsyncStorage.setItem('theme_preference', supabaseTheme);
  };

  const colorScheme =
    themePreference === 'system' ? deviceColorScheme : themePreference;

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        colorScheme,
        setThemePreference,
        syncThemeWithSupabase,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => useContext(ThemeContext);
