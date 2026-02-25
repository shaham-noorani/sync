import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers, useSendFriendRequest } from '../../hooks/useFriends';
import { Input } from '../../components/ui/Input';
import { FriendCard } from '../../components/FriendCard';
import { useColors } from '../../providers/ThemeProvider';

export default function AddFriendScreen() {
  const c = useColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: results, isLoading } = useSearchUsers(search);
  const sendRequest = useSendFriendRequest();
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  const handleSend = async (userId: string) => {
    await sendRequest.mutateAsync(userId);
    setSentTo((prev) => new Set(prev).add(userId));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: c.text, fontSize: 22, marginLeft: 16 }}>
          Add Friend
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <Input
          label="Search by username"
          value={search}
          onChangeText={setSearch}
          placeholder="Type a username..."
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
        {search.length < 2 ? (
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 32 }}>
            Type at least 2 characters to search
          </Text>
        ) : isLoading ? (
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 32 }}>Searching...</Text>
        ) : results?.length === 0 ? (
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 32 }}>
            No users found
          </Text>
        ) : (
          results?.map((user) => (
            <FriendCard
              key={user.id}
              displayName={user.display_name}
              username={user.username}
              avatarUrl={user.avatar_url}
              actionLabel={sentTo.has(user.id) ? 'Sent' : 'Add'}
              onAction={
                sentTo.has(user.id) ? undefined : () => handleSend(user.id)
              }
              loading={sendRequest.isPending}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
