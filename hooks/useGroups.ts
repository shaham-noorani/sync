import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function useMyGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-groups', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
          group_id,
          role,
          group:groups!group_members_group_id_fkey(id, name, description, invite_code, created_by)
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((gm) => ({ ...gm.group, role: gm.role }));
    },
    enabled: !!user,
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(
          `
          id,
          user_id,
          role,
          joined_at,
          profile:profiles!group_members_user_id_fkey(id, username, display_name, avatar_url)
        `
        )
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      return { ...group, members };
    },
    enabled: !!groupId,
  });
}

export function useGroupByCode(code: string) {
  return useQuery({
    queryKey: ['group-by-code', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, invite_code')
        .eq('invite_code', code)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!code,
  });
}

export function useCreateGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description: description || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
}

export function useJoinGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
}

export function useLeaveGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
}
