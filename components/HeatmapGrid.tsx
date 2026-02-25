import { View, Text, TouchableOpacity } from 'react-native';
import { AvailabilityCell } from '../hooks/useAvailability';
import { useColors } from '../providers/ThemeProvider';

const TIME_BLOCKS = ['morning', 'afternoon', 'evening'] as const;
const TIME_LABELS: Record<string, string> = {
  morning: 'AM',
  afternoon: 'PM',
  evening: 'Eve',
};
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TODAY = new Date().toISOString().split('T')[0];

type HeatmapGridProps = {
  dates: string[]; // 7 date strings (YYYY-MM-DD)
  availability: AvailabilityCell[];
  editable?: boolean;
  onCellPress?: (date: string, timeBlock: string) => void;
  // Map of "date|time_block" → number of free members
  friendOverlapCounts?: Record<string, number>;
  // Total member count — enables intensity gradient when provided
  totalMembers?: number;
};

function getDayNumber(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate();
}

// Interpolate between two hex colors by factor 0–1
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bv})`;
}

// Low-intensity purple → deep violet for the group overlap gradient
const COLOR_LOW = '#c4bafe';  // very light lavender
const COLOR_HIGH = '#5b21b6'; // deep violet

function getCellInlineStyle(
  isAvailable: boolean,
  overlapCount: number,
  isToday: boolean,
  busyColor: string,
  totalMembers?: number,
) {
  // Group heatmap: intensity gradient based on fraction free
  if (overlapCount > 0 && totalMembers && totalMembers > 0) {
    const fraction = Math.min(overlapCount / totalMembers, 1);
    // Map fraction to a curve that keeps low counts visible
    const t = 0.15 + fraction * 0.85;
    return { backgroundColor: lerpColor(COLOR_LOW, COLOR_HIGH, t) };
  }
  // Personal availability (own schedule)
  if (isAvailable && overlapCount > 0) {
    return { backgroundColor: '#8875ff' };
  }
  if (isAvailable) {
    return { backgroundColor: '#8875ff', opacity: isToday ? 0.8 : 0.6 };
  }
  if (overlapCount > 0) {
    return { backgroundColor: '#c084fc', opacity: 0.4 };
  }
  return { backgroundColor: busyColor };
}

export function HeatmapGrid({
  dates,
  availability,
  editable = false,
  onCellPress,
  friendOverlapCounts = {},
  totalMembers,
}: HeatmapGridProps) {
  const c = useColors();
  const busyColor = c.bg === '#09090f' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const getCell = (date: string, timeBlock: string) => {
    return availability.find(
      (a) => a.date === date && a.time_block === timeBlock
    );
  };

  return (
    <View>
      {/* Day headers */}
      <View className="flex-row mb-2">
        <View className="w-10" />
        {dates.map((date) => {
          const dayOfWeek = new Date(date + 'T12:00:00').getDay();
          const isToday = date === TODAY;
          return (
            <View key={date} className="flex-1 items-center">
              <Text
                className={`text-xs ${
                  isToday
                    ? 'font-bold'
                    : 'text-gray-400 dark:text-dark-400'
                }`}
                style={isToday ? { color: '#8875ff' } : undefined}
              >
                {DAY_LABELS[dayOfWeek]}
              </Text>
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={isToday ? { backgroundColor: '#8875ff' } : undefined}
              >
                <Text
                  className={`text-sm font-bold ${
                    isToday
                      ? 'text-dark-900'
                      : 'text-gray-700 dark:text-dark-200'
                  }`}
                >
                  {getDayNumber(date)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Grid rows */}
      {TIME_BLOCKS.map((block) => (
        <View key={block} className="flex-row mb-1.5 items-center">
          <View className="w-10">
            <Text className="text-gray-400 dark:text-dark-400 text-xs font-medium">
              {TIME_LABELS[block]}
            </Text>
          </View>
          {dates.map((date) => {
            const cell = getCell(date, block);
            const isAvailable = cell?.is_available ?? false;
            const overlapCount = friendOverlapCounts[`${date}|${block}`] ?? 0;
            const isToday = date === TODAY;
            const cellInlineStyle = getCellInlineStyle(isAvailable, overlapCount, isToday, busyColor, totalMembers);

            return (
              <TouchableOpacity
                key={`${date}-${block}`}
                className="flex-1 mx-0.5 rounded-lg"
                style={[
                  { minHeight: 40 },
                  cellInlineStyle,
                  isToday && !isAvailable && overlapCount === 0
                    ? { borderWidth: 1, borderColor: 'rgba(136,117,255,0.3)' }
                    : undefined,
                ]}
                onPress={() => onCellPress?.(date, block)}
                activeOpacity={editable || overlapCount > 0 ? 0.6 : 0.9}
              >
                {overlapCount > 0 && (
                  <Text className="text-dark-900 text-xs font-bold text-center mt-1">
                    +{overlapCount}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      {totalMembers ? (
        <View className="flex-row items-center justify-center mt-4 gap-3">
          <Text className="text-gray-400 dark:text-dark-400 text-xs">Few free</Text>
          <View style={{ flexDirection: 'row', borderRadius: 4, overflow: 'hidden', width: 80, height: 10 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: lerpColor(COLOR_LOW, COLOR_HIGH, 0.15 + (i / 7) * 0.85),
                }}
              />
            ))}
          </View>
          <Text className="text-gray-400 dark:text-dark-400 text-xs">All free</Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center mt-4 gap-5">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: '#8875ff' }} />
            <Text className="text-gray-400 dark:text-dark-400 text-xs">You free</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: '#c084fc', opacity: 0.4 }} />
            <Text className="text-gray-400 dark:text-dark-400 text-xs">Friends free</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: busyColor }} />
            <Text className="text-gray-400 dark:text-dark-400 text-xs">Busy</Text>
          </View>
        </View>
      )}
    </View>
  );
}
