import { TextInput, View, Text } from 'react-native';
import { useState } from 'react';
import { useColors } from '../../providers/ThemeProvider';

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
  const c = useColors();

  return (
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2, letterSpacing: 0.3 }}>{label}</Text>
      <TextInput
        style={{
          width: '100%',
          backgroundColor: focused ? c.accentBg : c.bgCard,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: c.text,
          fontSize: 15,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : focused ? c.accent : c.border,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
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
