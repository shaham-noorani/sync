import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCreateGroup, useMyGroups } from '../../hooks/useGroups';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GroupCard } from '../../components/GroupCard';
import { useColors } from '../../providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

const ICON_OPTIONS = ['🏃', '🎮', '🎬', '🍻', '🎾', '🏔️', '🎲', '☕', '🍽️', '🎵', '📚', '🏋️', '🎨', '🏄', '⚽', '🎯', '✈️', '🎉', '🧗', '🤝'];

export default function CreateGroupScreen() {
  const c = useColors();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const createGroup = useCreateGroup();
  const { data: myGroups } = useMyGroups();

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
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const group = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      iconName: selectedEmoji,
      iconPhotoUri: photoUri,
    });
    router.replace(`/group/${group.id}`);
  };

  const iconSize = 72;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={c.accent} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', color: c.text, fontSize: 22, marginLeft: 16 }}>
            Groups
          </Text>
        </View>

        {/* Create Section */}
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
          Create a Group
        </Text>

        {/* Icon Picker */}
        <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
          Icon
        </Text>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {/* Preview */}
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.27 }} />
            ) : (
              <LinearGradient
                colors={['#8875ff', '#c084fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.27, alignItems: 'center', justifyContent: 'center' }}
              >
                {selectedEmoji ? (
                  <Text style={{ fontSize: iconSize * 0.48 }}>{selectedEmoji}</Text>
                ) : (
                  <Ionicons name="grid" size={iconSize * 0.45} color="#ffffff" />
                )}
              </LinearGradient>
            )}
            <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: c.accent, borderRadius: 999, padding: 4 }}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Emoji grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {ICON_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => { setSelectedEmoji(emoji === selectedEmoji ? null : emoji); setPhotoUri(null); }}
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
          <Text style={{ color: c.text, fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
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
            onPress={() => { if (inviteCode.trim()) router.push(`/group/join/${inviteCode.trim()}`); }}
            variant="secondary"
            disabled={!inviteCode.trim()}
          />
        </View>

        {/* My Groups */}
        {myGroups && myGroups.length > 0 && (
          <View style={{ marginTop: 40 }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 18, marginBottom: 16 }}>
              My Groups
            </Text>
            {myGroups.map((group: any) => (
              <GroupCard
                key={group.id}
                name={group.name}
                description={group.description}
                role={group.role}
                iconUrl={group.icon_url}
                iconName={group.icon_name}
                onPress={() => router.push(`/group/${group.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
