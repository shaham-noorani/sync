import { TextInput, View, Text } from 'react-native';
import { useState } from 'react';

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  error?: string;
  testID?: string;
};

export function Input({ label, value, onChangeText, placeholder, secureTextEntry = false, autoCapitalize = 'none', keyboardType = 'default', error, testID }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2, letterSpacing: 0.3 }}>{label}</Text>
      <TextInput
        style={{
          width: '100%',
          backgroundColor: focused ? 'rgba(136,117,255,0.08)' : 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: '#f0f0ff',
          fontSize: 15,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : focused ? '#8875ff' : 'rgba(255,255,255,0.1)',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#5a5f7a"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        testID={testID}
      />
      {error && <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 2 }}>{error}</Text>}
    </View>
  );
}
