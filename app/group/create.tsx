import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [inviteCode, setInviteCode] = useState('');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#8875ff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22, marginLeft: 16 }}>
            Groups
          </Text>
        </View>

        {/* Create Section */}
        <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
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
        <View style={{ marginTop: 40, marginBottom: 8 }}>
          <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
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

        {/* My Groups */}
        {myGroups && myGroups.length > 0 && (
          <View style={{ marginTop: 40 }}>
            <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
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
    </SafeAreaView>
  );
}
