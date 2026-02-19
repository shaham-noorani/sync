import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHangout, useToggleReaction, getPhotoUrl } from '../../hooks/useHangouts';
import { useTheme } from '../../providers/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { SkeletonLoader } from '../../components/SkeletonLoader';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '🎉', '👏'];

export default function HangoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: hangout, isLoading } = useHangout(id);
  const toggleReaction = useToggleReaction();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
        <View className="px-6 pt-4">
          <SkeletonLoader height={250} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={24} borderRadius={8} className="mb-2" />
          <SkeletonLoader height={16} borderRadius={8} className="mb-2 w-1/2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!hangout) return null;

  const reactionCounts: Record<string, number> = {};
  hangout.reactions?.forEach((r) => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
  });

  const dateStr = hangout.date
    ? new Date(hangout.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-12">
        {/* Photos */}
        {hangout.photos?.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="h-64"
          >
            {hangout.photos.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: getPhotoUrl(photo.storage_path) }}
                style={{ width: 400, height: 256 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Back button overlay if photos, else top bar */}
        <View className={`flex-row items-center px-6 ${hangout.photos?.length > 0 ? 'mt-3' : 'pt-4'}`}>
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#94a3b8' : '#6b7280'} />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {/* Title row */}
          <View className="flex-row items-center mb-1">
            <Text className="text-2xl mr-2">
              {ACTIVITY_EMOJIS[hangout.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
            </Text>
            <Text className="text-gray-900 dark:text-dark-50 font-bold text-xl flex-1">
              {hangout.title}
            </Text>
          </View>

          {/* Meta */}
          <View className="gap-1.5 mb-4">
            {dateStr && (
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={14} color={isDark ? '#64748b' : '#9ca3af'} />
                <Text className="text-gray-500 dark:text-dark-300 text-sm ml-1.5">{dateStr}</Text>
              </View>
            )}
            {hangout.location_name && (
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color={isDark ? '#64748b' : '#9ca3af'} />
                <Text className="text-gray-500 dark:text-dark-300 text-sm ml-1.5">
                  {hangout.location_name}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <Avatar
                url={hangout.creator?.avatar_url}
                name={hangout.creator?.display_name}
                size={16}
              />
              <Text className="text-gray-400 dark:text-dark-400 text-xs ml-1.5">
                Logged by {hangout.creator?.display_name}
              </Text>
            </View>
          </View>

          {/* Attendees */}
          {hangout.attendees?.length > 0 && (
            <View className="mb-5">
              <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
                Who was there
              </Text>
              <View className="flex-row flex-wrap">
                {hangout.attendees.map((a) => (
                  <View key={a.user_id} className="items-center mr-4 mb-2">
                    <Avatar
                      url={a.profile?.avatar_url}
                      name={a.profile?.display_name}
                      size={40}
                    />
                    <Text className="text-gray-600 dark:text-dark-200 text-xs mt-1" numberOfLines={1}>
                      {a.profile?.display_name?.split(' ')[0]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reactions */}
          <View className="mb-4">
            <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-2">
              Reactions
            </Text>
            <View className="flex-row flex-wrap">
              {REACTION_EMOJIS.map((emoji) => {
                const count = reactionCounts[emoji] ?? 0;
                const isActive = hangout.my_reaction === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => toggleReaction.mutate({ hangoutId: hangout.id, emoji })}
                    className={`flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-2 ${
                      isActive ? 'bg-lavender/30' : 'bg-white dark:bg-dark-700'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-lg">{emoji}</Text>
                    {count > 0 && (
                      <Text className="text-gray-500 dark:text-dark-300 text-xs ml-1 font-medium">
                        {count}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
