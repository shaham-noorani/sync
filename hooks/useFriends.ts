import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function useFriendsList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
        `
        )
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      return data.map((f) => {
        const friend =
          f.requester_id === user.id ? f.addressee : f.requester;
        return { friendshipId: f.id, ...friend };
      });
    },
    enabled: !!user,
  });
}

export function usePendingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Incoming requests
      const { data: incoming, error: inError } = await supabase
        .from('friendships')
        .select(
          `
          id,
          requester_id,
          created_at,
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url)
        `
        )
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (inError) throw inError;

      // Outgoing requests
      const { data: outgoing, error: outError } = await supabase
        .from('friendships')
        .select(
          `
          id,
          addressee_id,
          created_at,
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
        `
        )
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (outError) throw outError;

      return {
        incoming: incoming.map((r) => ({
          friendshipId: r.id,
          ...r.requester,
          createdAt: r.created_at,
        })),
        outgoing: outgoing.map((r) => ({
          friendshipId: r.id,
          ...r.addressee,
          createdAt: r.created_at,
        })),
      };
    },
    enabled: !!user,
  });
}

export function useSearchUsers(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['search-users', query],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', user.id)
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user && query.length >= 2,
  });
}

export function useSendFriendRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: addresseeId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['search-users'] });
    },
  });
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      friendshipId,
      status,
    }: {
      friendshipId: string;
      status: 'accepted' | 'declined';
    }) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

// Realtime subscription hook
export function useFriendshipsRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friends'] });
          queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friends'] });
          queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
}
