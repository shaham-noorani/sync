import { Ionicons } from '@expo/vector-icons';
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
import { useTheme } from '../../providers/ThemeProvider';

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
  const { isDark } = useTheme();
  const createProposal = useCreateProposal();
  const { data: friends } = useFriendsList();
  const { data: groups } = useMyGroups();

  const [title, setTitle] = useState('');
  const [activityTag, setActivityTag] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const upcomingDates = getUpcomingDates();
  const placeholderColor = isDark ? '#64748b' : '#9ca3af';

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pt-2 pb-12">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#94a3b8' : '#6b7280'} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-dark-50">
            Propose a Hangout
          </Text>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            What's the plan?
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Saturday tennis match"
            placeholderTextColor={placeholderColor}
            className="bg-white dark:bg-dark-700 rounded-xl px-4 py-3 text-gray-900 dark:text-dark-50 text-base"
            maxLength={80}
          />
        </View>

        {/* Activity */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            Activity
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ACTIVITIES.map((a) => {
              const selected = activityTag === a.tag;
              return (
                <TouchableOpacity
                  key={a.tag}
                  onPress={() => setActivityTag(selected ? '' : a.tag)}
                  className={`mr-2 items-center justify-center rounded-xl px-3 py-2 ${
                    selected ? 'bg-lavender' : 'bg-white dark:bg-dark-700'
                  }`}
                  style={{ minWidth: 68 }}
                >
                  <Text className="text-2xl">{a.emoji}</Text>
                  <Text
                    className={`text-xs mt-0.5 ${
                      selected
                        ? 'text-dark-900 font-semibold'
                        : 'text-gray-500 dark:text-dark-300'
                    }`}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* When */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            When <Text className="font-normal">(optional)</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <TouchableOpacity
              onPress={() => setSelectedDate('')}
              className={`mr-2 rounded-xl px-3 py-2 ${
                !selectedDate ? 'bg-lavender' : 'bg-white dark:bg-dark-700'
              }`}
            >
              <Text
                className={`text-sm ${
                  !selectedDate
                    ? 'text-dark-900 font-semibold'
                    : 'text-gray-500 dark:text-dark-300'
                }`}
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
                  className={`mr-2 rounded-xl px-3 py-2 ${
                    selected ? 'bg-lavender' : 'bg-white dark:bg-dark-700'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selected
                        ? 'text-dark-900 font-semibold'
                        : 'text-gray-500 dark:text-dark-300'
                    }`}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDate && (
            <View className="flex-row">
              {TIME_BLOCKS.map((t) => {
                const selected = selectedTimeBlock === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setSelectedTimeBlock(selected ? '' : t.key)}
                    className={`mr-2 rounded-xl px-4 py-2 ${
                      selected ? 'bg-lavender' : 'bg-white dark:bg-dark-700'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selected
                          ? 'text-dark-900 font-semibold'
                          : 'text-gray-500 dark:text-dark-300'
                      }`}
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
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            Location <Text className="font-normal">(optional)</Text>
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Dolores Park"
            placeholderTextColor={placeholderColor}
            className="bg-white dark:bg-dark-700 rounded-xl px-4 py-3 text-gray-900 dark:text-dark-50 text-base"
          />
        </View>

        {/* Invite Friends */}
        {friends && friends.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
              Invite Friends
            </Text>
            {(friends as any[]).map((friend) => {
              const isSelected = selectedFriendIds.includes(friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  onPress={() => toggleFriend(friend.id)}
                  className={`flex-row items-center bg-white dark:bg-dark-700 rounded-xl px-4 py-3 mb-2 ${
                    isSelected ? 'border border-lavender' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <Avatar url={friend.avatar_url} name={friend.display_name} size={36} />
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 dark:text-dark-50 font-medium text-sm">
                      {friend.display_name}
                    </Text>
                    <Text className="text-gray-400 dark:text-dark-400 text-xs">
                      @{friend.username}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#a4a8d1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Or invite a Group */}
        {groups && groups.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
              Or invite a Group
            </Text>
            {(groups as any[]).map((group) => {
              const isSelected = selectedGroupId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => setSelectedGroupId(isSelected ? '' : group.id)}
                  className={`flex-row items-center bg-white dark:bg-dark-700 rounded-xl px-4 py-3 mb-2 ${
                    isSelected ? 'border border-lavender' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="w-9 h-9 rounded-full bg-lavender/20 items-center justify-center mr-3">
                    <Text className="text-base">👥</Text>
                  </View>
                  <Text className="flex-1 text-gray-900 dark:text-dark-50 font-medium text-sm">
                    {group.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#a4a8d1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Send */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={createProposal.isPending}
          className="bg-lavender rounded-2xl py-4 items-center mt-2"
          activeOpacity={0.8}
        >
          <Text className="text-dark-900 font-bold text-base">
            {createProposal.isPending ? 'Sending…' : 'Send Proposal'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
