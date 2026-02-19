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
        className="flex-1 bg-gray-50 dark:bg-dark-900"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerClassName="px-6 pt-16 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => setStep('info')}>
            <Text className="text-lavender-500 dark:text-lavender text-base mb-6">← Back</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 dark:text-dark-50 mb-2">
            Pick your interests
          </Text>
          <Text className="text-gray-500 dark:text-dark-300 mb-6">
            Choose at least a few so friends know what you're into
          </Text>

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

          {error ? (
            <Text className="text-red-400 text-sm mb-4 text-center">
              {error}
            </Text>
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
      className="flex-1 bg-gray-50 dark:bg-dark-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text
            style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 36 }}
            className="text-lavender-500 dark:text-lavender"
          >
            sync
          </Text>
          <Text className="text-gray-500 dark:text-dark-300 mt-2 text-base">Create your account</Text>
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
            <Text className="text-red-400 text-sm mb-4 text-center">
              {error}
            </Text>
          ) : null}

          <Button title="Next — Pick Interests" onPress={handleNext} />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 dark:text-dark-300">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-lavender-500 dark:text-lavender font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
