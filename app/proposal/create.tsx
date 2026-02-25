import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { useFriendsList } from '../../hooks/useFriends';
import { useMyGroups } from '../../hooks/useGroups';
import { useCreateProposal } from '../../hooks/useProposals';
import { useColors } from '../../providers/ThemeProvider';

const ACTIVITIES: { tag: string; emoji: string; label: string }[] = [
  { tag: 'dinner', emoji: '🍽️', label: 'Dinner' },
  { tag: 'drinks', emoji: '🍻', label: 'Drinks' },
  { tag: 'coffee', emoji: '☕', label: 'Coffee' },
  { tag: 'hiking', emoji: '🥾', label: 'Hiking' },
  { tag: 'climbing', emoji: '🧗', label: 'Climbing' },
  { tag: 'tennis', emoji: '🎾', label: 'Tennis' },
  { tag: 'run', emoji: '🏃', label: 'Run' },
  { tag: 'movie', emoji: '🎬', label: 'Movie' },
  { tag: 'games', emoji: '🎮', label: 'Games' },
  { tag: 'board games', emoji: '🎲', label: 'Board Games' },
];

const TIME_BLOCKS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
];

function getUpcomingDates(count = 14): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    dates.push({ value, label });
  }
  return dates;
}

export default function CreateProposalScreen() {
  const router = useRouter();
  const createProposal = useCreateProposal();
  const { data: friends } = useFriendsList();
  const { data: groups } = useMyGroups();
  const c = useColors();

  const glassCard = {
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
  } as const;

  const pillUnselected = {
    backgroundColor: c.bgCardHover,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
  } as const;

  const pillSelected = {
    backgroundColor: c.accent,
    borderRadius: 12,
  } as const;

  const textInput = {
    backgroundColor: c.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: c.text,
    fontSize: 15,
  } as const;

  const [title, setTitle] = useState('');
  const [activityTag, setActivityTag] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const upcomingDates = getUpcomingDates();

  function toggleFriend(id: string) {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSend() {
    if (!title.trim()) {
      Alert.alert('What are you doing?', 'Please add a title for your hangout.');
      return;
    }
    if (selectedFriendIds.length === 0 && !selectedGroupId) {
      Alert.alert("Who's invited?", 'Select at least one friend or a group.');
      return;
    }

    try {
      await createProposal.mutateAsync({
        title: title.trim(),
        activity_tag: activityTag || undefined,
        proposed_date: selectedDate || undefined,
        proposed_time_block: selectedTimeBlock || undefined,
        location_name: location.trim() || undefined,
        group_id: selectedGroupId || undefined,
        invitee_ids: selectedFriendIds,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to send proposal. Please try again.');
    }
  }

  const isPending = createProposal.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={c.accent} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: c.text, fontSize: 22 }}>
            Propose a Hangout
          </Text>
        </View>

        {/* Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            What's the plan?
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Saturday tennis match"
            placeholderTextColor={c.textMuted}
            style={textInput}
            maxLength={80}
          />
        </View>

        {/* Activity */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Activity
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ACTIVITIES.map((a) => {
              const selected = activityTag === a.tag;
              return (
                <TouchableOpacity
                  key={a.tag}
                  onPress={() => setActivityTag(selected ? '' : a.tag)}
                  style={[
                    selected ? pillSelected : pillUnselected,
                    { marginRight: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8, minWidth: 68 },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 2,
                      color: selected ? '#ffffff' : c.textSecondary,
                      fontWeight: selected ? '700' : '400',
                    }}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* When */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            When <Text style={{ fontWeight: '400' }}>(optional)</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedDate('')}
              style={[
                !selectedDate ? pillSelected : pillUnselected,
                { marginRight: 8, paddingHorizontal: 12, paddingVertical: 8 },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: !selectedDate ? '#ffffff' : c.textSecondary,
                  fontWeight: !selectedDate ? '700' : '400',
                }}
              >
                TBD
              </Text>
            </TouchableOpacity>
            {upcomingDates.map((d) => {
              const selected = selectedDate === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setSelectedDate(selected ? '' : d.value)}
                  style={[
                    selected ? pillSelected : pillUnselected,
                    { marginRight: 8, paddingHorizontal: 12, paddingVertical: 8 },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: selected ? '#ffffff' : c.textSecondary,
                      fontWeight: selected ? '700' : '400',
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDate && (
            <View style={{ flexDirection: 'row' }}>
              {TIME_BLOCKS.map((t) => {
                const selected = selectedTimeBlock === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setSelectedTimeBlock(selected ? '' : t.key)}
                    style={[
                      selected ? pillSelected : pillUnselected,
                      { marginRight: 8, paddingHorizontal: 16, paddingVertical: 8 },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: selected ? '#ffffff' : c.textSecondary,
                        fontWeight: selected ? '700' : '400',
                      }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Location */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Location <Text style={{ fontWeight: '400' }}>(optional)</Text>
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Dolores Park"
            placeholderTextColor={c.textMuted}
            style={textInput}
          />
        </View>

        {/* Invite Friends */}
        {friends && friends.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
              Invite Friends
            </Text>
            {(friends as any[]).map((friend) => {
              const isSelected = selectedFriendIds.includes(friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  onPress={() => toggleFriend(friend.id)}
                  style={[
                    glassCard,
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
                    isSelected ? { borderColor: c.accent, borderWidth: 1 } : {},
                  ]}
                  activeOpacity={0.7}
                >
                  <Avatar url={friend.avatar_url} name={friend.display_name} size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }}>
                      {friend.display_name}
                    </Text>
                    <Text style={{ color: c.textMuted, fontSize: 12 }}>
                      @{friend.username}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={c.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Or invite a Group */}
        {groups && groups.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
              Or invite a Group
            </Text>
            {(groups as any[]).map((group) => {
              const isSelected = selectedGroupId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => setSelectedGroupId(isSelected ? '' : group.id)}
                  style={[
                    glassCard,
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
                    isSelected ? { borderColor: c.accent, borderWidth: 1 } : {},
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 16 }}>👥</Text>
                  </View>
                  <Text style={{ flex: 1, color: c.text, fontWeight: '600', fontSize: 14 }}>
                    {group.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={c.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Send */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={isPending}
          activeOpacity={0.8}
          style={{ borderRadius: 16, overflow: 'hidden', opacity: isPending ? 0.7 : 1, marginTop: 8 }}
        >
          <LinearGradient
            colors={['#8875ff', '#c084fc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {isPending ? 'Sending…' : 'Send Proposal'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
