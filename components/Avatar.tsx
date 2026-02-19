import { View, Text, Image } from 'react-native';

type AvatarProps = {
  url?: string | null;
  name: string;
  size?: number;
};

export function Avatar({ url, name, size = 48 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-gray-200 dark:bg-dark-600"
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-lavender items-center justify-center"
    >
      <Text
        style={{ fontSize: size * 0.36 }}
        className="font-bold text-dark-900"
      >
        {initials}
      </Text>
    </View>
  );
}
