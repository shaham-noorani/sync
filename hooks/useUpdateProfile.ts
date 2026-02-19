import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

type UpdateProfileInput = {
  display_name?: string;
  city?: string | null;
  avatar_url?: string | null;
  interests?: string[];
};

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!user) throw new Error('Not authenticated');

      const { interests, ...profileFields } = input;

      // Update profile fields
      if (Object.keys(profileFields).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileFields)
          .eq('id', user.id);

        if (error) throw error;
      }

      // Update interests if provided
      if (interests !== undefined) {
        // Delete existing interests
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', user.id);

        // Insert new interests
        if (interests.length > 0) {
          const { error } = await supabase.from('user_interests').insert(
            interests.map((interest) => ({
              user_id: user.id,
              interest,
            }))
          );
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}
