import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFeed, useToggleReaction, getPhotoUrl } from '../../hooks/useHangouts';
import { useTheme } from '../../providers/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { SkeletonLoader } from '../../components/SkeletonLoader';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '🎉', '👏'];

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FeedScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: hangouts, isLoading, refetch } = useFeed();
  const toggleReaction = useToggleReaction();
  const [expandedReactions, setExpandedReactions] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-dark-50">Feed</Text>
        <TouchableOpacity onPress={() => router.push('/hangout/log')}>
          <Ionicons name="add-circle" size={28} color="#a4a8d1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View className="px-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} className="mb-4">
                <SkeletonLoader height={200} borderRadius={16} />
              </View>
            ))}
          </View>
        ) : hangouts?.length === 0 ? (
          <View className="items-center justify-center px-8 mt-20">
            <Text style={{ fontSize: 56 }}>📸</Text>
            <Text className="text-gray-900 dark:text-dark-50 font-bold text-xl text-center mt-4">
              Nothing here yet
            </Text>
            <Text className="text-gray-500 dark:text-dark-300 text-sm text-center mt-2 leading-5">
              Log a hangout to capture the moment and share it with your crew.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/hangout/log')}
              className="bg-lavender rounded-2xl px-8 py-3.5 mt-8"
              activeOpacity={0.8}
            >
              <Text className="text-dark-900 font-bold text-base">Log a Hangout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          hangouts?.map((hangout) => {
            const isReactionOpen = expandedReactions === hangout.id;
            const reactionCounts: Record<string, number> = {};
            hangout.reactions?.forEach((r) => {
              reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
            });

            return (
              <TouchableOpacity
                key={hangout.id}
                className="mx-4 mb-4 bg-white dark:bg-dark-700 rounded-2xl overflow-hidden"
                onPress={() => router.push(`/hangout/${hangout.id}`)}
                activeOpacity={0.9}
              >
                {/* Photos */}
                {hangout.photos?.length > 0 && (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    className="h-48"
                  >
                    {hangout.photos.map((photo) => (
                      <Image
                        key={photo.id}
                        source={{ uri: getPhotoUrl(photo.storage_path) }}
                        style={{ width: 350, height: 192 }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}

                <View className="p-4">
                  {/* Creator row */}
                  <View className="flex-row items-center mb-3">
                    <Avatar
                      url={hangout.creator?.avatar_url}
                      name={hangout.creator?.display_name}
                      size={32}
                    />
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-900 dark:text-dark-50 font-semibold text-sm">
                        {hangout.creator?.display_name}
                      </Text>
                      <Text className="text-gray-400 dark:text-dark-400 text-xs">
                        {formatRelativeDate(hangout.date || hangout.created_at)}
                      </Text>
                    </View>
                    <Text className="text-xl">
                      {ACTIVITY_EMOJIS[hangout.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text className="text-gray-900 dark:text-dark-50 font-bold text-base mb-1">
                    {hangout.title}
                  </Text>

                  {hangout.location_name && (
                    <Text className="text-gray-400 dark:text-dark-400 text-xs mb-2">
                      📍 {hangout.location_name}
                    </Text>
                  )}

                  {/* Attendees */}
                  {hangout.attendees?.length > 0 && (
                    <View className="flex-row items-center mb-3">
                      {hangout.attendees.slice(0, 4).map((a, i) => (
                        <View key={a.user_id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
                          <Avatar
                            url={a.profile?.avatar_url}
                            name={a.profile?.display_name}
                            size={24}
                          />
                        </View>
                      ))}
                      {hangout.attendees.length > 4 && (
                        <Text className="text-gray-400 dark:text-dark-400 text-xs ml-2">
                          +{hangout.attendees.length - 4} more
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Reactions bar */}
                  <View className="flex-row items-center">
                    {/* Existing reactions */}
                    <View className="flex-row flex-1">
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <TouchableOpacity
                          key={emoji}
                          onPress={() => toggleReaction.mutate({ hangoutId: hangout.id, emoji })}
                          className={`flex-row items-center rounded-full px-2 py-1 mr-1 ${
                            hangout.my_reaction === emoji
                              ? 'bg-lavender/30'
                              : 'bg-gray-100 dark:bg-dark-600'
                          }`}
                        >
                          <Text className="text-sm">{emoji}</Text>
                          <Text className="text-gray-500 dark:text-dark-300 text-xs ml-1">{count}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Add reaction */}
                    <TouchableOpacity
                      onPress={() => setExpandedReactions(isReactionOpen ? null : hangout.id)}
                      className="p-1"
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={isDark ? '#64748b' : '#9ca3af'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Emoji picker */}
                  {isReactionOpen && (
                    <View className="flex-row mt-2 bg-gray-100 dark:bg-dark-600 rounded-full px-3 py-2 self-start">
                      {REACTION_EMOJIS.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          onPress={() => {
                            toggleReaction.mutate({ hangoutId: hangout.id, emoji });
                            setExpandedReactions(null);
                          }}
                          className="mx-1"
                        >
                          <Text className="text-xl">{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
