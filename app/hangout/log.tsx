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
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
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

const glassCard = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 16,
} as const;

const pillUnselected = {
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 12,
} as const;

const pillSelected = {
  backgroundColor: '#8875ff',
  borderRadius: 12,
} as const;

const textInput = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: '#f0f0ff',
  fontSize: 15,
} as const;

export default function LogHangoutScreen() {
  const router = useRouter();
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

  const isPending = logHangout.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color="#8875ff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22 }}>
            Log a Hangout
          </Text>
        </View>

        {/* Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            What happened?
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Rooftop dinner with the crew"
            placeholderTextColor="#5a5f7a"
            style={textInput}
            maxLength={80}
          />
        </View>

        {/* Activity */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
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
                      color: selected ? '#ffffff' : '#8b8fa8',
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

        {/* Date */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            When was it?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentDates.map((d) => {
              const selected = selectedDate === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setSelectedDate(d.value)}
                  style={[
                    selected ? pillSelected : pillUnselected,
                    { marginRight: 8, paddingHorizontal: 12, paddingVertical: 8 },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: selected ? '#ffffff' : '#8b8fa8',
                      fontWeight: selected ? '700' : '400',
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Location */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Location <Text style={{ fontWeight: '400' }}>(optional)</Text>
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Tartine Manufactory"
            placeholderTextColor="#5a5f7a"
            style={textInput}
          />
        </View>

        {/* Who was there */}
        {friends && (friends as any[]).length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
              Who was there?
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
                    isSelected ? { borderColor: '#8875ff', borderWidth: 1 } : {},
                  ]}
                  activeOpacity={0.7}
                >
                  <Avatar url={friend.avatar_url} name={friend.display_name} size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: '#f0f0ff', fontWeight: '600', fontSize: 14 }}>
                      {friend.display_name}
                    </Text>
                    <Text style={{ color: '#5a5f7a', fontSize: 12 }}>
                      @{friend.username}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#8875ff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Photos */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Photos <Text style={{ fontWeight: '400' }}>(optional, up to 5)</Text>
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {photos.map((photo, i) => (
              <View key={i} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity
                onPress={pickPhoto}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={24} color="#5a5f7a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Log */}
        <TouchableOpacity
          onPress={handleLog}
          disabled={isPending}
          activeOpacity={0.8}
          style={{ borderRadius: 16, overflow: 'hidden', opacity: isPending ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={['#8875ff', '#c084fc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {isPending ? 'Logging…' : '🎉 Log Hangout'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
