import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-dark-900 px-6">
      <Ionicons name="compass-outline" size={48} color="#64748b" />
      <Text className="text-xl font-bold text-gray-900 dark:text-dark-50 mt-4">Page Not Found</Text>
      <Text className="text-gray-500 dark:text-dark-300 mt-2 text-center">
        This screen doesn't exist.
      </Text>
      <TouchableOpacity
        className="mt-6 bg-lavender rounded-xl px-6 py-3"
        onPress={() => router.replace('/')}
      >
        <Text className="text-dark-900 font-semibold">Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}
