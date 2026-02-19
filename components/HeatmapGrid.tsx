import { View, Text, TouchableOpacity } from 'react-native';
import { AvailabilityCell } from '../hooks/useAvailability';

const TIME_BLOCKS = ['morning', 'afternoon', 'evening'] as const;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type HeatmapGridProps = {
  dates: string[]; // 7 date strings (YYYY-MM-DD)
  availability: AvailabilityCell[];
  editable?: boolean;
  onCellPress?: (date: string, timeBlock: string) => void;
};

function getCellColor(isAvailable: boolean) {
  return isAvailable ? 'bg-lavender' : 'bg-dark-700';
}

function getDayNumber(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate();
}

export function HeatmapGrid({
  dates,
  availability,
  editable = false,
  onCellPress,
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
        {/* Spacer for time labels */}
        <View className="w-12" />
        {dates.map((date, i) => {
          const dayOfWeek = new Date(date + 'T12:00:00').getDay();
          return (
            <View key={date} className="flex-1 items-center">
              <Text className="text-dark-400 text-xs">{DAY_LABELS[dayOfWeek]}</Text>
              <Text className="text-dark-200 text-sm font-medium">
                {getDayNumber(date)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Grid rows */}
      {TIME_BLOCKS.map((block) => (
        <View key={block} className="flex-row mb-2 items-center">
          <View className="w-12">
            <Text className="text-dark-400 text-xs capitalize">
              {block.slice(0, 3)}
            </Text>
          </View>
          {dates.map((date) => {
            const cell = getCell(date, block);
            const isAvailable = cell?.is_available ?? false;

            if (editable) {
              return (
                <TouchableOpacity
                  key={`${date}-${block}`}
                  className={`flex-1 mx-0.5 rounded-lg ${getCellColor(isAvailable)}`}
                  style={{ minHeight: 44 }}
                  onPress={() => onCellPress?.(date, block)}
                  activeOpacity={0.6}
                />
              );
            }

            return (
              <View
                key={`${date}-${block}`}
                className={`flex-1 mx-0.5 rounded-lg ${getCellColor(isAvailable)}`}
                style={{ minHeight: 44 }}
              />
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-3 gap-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-lavender mr-1.5" />
          <Text className="text-dark-300 text-xs">Free</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-dark-700 mr-1.5" />
          <Text className="text-dark-300 text-xs">Busy</Text>
        </View>
      </View>
    </View>
  );
}
