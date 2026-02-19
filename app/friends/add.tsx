import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSearchUsers, useSendFriendRequest } from '../../hooks/useFriends';
import { Input } from '../../components/ui/Input';
import { FriendCard } from '../../components/FriendCard';

export default function AddFriendScreen() {
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
    <View className="flex-1 bg-dark-900">
      <View className="flex-row items-center px-6 pt-16 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark-50 ml-4">
          Add Friend
        </Text>
      </View>

      <View className="px-6">
        <Input
          label="Search by username"
          value={search}
          onChangeText={setSearch}
          placeholder="Type a username..."
        />
      </View>

      <ScrollView className="flex-1 px-6">
        {search.length < 2 ? (
          <Text className="text-dark-300 text-center mt-8">
            Type at least 2 characters to search
          </Text>
        ) : isLoading ? (
          <Text className="text-dark-300 text-center mt-8">Searching...</Text>
        ) : results?.length === 0 ? (
          <Text className="text-dark-300 text-center mt-8">
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
    </View>
  );
}
