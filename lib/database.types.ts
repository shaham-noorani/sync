export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          city?: string | null;
          updated_at?: string;
        };
      };
      user_interests: {
        Row: {
          id: string;
          user_id: string;
          interest: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interest: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interest?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          invite_code?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          role?: 'owner' | 'admin' | 'member';
        };
      };
      availability_patterns: {
        Row: {
          id: string;
          user_id: string;
          day_of_week: number;
          time_block: 'morning' | 'afternoon' | 'evening';
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_of_week: number;
          time_block: 'morning' | 'afternoon' | 'evening';
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_available?: boolean;
          updated_at?: string;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          time_block: 'morning' | 'afternoon' | 'evening';
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          time_block: 'morning' | 'afternoon' | 'evening';
          is_available: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_available?: boolean;
          updated_at?: string;
        };
      };
      travel_periods: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          start_date?: string;
          end_date?: string;
          label?: string | null;
          updated_at?: string;
        };
      };
      hangout_proposals: {
        Row: {
          id: string;
          created_by: string;
          group_id: string | null;
          title: string;
          description: string | null;
          activity_tag: string | null;
          proposed_date: string | null;
          proposed_time_block: 'morning' | 'afternoon' | 'evening' | 'night' | null;
          location_name: string | null;
          location_city: string | null;
          status: 'open' | 'confirmed' | 'cancelled' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          group_id?: string | null;
          title: string;
          description?: string | null;
          activity_tag?: string | null;
          proposed_date?: string | null;
          proposed_time_block?: 'morning' | 'afternoon' | 'evening' | 'night' | null;
          location_name?: string | null;
          location_city?: string | null;
          status?: 'open' | 'confirmed' | 'cancelled' | 'completed';
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: 'open' | 'confirmed' | 'cancelled' | 'completed';
          location_name?: string | null;
        };
      };
      proposal_responses: {
        Row: {
          id: string;
          proposal_id: string;
          user_id: string;
          response: 'pending' | 'accepted' | 'declined' | 'maybe';
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          user_id: string;
          response?: 'pending' | 'accepted' | 'declined' | 'maybe';
          responded_at?: string | null;
        };
        Update: {
          response?: 'pending' | 'accepted' | 'declined' | 'maybe';
          responded_at?: string | null;
        };
      };
      hangouts: {
        Row: {
          id: string;
          proposal_id: string | null;
          group_id: string | null;
          title: string;
          activity_tag: string | null;
          location_name: string | null;
          location_city: string | null;
          date: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id?: string | null;
          group_id?: string | null;
          title: string;
          activity_tag?: string | null;
          location_name?: string | null;
          location_city?: string | null;
          date?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          activity_tag?: string | null;
          location_name?: string | null;
          date?: string;
        };
      };
      hangout_attendees: {
        Row: {
          id: string;
          hangout_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          hangout_id: string;
          user_id: string;
        };
        Update: {};
      };
      hangout_photos: {
        Row: {
          id: string;
          hangout_id: string;
          uploaded_by: string;
          storage_path: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hangout_id: string;
          uploaded_by: string;
          storage_path: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          caption?: string | null;
        };
      };
      hangout_reactions: {
        Row: {
          id: string;
          hangout_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hangout_id: string;
          user_id: string;
          emoji?: string;
          created_at?: string;
        };
        Update: {
          emoji?: string;
        };
      };
    };
    Functions: {
      get_effective_availability: {
        Args: {
          p_user_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          date: string;
          time_block: string;
          is_available: boolean;
          source: string;
        }[];
      };
      get_group_overlaps: {
        Args: {
          p_group_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          date: string;
          time_block: string;
          available_count: number;
          total_members: number;
          available_members: string[];
        }[];
      };
    };
  };
}
