import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export type ProposalResponse = 'pending' | 'accepted' | 'declined' | 'maybe';

export type Proposal = {
  id: string;
  created_by: string;
  group_id: string | null;
  title: string;
  description: string | null;
  activity_tag: string | null;
  proposed_date: string | null;
  proposed_time_block: string | null;
  location_name: string | null;
  status: string;
  created_at: string;
  creator: { display_name: string; avatar_url: string | null; username: string };
  group: { name: string } | null;
  responses: {
    user_id: string;
    response: ProposalResponse;
    profile: { display_name: string; avatar_url: string | null; username: string };
  }[];
  my_response: ProposalResponse | null;
};

export function useProposals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('hangout_proposals')
        .select(`
          *,
          creator:profiles!hangout_proposals_created_by_fkey(display_name, avatar_url, username),
          group:groups(name),
          responses:proposal_responses(
            user_id, response,
            profile:profiles(display_name, avatar_url, username)
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as any[]).map((p) => ({
        ...p,
        my_response: p.responses?.find((r: any) => r.user_id === user.id)?.response ?? null,
      })) as Proposal[];
    },
    enabled: !!user,
  });
}

export function useProposal(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('hangout_proposals')
        .select(`
          *,
          creator:profiles!hangout_proposals_created_by_fkey(display_name, avatar_url, username),
          group:groups(name),
          responses:proposal_responses(
            user_id, response,
            profile:profiles(display_name, avatar_url, username)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        my_response: (data as any).responses?.find((r: any) => r.user_id === user.id)?.response ?? null,
      } as Proposal;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProposal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      activity_tag?: string;
      group_id?: string;
      proposed_date?: string;
      proposed_time_block?: string;
      location_name?: string;
      invitee_ids?: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: proposal, error } = await supabase
        .from('hangout_proposals')
        .insert({
          created_by: user.id,
          title: input.title,
          description: input.description ?? null,
          activity_tag: input.activity_tag ?? null,
          group_id: input.group_id ?? null,
          proposed_date: input.proposed_date ?? null,
          proposed_time_block: input.proposed_time_block ?? null,
          location_name: input.location_name ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add invitees as pending responses
      const invitees = input.invitee_ids ?? [];
      // Always add creator as accepted
      const allInvitees = [
        { proposal_id: proposal.id, user_id: user.id, response: 'accepted' },
        ...invitees
          .filter((id) => id !== user.id)
          .map((id) => ({ proposal_id: proposal.id, user_id: id, response: 'pending' })),
      ];

      if (allInvitees.length > 0) {
        const { error: respError } = await supabase
          .from('proposal_responses')
          .insert(allInvitees);
        if (respError) throw respError;
      }

      return proposal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useRespondToProposal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, response }: { proposalId: string; response: ProposalResponse }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('proposal_responses')
        .upsert({
          proposal_id: proposalId,
          user_id: user.id,
          response,
          responded_at: new Date().toISOString(),
        }, { onConflict: 'proposal_id,user_id' });

      if (error) throw error;
    },
    onSuccess: (_, { proposalId }) => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['proposal', proposalId] });
    },
  });
}

export function useCompleteProposal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from('hangout_proposals')
        .update({ status: 'completed' })
        .eq('id', proposalId);
      if (error) throw error;
      return proposalId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
