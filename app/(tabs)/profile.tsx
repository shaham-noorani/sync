import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { useProfile } from '../../hooks/useProfile';
import { useMyHangoutStats } from '../../hooks/useHangouts';
import { Avatar } from '../../components/Avatar';
import { InterestChip } from '../../components/ui/InterestChip';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useTheme } from '../../providers/ThemeProvider';
import { makeRedirectUri } from 'expo-auth-session';
import { useQueryClient } from '@tanstack/react-query';
import { useGcalConnections } from '../../hooks/useGcalConnection';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕', other: '📅',
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: stats } = useMyHangoutStats();
  const router = useRouter();
  const c = useColors();
  const { isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { data: gcalConnections } = useGcalConnections();
  const [connectingCalendar, setConnectingCalendar] = useState(false);

  const handleConnectCalendar = async () => {
    setConnectingCalendar(true);
    const redirectTo = makeRedirectUri({ scheme: 'sync' });

    // Subscribe to next auth state change to capture calendar tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.provider_token) {
        subscription.unsubscribe();
        const { data, error } = await supabase.functions.invoke('connect-gcal', {
          body: {
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token ?? null,
            redirect_uri: redirectTo,
          },
        });
        if (!error && data?.calendars) {
          queryClient.invalidateQueries({ queryKey: ['gcal-connections'] });
          router.push('/gcal/calendars');
        }
        setConnectingCalendar(false);
      }
    });

    const { data: oauthData, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      subscription.unsubscribe();
      setConnectingCalendar(false);
      return;
    }

    if (oauthData?.url) {
      try {
        await WebBrowser.openAuthSessionAsync(oauthData.url, redirectTo);
      } finally {
        // Unsubscribe if auth state change hasn't fired yet (user cancelled or browser error)
        // If it already fired and unsubscribed itself, this is a no-op
        subscription.unsubscribe();
        setConnectingCalendar(false);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: c.bg }} edges={['top']}>
        <View className="px-6 pt-6">
          <View className="items-center mb-8">
            <SkeletonLoader width={80} height={80} borderRadius={40} />
            <SkeletonLoader width={150} height={24} borderRadius={8} className="mt-4" />
            <SkeletonLoader width={100} height={16} borderRadius={8} className="mt-2" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: c.bg }} edges={['top']}>
      <ScrollView className="flex-1" style={{ backgroundColor: c.bg }} contentContainerClassName="px-6 pt-6 pb-12">
        {/* Header */}
        <View className="items-center mb-6">
          <Avatar
            url={profile.avatar_url}
            name={profile.display_name}
            size={88}
            ring
          />
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: c.text, marginTop: 16 }}>
            {profile.display_name}
          </Text>
          <Text style={{ color: c.textSecondary, marginTop: 4, fontSize: 14 }}>@{profile.username}</Text>
          {profile.city && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={12} color={c.textMuted} />
              <Text style={{ color: c.textSecondary, fontSize: 14, marginLeft: 2 }}>{profile.city}</Text>
            </View>
          )}
        </View>

        {/* Hangout Stats */}
        {stats && stats.total > 0 && (
          <View style={{ marginBottom: 24, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 16 }}>
            <View className="flex-row items-center mb-3">
              <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }} className="flex-1 uppercase">
                Hangout Stats
              </Text>
              <View style={{ backgroundColor: c.accentBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: c.accent, fontSize: 14, fontWeight: '700' }}>
                  {stats.total} total
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap">
              {stats.topActivities.map(({ tag, count }) => (
                <View
                  key={tag}
                  style={{ backgroundColor: c.bgCard, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Text className="text-base mr-1.5">
                    {ACTIVITY_EMOJIS[tag.toLowerCase()] ?? '📅'}
                  </Text>
                  <View>
                    <Text style={{ color: c.text, fontSize: 12, fontWeight: '600' }} className="capitalize">
                      {tag}
                    </Text>
                    <Text style={{ color: c.textMuted, fontSize: 12 }}>{count}×</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Edit Button */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingVertical: 12, marginBottom: 24 }}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={15} color={c.textMuted} />
          <Text style={{ color: c.textSecondary, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <View className="mb-8">
            <Text style={{ color: c.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 2 }}>
              Interests
            </Text>
            <View className="flex-row flex-wrap">
              {profile.interests.map((interest: string) => (
                <InterestChip key={interest} label={interest} selected />
              ))}
            </View>
          </View>
        )}

        {/* Quick Links + Theme Toggle */}
        <View style={{ marginBottom: 32, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, overflow: 'hidden' }}>
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: c.bgCardHover }}
            onPress={() => router.push('/friends')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={20} color={c.accent} />
              <Text style={{ color: c.text, marginLeft: 12, fontSize: 14, fontWeight: '500' }}>Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: c.bgCardHover }}
            onPress={() => router.push('/groups')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="grid-outline" size={20} color={c.accent} />
              <Text style={{ color: c.text, marginLeft: 12, fontSize: 14, fontWeight: '500' }}>Groups</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={20} color={c.accent} />
              <Text style={{ color: c.text, marginLeft: 12, fontSize: 14, fontWeight: '500' }}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor="#ffffff"
            />
          </View>

        </View>

        {/* Integrations */}
        <View style={{ marginBottom: 32, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, overflow: 'hidden' }}>
          <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
            INTEGRATIONS
          </Text>

          {gcalConnections && gcalConnections.length > 0 ? (
            <>
              {gcalConnections.map((conn) => (
                <TouchableOpacity
                  key={conn.id}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.bgCardHover }}
                  onPress={() => router.push('/gcal/calendars')}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>📅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 14, fontWeight: '500' }}>Google Calendar</Text>
                    <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 1 }}>{conn.google_email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.bgCardHover, opacity: connectingCalendar ? 0.5 : 1 }}
                onPress={handleConnectCalendar}
                disabled={connectingCalendar}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color={c.accent} />
                <Text style={{ color: c.accent, marginLeft: 12, fontSize: 14, fontWeight: '500' }}>
                  {connectingCalendar ? 'Connecting…' : 'Connect another account'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, opacity: connectingCalendar ? 0.5 : 1 }}
              onPress={handleConnectCalendar}
              disabled={connectingCalendar}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18, marginRight: 12 }}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 14, fontWeight: '500' }}>Connect Google Calendar</Text>
                <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 1 }}>Import busy times automatically</Text>
              </View>
              {connectingCalendar
                ? <Text style={{ color: c.textMuted, fontSize: 12 }}>Connecting…</Text>
                : <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
              }
            </TouchableOpacity>
          )}
        </View>

        {/* Sign Out */}
        <Button title="Sign Out" onPress={signOut} variant="critical" />
      </ScrollView>
    </SafeAreaView>
  );
}
