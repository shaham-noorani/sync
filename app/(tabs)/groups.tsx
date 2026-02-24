import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateGroup, useMyGroups } from '../../hooks/useGroups';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GroupCard } from '../../components/GroupCard';

export default function GroupsTabScreen() {
  const router = useRouter();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: '#f0f0ff', fontSize: 22 }}>Groups</Text>
          <TouchableOpacity onPress={() => setShowCreate(!showCreate)}>
            <Ionicons name={showCreate ? 'close' : 'add-circle-outline'} size={26} color="#8875ff" />
          </TouchableOpacity>
        </View>

        {showCreate && (
          <View style={{ marginBottom: 32 }}>
            {/* Create Section */}
            <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 }}>
              CREATE A GROUP
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
            <View style={{ marginTop: 24 }}>
              <Text style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 }}>
                JOIN A GROUP
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
          <Text style={{ color: '#5a5f7a', textAlign: 'center', marginTop: 32 }}>
            No groups yet. Tap + to create or join one!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
