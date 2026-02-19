import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../hooks/useProfile';
import { useFriendEffectiveAvailability } from '../../hooks/useAvailability';
import { Avatar } from '../../components/Avatar';
import { InterestChip } from '../../components/ui/InterestChip';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { HeatmapGrid } from '../../components/HeatmapGrid';
import { WeekNavigator } from '../../components/WeekNavigator';
import { useTheme } from '../../providers/ThemeProvider';

function getWeekDates(weekOffset: number): string[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatWeekLabel(dates: string[]): string {
  const start = new Date(dates[0] + 'T12:00:00');
  const end = new Date(dates[6] + 'T12:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (start.getMonth() === end.getMonth()) {
    return `${months[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}`;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: profile, isLoading } = useProfile(id);
  const [weekOffset, setWeekOffset] = useState(0);

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const { data: availability, isLoading: availLoading } = useFriendEffectiveAvailability(
    id,
    dates[0],
    dates[6]
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
        <View className="px-6 pt-4">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Ionicons name="chevron-back" size={24} color={isDark ? '#94a3b8' : '#6b7280'} />
            </TouchableOpacity>
          </View>
          <View className="items-center">
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-12">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#94a3b8' : '#6b7280'} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-dark-50">Profile</Text>
        </View>

        {/* Profile Info */}
        <View className="items-center py-6">
          <Avatar url={profile.avatar_url} name={profile.display_name} size={80} />
          <Text className="text-2xl font-bold text-gray-900 dark:text-dark-50 mt-4">
            {profile.display_name}
          </Text>
          <Text className="text-gray-400 dark:text-dark-400 mt-1">@{profile.username}</Text>
          {profile.city && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location" size={12} color={isDark ? '#64748b' : '#9ca3af'} />
              <Text className="text-gray-400 dark:text-dark-400 text-sm ml-1">{profile.city}</Text>
            </View>
          )}
        </View>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-gray-500 dark:text-dark-300 text-xs font-semibold uppercase tracking-widest mb-3">
              Interests
            </Text>
            <View className="flex-row flex-wrap">
              {profile.interests.map((interest: string) => (
                <InterestChip key={interest} label={interest} selected />
              ))}
            </View>
          </View>
        )}

        {/* Availability Heatmap */}
        <View className="px-6">
          <Text className="text-gray-500 dark:text-dark-300 text-xs font-semibold uppercase tracking-widest mb-1">
            When {profile.display_name.split(' ')[0]} is Free
          </Text>
          <WeekNavigator
            label={formatWeekLabel(dates)}
            onPrev={() => setWeekOffset((o) => o - 1)}
            onNext={() => setWeekOffset((o) => o + 1)}
            canGoPrev={weekOffset > 0}
          />
          <View className="mt-1">
            {availLoading ? (
              <View className="h-32 bg-white dark:bg-dark-700 rounded-xl opacity-60" />
            ) : (
              <HeatmapGrid
                dates={dates}
                availability={availability ?? []}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
