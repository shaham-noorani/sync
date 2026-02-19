import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export type AvailabilityCell = {
  date: string;
  time_block: 'morning' | 'afternoon' | 'evening';
  is_available: boolean;
  source: string;
};

export function useEffectiveAvailability(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['effective-availability', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_effective_availability', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
      return data as AvailabilityCell[];
    },
    enabled: !!user && !!startDate && !!endDate,
  });
}

// Combine availability of multiple users → overlap count map (for group heatmap)
export function useGroupAvailability(memberIds: string[], startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['group-availability', memberIds.join(','), startDate, endDate],
    queryFn: async () => {
      const overlapCount: Record<string, number> = {};
      await Promise.all(
        memberIds.map(async (uid) => {
          const { data } = await supabase.rpc('get_effective_availability', {
            p_user_id: uid,
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
    enabled: memberIds.length > 0 && !!startDate && !!endDate,
  });
}

// Query another user's effective availability (for friend profiles)
export function useFriendEffectiveAvailability(friendId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['friend-effective-availability', friendId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_effective_availability', {
        p_user_id: friendId,
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if (error) throw error;
      return data as AvailabilityCell[];
    },
    enabled: !!friendId && !!startDate && !!endDate,
  });
}

export function useAvailabilityPatterns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['availability-patterns', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('availability_patterns')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTravelPeriods() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['travel-periods', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('travel_periods')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
