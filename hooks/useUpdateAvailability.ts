import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function useTogglePattern() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dayOfWeek,
      timeBlock,
      isAvailable,
    }: {
      dayOfWeek: number;
      timeBlock: string;
      isAvailable: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('availability_patterns').upsert(
        {
          user_id: user.id,
          day_of_week: dayOfWeek,
          time_block: timeBlock,
          is_available: isAvailable,
        },
        { onConflict: 'user_id,day_of_week,time_block' }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['effective-availability'] });
    },
  });
}

export function useToggleSlot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      timeBlock,
      isAvailable,
    }: {
      date: string;
      timeBlock: string;
      isAvailable: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('availability_slots').upsert(
        {
          user_id: user.id,
          date,
          time_block: timeBlock,
          is_available: isAvailable,
        },
        { onConflict: 'user_id,date,time_block' }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['effective-availability'] });
    },
  });
}

export function useAddTravelPeriod() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      label,
    }: {
      startDate: string;
      endDate: string;
      label?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('travel_periods').insert({
        user_id: user.id,
        start_date: startDate,
        end_date: endDate,
        label: label || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-periods'] });
      queryClient.invalidateQueries({ queryKey: ['effective-availability'] });
    },
  });
}

export function useDeleteTravelPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (travelPeriodId: string) => {
      const { error } = await supabase
        .from('travel_periods')
        .delete()
        .eq('id', travelPeriodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-periods'] });
      queryClient.invalidateQueries({ queryKey: ['effective-availability'] });
    },
  });
}
