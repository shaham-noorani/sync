import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
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

  // Travel period form
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

  // Build pattern availability for the pattern grid
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
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-6 pt-16 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark-50 ml-4">
          Edit Availability
        </Text>
      </View>

      {/* Mode Tabs */}
      <View className="flex-row bg-dark-700 rounded-xl p-1 mb-6">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${
            mode === 'pattern' ? 'bg-lavender' : ''
          }`}
          onPress={() => setMode('pattern')}
        >
          <Text
            className={`font-medium ${
              mode === 'pattern' ? 'text-dark-900' : 'text-dark-300'
            }`}
          >
            Weekly Pattern
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${
            mode === 'specific' ? 'bg-lavender' : ''
          }`}
          onPress={() => setMode('specific')}
        >
          <Text
            className={`font-medium ${
              mode === 'specific' ? 'text-dark-900' : 'text-dark-300'
            }`}
          >
            Specific Dates
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'pattern' ? (
        <>
          <Text className="text-dark-300 text-sm mb-4">
            Set your recurring weekly schedule. Tap cells to toggle free/busy.
          </Text>
          <HeatmapGrid
            dates={dates}
            availability={patternAvailability}
            editable
            onCellPress={handlePatternCellPress}
          />
          <Text className="text-dark-400 text-xs mt-3 text-center">
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
          <Text className="text-dark-300 text-sm mb-4 mt-2">
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
      <View className="mt-10">
        <Text className="text-lg font-semibold text-dark-50 mb-4">
          Travel Periods
        </Text>
        <Text className="text-dark-300 text-sm mb-4">
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

        {/* Existing travel periods */}
        {travelPeriods && travelPeriods.length > 0 && (
          <View className="mt-6">
            {travelPeriods.map((tp) => (
              <View
                key={tp.id}
                className="flex-row items-center bg-dark-700 rounded-xl px-4 py-3 mb-3"
              >
                <Ionicons name="airplane" size={18} color="#a4a8d1" />
                <View className="flex-1 ml-3">
                  <Text className="text-dark-50 font-medium">
                    {tp.label || 'Travel'}
                  </Text>
                  <Text className="text-dark-300 text-sm">
                    {tp.start_date} → {tp.end_date}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteTravel.mutate(tp.id)}
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
