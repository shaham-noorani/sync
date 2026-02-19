import { View, Text, TouchableOpacity } from 'react-native';
import { AvailabilityCell } from '../hooks/useAvailability';

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
  // Map of "date|time_block" → number of free friends
  friendOverlapCounts?: Record<string, number>;
};

function getDayNumber(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate();
}

function getCellStyle(isAvailable: boolean, overlapCount: number, isToday: boolean) {
  if (isAvailable && overlapCount > 0) {
    return isToday ? 'bg-lavender-400' : 'bg-lavender';
  } else if (isAvailable) {
    return isToday ? 'bg-lavender opacity-80' : 'bg-lavender opacity-60';
  } else if (overlapCount > 0) {
    return 'bg-lilac opacity-40';
  }
  return 'bg-gray-200 dark:bg-dark-600';
}

export function HeatmapGrid({
  dates,
  availability,
  editable = false,
  onCellPress,
  friendOverlapCounts = {},
}: HeatmapGridProps) {
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
                    ? 'text-lavender-500 dark:text-lavender font-bold'
                    : 'text-gray-400 dark:text-dark-400'
                }`}
              >
                {DAY_LABELS[dayOfWeek]}
              </Text>
              <View className={`w-7 h-7 rounded-full items-center justify-center ${
                isToday ? 'bg-lavender' : ''
              }`}>
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
            const cellStyle = getCellStyle(isAvailable, overlapCount, isToday);

            return (
              <TouchableOpacity
                key={`${date}-${block}`}
                className={`flex-1 mx-0.5 rounded-lg ${cellStyle} ${
                  isToday && !isAvailable && overlapCount === 0
                    ? 'border border-lavender/30'
                    : ''
                }`}
                style={{ minHeight: 40 }}
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
      <View className="flex-row items-center justify-center mt-4 gap-5">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-sm bg-lavender mr-1.5" />
          <Text className="text-gray-400 dark:text-dark-400 text-xs">You free</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-sm bg-lilac opacity-40 mr-1.5" />
          <Text className="text-gray-400 dark:text-dark-400 text-xs">Friends free</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-dark-600 mr-1.5" />
          <Text className="text-gray-400 dark:text-dark-400 text-xs">Busy</Text>
        </View>
      </View>
    </View>
  );
}
