import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const id = userId ?? user?.id;

  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) throw new Error('No user ID');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      const { data: interests, error: interestsError } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', id);

      if (interestsError) throw interestsError;

      return {
        ...profile,
        interests: interests.map((i) => i.interest),
      };
    },
    enabled: !!id,
  });
}
