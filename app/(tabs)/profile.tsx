import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { useProfile } from '../../hooks/useProfile';
import { Avatar } from '../../components/Avatar';
import { InterestChip } from '../../components/ui/InterestChip';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-900 px-6 pt-16">
        <View className="items-center mb-8">
          <SkeletonLoader width={80} height={80} borderRadius={40} />
          <SkeletonLoader width={150} height={24} borderRadius={8} className="mt-4" />
          <SkeletonLoader width={100} height={16} borderRadius={8} className="mt-2" />
        </View>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-6 pt-6 pb-12">
      {/* Header */}
      <View className="items-center mb-8">
        <Avatar
          url={profile.avatar_url}
          name={profile.display_name}
          size={80}
        />
        <Text className="text-2xl font-bold text-dark-50 mt-4">
          {profile.display_name}
        </Text>
        <Text className="text-dark-300 mt-1">@{profile.username}</Text>
        {profile.city && (
          <Text className="text-dark-300 mt-1">{profile.city}</Text>
        )}
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-dark-700 rounded-xl py-3 mb-8"
        onPress={() => router.push('/profile/edit')}
      >
        <Ionicons name="pencil" size={16} color="#94a3b8" />
        <Text className="text-dark-200 ml-2 font-medium">Edit Profile</Text>
      </TouchableOpacity>

      {/* Interests */}
      {profile.interests.length > 0 && (
        <View className="mb-8">
          <Text className="text-dark-200 text-sm font-medium mb-3 ml-1">
            Interests
          </Text>
          <View className="flex-row flex-wrap">
            {profile.interests.map((interest: string) => (
              <InterestChip key={interest} label={interest} selected />
            ))}
          </View>
        </View>
      )}

      {/* Quick Links */}
      <View className="mb-8">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-dark-700 rounded-xl px-4 py-4 mb-3"
          onPress={() => router.push('/friends')}
        >
          <View className="flex-row items-center">
            <Ionicons name="people" size={20} color="#f59e0b" />
            <Text className="text-dark-50 ml-3 text-base">Friends</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between bg-dark-700 rounded-xl px-4 py-4"
          onPress={() => router.push('/group/create')}
        >
          <View className="flex-row items-center">
            <Ionicons name="grid" size={20} color="#f59e0b" />
            <Text className="text-dark-50 ml-3 text-base">Groups</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <Button title="Sign Out" onPress={signOut} variant="outline" />
    </ScrollView>
  );
}
