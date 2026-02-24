import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
};

export function Button({ title, onPress, loading = false, disabled = false, variant = 'primary' }: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={{ width: '100%', borderRadius: 16, overflow: 'hidden', opacity: isDisabled ? 0.5 : 1 }}
      >
        <LinearGradient
          colors={['#8875ff', '#c084fc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 }}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, object> = {
    secondary: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    outline:   { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  };

  return (
    <TouchableOpacity
      style={[{ width: '100%', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', opacity: isDisabled ? 0.5 : 1 }, variantStyles[variant]]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#d0d0e8" />
      ) : (
        <Text style={{ color: '#d0d0e8', fontWeight: '600', fontSize: 16 }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
