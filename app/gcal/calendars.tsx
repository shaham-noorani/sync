import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { useColors } from '../../providers/ThemeProvider';

function useCalendars() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['gcal-calendars', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('gcal_calendars')
        .select(`
          id, google_calendar_id, calendar_name, color, is_enabled, is_primary,
          gcal_connections ( google_email )
        `)
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

function useToggleCalendar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from('gcal_calendars')
        .update({ is_enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gcal-calendars', user?.id] }),
  });
}

export default function CalendarPickerScreen() {
  const c = useColors();
  const router = useRouter();
  const { data: calendars = [] } = useCalendars();
  const toggleCalendar = useToggleCalendar();

  // Group calendars by connected account email
  const byAccount = calendars.reduce<Record<string, typeof calendars>>((acc, cal) => {
    const email = (cal.gcal_connections as any)?.google_email ?? 'Unknown';
    (acc[email] ??= []).push(cal);
    return acc;
  }, {});

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 18 }}>Calendar Sources</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Text style={{ color: c.textSecondary, fontSize: 14, marginBottom: 24, marginTop: 8 }}>
          Choose which calendars sync blocks your availability. Enabled calendars mark you busy when you have events.
        </Text>

        {Object.entries(byAccount).map(([email, cals]) => (
          <View key={email} style={{ marginBottom: 24 }}>
            <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
              {email.toUpperCase()}
            </Text>
            <View style={{ backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, overflow: 'hidden' }}>
              {cals.map((cal, i) => (
                <View
                  key={cal.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.bgCardHover,
                  }}
                >
                  {cal.color ? (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cal.color, marginRight: 12 }} />
                  ) : (
                    <Ionicons name="calendar-outline" size={16} color={c.textMuted} style={{ marginRight: 12 }} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 14, fontWeight: '500' }}>
                      {cal.calendar_name}
                    </Text>
                    {cal.is_primary && (
                      <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 1 }}>Primary</Text>
                    )}
                  </View>
                  <Switch
                    value={cal.is_enabled}
                    onValueChange={(val) => toggleCalendar.mutate({ id: cal.id, is_enabled: val })}
                    trackColor={{ false: c.border, true: c.accent }}
                    thumbColor="#ffffff"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {calendars.length === 0 && (
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>
            No calendars connected yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
