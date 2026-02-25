import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useColors } from '../../providers/ThemeProvider';

export default function LoginScreen() {
  const c = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const redirectTo = makeRedirectUri({ scheme: 'sync' });
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
      return;
    }
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
    setGoogleLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
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
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 56 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 64, letterSpacing: -3, color: c.accent }}>
            sync
          </Text>
          <Text style={{ color: c.textSecondary, marginTop: 8, fontSize: 15 }}>
            coordinate hangouts with friends
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 4 }}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" testID="email-input" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry testID="password-input" />

          {error ? (
            <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }}>
              <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginTop: 8 }}>
            <Button title="Sign In" onPress={handleLogin} loading={loading} />
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
            <Text style={{ color: c.textMuted, fontSize: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
          </View>

          {/* Google button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border,
              borderRadius: 14, paddingVertical: 14, gap: 8,
              opacity: googleLoading ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 18 }}>G</Text>
            <Text style={{ color: c.text, fontWeight: '600', fontSize: 15 }}>
              {googleLoading ? 'Opening…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: c.textMuted }}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={{ color: c.accent, fontWeight: '600' }}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
