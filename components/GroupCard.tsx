import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../providers/ThemeProvider';

type GroupCardProps = {
  name: string;
  description?: string | null;
  role?: string;
  memberCount?: number;
  iconUrl?: string | null;
  iconName?: string | null;
  onPress?: () => void;
};

function GroupIcon({ iconUrl, iconName, size = 44 }: { iconUrl?: string | null; iconName?: string | null; size?: number }) {
  if (iconUrl) {
    return (
      <Image
        source={{ uri: iconUrl }}
        style={{ width: size, height: size, borderRadius: size * 0.27 }}
        resizeMode="cover"
      />
    );
  }
  return (
    <LinearGradient
      colors={['#8875ff', '#c084fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.27, alignItems: 'center', justifyContent: 'center' }}
    >
      {iconName ? (
        <Text style={{ fontSize: size * 0.48 }}>{iconName}</Text>
      ) : (
        <Ionicons name="grid" size={size * 0.45} color="#ffffff" />
      )}
    </LinearGradient>
  );
}

export { GroupIcon };

export function GroupCard({ name, description, role, memberCount, iconUrl, iconName, onPress }: GroupCardProps) {
  const c = useColors();

  return (
    <TouchableOpacity
      style={{ backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <GroupIcon iconUrl={iconUrl} iconName={iconName} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{name}</Text>
        <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }}>
          {memberCount !== undefined ? `${memberCount} member${memberCount !== 1 ? 's' : ''}` : description ?? ''}
        </Text>
      </View>
      {role && role !== 'member' && (
        <View style={{ backgroundColor: c.accentBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
          <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {role}
          </Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
    </TouchableOpacity>
  );
}
