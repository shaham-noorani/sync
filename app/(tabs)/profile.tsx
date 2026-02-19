import { View, Text } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-dark-900">
      <Text className="text-xl font-bold text-dark-50">Profile</Text>
      <Text className="mt-2 text-dark-200">{user?.email}</Text>
    </View>
  );
}
