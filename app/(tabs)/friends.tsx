import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function FriendsTabScreen() {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22 }}>Friends</Text>
        <TouchableOpacity onPress={() => router.push('/friends/add')}>
          <Ionicons name="person-add" size={24} color="#8875ff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              { marginRight: 16 },
              activeTab === tab.key
                ? { borderBottomWidth: 2, borderBottomColor: '#8875ff', paddingBottom: 8 }
                : { paddingBottom: 8 },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={
                activeTab === tab.key
                  ? { color: '#8875ff', fontWeight: '700', fontSize: 14 }
                  : { color: '#5a5f7a', fontWeight: '600', fontSize: 14 }
              }
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0
                ? ` (${tab.count})`
                : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
        {activeTab === 'friends' && (
          <>
            {friendsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} height={60} borderRadius={12} className="mb-3" />
              ))
            ) : friends?.length === 0 ? (
              <Text style={{ color: '#5a5f7a', textAlign: 'center', marginTop: 32 }}>
                No friends yet. Tap + to add some!
              </Text>
            ) : (
              friends?.map((friend: any) => (
                <FriendCard
                  key={friend.friendshipId}
                  displayName={friend.display_name}
                  username={friend.username}
                  avatarUrl={friend.avatar_url}
                  onPress={() => router.push(`/profile/${friend.id}`)}
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
              <Text style={{ color: '#5a5f7a', textAlign: 'center', marginTop: 32 }}>
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
              <Text style={{ color: '#5a5f7a', textAlign: 'center', marginTop: 32 }}>
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
    </SafeAreaView>
  );
}
