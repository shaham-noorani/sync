import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../providers/ThemeProvider';

type AvatarProps = {
  url?: string | null;
  name: string;
  size?: number;
  ring?: boolean;
};

export function Avatar({ url, name, size = 48, ring = false }: AvatarProps) {
  const c = useColors();

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const inner = url ? (
    <Image
      source={{ uri: url }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  ) : (
    <LinearGradient
      colors={['#8875ff', '#c084fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: '#ffffff' }}>{initials}</Text>
    </LinearGradient>
  );

  if (ring) {
    const ringPad = 2;
    const outerSize = size + ringPad * 2 + 4;
    return (
      <LinearGradient
        colors={['#8875ff', '#c084fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: outerSize, height: outerSize, borderRadius: outerSize / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
          {inner}
        </View>
      </LinearGradient>
    );
  }

  return inner;
}
