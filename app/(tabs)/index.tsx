import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffectiveAvailability } from '../../hooks/useAvailability';
import { HeatmapGrid } from '../../components/HeatmapGrid';
import { WeekNavigator } from '../../components/WeekNavigator';
import { SkeletonLoader } from '../../components/SkeletonLoader';

function getWeekDates(weekOffset: number): string[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  // Set to Sunday of current week
  startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatWeekLabel(dates: string[]): string {
  const start = new Date(dates[0] + 'T12:00:00');
  const end = new Date(dates[6] + 'T12:00:00');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  if (start.getMonth() === end.getMonth()) {
    return `${months[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const startDate = dates[0];
  const endDate = dates[6];

  const { data: availability, isLoading } = useEffectiveAvailability(
    startDate,
    endDate
  );

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-6 pt-6 pb-12">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-lavender">sync</Text>
        <TouchableOpacity onPress={() => router.push('/availability/edit')}>
          <Ionicons name="create-outline" size={24} color="#a4a8d1" />
        </TouchableOpacity>
      </View>

      {/* Week Navigator */}
      <WeekNavigator
        label={formatWeekLabel(dates)}
        onPrev={() => setWeekOffset((o) => o - 1)}
        onNext={() => setWeekOffset((o) => o + 1)}
      />

      {/* Heatmap */}
      <View className="mt-4">
        {isLoading ? (
          <View>
            <SkeletonLoader height={44} borderRadius={8} className="mb-2" />
            <SkeletonLoader height={44} borderRadius={8} className="mb-2" />
            <SkeletonLoader height={44} borderRadius={8} />
          </View>
        ) : (
          <HeatmapGrid dates={dates} availability={availability ?? []} />
        )}
      </View>

      {/* Quick actions */}
      <View className="mt-8">
        <Text className="text-dark-200 text-sm font-medium mb-3">
          Quick Actions
        </Text>
        <TouchableOpacity
          className="flex-row items-center bg-dark-700 rounded-xl px-4 py-4 mb-3"
          onPress={() => router.push('/availability/edit')}
        >
          <Ionicons name="calendar" size={20} color="#a4a8d1" />
          <Text className="text-dark-50 ml-3 text-base">
            Edit Availability
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-dark-700 rounded-xl px-4 py-4 mb-3"
          onPress={() => router.push('/friends')}
        >
          <Ionicons name="people" size={20} color="#a4a8d1" />
          <Text className="text-dark-50 ml-3 text-base">Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-dark-700 rounded-xl px-4 py-4"
          onPress={() => router.push('/group/create')}
        >
          <Ionicons name="grid" size={20} color="#a4a8d1" />
          <Text className="text-dark-50 ml-3 text-base">Groups</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
