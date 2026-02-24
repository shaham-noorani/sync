import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
            <Ionicons name="chevron-back" size={24} color="#8875ff" />
          </TouchableOpacity>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
        </View>

        {group.description && (
          <Text style={styles.descriptionText}>
            {group.description}
          </Text>
        )}

        {/* Invite Code */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <TouchableOpacity
            style={[styles.glassCard, { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={copyInviteCode}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.inviteCodeLabel}>
                INVITE CODE
              </Text>
              <Text style={styles.inviteCodeValue}>
                {group.invite_code}
              </Text>
            </View>
            <View style={styles.copyIconContainer}>
              <Ionicons name="copy-outline" size={20} color="#8875ff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Group Availability Heatmap */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={styles.sectionLabel}>
            GROUP AVAILABILITY
          </Text>
          <WeekNavigator
            label={formatWeekLabel(dates)}
            onPrev={() => setWeekOffset((o) => o - 1)}
            onNext={() => setWeekOffset((o) => o + 1)}
            canGoPrev={weekOffset > 0}
          />
          <View style={{ marginTop: 4 }}>
            {overlapsLoading ? (
              <View style={styles.heatmapPlaceholder} />
            ) : (
              <HeatmapGrid
                dates={dates}
                availability={[]}
                friendOverlapCounts={groupOverlaps ?? {}}
              />
            )}
          </View>
          <Text style={styles.heatmapHint}>
            Numbers show how many members are free
          </Text>
        </View>

        {/* Members */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={styles.sectionLabel}>
            MEMBERS · {group.members.length}
          </Text>

          {group.members.map((member: any) => (
            <TouchableOpacity
              key={member.id}
              style={[styles.glassCard, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }]}
              onPress={() => router.push(`/profile/${member.user_id}`)}
              activeOpacity={0.8}
            >
              <Avatar
                url={member.profile.avatar_url}
                name={member.profile.display_name}
                size={40}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.memberName}>
                  {member.profile.display_name}
                </Text>
                <Text style={styles.memberUsername}>
                  @{member.profile.username}
                </Text>
              </View>
              {member.role !== 'member' && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {member.role.toUpperCase()}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#5a5f7a"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ))}

          {/* Leave */}
          <View style={{ marginTop: 32 }}>
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
  groupName: {
    flex: 1,
    color: '#f0f0ff',
    fontWeight: '700',
    fontSize: 22,
  },
  descriptionText: {
    color: '#8b8fa8',
    fontSize: 14,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  inviteCodeLabel: {
    color: '#5a5f7a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  inviteCodeValue: {
    color: '#8875ff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 4,
  },
  copyIconContainer: {
    backgroundColor: 'rgba(136,117,255,0.15)',
    borderRadius: 999,
    padding: 8,
  },
  sectionLabel: {
    color: '#5a5f7a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heatmapPlaceholder: {
    height: 128,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    opacity: 0.6,
  },
  heatmapHint: {
    color: '#5a5f7a',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  memberName: {
    color: '#f0f0ff',
    fontWeight: '600',
    fontSize: 14,
  },
  memberUsername: {
    color: '#8b8fa8',
    fontSize: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(136,117,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeText: {
    color: '#8875ff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
