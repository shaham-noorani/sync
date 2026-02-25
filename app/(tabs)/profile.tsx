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

        {/* Sign Out */}
        <Button title="Sign Out" onPress={signOut} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}
