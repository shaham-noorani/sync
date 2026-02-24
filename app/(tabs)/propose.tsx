import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

function ProposalCard({ proposal, isMe }: { proposal: Proposal; isMe: boolean }) {
  const router = useRouter();
  const acceptedCount = proposal.responses.filter((r) => r.response === 'accepted').length;
  const pendingResponse = !isMe && (proposal.my_response === 'pending' || proposal.my_response === null);

  const dateStr = proposal.proposed_date
    ? new Date(proposal.proposed_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : 'Date TBD';

  const myResponseBadge = () => {
    if (proposal.my_response === 'accepted') {
      return (
        <View style={{ backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 }}>
          <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: '700' }}>Going</Text>
        </View>
      );
    }
    if (proposal.my_response === 'declined') {
      return (
        <View style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 }}>
          <Text style={{ color: '#f87171', fontSize: 12, fontWeight: '700' }}>Declined</Text>
        </View>
      );
    }
    if (proposal.my_response === 'maybe') {
      return (
        <View style={{ backgroundColor: 'rgba(234,179,8,0.15)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 }}>
          <Text style={{ color: '#eab308', fontSize: 12, fontWeight: '700' }}>Maybe</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/proposal/${proposal.id}`)}
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 12 }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(136,117,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ fontSize: 18 }}>
            {ACTIVITY_EMOJIS[proposal.activity_tag?.toLowerCase() ?? ''] ?? '📅'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
            {proposal.title}
          </Text>
          <Text style={{ color: '#8b8fa8', fontSize: 13, marginTop: 2 }}>{dateStr}</Text>
        </View>
        {pendingResponse ? (
          <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginLeft: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Respond</Text>
          </LinearGradient>
        ) : myResponseBadge()}
      </View>

      {/* Footer row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
        {/* Avatar stack */}
        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
          {proposal.responses.slice(0, 4).map((r, i) => (
            <View key={r.user_id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
              <Avatar url={r.profile.avatar_url} name={r.profile.display_name} size={22} />
            </View>
          ))}
          <Text style={{ color: '#8b8fa8', fontSize: 12, marginLeft: 8 }}>
            {acceptedCount} going
          </Text>
        </View>
        <Text style={{ color: '#8b8fa8', fontSize: 12 }}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22 }}>Proposals</Text>
        <TouchableOpacity onPress={() => router.push('/proposal/create')}>
          <Ionicons name="add-circle" size={28} color="#8875ff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} height={96} borderRadius={16} className="mb-3" />
          ))
        ) : proposals?.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 48 }}>🤙</Text>
            <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 18, textAlign: 'center', marginTop: 16 }}>
              No proposals yet
            </Text>
            <Text style={{ color: '#5a5f7a', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Tap + to propose a hangout to your friends or a group.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/proposal/create')}
              style={{ borderRadius: 20, overflow: 'hidden', marginTop: 32 }}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 32, paddingVertical: 14 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Propose a Hangout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {incoming.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>
                  INVITED · {incoming.length}
                </Text>
                {incoming.map((p) => (
                  <ProposalCard key={p.id} proposal={p} isMe={false} />
                ))}
              </View>
            )}

            {mine.length > 0 && (
              <View>
                <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>
                  SENT BY YOU · {mine.length}
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
