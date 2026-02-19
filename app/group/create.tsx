import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGroup, useMyGroups } from '../../hooks/useGroups';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GroupCard } from '../../components/GroupCard';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createGroup = useCreateGroup();
  const { data: myGroups } = useMyGroups();

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    router.replace(`/group/${group.id}`);
  };

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-6 pt-16 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark-50 ml-4">Groups</Text>
      </View>

      {/* Create Section */}
      <Text className="text-lg font-semibold text-dark-50 mb-4">
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

      {/* My Groups */}
      {myGroups && myGroups.length > 0 && (
        <View className="mt-10">
          <Text className="text-lg font-semibold text-dark-50 mb-4">
            My Groups
          </Text>
          {myGroups.map((group: any) => (
            <GroupCard
              key={group.id}
              name={group.name}
              description={group.description}
              role={group.role}
              onPress={() => router.push(`/group/${group.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
