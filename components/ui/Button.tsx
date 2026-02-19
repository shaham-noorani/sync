import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = 'w-full rounded-xl py-4 items-center justify-center';
  const variantClasses = {
    primary: 'bg-lavender',
    secondary: 'bg-dark-600',
    outline: 'border border-dark-400',
  };
  const textClasses = {
    primary: 'text-dark-900 font-semibold text-base',
    secondary: 'text-dark-50 font-semibold text-base',
    outline: 'text-dark-50 font-semibold text-base',
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0f1420' : '#f8fafc'} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
