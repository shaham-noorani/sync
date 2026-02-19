import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type GroupCardProps = {
  name: string;
  description?: string | null;
  role?: string;
  onPress?: () => void;
};

export function GroupCard({ name, description, role, onPress }: GroupCardProps) {
  return (
    <TouchableOpacity
      className="bg-dark-700 rounded-xl px-4 py-4 mb-3 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-11 h-11 rounded-full bg-lavender items-center justify-center">
        <Ionicons name="people" size={20} color="#0f1420" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-dark-50 font-medium text-base">{name}</Text>
        {description && (
          <Text className="text-dark-300 text-sm mt-0.5" numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
      {role && (
        <Text className="text-dark-400 text-xs uppercase">{role}</Text>
      )}
      <Ionicons
        name="chevron-forward"
        size={18}
        color="#475569"
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
}
