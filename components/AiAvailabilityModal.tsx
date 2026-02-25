import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useColors } from '../providers/ThemeProvider';
import { useToggleSlot, useAddTravelPeriod } from '../hooks/useUpdateAvailability';
import { Button } from './ui/Button';

type Slot = {
  date: string;
  time_block: 'morning' | 'afternoon' | 'evening';
  is_available: boolean;
};

type Trip = {
  start_date: string;
  end_date: string;
  label: string | null;
};

type ParseResult = {
  summary: string;
  slots: Slot[];
  trips: Trip[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (s.getMonth() === e.getMonth()) {
    return `${months[s.getMonth()]} ${s.getDate()} – ${e.getDate()}`;
  }
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}`;
}

export function AiAvailabilityModal({ visible, onClose }: Props) {
  const c = useColors();
  const [message, setMessage] = useState('');
  const [uiState, setUiState] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [applying, setApplying] = useState(false);

  const toggleSlot = useToggleSlot();
  const addTravel = useAddTravelPeriod();

  const reset = () => {
    setMessage('');
    setUiState('idle');
    setResult(null);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setUiState('loading');

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.functions.invoke('parse-availability', {
        body: { message: message.trim(), today },
      });

      if (error) throw new Error(error.message);
      if (data?.error) {
        setErrorMsg(data.error);
        setUiState('error');
        return;
      }
      if (!data?.slots?.length && !data?.trips?.length) {
        setErrorMsg("No changes detected. Try being more specific — e.g. \"Busy Saturday morning\" or \"Traveling to Austin Mar 3–5\".");
        setUiState('error');
        return;
      }

      setResult(data);
      setUiState('preview');
    } catch {
      setErrorMsg("Couldn't connect. Check your network and try again.");
      setUiState('error');
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      await Promise.all(
        result.trips.map((trip) =>
          addTravel.mutateAsync({
            startDate: trip.start_date,
            endDate: trip.end_date,
            label: trip.label ?? undefined,
          })
        )
      );
      await Promise.all(
        result.slots.map((slot) =>
          toggleSlot.mutateAsync({
            date: slot.date,
            timeBlock: slot.time_block,
            isAvailable: slot.is_available,
          })
        )
      );
      handleClose();
    } catch {
      setErrorMsg('Failed to apply changes. Please try again.');
      setUiState('error');
    } finally {
      setApplying(false);
    }
  };

  const slotsByDate = (result?.slots ?? []).reduce<Record<string, Slot[]>>((acc, slot) => {
    (acc[slot.date] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: 40,
            maxHeight: '85%',
            borderTopWidth: 1,
            borderColor: c.border,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: c.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginBottom: 20,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 18 }}>
                ✨ AI Scheduler
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
                Describe your schedule in plain English
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={22} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Idle / Loading ── */}
            {(uiState === 'idle' || uiState === 'loading') && (
              <>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder={'e.g. "Traveling to NYC March 5–8" or "Busy Saturday morning"'}
                  placeholderTextColor={c.textMuted}
                  multiline
                  style={{
                    backgroundColor: c.bgCard,
                    borderWidth: 1,
                    borderColor: c.border,
                    borderRadius: 16,
                    padding: 14,
                    color: c.text,
                    fontSize: 15,
                    minHeight: 88,
                    textAlignVertical: 'top',
                  }}
                  editable={uiState !== 'loading'}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!message.trim() || uiState === 'loading'}
                  style={{
                    marginTop: 12,
                    backgroundColor: c.accent,
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: !message.trim() || uiState === 'loading' ? 0.5 : 1,
                  }}
                  activeOpacity={0.8}
                >
                  {uiState === 'loading' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                      Parse Schedule
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ── Preview ── */}
            {uiState === 'preview' && result && (
              <>
                <View
                  style={{
                    backgroundColor: c.accentBg,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 20,
                    flexDirection: 'row',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>✨</Text>
                  <Text style={{ color: c.accent, fontSize: 14, flex: 1, lineHeight: 20 }}>
                    {result.summary}
                  </Text>
                </View>

                {result.trips.length > 0 && (
                  <>
                    <Text
                      style={{
                        color: c.textMuted,
                        fontSize: 11,
                        fontWeight: '700',
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}
                    >
                      Trip Added
                    </Text>
                    {result.trips.map((trip, i) => (
                      <View
                        key={i}
                        style={{
                          backgroundColor: c.bgCard,
                          borderWidth: 1,
                          borderColor: c.border,
                          borderRadius: 14,
                          padding: 14,
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>✈️</Text>
                        <View>
                          <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }}>
                            {trip.label ?? 'Trip'}
                          </Text>
                          <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
                            {formatDateRange(trip.start_date, trip.end_date)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {Object.keys(slotsByDate).length > 0 && (
                  <>
                    <Text
                      style={{
                        color: c.textMuted,
                        fontSize: 11,
                        fontWeight: '700',
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                        marginTop: result.trips.length > 0 ? 12 : 0,
                      }}
                    >
                      Availability Changes
                    </Text>
                    {Object.entries(slotsByDate)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([date, slots]) => (
                        <View
                          key={date}
                          style={{
                            backgroundColor: c.bgCard,
                            borderWidth: 1,
                            borderColor: c.border,
                            borderRadius: 14,
                            padding: 14,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{ color: c.text, fontWeight: '600', fontSize: 14, marginBottom: 8 }}
                          >
                            {formatDate(date)}
                          </Text>
                          {slots.map((slot, i) => (
                            <View
                              key={i}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: i > 0 ? 6 : 0,
                              }}
                            >
                              <Ionicons
                                name={slot.is_available ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color={slot.is_available ? '#22c55e' : c.danger}
                              />
                              <Text style={{ color: c.textSecondary, fontSize: 13, marginLeft: 8 }}>
                                {TIME_LABELS[slot.time_block]} —{' '}
                                {slot.is_available ? 'Free' : 'Busy'}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))}
                  </>
                )}

                <View style={{ marginTop: 16, gap: 10 }}>
                  <Button title="Apply Changes" onPress={handleApply} loading={applying} />
                  <Button title="Cancel" variant="secondary" onPress={handleClose} />
                </View>
              </>
            )}

            {/* ── Error ── */}
            {uiState === 'error' && (
              <>
                <View
                  style={{
                    backgroundColor: c.dangerBg,
                    borderWidth: 1,
                    borderColor: c.dangerBorder,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: c.danger, fontSize: 14, lineHeight: 20 }}>
                    {errorMsg}
                  </Text>
                </View>
                <Button title="Try Again" onPress={() => setUiState('idle')} />
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
