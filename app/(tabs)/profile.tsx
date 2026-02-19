import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { useProfile } from '../../hooks/useProfile';
import { useTheme } from '../../providers/ThemeProvider';
import { Avatar } from '../../components/Avatar';
import { InterestChip } from '../../components/ui/InterestChip';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
        <View className="px-6 pt-6">
          <View className="items-center mb-8">
            <SkeletonLoader width={80} height={80} borderRadius={40} />
            <SkeletonLoader width={150} height={24} borderRadius={8} className="mt-4" />
            <SkeletonLoader width={100} height={16} borderRadius={8} className="mt-2" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-6 pt-6 pb-12">
        {/* Header */}
        <View className="items-center mb-6">
          <Avatar
            url={profile.avatar_url}
            name={profile.display_name}
            size={88}
          />
          <Text className="text-2xl font-bold text-gray-900 dark:text-dark-50 mt-4">
            {profile.display_name}
          </Text>
          <Text className="text-gray-400 dark:text-dark-400 mt-1 text-sm">@{profile.username}</Text>
          {profile.city && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={12} color={isDark ? '#64748b' : '#9ca3af'} />
              <Text className="text-gray-400 dark:text-dark-400 text-sm ml-0.5">{profile.city}</Text>
            </View>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white dark:bg-dark-700 rounded-2xl py-3 mb-6 border border-gray-100 dark:border-dark-600"
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={15} color={isDark ? '#94a3b8' : '#6b7280'} />
          <Text className="text-gray-500 dark:text-dark-300 ml-2 text-sm font-medium">Edit Profile</Text>
        </TouchableOpacity>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <View className="mb-8">
            <Text className="text-gray-500 dark:text-dark-200 text-sm font-medium mb-3 ml-1">
              Interests
            </Text>
            <View className="flex-row flex-wrap">
              {profile.interests.map((interest: string) => (
                <InterestChip key={interest} label={interest} selected />
              ))}
            </View>
          </View>
        )}

        {/* Quick Links + Theme Toggle */}
        <View className="mb-8 bg-white dark:bg-dark-700 rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-dark-600"
            onPress={() => router.push('/friends')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={20} color="#a4a8d1" />
              <Text className="text-gray-900 dark:text-dark-50 ml-3 text-sm font-medium">Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#9ca3af'} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-dark-600"
            onPress={() => router.push('/groups')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="grid-outline" size={20} color="#a4a8d1" />
              <Text className="text-gray-900 dark:text-dark-50 ml-3 text-sm font-medium">Groups</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#9ca3af'} />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color="#a4a8d1"
              />
              <Text className="text-gray-900 dark:text-dark-50 ml-3 text-sm font-medium">Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: '#a4a8d1' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Sign Out */}
        <Button title="Sign Out" onPress={signOut} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}
