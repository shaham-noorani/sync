import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { useProposals, useProposalsRealtime, type Proposal } from '../../hooks/useProposals';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};

const RESPONSE_COLORS: Record<string, string> = {
  accepted: 'text-green-500',
  declined: 'text-red-400',
  maybe: 'text-yellow-500',
};

function ProposalCard({ proposal, isMe }: { proposal: Proposal; isMe: boolean }) {
  const router = useRouter();
  const { isDark } = useTheme();
  const acceptedCount = proposal.responses.filter((r) => r.response === 'accepted').length;
  const pendingResponse = !isMe && (proposal.my_response === 'pending' || proposal.my_response === null);
  const myResponseColor = proposal.my_response ? RESPONSE_COLORS[proposal.my_response] : null;

  const dateStr = proposal.proposed_date
    ? new Date(proposal.proposed_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : 'Date TBD';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/proposal/${proposal.id}`)}
      className="bg-white dark:bg-dark-700 rounded-2xl px-4 py-4 mb-3"
      activeOpacity={0.8}
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-xl bg-lavender/20 items-center justify-center mr-3">
          <Text className="text-lg">
            {ACTIVITY_EMOJIS[proposal.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-dark-50 font-bold text-sm" numberOfLines={1}>
            {proposal.title}
          </Text>
          <Text className="text-gray-400 dark:text-dark-400 text-xs mt-0.5">{dateStr}</Text>
        </View>
        {pendingResponse ? (
          <View className="bg-lavender rounded-full px-2.5 py-1 ml-2">
            <Text className="text-dark-900 text-xs font-bold">Respond</Text>
          </View>
        ) : myResponseColor ? (
          <Text className={`text-xs font-semibold ml-2 ${myResponseColor}`}>
            {proposal.my_response === 'accepted' ? '✓ Going'
              : proposal.my_response === 'declined' ? '✗ Declined'
              : '? Maybe'}
          </Text>
        ) : null}
      </View>

      {/* Footer row */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100 dark:border-dark-600">
        {/* Avatar stack */}
        <View className="flex-row flex-1 items-center">
          {proposal.responses.slice(0, 4).map((r, i) => (
            <View key={r.user_id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
              <Avatar url={r.profile.avatar_url} name={r.profile.display_name} size={22} />
            </View>
          ))}
          <Text className="text-gray-400 dark:text-dark-400 text-xs ml-2">
            {acceptedCount} going
          </Text>
        </View>
        <Text className="text-gray-400 dark:text-dark-400 text-xs">
          {isMe ? 'by you' : `by ${proposal.creator.display_name.split(' ')[0]}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProposalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: proposals, isLoading, refetch } = useProposals();
  const [refreshing, setRefreshing] = useState(false);

  useProposalsRealtime();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const mine = proposals?.filter((p) => p.created_by === user?.id) ?? [];
  const incoming = proposals?.filter((p) => p.created_by !== user?.id) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-dark-50">Proposals</Text>
        <TouchableOpacity onPress={() => router.push('/proposal/create')}>
          <Ionicons name="add-circle" size={28} color="#a4a8d1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} height={96} borderRadius={16} className="mb-3" />
          ))
        ) : proposals?.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <Text style={{ fontSize: 48 }}>🤙</Text>
            <Text className="text-gray-900 dark:text-dark-50 font-bold text-lg text-center mt-4">
              No proposals yet
            </Text>
            <Text className="text-gray-500 dark:text-dark-300 text-sm text-center mt-2 leading-5">
              Tap + to propose a hangout to your friends or a group.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/proposal/create')}
              className="bg-lavender rounded-2xl px-8 py-3.5 mt-8"
              activeOpacity={0.8}
            >
              <Text className="text-dark-900 font-bold text-base">Propose a Hangout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {incoming.length > 0 && (
              <View className="mb-6">
                <Text className="text-gray-500 dark:text-dark-300 text-xs font-semibold uppercase tracking-widest mb-3">
                  Invited · {incoming.length}
                </Text>
                {incoming.map((p) => (
                  <ProposalCard key={p.id} proposal={p} isMe={false} />
                ))}
              </View>
            )}

            {mine.length > 0 && (
              <View>
                <Text className="text-gray-500 dark:text-dark-300 text-xs font-semibold uppercase tracking-widest mb-3">
                  Sent by You · {mine.length}
                </Text>
                {mine.map((p) => (
                  <ProposalCard key={p.id} proposal={p} isMe={true} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
