import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../providers/ThemeProvider';
import { useLogHangout } from '../../hooks/useHangouts';
import { useFriendsList } from '../../hooks/useFriends';
import { Avatar } from '../../components/Avatar';

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

function getRecentDates(count = 7): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const value = d.toISOString().split('T')[0];
    const label = i === 0
      ? 'Today'
      : i === 1
      ? 'Yesterday'
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dates.push({ value, label });
  }
  return dates;
}

export default function LogHangoutScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const logHangout = useLogHangout();
  const { data: friends } = useFriendsList();

  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [activityTag, setActivityTag] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [location, setLocation] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ uri: string; caption?: string }[]>([]);

  const recentDates = getRecentDates();
  const placeholderColor = isDark ? '#64748b' : '#9ca3af';

  function toggleFriend(id: string) {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((a) => ({ uri: a.uri }));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  }

  async function handleLog() {
    if (!title.trim()) {
      Alert.alert('What did you do?', 'Please add a title for your hangout.');
      return;
    }

    try {
      const hangout = await logHangout.mutateAsync({
        title: title.trim(),
        activity_tag: activityTag || undefined,
        date: selectedDate,
        location_name: location.trim() || undefined,
        attendee_ids: selectedFriendIds,
        photos: photos.length > 0 ? photos : undefined,
      });
      router.replace(`/hangout/${(hangout as any).id}`);
    } catch {
      Alert.alert('Error', 'Failed to log hangout. Please try again.');
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
            Log a Hangout
          </Text>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            What happened?
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Rooftop dinner with the crew"
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
                      selected ? 'text-dark-900 font-semibold' : 'text-gray-500 dark:text-dark-300'
                    }`}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Date */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            When was it?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentDates.map((d) => {
              const selected = selectedDate === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setSelectedDate(d.value)}
                  className={`mr-2 rounded-xl px-3 py-2 ${
                    selected ? 'bg-lavender' : 'bg-white dark:bg-dark-700'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selected ? 'text-dark-900 font-semibold' : 'text-gray-500 dark:text-dark-300'
                    }`}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            Location <Text className="font-normal">(optional)</Text>
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Tartine Manufactory"
            placeholderTextColor={placeholderColor}
            className="bg-white dark:bg-dark-700 rounded-xl px-4 py-3 text-gray-900 dark:text-dark-50 text-base"
          />
        </View>

        {/* Who was there */}
        {friends && (friends as any[]).length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
              Who was there?
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

        {/* Photos */}
        <View className="mb-6">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            Photos <Text className="font-normal">(optional, up to 5)</Text>
          </Text>
          <View className="flex-row flex-wrap">
            {photos.map((photo, i) => (
              <View key={i} className="relative mr-2 mb-2">
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity
                onPress={pickPhoto}
                className="w-20 h-20 rounded-xl bg-white dark:bg-dark-700 border border-dashed border-gray-300 dark:border-dark-500 items-center justify-center mb-2"
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={24} color={isDark ? '#64748b' : '#9ca3af'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Log */}
        <TouchableOpacity
          onPress={handleLog}
          disabled={logHangout.isPending}
          className="bg-lavender rounded-2xl py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-dark-900 font-bold text-base">
            {logHangout.isPending ? 'Logging…' : '🎉 Log Hangout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
