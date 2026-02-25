import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFeed, useToggleReaction, getPhotoUrl } from '../../hooks/useHangouts';
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
  const { data: hangouts, isLoading, refetch } = useFeed();
  const toggleReaction = useToggleReaction();
  const [expandedReactions, setExpandedReactions] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Derive unique activity tags from feed data
  const activityTags = useMemo(() => {
    if (!hangouts) return [];
    const tags = new Set(hangouts.map((h) => h.activity_tag).filter(Boolean) as string[]);
    return Array.from(tags).sort();
  }, [hangouts]);

  const filteredHangouts = useMemo(() => {
    if (!activeFilter) return hangouts ?? [];
    return (hangouts ?? []).filter((h) => h.activity_tag === activeFilter);
  }, [hangouts, activeFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22 }}>Feed</Text>
        <TouchableOpacity onPress={() => router.push('/hangout/log')}>
          <Ionicons name="add-circle" size={28} color="#8875ff" />
        </TouchableOpacity>
      </View>

      {/* Activity filter chips */}
      {activityTags.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexShrink: 0, flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12, alignItems: 'center', height: 44 }}
        >
          <TouchableOpacity
            onPress={() => setActiveFilter(null)}
            style={[
              { marginRight: 8, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
              !activeFilter
                ? { backgroundColor: '#8875ff' }
                : { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
            ]}
          >
            <Text
              style={[
                { fontSize: 12, fontWeight: '600' },
                !activeFilter ? { color: '#fff' } : { color: '#8b8fa8' },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {activityTags.map((tag) => {
            const isActive = activeFilter === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setActiveFilter(isActive ? null : tag)}
                style={[
                  { marginRight: 8, flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
                  isActive
                    ? { backgroundColor: '#8875ff' }
                    : { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
                ]}
              >
                <Text style={{ fontSize: 12, marginRight: 4 }}>
                  {ACTIVITY_EMOJIS[tag.toLowerCase()] ?? '📅'}
                </Text>
                <Text
                  style={[
                    { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
                    isActive ? { color: '#fff' } : { color: '#8b8fa8' },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View style={{ paddingHorizontal: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={{ marginBottom: 16 }}>
                <SkeletonLoader height={200} borderRadius={16} />
              </View>
            ))}
          </View>
        ) : filteredHangouts.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginTop: 80 }}>
            <Text style={{ fontSize: 56 }}>📸</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 20, textAlign: 'center', marginTop: 16 }}>
              Nothing here yet
            </Text>
            <Text style={{ color: '#5a5f7a', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Log a hangout to capture the moment and share it with your crew.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/hangout/log')}
              style={{ backgroundColor: '#8875ff', borderRadius: 20, paddingHorizontal: 32, paddingVertical: 14, marginTop: 32 }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Log a Hangout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredHangouts.map((hangout) => {
            const isReactionOpen = expandedReactions === hangout.id;
            const reactionCounts: Record<string, number> = {};
            hangout.reactions?.forEach((r) => {
              reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
            });

            return (
              <TouchableOpacity
                key={hangout.id}
                style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}
                onPress={() => router.push(`/hangout/${hangout.id}`)}
                activeOpacity={0.9}
              >
                {/* Photos */}
                {hangout.photos?.length > 0 && (
                  <Image
                    source={{ uri: getPhotoUrl(hangout.photos[0].storage_path) }}
                    style={{ width: '100%', height: 220 }}
                    resizeMode="cover"
                  />
                )}

                <View style={{ padding: 16 }}>
                  {/* Creator row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Avatar
                      url={hangout.creator?.avatar_url}
                      name={hangout.creator?.display_name}
                      size={32}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 14 }}>
                        {hangout.creator?.display_name}
                      </Text>
                      <Text style={{ color: '#8b8fa8', fontSize: 12 }}>
                        {formatRelativeDate(hangout.date || hangout.created_at)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20 }}>
                      {ACTIVITY_EMOJIS[hangout.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 16, marginBottom: 4 }}>
                    {hangout.title}
                  </Text>

                  {hangout.location_name && (
                    <Text style={{ color: '#8b8fa8', fontSize: 12, marginBottom: 8 }}>
                      📍 {hangout.location_name}
                    </Text>
                  )}

                  {/* Attendees */}
                  {hangout.attendees?.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
                        <Text style={{ color: '#8b8fa8', fontSize: 12, marginLeft: 8 }}>
                          +{hangout.attendees.length - 4} more
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Reactions bar */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Existing reactions */}
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <TouchableOpacity
                          key={emoji}
                          onPress={() => toggleReaction.mutate({ hangoutId: hangout.id, emoji })}
                          style={[
                            { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4 },
                            hangout.my_reaction === emoji
                              ? { backgroundColor: 'rgba(136,117,255,0.2)', borderWidth: 1, borderColor: '#8875ff' }
                              : { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
                          ]}
                        >
                          <Text style={{ fontSize: 14 }}>{emoji}</Text>
                          <Text style={{ color: '#8b8fa8', fontSize: 12, marginLeft: 4 }}>{count}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Add reaction */}
                    <TouchableOpacity
                      onPress={() => setExpandedReactions(isReactionOpen ? null : hangout.id)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#5a5f7a"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Emoji picker */}
                  {isReactionOpen && (
                    <View style={{ flexDirection: 'row', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' }}>
                      {REACTION_EMOJIS.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          onPress={() => {
                            toggleReaction.mutate({ hangoutId: hangout.id, emoji });
                            setExpandedReactions(null);
                          }}
                          style={{ marginHorizontal: 4 }}
                        >
                          <Text style={{ fontSize: 20 }}>{emoji}</Text>
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
