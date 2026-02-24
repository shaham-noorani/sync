import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="chevron-back" size={24} color="#8875ff" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center' }}>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
            <Ionicons name="chevron-back" size={24} color="#8875ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Avatar url={profile.avatar_url} name={profile.display_name} size={80} />
          <Text style={styles.displayName}>
            {profile.display_name}
          </Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.city && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="location" size={12} color="#5a5f7a" />
              <Text style={styles.cityText}>{profile.city}</Text>
            </View>
          )}
        </View>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={styles.sectionLabel}>
              INTERESTS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {profile.interests.map((interest: string) => (
                <InterestChip key={interest} label={interest} selected />
              ))}
            </View>
          </View>
        )}

        {/* Availability Heatmap */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={styles.sectionLabel}>
            WHEN {profile.display_name.split(' ')[0].toUpperCase()} IS FREE
          </Text>
          <WeekNavigator
            label={formatWeekLabel(dates)}
            onPrev={() => setWeekOffset((o) => o - 1)}
            onNext={() => setWeekOffset((o) => o + 1)}
            canGoPrev={weekOffset > 0}
          />
          <View style={{ marginTop: 4 }}>
            {availLoading ? (
              <View style={styles.availabilityPlaceholder} />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#f0f0ff',
    fontWeight: '700',
    fontSize: 18,
  },
  displayName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#f0f0ff',
    fontSize: 24,
    marginTop: 16,
  },
  username: {
    color: '#8b8fa8',
    marginTop: 4,
  },
  cityText: {
    color: '#8b8fa8',
    fontSize: 14,
    marginLeft: 4,
  },
  sectionLabel: {
    color: '#5a5f7a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  availabilityPlaceholder: {
    height: 128,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    opacity: 0.6,
  },
});
