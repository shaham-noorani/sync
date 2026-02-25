import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type WeekNavigatorProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev?: boolean;
  onToday?: () => void;
};

export function WeekNavigator({ label, onPrev, onNext, canGoPrev = true, onToday }: WeekNavigatorProps) {
  return (
    <View className="flex-row items-center justify-between px-1 py-3">
      <TouchableOpacity
        onPress={onPrev}
        className="p-2"
        disabled={!canGoPrev}
        activeOpacity={canGoPrev ? 0.7 : 1}
      >
        <Ionicons name="chevron-back" size={22} color={canGoPrev ? '#a4a8d1' : '#334155'} />
      </TouchableOpacity>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text className="text-gray-900 dark:text-dark-50 font-bold text-base tracking-wide">{label}</Text>
        {onToday && canGoPrev && (
          <TouchableOpacity onPress={onToday} activeOpacity={0.7}>
            <Text style={{ color: '#8875ff', fontSize: 12, fontWeight: '600' }}>Today</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={onNext} className="p-2" activeOpacity={0.7}>
        <Ionicons name="chevron-forward" size={22} color="#a4a8d1" />
      </TouchableOpacity>
    </View>
  );
}
