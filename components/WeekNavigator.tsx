import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type WeekNavigatorProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

export function WeekNavigator({ label, onPrev, onNext }: WeekNavigatorProps) {
  return (
    <View className="flex-row items-center justify-between px-2 py-3">
      <TouchableOpacity onPress={onPrev} className="p-2">
        <Ionicons name="chevron-back" size={22} color="#f59e0b" />
      </TouchableOpacity>
      <Text className="text-dark-50 font-semibold text-base">{label}</Text>
      <TouchableOpacity onPress={onNext} className="p-2">
        <Ionicons name="chevron-forward" size={22} color="#f59e0b" />
      </TouchableOpacity>
    </View>
  );
}
