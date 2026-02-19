import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export type OverlapSlot = {
  date: string;
  time_block: string;
  available_user_ids: string[];
  available_count: number;
  available_names: string[];
};

// Get overlaps across ALL friends (no specific group)
export function useFriendOverlaps(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friend-overlaps', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Get all accepted friend IDs
      const { data: friendships, error: fErr } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (fErr) throw fErr;
      if (!friendships?.length) return [];

      const friendIds = friendships.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Get effective availability for all friends across the date range
      const results: OverlapSlot[] = [];
      const dates: string[] = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      // Fetch availability for friends in parallel
      const availabilityByUser = await Promise.all(
        friendIds.map(async (friendId) => {
          const { data } = await supabase.rpc('get_effective_availability', {
            p_user_id: friendId,
            p_start_date: startDate,
            p_end_date: endDate,
          });
          // Get profile for display name
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', friendId)
            .single();
          return { friendId, availability: data ?? [], displayName: profile?.display_name ?? '' };
        })
      );

      // Also get my own availability
      const { data: myAvailability } = await supabase.rpc('get_effective_availability', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate,
      });
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const allUsers = [
        { friendId: user.id, availability: myAvailability ?? [], displayName: myProfile?.display_name ?? 'You' },
        ...availabilityByUser,
      ];

      // Build overlap map
      const TIME_BLOCKS = ['morning', 'afternoon', 'evening'];
      for (const date of dates) {
        for (const block of TIME_BLOCKS) {
          const freeUsers = allUsers.filter((u) => {
            const slot = u.availability.find(
              (a: any) => a.date === date && a.time_block === block
            );
            return slot?.is_available === true;
          });

          if (freeUsers.length >= 2) {
            results.push({
              date,
              time_block: block,
              available_user_ids: freeUsers.map((u) => u.friendId),
              available_count: freeUsers.length,
              available_names: freeUsers.map((u) => u.displayName),
            });
          }
        }
      }

      return results;
    },
    enabled: !!user && !!startDate && !!endDate,
  });
}

// Friends' availability data for the heatmap overlay
export function useFriendsAvailability(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friends-availability', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      if (!friendships?.length) return {};

      const friendIds = friendships.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Map: "date|time_block" → count of free friends
      const overlapCount: Record<string, number> = {};

      await Promise.all(
        friendIds.map(async (friendId) => {
          const { data } = await supabase.rpc('get_effective_availability', {
            p_user_id: friendId,
            p_start_date: startDate,
            p_end_date: endDate,
          });
          (data ?? []).forEach((slot: any) => {
            if (slot.is_available) {
              const key = `${slot.date}|${slot.time_block}`;
              overlapCount[key] = (overlapCount[key] ?? 0) + 1;
            }
          });
        })
      );

      return overlapCount;
    },
    enabled: !!user && !!startDate && !!endDate,
  });
}
