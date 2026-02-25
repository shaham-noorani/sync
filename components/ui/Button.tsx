import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../providers/ThemeProvider';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** primary — gradient violet, for submit/action
   *  secondary — muted glass, for navigation/non-destructive
   *  critical — red, for destructive actions (leave, delete) */
  variant?: 'primary' | 'secondary' | 'critical';
};

export function Button({ title, onPress, loading = false, disabled = false, variant = 'primary' }: ButtonProps) {
  const c = useColors();
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

  if (variant === 'critical') {
    return (
      <TouchableOpacity
        style={{
          width: '100%',
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
          backgroundColor: c.dangerBg,
          borderWidth: 1,
          borderColor: c.dangerBorder,
        }}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={c.danger} />
        ) : (
          <Text style={{ color: c.danger, fontWeight: '600', fontSize: 16 }}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // secondary — muted glass
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.5 : 1,
        backgroundColor: c.bgCardHover,
        borderWidth: 1,
        borderColor: c.border,
      }}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={c.textSecondary} />
      ) : (
        <Text style={{ color: c.textSecondary, fontWeight: '600', fontSize: 16 }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
