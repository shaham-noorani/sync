import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useAvailabilityPatterns,
  useEffectiveAvailability,
  useTravelPeriods,
} from '../../hooks/useAvailability';
import {
  useTogglePattern,
  useToggleSlot,
  useAddTravelPeriod,
  useDeleteTravelPeriod,
} from '../../hooks/useUpdateAvailability';
import { HeatmapGrid } from '../../components/HeatmapGrid';
import { WeekNavigator } from '../../components/WeekNavigator';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_BLOCKS = ['morning', 'afternoon', 'evening'] as const;

type Mode = 'pattern' | 'specific';

function getWeekDates(weekOffset: number): string[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatWeekLabel(dates: string[]): string {
  const start = new Date(dates[0] + 'T12:00:00');
  const end = new Date(dates[6] + 'T12:00:00');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  if (start.getMonth() === end.getMonth()) {
    return `${months[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}`;
}

export default function EditAvailabilityScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('pattern');
  const [weekOffset, setWeekOffset] = useState(0);

  const [travelStart, setTravelStart] = useState('');
  const [travelEnd, setTravelEnd] = useState('');
  const [travelLabel, setTravelLabel] = useState('');

  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const { data: patterns } = useAvailabilityPatterns();
  const { data: availability } = useEffectiveAvailability(dates[0], dates[6]);
  const { data: travelPeriods } = useTravelPeriods();
  const togglePattern = useTogglePattern();
  const toggleSlot = useToggleSlot();
  const addTravel = useAddTravelPeriod();
  const deleteTravel = useDeleteTravelPeriod();

  const patternAvailability = useMemo(() => {
    if (!patterns) return [];
    return dates.flatMap((date) => {
      const dayOfWeek = new Date(date + 'T12:00:00').getDay();
      return TIME_BLOCKS.map((block) => {
        const pattern = patterns.find(
          (p) => p.day_of_week === dayOfWeek && p.time_block === block
        );
        return {
          date,
          time_block: block,
          is_available: pattern?.is_available ?? false,
          source: 'pattern',
        };
      });
    });
  }, [patterns, dates]);

  const handlePatternCellPress = (date: string, timeBlock: string) => {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const current = patterns?.find(
      (p) => p.day_of_week === dayOfWeek && p.time_block === timeBlock
    );
    const currentValue = current?.is_available ?? false;
    togglePattern.mutate({
      dayOfWeek,
      timeBlock,
      isAvailable: !currentValue,
    });
  };

  const handleSpecificCellPress = (date: string, timeBlock: string) => {
    const cell = availability?.find(
      (a) => a.date === date && a.time_block === timeBlock
    );
    const currentValue = cell?.is_available ?? false;
    toggleSlot.mutate({
      date,
      timeBlock,
      isAvailable: !currentValue,
    });
  };

  const handleAddTravel = async () => {
    if (!travelStart || !travelEnd) {
      Alert.alert('Missing dates', 'Please enter both start and end dates');
      return;
    }
    if (travelEnd < travelStart) {
      Alert.alert('Invalid range', 'End date must be after start date');
      return;
    }
    await addTravel.mutateAsync({
      startDate: travelStart,
      endDate: travelEnd,
      label: travelLabel || undefined,
    });
    setTravelStart('');
    setTravelEnd('');
    setTravelLabel('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#8875ff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22, marginLeft: 16 }}>
            Edit Availability
          </Text>
        </View>

        {/* Mode Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4, marginBottom: 24 }}>
          <TouchableOpacity
            style={
              mode === 'pattern'
                ? { backgroundColor: '#8875ff', borderRadius: 10, paddingVertical: 10, flex: 1, alignItems: 'center' }
                : { flex: 1, paddingVertical: 10, alignItems: 'center' }
            }
            onPress={() => setMode('pattern')}
          >
            <Text
              style={
                mode === 'pattern'
                  ? { color: '#ffffff', fontWeight: '700' }
                  : { color: '#5a5f7a', fontWeight: '500' }
              }
            >
              Weekly Pattern
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              mode === 'specific'
                ? { backgroundColor: '#8875ff', borderRadius: 10, paddingVertical: 10, flex: 1, alignItems: 'center' }
                : { flex: 1, paddingVertical: 10, alignItems: 'center' }
            }
            onPress={() => setMode('specific')}
          >
            <Text
              style={
                mode === 'specific'
                  ? { color: '#ffffff', fontWeight: '700' }
                  : { color: '#5a5f7a', fontWeight: '500' }
              }
            >
              Specific Dates
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'pattern' ? (
          <>
            <Text style={{ color: '#8b8fa8', fontSize: 14, marginBottom: 16 }}>
              Set your recurring weekly schedule. Tap cells to toggle free/busy.
            </Text>
            <HeatmapGrid
              dates={dates}
              availability={patternAvailability}
              editable
              onCellPress={handlePatternCellPress}
            />
            <Text style={{ color: '#5a5f7a', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
              Pattern applies to the same day every week
            </Text>
          </>
        ) : (
          <>
            <WeekNavigator
              label={formatWeekLabel(dates)}
              onPrev={() => setWeekOffset((o) => o - 1)}
              onNext={() => setWeekOffset((o) => o + 1)}
            />
            <Text style={{ color: '#8b8fa8', fontSize: 14, marginBottom: 16, marginTop: 8 }}>
              Override specific dates. These take priority over your weekly pattern.
            </Text>
            <HeatmapGrid
              dates={dates}
              availability={availability ?? []}
              editable
              onCellPress={handleSpecificCellPress}
            />
          </>
        )}

        {/* Travel Periods */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
            Travel Periods
          </Text>
          <Text style={{ color: '#8b8fa8', fontSize: 14, marginBottom: 16 }}>
            Mark dates when you're away. All time blocks will show as busy.
          </Text>

          <Input
            label="Start Date (YYYY-MM-DD)"
            value={travelStart}
            onChangeText={setTravelStart}
            placeholder="2026-03-01"
          />
          <Input
            label="End Date (YYYY-MM-DD)"
            value={travelEnd}
            onChangeText={setTravelEnd}
            placeholder="2026-03-07"
          />
          <Input
            label="Label (optional)"
            value={travelLabel}
            onChangeText={setTravelLabel}
            placeholder="e.g., Spring Break"
            autoCapitalize="words"
          />

          <Button
            title="Add Travel Period"
            onPress={handleAddTravel}
            variant="secondary"
            loading={addTravel.isPending}
          />

          {travelPeriods && travelPeriods.length > 0 && (
            <View style={{ marginTop: 24 }}>
              {travelPeriods.map((tp) => (
                <View
                  key={tp.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="airplane" size={18} color="#8875ff" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: '#f0f0ff', fontWeight: '600' }}>
                      {tp.label || 'Travel'}
                    </Text>
                    <Text style={{ color: '#8b8fa8', fontSize: 13 }}>
                      {tp.start_date} → {tp.end_date}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteTravel.mutate(tp.id)}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
