import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../hooks/useProfile';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../../components/Avatar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { InterestChip } from '../../components/ui/InterestChip';
import { INTERESTS } from '../../lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests ?? []
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() || 'jpg';
    const path = `${user!.id}/avatar.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) {
      Alert.alert('Upload failed', error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      display_name: displayName.trim(),
      city: city.trim() || null,
      avatar_url: avatarUrl,
      interests: selectedInterests,
    });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-6 pt-6 pb-12">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark-50 ml-4">
          Edit Profile
        </Text>
      </View>

      {/* Avatar */}
      <TouchableOpacity
        className="items-center mb-8"
        onPress={pickImage}
        disabled={uploading}
      >
        <Avatar url={avatarUrl} name={displayName || 'U'} size={96} />
        <Text className="text-lavender mt-2 text-sm">
          {uploading ? 'Uploading...' : 'Change photo'}
        </Text>
      </TouchableOpacity>

      {/* Fields */}
      <Input
        label="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="How friends see you"
        autoCapitalize="words"
      />

      <Input
        label="City"
        value={city}
        onChangeText={setCity}
        placeholder="Where are you based?"
        autoCapitalize="words"
      />

      {/* Interests */}
      <Text className="text-dark-200 text-sm mb-3 ml-1">Interests</Text>
      <View className="flex-row flex-wrap mb-8">
        {INTERESTS.map((interest) => (
          <InterestChip
            key={interest}
            label={interest}
            selected={selectedInterests.includes(interest)}
            onPress={() => toggleInterest(interest)}
          />
        ))}
      </View>

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={updateProfile.isPending}
      />
    </ScrollView>
  );
}
