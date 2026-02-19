import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useGroup, useLeaveGroup } from '../../hooks/useGroups';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/SkeletonLoader';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: group, isLoading } = useGroup(id);
  const leaveGroup = useLeaveGroup();

  const copyInviteCode = async () => {
    if (!group) return;
    await Clipboard.setStringAsync(group.invite_code);
    Alert.alert('Copied!', `Invite code "${group.invite_code}" copied to clipboard`);
  };

  const handleLeave = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveGroup.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-900 px-6 pt-16">
        <SkeletonLoader height={32} borderRadius={8} className="mb-4" />
        <SkeletonLoader height={20} borderRadius={8} className="mb-8" />
        <SkeletonLoader height={60} borderRadius={12} className="mb-3" />
        <SkeletonLoader height={60} borderRadius={12} className="mb-3" />
      </View>
    );
  }

  if (!group) return null;

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-6 pt-16 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark-50 ml-4 flex-1" numberOfLines={1}>
          {group.name}
        </Text>
      </View>

      {group.description && (
        <Text className="text-dark-300 text-base mb-6">{group.description}</Text>
      )}

      {/* Invite Code */}
      <TouchableOpacity
        className="bg-dark-700 rounded-xl px-4 py-4 flex-row items-center justify-between mb-8"
        onPress={copyInviteCode}
      >
        <View>
          <Text className="text-dark-300 text-sm">Invite Code</Text>
          <Text className="text-lavender text-xl font-bold mt-1">
            {group.invite_code}
          </Text>
        </View>
        <Ionicons name="copy-outline" size={24} color="#a4a8d1" />
      </TouchableOpacity>

      {/* Members */}
      <Text className="text-lg font-semibold text-dark-50 mb-4">
        Members ({group.members.length})
      </Text>

      {group.members.map((member: any) => (
        <View
          key={member.id}
          className="flex-row items-center bg-dark-700 rounded-xl px-4 py-3 mb-3"
        >
          <Avatar
            url={member.profile.avatar_url}
            name={member.profile.display_name}
            size={40}
          />
          <View className="flex-1 ml-3">
            <Text className="text-dark-50 font-medium">
              {member.profile.display_name}
            </Text>
            <Text className="text-dark-300 text-sm">
              @{member.profile.username}
            </Text>
          </View>
          {member.role !== 'member' && (
            <Text className="text-lavender text-xs uppercase font-medium">
              {member.role}
            </Text>
          )}
        </View>
      ))}

      {/* Leave */}
      <View className="mt-8">
        <Button
          title="Leave Group"
          onPress={handleLeave}
          variant="outline"
          loading={leaveGroup.isPending}
        />
      </View>
    </ScrollView>
  );
}
