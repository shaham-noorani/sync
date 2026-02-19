import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type GroupCardProps = {
  name: string;
  description?: string | null;
  role?: string;
  memberCount?: number;
  onPress?: () => void;
};

export function GroupCard({ name, description, role, memberCount, onPress }: GroupCardProps) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-dark-700 rounded-2xl px-4 py-4 mb-2 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-11 h-11 rounded-2xl bg-lavender/20 items-center justify-center">
        <Ionicons name="people" size={20} color="#a4a8d1" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-gray-900 dark:text-dark-50 font-semibold text-sm">{name}</Text>
        <Text className="text-gray-400 dark:text-dark-400 text-xs mt-0.5">
          {memberCount !== undefined ? `${memberCount} member${memberCount !== 1 ? 's' : ''}` : description ?? ''}
        </Text>
      </View>
      {role && role !== 'member' && (
        <View className="bg-lavender/20 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-lavender-500 dark:text-lavender text-xs font-semibold uppercase">
            {role}
          </Text>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={16}
        color="#475569"
      />
    </TouchableOpacity>
  );
}
