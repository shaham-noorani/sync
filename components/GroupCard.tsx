import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type GroupCardProps = {
  name: string;
  description?: string | null;
  role?: string;
  memberCount?: number;
  onPress?: () => void;
};

export function GroupCard({ name, description, role, memberCount, onPress }: GroupCardProps) {
  return (
    <TouchableOpacity
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="grid" size={20} color="#ffffff" />
      </LinearGradient>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: '#f0f0ff', fontWeight: '700', fontSize: 15 }}>{name}</Text>
        <Text style={{ color: '#8b8fa8', fontSize: 13, marginTop: 2 }}>
          {memberCount !== undefined ? `${memberCount} member${memberCount !== 1 ? 's' : ''}` : description ?? ''}
        </Text>
      </View>
      {role && role !== 'member' && (
        <View style={{ backgroundColor: 'rgba(136,117,255,0.15)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
          <Text style={{ color: '#8875ff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {role}
          </Text>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={16}
        color="#5a5f7a"
      />
    </TouchableOpacity>
  );
}
