import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffectiveAvailability } from '../../hooks/useAvailability';
import { useFriendsAvailability, useFriendOverlaps } from '../../hooks/useOverlaps';
import { useProposals } from '../../hooks/useProposals';
import { HeatmapGrid } from '../../components/HeatmapGrid';
import { WeekNavigator } from '../../components/WeekNavigator';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};

// Rich accent colors per activity (for proposal cards)
const ACTIVITY_COLORS: Record<string, string> = {
  tennis: '#2d6a4f',
  'board games': '#7b2d8b',
  dinner: '#9a3412',
  climbing: '#1e3a5f',
  movie: '#312e81',
  drinks: '#713f12',
  run: '#1e40af',
  games: '#14532d',
  hiking: '#3f6212',
  coffee: '#78350f',
  default: '#1e293b',
};

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

function HeatmapSkeleton() {
  return (
    <View>
      {/* Header row skeleton */}
      <View className="flex-row mb-2">
        <View className="w-10" />
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} className="flex-1 items-center">
            <View className="w-6 h-3 rounded mb-1 opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <View className="w-7 h-7 rounded-full opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </View>
        ))}
      </View>
      {/* Cell rows */}
      {['AM', 'PM', 'Eve'].map((label) => (
        <View key={label} className="flex-row mb-1.5 items-center">
          <View className="w-10">
            <Text className="text-gray-400 dark:text-dark-400 text-xs font-medium">{label}</Text>
          </View>
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              className="flex-1 mx-0.5 rounded-lg opacity-60"
              style={{ minHeight: 40, backgroundColor: 'rgba(255,255,255,0.06)' }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const startDate = dates[0];
  const endDate = dates[6];

  const { data: availability, isLoading: availLoading, refetch: refetchAvail } = useEffectiveAvailability(startDate, endDate);
  const { data: friendOverlapCounts, refetch: refetchOverlapCounts } = useFriendsAvailability(startDate, endDate);
  const { data: overlaps, refetch: refetchOverlaps } = useFriendOverlaps(startDate, endDate);
  const { data: proposals, refetch: refetchProposals } = useProposals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAvail(), refetchOverlapCounts(), refetchOverlaps(), refetchProposals()]);
    setRefreshing(false);
  }, [refetchAvail, refetchOverlapCounts, refetchOverlaps, refetchProposals]);

  const topOverlaps = useMemo(() => {
    if (!overlaps) return [];
    return overlaps.slice(0, 3);
  }, [overlaps]);

  const openProposals = proposals?.slice(0, 6) ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#09090f' }} edges={['top']}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: '#09090f' }}
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Text
            style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, letterSpacing: -0.5, color: '#8875ff' }}
          >
            sync
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/availability/edit')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.07)',
              borderWidth: 1,
              borderColor: 'rgba(136,117,255,0.4)',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={15} color="#8875ff" />
            <Text style={{ color: '#8875ff', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
              Availability
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Proposals */}
        {openProposals.length > 0 && (
          <View className="mb-6">
            <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }} className="px-6 mb-3 uppercase">
              Who's Down?
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {openProposals.map((p) => {
                const emoji = ACTIVITY_EMOJIS[p.activity_tag?.toLowerCase() ?? ''] ?? '📅';
                const bgColor = ACTIVITY_COLORS[p.activity_tag?.toLowerCase() ?? ''] ?? ACTIVITY_COLORS.default;
                const acceptedCount = p.responses.filter((r) => r.response === 'accepted').length;
                const pendingResponse = p.my_response === 'pending' || p.my_response === null;

                return (
                  <TouchableOpacity
                    key={p.id}
                    className="mr-3 rounded-2xl overflow-hidden"
                    style={{ width: 180, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
                    onPress={() => router.push(`/proposal/${p.id}`)}
                    activeOpacity={0.85}
                  >
                    {/* Card header — activity color block */}
                    <View
                      style={{ backgroundColor: bgColor, paddingVertical: 20, alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 36 }}>{emoji}</Text>
                    </View>
                    {/* Card body */}
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 12 }}>
                      <Text
                        style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 13 }}
                        numberOfLines={2}
                      >
                        {p.title}
                      </Text>
                      {p.proposed_date && (
                        <Text style={{ color: '#5a5f7a', fontSize: 11, marginTop: 4 }}>
                          {new Date(p.proposed_date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          })}
                          {p.proposed_time_block ? ` · ${p.proposed_time_block}` : ''}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-2">
                        <Text style={{ color: '#5a5f7a', fontSize: 11 }} className="flex-1">
                          {acceptedCount} going
                        </Text>
                        {pendingResponse && (
                          <LinearGradient
                            colors={['#8875ff', '#c084fc']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}
                          >
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Respond</Text>
                          </LinearGradient>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Overlap Alerts */}
        {topOverlaps.length > 0 && (
          <View className="px-6 mb-6">
            <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }} className="mb-3 uppercase">
              Make a Plan
            </Text>
            {topOverlaps.map((overlap) => {
              const names = overlap.available_names.slice(0, 2).join(' & ');
              const date = new Date(overlap.date + 'T12:00:00');
              const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const extra = overlap.available_count > 3 ? ` +${overlap.available_count - 3}` : '';
              return (
                <TouchableOpacity
                  key={`${overlap.date}-${overlap.time_block}`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderLeftWidth: 3,
                    borderLeftColor: '#8875ff',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => router.push('/proposal/create')}
                  activeOpacity={0.8}
                >
                  <View className="flex-1">
                    <Text style={{ color: '#f0f0ff', fontWeight: '600', fontSize: 13 }}>
                      {names}{extra} free · {overlap.time_block}
                    </Text>
                    <Text style={{ color: '#5a5f7a', fontSize: 12, marginTop: 2 }}>
                      {dateStr}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(136,117,255,0.15)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Text style={{ color: '#8875ff', fontSize: 12, fontWeight: '700' }}>
                      Plan →
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Availability Heatmap */}
        <View className="px-6">
          <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }} className="mb-1 uppercase">
            Your Availability
          </Text>
          <WeekNavigator
            label={formatWeekLabel(dates)}
            onPrev={() => setWeekOffset((o) => o - 1)}
            onNext={() => setWeekOffset((o) => o + 1)}
            canGoPrev={weekOffset > 0}
          />
          <View className="mt-1">
            {availLoading ? (
              <HeatmapSkeleton />
            ) : (
              <HeatmapGrid
                dates={dates}
                availability={availability ?? []}
                friendOverlapCounts={friendOverlapCounts}
                onCellPress={() => router.push('/availability/edit')}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
