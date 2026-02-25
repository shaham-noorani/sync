import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProposal, useRespondToProposal, useCompleteProposal } from '../../hooks/useProposals';
import { useLogHangout } from '../../hooks/useHangouts';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/Avatar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useColors } from '../../providers/ThemeProvider';

const ACTIVITY_EMOJIS: Record<string, string> = {
  tennis: '🎾', 'board games': '🎲', dinner: '🍽️', climbing: '🧗',
  movie: '🎬', drinks: '🍻', run: '🏃', games: '🎮', hiking: '🥾',
  coffee: '☕',
};



export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: proposal, isLoading } = useProposal(id);
  const respondToProposal = useRespondToProposal();
  const completeProposal = useCompleteProposal();
  const logHangout = useLogHangout();
  const [responding, setResponding] = useState(false);
  const c = useColors();

  const RESPONSE_STYLES: Record<string, { label: string; bgColor: string; textColor: string }> = {
    accepted: { label: 'Going', bgColor: 'rgba(34,197,94,0.15)', textColor: '#22c55e' },
    declined: { label: "Can't go", bgColor: 'rgba(239,68,68,0.15)', textColor: '#f87171' },
    maybe: { label: 'Maybe', bgColor: 'rgba(234,179,8,0.15)', textColor: '#eab308' },
    pending: { label: 'Pending', bgColor: c.bgCardHover, textColor: c.textMuted },
  };

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.bg }]} edges={['top']}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
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

  const glassCard = {
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 20,
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.bg }]} edges={['top']}>
      {/* Header — sticky, outside ScrollView */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="chevron-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {proposal.title}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Card */}
        <View style={[glassCard, { marginHorizontal: 24, marginBottom: 16, padding: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <Text style={{ fontSize: 36, marginRight: 12 }}>
              {ACTIVITY_EMOJIS[proposal.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>
                {proposal.title}
              </Text>
              {proposal.description && (
                <Text style={[styles.secondaryText, { color: c.textSecondary, marginTop: 4 }]}>
                  {proposal.description}
                </Text>
              )}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            {dateStr && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar" size={15} color={c.textMuted} />
                <Text style={[styles.metaText, { color: c.textSecondary, marginLeft: 8 }]}>
                  {dateStr}
                  {proposal.proposed_time_block ? ` · ${proposal.proposed_time_block}` : ''}
                </Text>
              </View>
            )}
            {proposal.location_name && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={15} color={c.textMuted} />
                <Text style={[styles.metaText, { color: c.textSecondary, marginLeft: 8 }]}>
                  {proposal.location_name}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar
                url={proposal.creator.avatar_url}
                name={proposal.creator.display_name}
                size={16}
              />
              <Text style={[styles.metaText, { color: c.textSecondary, marginLeft: 8 }]}>
                Proposed by {proposal.creator.display_name}
              </Text>
            </View>
          </View>
        </View>

        {/* My Response */}
        {!isCreator && (
          <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
            <Text style={[styles.areYouInLabel, { color: c.textSecondary }]}>
              Are you in?
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['accepted', 'maybe', 'declined'] as const).map((r) => {
                const isActive = proposal.my_response === r;
                const labels = { accepted: '✅ Going', maybe: '🤔 Maybe', declined: "❌ Can't" };
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleRespond(r)}
                    disabled={responding}
                    style={[
                      styles.responseButton,
                      isActive ? { backgroundColor: c.accent, borderRadius: 12 } : glassCard,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={
                        isActive
                          ? { color: '#ffffff', fontWeight: '700', fontSize: 14 }
                          : { color: c.textSecondary, fontSize: 14 }
                      }
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
        <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
            RESPONSES · {acceptedCount} GOING
          </Text>
          {proposal.responses.map((res) => {
            const config = RESPONSE_STYLES[res.response ?? 'pending'];
            return (
              <View
                key={res.user_id}
                style={[
                  glassCard,
                  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
                ]}
              >
                <Avatar
                  url={res.profile.avatar_url}
                  name={res.profile.display_name}
                  size={32}
                />
                <Text style={[styles.personName, { color: c.text, flex: 1, marginLeft: 12 }]}>
                  {res.profile.display_name}
                </Text>
                <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: config.bgColor }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: config.textColor }}>{config.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* It Happened */}
        {canMarkHappened && (
          <View style={{ marginHorizontal: 24 }}>
            <TouchableOpacity
              onPress={handleItHappened}
              disabled={logHangout.isPending}
              style={[styles.itHappenedButton, { backgroundColor: c.accentBg, borderColor: c.accentBorder }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.itHappenedText, { color: c.accent }]}>
                {logHangout.isPending ? 'Logging…' : '🎉 It Happened! Log the hangout'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerTitle: {
    flex: 1,
    fontWeight: '700',
    fontSize: 18,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  secondaryText: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 13,
  },
  areYouInLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  responseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  personName: {
    fontWeight: '600',
    fontSize: 14,
  },
  itHappenedButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  itHappenedText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
