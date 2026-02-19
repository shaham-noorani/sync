import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useFriendsList,
  usePendingRequests,
  useRespondToRequest,
  useRemoveFriend,
  useFriendshipsRealtime,
} from '../../hooks/useFriends';
import { FriendCard } from '../../components/FriendCard';
import { SkeletonLoader } from '../../components/SkeletonLoader';

type Tab = 'friends' | 'requests' | 'sent';

export default function FriendsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const { data: friends, isLoading: friendsLoading } = useFriendsList();
  const { data: requests, isLoading: requestsLoading } = usePendingRequests();
  const respondToRequest = useRespondToRequest();
  const removeFriend = useRemoveFriend();

  useFriendshipsRealtime();

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'friends', label: 'Friends', count: friends?.length },
    { key: 'requests', label: 'Requests', count: requests?.incoming.length },
    { key: 'sent', label: 'Sent', count: requests?.outgoing.length },
  ];

  return (
    <View className="flex-1 bg-dark-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark-50 ml-4">Friends</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/friends/add')}>
          <Ionicons name="person-add" size={24} color="#a4a8d1" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`mr-4 pb-2 ${
              activeTab === tab.key ? 'border-b-2 border-lavender' : ''
            }`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              className={`text-base font-medium ${
                activeTab === tab.key ? 'text-lavender' : 'text-dark-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0
                ? ` (${tab.count})`
                : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-6">
        {activeTab === 'friends' && (
          <>
            {friendsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} height={60} borderRadius={12} className="mb-3" />
              ))
            ) : friends?.length === 0 ? (
              <Text className="text-dark-300 text-center mt-8">
                No friends yet. Tap + to add some!
              </Text>
            ) : (
              friends?.map((friend: any) => (
                <FriendCard
                  key={friend.friendshipId}
                  displayName={friend.display_name}
                  username={friend.username}
                  avatarUrl={friend.avatar_url}
                  actionLabel="Remove"
                  onAction={() => removeFriend.mutate(friend.friendshipId)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {requestsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <SkeletonLoader key={i} height={60} borderRadius={12} className="mb-3" />
              ))
            ) : requests?.incoming.length === 0 ? (
              <Text className="text-dark-300 text-center mt-8">
                No pending requests
              </Text>
            ) : (
              requests?.incoming.map((req: any) => (
                <FriendCard
                  key={req.friendshipId}
                  displayName={req.display_name}
                  username={req.username}
                  avatarUrl={req.avatar_url}
                  actionLabel="Accept"
                  secondaryActionLabel="Decline"
                  onAction={() =>
                    respondToRequest.mutate({
                      friendshipId: req.friendshipId,
                      status: 'accepted',
                    })
                  }
                  onSecondaryAction={() =>
                    respondToRequest.mutate({
                      friendshipId: req.friendshipId,
                      status: 'declined',
                    })
                  }
                />
              ))
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {requestsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <SkeletonLoader key={i} height={60} borderRadius={12} className="mb-3" />
              ))
            ) : requests?.outgoing.length === 0 ? (
              <Text className="text-dark-300 text-center mt-8">
                No sent requests
              </Text>
            ) : (
              requests?.outgoing.map((req: any) => (
                <FriendCard
                  key={req.friendshipId}
                  displayName={req.display_name}
                  username={req.username}
                  avatarUrl={req.avatar_url}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
