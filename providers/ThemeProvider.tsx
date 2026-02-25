import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'sync_theme_preference';

export type ColorTokens = {
  bg: string;
  bgCard: string;
  bgCardHover: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  // Skeleton
  skeleton: string;
  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  // Danger / critical actions
  danger: string;
  dangerBg: string;
  dangerBorder: string;
};

const dark: ColorTokens = {
  bg: '#09090f',
  bgCard: 'rgba(255,255,255,0.05)',
  bgCardHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.15)',
  text: '#f0f0ff',
  textSecondary: '#8b8fa8',
  textMuted: '#5a5f7a',
  accent: '#8875ff',
  accentBg: 'rgba(136,117,255,0.15)',
  accentBorder: 'rgba(136,117,255,0.4)',
  skeleton: '#334155',
  tabBar: '#0e0e1a',
  tabBarBorder: 'rgba(255,255,255,0.07)',
  danger: '#f87171',
  dangerBg: 'rgba(239,68,68,0.12)',
  dangerBorder: 'rgba(239,68,68,0.4)',
};

const light: ColorTokens = {
  bg: '#f4f4f8',
  bgCard: 'rgba(0,0,0,0.04)',
  bgCardHover: 'rgba(0,0,0,0.07)',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.18)',
  text: '#0a0a1a',
  textSecondary: '#4a4d66',
  textMuted: '#8b8fa8',
  accent: '#6c57e8',
  accentBg: 'rgba(108,87,232,0.12)',
  accentBorder: 'rgba(108,87,232,0.35)',
  skeleton: '#d1d5db',
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.08)',
  dangerBorder: 'rgba(220,38,38,0.35)',
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ColorTokens;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: dark,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors(): ColorTokens {
  return useContext(ThemeContext).colors;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setColorScheme(saved);
      } else {
        setColorScheme('dark');
      }
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    AsyncStorage.setItem(THEME_KEY, next);
  };

  if (!loaded) return null;

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: isDark ? dark : light }}>
      {children}
    </ThemeContext.Provider>
  );
}
