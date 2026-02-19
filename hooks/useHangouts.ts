import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { notifyHangoutLogged } from '../lib/notifications';

export type HangoutPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  uploaded_by: string;
};

export type Hangout = {
  id: string;
  title: string;
  activity_tag: string | null;
  location_name: string | null;
  location_city: string | null;
  date: string;
  created_by: string;
  group_id: string | null;
  proposal_id: string | null;
  created_at: string;
  creator: { display_name: string; avatar_url: string | null; username: string };
  attendees: { user_id: string; profile: { display_name: string; avatar_url: string | null } }[];
  photos: HangoutPhoto[];
  reactions: { user_id: string; emoji: string }[];
  my_reaction: string | null;
};

export function useFeed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['feed', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('hangouts')
        .select(`
          *,
          creator:profiles!hangouts_created_by_fkey(display_name, avatar_url, username),
          attendees:hangout_attendees(user_id, profile:profiles(display_name, avatar_url)),
          photos:hangout_photos(id, storage_path, caption, uploaded_by),
          reactions:hangout_reactions(user_id, emoji)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data as any[]).map((h) => ({
        ...h,
        my_reaction: h.reactions?.find((r: any) => r.user_id === user.id)?.emoji ?? null,
      })) as Hangout[];
    },
    enabled: !!user,
  });
}

export function useHangout(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hangout', id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('hangouts')
        .select(`
          *,
          creator:profiles!hangouts_created_by_fkey(display_name, avatar_url, username),
          attendees:hangout_attendees(user_id, profile:profiles(display_name, avatar_url)),
          photos:hangout_photos(id, storage_path, caption, uploaded_by),
          reactions:hangout_reactions(user_id, emoji)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...(data as any),
        my_reaction: (data as any).reactions?.find((r: any) => r.user_id === user.id)?.emoji ?? null,
      } as Hangout;
    },
    enabled: !!user && !!id,
  });
}

export function useLogHangout() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      activity_tag?: string;
      group_id?: string;
      proposal_id?: string;
      location_name?: string;
      date?: string;
      attendee_ids: string[];
      photos?: { uri: string; caption?: string }[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Create hangout
      const { data: hangout, error } = await supabase
        .from('hangouts')
        .insert({
          created_by: user.id,
          title: input.title,
          activity_tag: input.activity_tag ?? null,
          group_id: input.group_id ?? null,
          proposal_id: input.proposal_id ?? null,
          location_name: input.location_name ?? null,
          date: input.date ?? new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      // Add attendees (creator + others)
      const allAttendees = [...new Set([user.id, ...input.attendee_ids])];
      const { error: attendeesError } = await supabase
        .from('hangout_attendees')
        .insert(allAttendees.map((uid) => ({ hangout_id: hangout.id, user_id: uid })));

      if (attendeesError) throw attendeesError;

      // Upload photos if any
      if (input.photos && input.photos.length > 0) {
        for (const photo of input.photos) {
          const ext = photo.uri.split('.').pop() || 'jpg';
          const path = `${hangout.id}/${Date.now()}.${ext}`;

          const response = await fetch(photo.uri);
          const blob = await response.blob();
          const arrayBuffer = await new Response(blob).arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from('hangout-photos')
            .upload(path, arrayBuffer, { contentType: `image/${ext}` });

          if (!uploadError) {
            await supabase.from('hangout_photos').insert({
              hangout_id: hangout.id,
              uploaded_by: user.id,
              storage_path: path,
              caption: photo.caption ?? null,
            });
          }
        }
      }

      // Mark proposal as completed if linked
      if (input.proposal_id) {
        await supabase
          .from('hangout_proposals')
          .update({ status: 'completed' })
          .eq('id', input.proposal_id);
      }

      // Notify other attendees (fire-and-forget)
      const loggerRes = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      const loggerName = loggerRes.data?.display_name ?? 'Someone';
      const otherAttendees = allAttendees.filter((id) => id !== user.id);
      notifyHangoutLogged({
        attendeeIds: otherAttendees,
        loggerName,
        hangoutTitle: input.title,
        hangoutId: (hangout as any).id,
      });

      return hangout;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useToggleReaction() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ hangoutId, emoji }: { hangoutId: string; emoji: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if already reacted
      const { data: existing } = await supabase
        .from('hangout_reactions')
        .select('id, emoji')
        .eq('hangout_id', hangoutId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        if (existing.emoji === emoji) {
          // Remove reaction
          await supabase.from('hangout_reactions').delete().eq('id', existing.id);
        } else {
          // Change reaction
          await supabase.from('hangout_reactions').update({ emoji }).eq('id', existing.id);
        }
      } else {
        await supabase.from('hangout_reactions').insert({
          hangout_id: hangoutId,
          user_id: user.id,
          emoji,
        });
      }
    },
    onSuccess: (_, { hangoutId }) => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['hangout', hangoutId] });
    },
  });
}

export function getPhotoUrl(storagePath: string) {
  const { data } = supabase.storage.from('hangout-photos').getPublicUrl(storagePath);
  return data.publicUrl;
}
