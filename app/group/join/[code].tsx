import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroupByCode, useJoinGroup } from '../../../hooks/useGroups';
import { Button } from '../../../components/ui/Button';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

export default function JoinGroupScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { data: group, isLoading, error } = useGroupByCode(code);
  const joinGroup = useJoinGroup();

  const handleJoin = async () => {
    if (!group) return;
    await joinGroup.mutateAsync(group.id);
    router.replace(`/group/${group.id}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900 items-center justify-center px-6" edges={['top']}>
        <SkeletonLoader width={200} height={32} borderRadius={8} />
        <SkeletonLoader width={250} height={20} borderRadius={8} className="mt-4" />
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900 items-center justify-center px-6" edges={['top']}>
        <Ionicons name="alert-circle" size={48} color="#64748b" />
        <Text className="text-gray-600 dark:text-dark-200 text-lg mt-4">Group not found</Text>
        <Text className="text-gray-400 dark:text-dark-400 mt-2 text-center">
          The invite code "{code}" doesn't match any group.
        </Text>
        <TouchableOpacity className="mt-6" onPress={() => router.back()}>
          <Text className="text-lavender-500 dark:text-lavender font-semibold text-base">
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900 items-center justify-center px-6" edges={['top']}>
      <View className="w-20 h-20 rounded-full bg-lavender items-center justify-center mb-6">
        <Ionicons name="people" size={36} color="#0f1420" />
      </View>

      <Text className="text-2xl font-bold text-gray-900 dark:text-dark-50">{group.name}</Text>
      {group.description && (
        <Text className="text-gray-500 dark:text-dark-300 text-base mt-2 text-center">
          {group.description}
        </Text>
      )}

      <View className="w-full mt-10">
        <Button
          title="Join Group"
          onPress={handleJoin}
          loading={joinGroup.isPending}
        />
      </View>

      <TouchableOpacity className="mt-4" onPress={() => router.back()}>
        <Text className="text-gray-500 dark:text-dark-300 text-base">Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
