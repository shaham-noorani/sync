import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from './Avatar';
import { useColors } from '../providers/ThemeProvider';

type FriendCardProps = {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  // For tapping the whole card (existing friends)
  onPress?: () => void;
  // For explicit action buttons (requests)
  actionLabel?: string;
  secondaryActionLabel?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  loading?: boolean;
};

export function FriendCard({
  displayName,
  username,
  avatarUrl,
  onPress,
  actionLabel,
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
  loading,
}: FriendCardProps) {
  const c = useColors();
  const hasButtons = !!(actionLabel || secondaryActionLabel);

  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar url={avatarUrl} name={displayName} size={44} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>
          {displayName}
        </Text>
        <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }}>@{username}</Text>
      </View>
      {hasButtons ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {secondaryActionLabel && onSecondaryAction && (
            <TouchableOpacity
              style={{ backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={onSecondaryAction}
              disabled={loading}
            >
              <Text style={{ color: c.textSecondary, fontWeight: '600', fontSize: 13 }}>
                {secondaryActionLabel}
              </Text>
            </TouchableOpacity>
          )}
          {actionLabel && onAction && (
            <TouchableOpacity onPress={onAction} activeOpacity={0.8} style={{ borderRadius: 12, overflow: 'hidden' }} disabled={loading}>
              <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{actionLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      )}
    </View>
  );

  if (onPress || (!hasButtons)) {
    return (
      <TouchableOpacity
        style={{ backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, padding: 16, marginBottom: 12 }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 20, padding: 16, marginBottom: 12 }}>
      {inner}
    </View>
  );
}
