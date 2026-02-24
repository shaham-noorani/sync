import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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

export default function FriendsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const { data: friends, isLoading: friendsLoading, refetch: refetchFriends } = useFriendsList();
  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = usePendingRequests();
  const respondToRequest = useRespondToRequest();
  const removeFriend = useRemoveFriend();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFriends(), refetchRequests()]);
    setRefreshing(false);
  }, [refetchFriends, refetchRequests]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#8875ff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22, marginLeft: 16 }}>
            Friends
          </Text>
        </View>
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
              { marginRight: 16, paddingBottom: 8 },
              activeTab === tab.key
                ? { borderBottomWidth: 2, borderBottomColor: '#8875ff' }
                : {},
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={
                activeTab === tab.key
                  ? { color: '#8875ff', fontWeight: '700', fontSize: 15 }
                  : { color: '#5a5f7a', fontWeight: '600', fontSize: 15 }
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

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, backgroundColor: '#09090f' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
