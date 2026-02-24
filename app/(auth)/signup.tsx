import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { InterestChip } from '../../components/ui/InterestChip';
import { INTERESTS } from '../../lib/constants';

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'interests'>('info');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (!email || !password || !username || !displayName) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setError('');
    setStep('interests');
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Failed to create account');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.rpc('create_profile', {
      p_user_id: authData.user.id,
      p_username: username.trim().toLowerCase(),
      p_display_name: displayName.trim(),
      p_city: city.trim() || null,
      p_interests: selectedInterests,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  if (step === 'interests') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#09090f' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Background glow orb */}
        <View
          style={{
            position: 'absolute', top: -120, left: '50%', marginLeft: -160,
            width: 320, height: 320, borderRadius: 160,
            backgroundColor: 'rgba(136,117,255,0.12)',
          }}
          pointerEvents="none"
        />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => setStep('info')}>
            <Text style={{ color: '#8875ff', fontSize: 16, marginBottom: 24 }}>← Back</Text>
          </TouchableOpacity>

          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#f0f0ff', marginBottom: 8 }}>
            Pick your interests
          </Text>
          <Text style={{ color: '#8b8fa8', marginBottom: 24 }}>
            Choose at least a few so friends know what you're into
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

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#09090f' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background glow orb */}
      <View
        style={{
          position: 'absolute', top: -120, left: '50%', marginLeft: -160,
          width: 320, height: 320, borderRadius: 160,
          backgroundColor: 'rgba(136,117,255,0.12)',
        }}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 64, letterSpacing: -3, color: '#8875ff' }}>
            sync
          </Text>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: '#f0f0ff', marginTop: 8 }}>
            Create your account
          </Text>
        </View>

        <View>
          <Input
            label="Email *"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <Input
            label="Password *"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />

          <Input
            label="Username *"
            value={username}
            onChangeText={setUsername}
            placeholder="your_username"
          />

          <Input
            label="Display Name *"
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

          {error ? (
            <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 }}>
              <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          <Button title="Next — Pick Interests" onPress={handleNext} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#5a5f7a' }}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ color: '#8875ff', fontWeight: '600' }}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
