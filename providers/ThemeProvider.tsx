import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'sync_theme_preference';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
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

  return (
    <ThemeContext.Provider value={{ isDark: colorScheme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
