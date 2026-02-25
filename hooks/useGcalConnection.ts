import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function useGcalConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['gcal-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('gcal_connections')
        .select('id, google_email, connected_at')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
