import { TouchableOpacity, Text } from 'react-native';

type InterestChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function InterestChip({
  label,
  selected = false,
  onPress,
}: InterestChipProps) {
  return (
    <TouchableOpacity
      className={`rounded-full px-4 py-2 mr-2 mb-2 ${
        selected ? 'bg-lavender' : 'bg-gray-100 dark:bg-dark-600'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-dark-900' : 'text-gray-600 dark:text-dark-200'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
