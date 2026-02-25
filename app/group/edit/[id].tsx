import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useGroup, useUpdateGroup, useRemoveGroupMember, useAddGroupMember } from '../../../hooks/useGroups';
import { useFriendsList } from '../../../hooks/useFriends';
import { useAuth } from '../../../providers/AuthProvider';
import { useColors } from '../../../providers/ThemeProvider';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/Avatar';
import { GroupIcon } from '../../../components/GroupCard';
import { SkeletonLoader } from '../../../components/SkeletonLoader';

const ICON_OPTIONS = ['🏃', '🎮', '🎬', '🍻', '🎾', '🏔️', '🎲', '☕', '🍽️', '🎵', '📚', '🏋️', '🎨', '🏄', '⚽', '🎯', '✈️', '🎉', '🧗', '🤝'];

export default function GroupEditScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: group, isLoading } = useGroup(id);
  const { data: friends } = useFriendsList();
  const updateGroup = useUpdateGroup();
  const removeMember = useRemoveGroupMember();
  const addMember = useAddGroupMember();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [iconChanged, setIconChanged] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form from group data once loaded
  if (group && !initialized) {
    setName(group.name);
    setDescription(group.description ?? '');
    setSelectedEmoji(group.icon_name ?? null);
    setInitialized(true);
  }

  const memberUserIds = useMemo(
    () => new Set((group?.members ?? []).map((m: any) => m.user_id)),
    [group]
  );

  const friendsToAdd = useMemo(
    () => (friends ?? []).filter((f: any) => !memberUserIds.has(f.id)),
    [friends, memberUserIds]
  );

  const myRole = useMemo(
    () => group?.members?.find((m: any) => m.user_id === user?.id)?.role ?? 'member',
    [group, user]
  );

  const canRemove = (member: any) =>
    member.user_id !== user?.id && member.role !== 'owner';

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setSelectedEmoji(null);
      setIconChanged(true);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateGroup.mutateAsync({
      groupId: id,
      name: name.trim(),
      description: description.trim() || null,
      ...(iconChanged ? { iconName: photoUri ? null : selectedEmoji, iconPhotoUri: photoUri } : {}),
    });
    router.back();
  };

  const handleRemoveMember = (member: any) => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.profile.display_name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMember.mutate({ groupId: id, userId: member.user_id }),
        },
      ]
    );
  };

  const handleAddMember = (friend: any) => {
    addMember.mutate({ groupId: id, userId: friend.id });
  };

  const iconSize = 72;

  if (isLoading || !group) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <SkeletonLoader height={32} borderRadius={8} className="mb-4" />
          <SkeletonLoader height={80} borderRadius={16} className="mb-4" />
        </View>
      </SafeAreaView>
    );
  }

  const previewIconUrl = photoUri ?? (selectedEmoji ? null : group.icon_url);
  const previewIconName = selectedEmoji ?? (photoUri ? null : group.icon_name);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: c.text, fontWeight: '700', fontSize: 22 }}>Manage Group</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateGroup.isPending || !name.trim()}
          style={{ backgroundColor: c.accentBg, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: c.accent, fontWeight: '700', fontSize: 14 }}>
            {updateGroup.isPending ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>

        {/* Icon */}
        <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 16, marginBottom: 12 }}>
          Icon
        </Text>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
            {previewIconUrl ? (
              <Image source={{ uri: previewIconUrl }} style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.27 }} />
            ) : (
              <LinearGradient
                colors={['#8875ff', '#c084fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.27, alignItems: 'center', justifyContent: 'center' }}
              >
                {previewIconName ? (
                  <Text style={{ fontSize: iconSize * 0.48 }}>{previewIconName}</Text>
                ) : (
                  <Ionicons name="grid" size={iconSize * 0.45} color="#ffffff" />
                )}
              </LinearGradient>
            )}
            <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: c.accent, borderRadius: 999, padding: 5 }}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
          {ICON_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => { setSelectedEmoji(emoji === selectedEmoji ? null : emoji); setPhotoUri(null); setIconChanged(true); }}
              style={[
                { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8 },
                selectedEmoji === emoji
                  ? { backgroundColor: c.accentBg, borderWidth: 1.5, borderColor: c.accent }
                  : { backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border },
              ]}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name & Description */}
        <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
          Info
        </Text>
        <Input label="Group Name" value={name} onChangeText={setName} placeholder="Group name" autoCapitalize="words" />
        <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="What's this group about?" autoCapitalize="sentences" />

        {/* Current Members */}
        <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 8, marginBottom: 12 }}>
          Members · {group.members.length}
        </Text>
        {group.members.map((member: any) => (
          <View
            key={member.id}
            style={{ backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}
          >
            <Avatar url={member.profile.avatar_url} name={member.profile.display_name} size={36} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }}>{member.profile.display_name}</Text>
              <Text style={{ color: c.textMuted, fontSize: 12 }}>@{member.profile.username}</Text>
            </View>
            {member.role !== 'member' && (
              <View style={{ backgroundColor: c.accentBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
                <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{member.role}</Text>
              </View>
            )}
            {canRemove(member) && (
              <TouchableOpacity
                onPress={() => handleRemoveMember(member)}
                style={{ backgroundColor: c.dangerBg, borderRadius: 999, padding: 6 }}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={14} color={c.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Add Friends */}
        {friendsToAdd.length > 0 && (
          <>
            <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 }}>
              Add Friends
            </Text>
            {friendsToAdd.map((friend: any) => (
              <View
                key={friend.id}
                style={{ backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}
              >
                <Avatar url={friend.avatar_url} name={friend.display_name} size={36} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }}>{friend.display_name}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 12 }}>@{friend.username}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleAddMember(friend)}
                  style={{ backgroundColor: c.accentBg, borderRadius: 999, padding: 6 }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={14} color={c.accent} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Danger Zone */}
        {myRole === 'owner' && (
          <View style={{ marginTop: 40 }}>
            <Button
              title="Delete Group"
              variant="critical"
              onPress={() => Alert.alert('Delete Group', 'This will permanently delete the group and all its data. This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
              ])}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
