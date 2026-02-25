import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useGroup, useLeaveGroup } from '../../hooks/useGroups';
import { useGroupAvailability } from '../../hooks/useAvailability';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { HeatmapGrid } from '../../components/HeatmapGrid';
import { WeekNavigator } from '../../components/WeekNavigator';
import { useColors } from '../../providers/ThemeProvider';

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
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: group, isLoading } = useGroup(id);
  const leaveGroup = useLeaveGroup();
  const [weekOffset, setWeekOffset] = useState(0);

  const myRole = useMemo(
    () => group?.members?.find((m: any) => m.user_id === user?.id)?.role ?? 'member',
    [group, user]
  );
  const isManager = myRole === 'owner' || myRole === 'admin';

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
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
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

  const BANNER_HEIGHT = 200;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Banner */}
        <View style={{ position: 'relative', height: BANNER_HEIGHT, marginBottom: 0 }}>
          {group.icon_url ? (
            <View style={{ width: '100%', height: BANNER_HEIGHT }}>
              <Image
                source={{ uri: group.icon_url }}
                style={{ width: '100%', height: BANNER_HEIGHT, resizeMode: 'cover' }}
              />
              <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
            </View>
          ) : (
            <LinearGradient
              colors={['#8875ff', '#c084fc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: '100%', height: BANNER_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              {group.icon_name ? (
                <Text style={{ fontSize: 72 }}>{group.icon_name}</Text>
              ) : (
                <Ionicons name="grid" size={72} color="rgba(255,255,255,0.6)" />
              )}
            </LinearGradient>
          )}

          {/* Back button overlay */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 12, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 6 }}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Settings button overlay */}
          {isManager && (
            <TouchableOpacity
              onPress={() => router.push(`/group/edit/${id}`)}
              style={{ position: 'absolute', top: 12, right: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 6 }}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Title + Description */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: group.description ? 4 : 16 }}>
          <Text style={{ color: c.text, fontWeight: '700', fontSize: 26 }}>{group.name}</Text>
        </View>
        {group.description && (
          <Text style={{ color: c.textSecondary, fontSize: 14, paddingHorizontal: 24, paddingBottom: 20 }}>
            {group.description}
          </Text>
        )}

        {/* Group Availability Heatmap */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{
            color: c.textMuted,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.5,
            marginBottom: 12,
          }}>
            GROUP AVAILABILITY
          </Text>
          <WeekNavigator
            label={formatWeekLabel(dates)}
            onPrev={() => setWeekOffset((o) => Math.max(0, o - 1))}
            onNext={() => setWeekOffset((o) => o + 1)}
            canGoPrev={weekOffset > 0}
            onToday={() => setWeekOffset(0)}
          />
          <View style={{ marginTop: 4 }}>
            {overlapsLoading ? (
              <View style={{
                height: 128,
                backgroundColor: c.bgCard,
                borderRadius: 14,
                opacity: 0.6,
              }} />
            ) : (
              <HeatmapGrid
                dates={dates}
                availability={[]}
                friendOverlapCounts={groupOverlaps ?? {}}
                totalMembers={group.members.length}
              />
            )}
          </View>
          <Text style={{
            color: c.textMuted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 8,
          }}>
            Numbers show how many members are free
          </Text>
        </View>

        {/* Members */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{
            color: c.textMuted,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.5,
            marginBottom: 12,
          }}>
            MEMBERS · {group.members.length}
          </Text>

          {group.members.map((member: any) => (
            <TouchableOpacity
              key={member.id}
              style={{
                backgroundColor: c.bgCard,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 8,
              }}
              onPress={() => router.push(`/profile/${member.user_id}`)}
              activeOpacity={0.8}
            >
              <Avatar
                url={member.profile.avatar_url}
                name={member.profile.display_name}
                size={40}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{
                  color: c.text,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  {member.profile.display_name}
                </Text>
                <Text style={{
                  color: c.textSecondary,
                  fontSize: 12,
                }}>
                  @{member.profile.username}
                </Text>
              </View>
              {member.role !== 'member' && (
                <View style={{
                  backgroundColor: c.accentBg,
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}>
                  <Text style={{
                    color: c.accent,
                    fontSize: 11,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}>
                    {member.role.toUpperCase()}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={16}
                color={c.textMuted}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ))}

          {/* Invite Code */}
          <TouchableOpacity
            style={{
              backgroundColor: c.bgCard,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 24,
            }}
            onPress={copyInviteCode}
            activeOpacity={0.8}
          >
            <View>
              <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                INVITE CODE
              </Text>
              <Text style={{ color: c.accent, fontSize: 24, fontWeight: '700', letterSpacing: 4, marginTop: 4 }}>
                {group.invite_code}
              </Text>
            </View>
            <View style={{ backgroundColor: c.accentBg, borderRadius: 999, padding: 8 }}>
              <Ionicons name="copy-outline" size={20} color={c.accent} />
            </View>
          </TouchableOpacity>

          {/* Leave */}
          <View style={{ marginTop: 16 }}>
            <Button
              title="Leave Group"
              onPress={handleLeave}
              variant="critical"
              loading={leaveGroup.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
