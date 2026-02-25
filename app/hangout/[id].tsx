import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHangout, useToggleReaction, getPhotoUrl } from '../../hooks/useHangouts';
import { Avatar } from '../../components/Avatar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useColors } from '../../providers/ThemeProvider';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '🎉', '👏'];

export default function HangoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: hangout, isLoading } = useHangout(id);
  const toggleReaction = useToggleReaction();
  const c = useColors();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.bg }]} edges={['top']}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.bg }]} edges={['top']}>
      {/* Header — sticky, outside ScrollView */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="chevron-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.hangoutTitle, { color: c.text }]} numberOfLines={1}>
          {hangout.title}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Photo */}
        {hangout.photos?.length > 0 && (
          <Image
            source={{ uri: getPhotoUrl(hangout.photos[0].storage_path) }}
            style={{ width: '100%', height: 256 }}
            resizeMode="cover"
          />
        )}

        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>
              {ACTIVITY_EMOJIS[hangout.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
            </Text>
            <Text style={[styles.hangoutTitleContent, { color: c.text }]} numberOfLines={2}>
              {hangout.title}
            </Text>
          </View>

          {/* Meta */}
          <View style={{ gap: 6, marginBottom: 16 }}>
            {dateStr && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar" size={14} color={c.textMuted} />
                <Text style={[styles.metaText, { color: c.textSecondary, marginLeft: 6 }]}>{dateStr}</Text>
              </View>
            )}
            {hangout.location_name && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={14} color={c.textMuted} />
                <Text style={[styles.metaText, { color: c.textSecondary, marginLeft: 6 }]}>
                  {hangout.location_name}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar
                url={hangout.creator?.avatar_url}
                name={hangout.creator?.display_name}
                size={16}
              />
              <Text style={[styles.metaText, { color: c.textSecondary, marginLeft: 6 }]}>
                Logged by {hangout.creator?.display_name}
              </Text>
            </View>
          </View>

          {/* Attendees */}
          {hangout.attendees?.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionSubLabel, { color: c.textSecondary }]}>
                Who was there
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {hangout.attendees.map((a) => (
                  <View key={a.user_id} style={{ alignItems: 'center', marginRight: 16, marginBottom: 8 }}>
                    <Avatar
                      url={a.profile?.avatar_url}
                      name={a.profile?.display_name}
                      size={40}
                    />
                    <Text style={[styles.attendeeName, { color: c.textSecondary }]} numberOfLines={1}>
                      {a.profile?.display_name?.split(' ')[0]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reactions */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionSubLabel, { color: c.textSecondary }]}>
              Reactions
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {REACTION_EMOJIS.map((emoji) => {
                const count = reactionCounts[emoji] ?? 0;
                const isActive = hangout.my_reaction === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => toggleReaction.mutate({ hangoutId: hangout.id, emoji })}
                    style={[
                      styles.reactionButton,
                      isActive
                        ? { backgroundColor: c.accentBg, borderWidth: 1, borderColor: c.accent }
                        : { backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    {count > 0 && (
                      <Text style={[styles.reactionCount, { color: c.textSecondary }]}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  hangoutTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  hangoutTitleContent: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    flex: 1,
  },
  metaText: {
    fontSize: 13,
  },
  sectionSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  attendeeName: {
    fontSize: 12,
    marginTop: 4,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});
