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
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full mb-4">
      <Text className="text-dark-200 text-sm mb-1.5 ml-1">{label}</Text>
      <TextInput
        className={`w-full bg-dark-700 rounded-xl px-4 py-3.5 text-dark-50 text-base ${
          focused ? 'border border-amber-500' : 'border border-dark-500'
        } ${error ? 'border-red-500' : ''}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <Text className="text-red-400 text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
}
