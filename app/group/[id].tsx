import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useGroup, useLeaveGroup } from '../../hooks/useGroups';
import { useGroupAvailability } from '../../hooks/useAvailability';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/ui/Button';
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

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { data: group, isLoading } = useGroup(id);
  const leaveGroup = useLeaveGroup();
  const [weekOffset, setWeekOffset] = useState(0);

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const memberIds = useMemo(
    () => (group?.members ?? []).map((m: any) => m.user_id),
    [group]
  );

  const { data: groupOverlaps, isLoading: overlapsLoading } = useGroupAvailability(
    memberIds,
    dates[0],
    dates[6]
  );

  const copyInviteCode = async () => {
    if (!group) return;
    await Clipboard.setStringAsync(group.invite_code);
    Alert.alert('Copied!', `Invite code "${group.invite_code}" copied to clipboard`);
  };

  const handleLeave = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveGroup.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
        <View className="px-6 pt-4">
          <SkeletonLoader height={32} borderRadius={8} className="mb-4" />
          <SkeletonLoader height={20} borderRadius={8} className="mb-8" />
          <SkeletonLoader height={60} borderRadius={12} className="mb-3" />
          <SkeletonLoader height={60} borderRadius={12} className="mb-3" />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-12">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#94a3b8' : '#6b7280'} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-dark-50 flex-1" numberOfLines={1}>
            {group.name}
          </Text>
        </View>

        {group.description && (
          <Text className="text-gray-500 dark:text-dark-300 text-sm px-6 pb-4">
            {group.description}
          </Text>
        )}

        {/* Invite Code */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="bg-white dark:bg-dark-700 rounded-2xl px-4 py-4 flex-row items-center justify-between"
            onPress={copyInviteCode}
            activeOpacity={0.8}
          >
            <View>
              <Text className="text-gray-500 dark:text-dark-400 text-xs font-semibold uppercase tracking-wider">
                Invite Code
              </Text>
              <Text className="text-lavender-500 dark:text-lavender text-2xl font-bold mt-1 tracking-widest">
                {group.invite_code}
              </Text>
            </View>
            <View className="bg-lavender/20 rounded-full p-2">
              <Ionicons name="copy-outline" size={20} color="#a4a8d1" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Group Availability Heatmap */}
        <View className="px-6 mb-6">
          <Text className="text-gray-500 dark:text-dark-300 text-xs font-semibold uppercase tracking-widest mb-1">
            Group Availability
          </Text>
          <WeekNavigator
            label={formatWeekLabel(dates)}
            onPrev={() => setWeekOffset((o) => o - 1)}
            onNext={() => setWeekOffset((o) => o + 1)}
            canGoPrev={weekOffset > 0}
          />
          <View className="mt-1">
            {overlapsLoading ? (
              <View className="h-32 bg-white dark:bg-dark-700 rounded-xl opacity-60" />
            ) : (
              <HeatmapGrid
                dates={dates}
                availability={[]}
                friendOverlapCounts={groupOverlaps ?? {}}
              />
            )}
          </View>
          <Text className="text-gray-400 dark:text-dark-400 text-xs text-center mt-2">
            Numbers show how many members are free
          </Text>
        </View>

        {/* Members */}
        <View className="px-6">
          <Text className="text-gray-500 dark:text-dark-300 text-xs font-semibold uppercase tracking-widest mb-3">
            Members · {group.members.length}
          </Text>

          {group.members.map((member: any) => (
            <TouchableOpacity
              key={member.id}
              className="flex-row items-center bg-white dark:bg-dark-700 rounded-2xl px-4 py-3 mb-2"
              onPress={() => router.push(`/profile/${member.user_id}`)}
              activeOpacity={0.8}
            >
              <Avatar
                url={member.profile.avatar_url}
                name={member.profile.display_name}
                size={40}
              />
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 dark:text-dark-50 font-semibold text-sm">
                  {member.profile.display_name}
                </Text>
                <Text className="text-gray-400 dark:text-dark-400 text-xs">
                  @{member.profile.username}
                </Text>
              </View>
              {member.role !== 'member' && (
                <View className="bg-lavender/20 rounded-full px-2 py-0.5">
                  <Text className="text-lavender-500 dark:text-lavender text-xs font-semibold uppercase">
                    {member.role}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? '#475569' : '#9ca3af'}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ))}

          {/* Leave */}
          <View className="mt-8">
            <Button
              title="Leave Group"
              onPress={handleLeave}
              variant="outline"
              loading={leaveGroup.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
