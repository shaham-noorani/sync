import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import * as ImagePicker from 'expo-image-picker';

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
          group:groups!group_members_group_id_fkey(id, name, description, invite_code, created_by, icon_url, icon_name, members:group_members(count))
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((gm: any) => ({
        ...gm.group,
        role: gm.role,
        member_count: gm.group?.members?.[0]?.count ?? 0,
      }));
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

async function uploadGroupIcon(groupId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const storagePath = `groups/${groupId}/icon.${ext}`;
  const contentType = blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg');

  const { error } = await supabase.storage
    .from('avatars')
    .upload(storagePath, blob, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
  return data.publicUrl;
}

export function useCreateGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      iconName,
      iconPhotoUri,
    }: {
      name: string;
      description?: string;
      iconName?: string | null;
      iconPhotoUri?: string | null;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description: description || null,
          created_by: user.id,
          icon_name: iconName || null,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Upload photo if provided
      if (iconPhotoUri) {
        const iconUrl = await uploadGroupIcon(group.id, iconPhotoUri);
        await supabase.from('groups').update({ icon_url: iconUrl }).eq('id', group.id);
        group.icon_url = iconUrl;
      }

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'owner' });

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
}

export function useUpdateGroupIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      iconName,
      iconPhotoUri,
    }: {
      groupId: string;
      iconName?: string | null;
      iconPhotoUri?: string | null;
    }) => {
      let iconUrl: string | null = null;

      if (iconPhotoUri) {
        iconUrl = await uploadGroupIcon(groupId, iconPhotoUri);
      }

      const { error } = await supabase
        .from('groups')
        .update({
          icon_url: iconUrl,
          icon_name: iconName ?? null,
        })
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
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
