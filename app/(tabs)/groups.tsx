import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGroup, useMyGroups } from '../../hooks/useGroups';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GroupCard } from '../../components/GroupCard';
import { useTheme } from '../../providers/ThemeProvider';

export default function GroupsTabScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const createGroup = useCreateGroup();
  const { data: myGroups, refetch } = useMyGroups();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setName('');
    setDescription('');
    setShowCreate(false);
    router.push(`/group/${group.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-900" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-2 pb-12"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-dark-50">Groups</Text>
          <TouchableOpacity onPress={() => setShowCreate(!showCreate)}>
            <Ionicons name={showCreate ? 'close' : 'add-circle-outline'} size={26} color="#a4a8d1" />
          </TouchableOpacity>
        </View>

        {showCreate && (
          <View className="mb-8">
            {/* Create Section */}
            <Text className="text-lg font-semibold text-gray-900 dark:text-dark-50 mb-4">
              Create a Group
            </Text>

            <Input
              label="Group Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Weekend Warriors"
              autoCapitalize="words"
            />

            <Input
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="What's this group about?"
              autoCapitalize="sentences"
            />

            <Button
              title="Create Group"
              onPress={handleCreate}
              loading={createGroup.isPending}
              disabled={!name.trim()}
            />

            {/* Join Section */}
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-900 dark:text-dark-50 mb-4">
                Join a Group
              </Text>

              <Input
                label="Invite Code"
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Paste an invite code"
              />

              <Button
                title="Join Group"
                onPress={() => {
                  if (inviteCode.trim()) {
                    router.push(`/group/join/${inviteCode.trim()}`);
                  }
                }}
                variant="secondary"
                disabled={!inviteCode.trim()}
              />
            </View>
          </View>
        )}

        {/* My Groups */}
        {myGroups && myGroups.length > 0 ? (
          myGroups.map((group: any) => (
            <GroupCard
              key={group.id}
              name={group.name}
              description={group.description}
              role={group.role}
              memberCount={group.member_count}
              onPress={() => router.push(`/group/${group.id}`)}
            />
          ))
        ) : (
          <Text className="text-gray-500 dark:text-dark-300 text-center mt-8">
            No groups yet. Tap + to create or join one!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
