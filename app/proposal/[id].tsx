import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProposal, useRespondToProposal, useCompleteProposal } from '../../hooks/useProposals';
import { useLogHangout } from '../../hooks/useHangouts';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { SkeletonLoader } from '../../components/SkeletonLoader';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};

const RESPONSE_CONFIG = {
  accepted: { label: 'Going', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  declined: { label: 'Can\'t go', color: 'text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  maybe: { label: 'Maybe', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  pending: { label: 'Pending', color: 'text-gray-400 dark:text-dark-400', bg: 'bg-gray-100 dark:bg-dark-700' },
};

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { data: proposal, isLoading } = useProposal(id);
  const respondToProposal = useRespondToProposal();
  const completeProposal = useCompleteProposal();
  const logHangout = useLogHangout();
  const [responding, setResponding] = useState(false);

  async function handleRespond(response: 'accepted' | 'maybe' | 'declined') {
    setResponding(true);
    try {
      await respondToProposal.mutateAsync({ proposalId: id, response });
    } catch {
      Alert.alert('Error', 'Failed to respond. Please try again.');
    } finally {
      setResponding(false);
    }
  }

  async function handleItHappened() {
    if (!proposal) return;

    Alert.alert(
      'Log as Hangout',
      'Mark this as a completed hangout and add it to your feed!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log it!',
          onPress: async () => {
            try {
              const attendeeIds = proposal.responses
                .filter((r) => r.response === 'accepted')
                .map((r) => r.user_id);
              const hangout = await logHangout.mutateAsync({
                title: proposal.title,
                activity_tag: proposal.activity_tag ?? undefined,
                proposal_id: proposal.id,
                group_id: proposal.group_id ?? undefined,
                location_name: proposal.location_name ?? undefined,
                date: proposal.proposed_date ?? undefined,
                attendee_ids: attendeeIds,
              });
              router.replace(`/hangout/${(hangout as any).id}`);
            } catch {
              Alert.alert('Error', 'Failed to log hangout. Please try again.');
            }
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
        <View className="px-6 pt-4">
          <SkeletonLoader height={24} borderRadius={8} className="mb-3 w-3/4" />
          <SkeletonLoader height={16} borderRadius={8} className="mb-6 w-1/2" />
          <SkeletonLoader height={120} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  if (!proposal) return null;

  const acceptedCount = proposal.responses.filter((r) => r.response === 'accepted').length;
  const isCreator = proposal.created_by === user?.id;
  const canMarkHappened = isCreator && acceptedCount >= 1;

  const dateStr = proposal.proposed_date
    ? new Date(proposal.proposed_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-12">
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#94a3b8' : '#6b7280'} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-dark-50 flex-1" numberOfLines={1}>
            {proposal.title}
          </Text>
        </View>

        {/* Card */}
        <View className="mx-6 bg-white dark:bg-dark-700 rounded-2xl p-5 mb-4">
          <View className="flex-row items-start mb-3">
            <Text className="text-4xl mr-3">
              {ACTIVITY_EMOJIS[proposal.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
            </Text>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-dark-50 font-bold text-lg" numberOfLines={2}>
                {proposal.title}
              </Text>
              {proposal.description && (
                <Text className="text-gray-500 dark:text-dark-300 text-sm mt-1">
                  {proposal.description}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-2">
            {dateStr && (
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={15} color={isDark ? '#64748b' : '#9ca3af'} />
                <Text className="text-gray-500 dark:text-dark-300 text-sm ml-2">
                  {dateStr}
                  {proposal.proposed_time_block ? ` · ${proposal.proposed_time_block}` : ''}
                </Text>
              </View>
            )}
            {proposal.location_name && (
              <View className="flex-row items-center">
                <Ionicons name="location" size={15} color={isDark ? '#64748b' : '#9ca3af'} />
                <Text className="text-gray-500 dark:text-dark-300 text-sm ml-2">
                  {proposal.location_name}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <Avatar
                url={proposal.creator.avatar_url}
                name={proposal.creator.display_name}
                size={16}
              />
              <Text className="text-gray-400 dark:text-dark-400 text-xs ml-2">
                Proposed by {proposal.creator.display_name}
              </Text>
            </View>
          </View>
        </View>

        {/* My Response */}
        {!isCreator && (
          <View className="mx-6 mb-4">
            <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
              Are you in?
            </Text>
            <View className="flex-row gap-2">
              {(['accepted', 'maybe', 'declined'] as const).map((r) => {
                const isActive = proposal.my_response === r;
                const labels = { accepted: '✅ Going', maybe: '🤔 Maybe', declined: '❌ Can\'t' };
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleRespond(r)}
                    disabled={responding}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      isActive ? 'bg-lavender' : 'bg-white dark:bg-dark-700'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isActive ? 'text-dark-900' : 'text-gray-600 dark:text-dark-200'
                      }`}
                    >
                      {labels[r]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Responses */}
        <View className="mx-6 mb-4">
          <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
            Responses · {acceptedCount} going
          </Text>
          {proposal.responses.map((res) => {
            const config = RESPONSE_CONFIG[res.response ?? 'pending'];
            return (
              <View
                key={res.user_id}
                className="flex-row items-center bg-white dark:bg-dark-700 rounded-xl px-4 py-3 mb-2"
              >
                <Avatar
                  url={res.profile.avatar_url}
                  name={res.profile.display_name}
                  size={32}
                />
                <Text className="flex-1 text-gray-900 dark:text-dark-50 font-medium text-sm ml-3">
                  {res.profile.display_name}
                </Text>
                <View className={`rounded-full px-2 py-0.5 ${config.bg}`}>
                  <Text className={`text-xs font-medium ${config.color}`}>{config.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* It Happened */}
        {canMarkHappened && (
          <View className="mx-6">
            <TouchableOpacity
              onPress={handleItHappened}
              disabled={logHangout.isPending}
              className="bg-lavender/20 border border-lavender/40 rounded-2xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-lavender-500 dark:text-lavender font-bold text-base">
                {logHangout.isPending ? 'Logging…' : '🎉 It Happened! Log the hangout'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
