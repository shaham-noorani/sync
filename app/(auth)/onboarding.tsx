import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { InterestChip } from '../../components/ui/InterestChip';
import { INTERESTS } from '../../lib/constants';
import { useColors } from '../../providers/ThemeProvider';

export default function OnboardingScreen() {
  const c = useColors();
  const { user } = useAuth();

  const googleName = user?.user_metadata?.full_name ?? '';
  const [displayName, setDisplayName] = useState(googleName);
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) =>
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );

  const handleCreate = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError('Display name and username are required');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!user) return;
    setLoading(true);
    setError('');
    const { error: rpcError } = await supabase.rpc('create_profile', {
      p_user_id: user.id,
      p_username: username.trim().toLowerCase(),
      p_display_name: displayName.trim(),
      p_city: city.trim() || null,
      p_interests: selectedInterests,
    });
    if (rpcError) {
      setError(rpcError.message.includes('unique') ? 'Username already taken' : rpcError.message);
    } else {
      // Force onAuthStateChange to fire so AuthProvider re-checks profile
      await supabase.auth.refreshSession();
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: c.text, marginBottom: 8 }}>
          One last step
        </Text>
        <Text style={{ color: c.textSecondary, fontSize: 15, marginBottom: 32 }}>
          Set up your sync profile
        </Text>

        <Input
          label="Display Name *"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="How friends see you"
          autoCapitalize="words"
        />
        <Input
          label="Username *"
          value={username}
          onChangeText={setUsername}
          placeholder="your_username"
          autoCapitalize="none"
        />
        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Where are you based?"
          autoCapitalize="words"
        />

        <Text style={{ color: c.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Pick your interests (optional)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 }}>
          {INTERESTS.map((interest) => (
            <InterestChip
              key={interest}
              label={interest}
              selected={selectedInterests.includes(interest)}
              onPress={() => toggleInterest(interest)}
            />
          ))}
        </View>

        {error ? (
          <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
            <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</Text>
          </View>
        ) : null}

        <Button title="Get Started" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
