import '../global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { supabase } from '../lib/supabase';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading, hasProfile } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  usePushNotifications();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onOnboarding = segments[0] === '(auth)' && segments[1] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && !hasProfile && !onOnboarding) {
      router.replace('/(auth)/onboarding');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, hasProfile]);

  if (isLoading) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    SpaceGrotesk_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle OAuth deep link redirects (PKCE code exchange)
  useEffect(() => {
    // Cold-start: app opened via OAuth redirect URL
    Linking.getInitialURL().then((url) => {
      if (url && url.includes('code=')) {
        supabase.auth.exchangeCodeForSession(url);
      }
    });

    // Warm-start: app already running when OAuth redirect arrives
    const sub = Linking.addEventListener('url', async ({ url }) => {
      if (url.includes('code=')) {
        await supabase.auth.exchangeCodeForSession(url);
      }
    });
    return () => sub.remove();
  }, []);

  if (!loaded) return null;

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthGate>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
