import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';

type FriendCardProps = {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
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
  actionLabel,
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
  loading,
}: FriendCardProps) {
  return (
    <View className="flex-row items-center bg-dark-700 rounded-xl px-4 py-3 mb-3">
      <Avatar url={avatarUrl} name={displayName} size={44} />
      <View className="flex-1 ml-3">
        <Text className="text-dark-50 font-medium text-base">
          {displayName}
        </Text>
        <Text className="text-dark-300 text-sm">@{username}</Text>
      </View>
      <View className="flex-row gap-2">
        {secondaryActionLabel && onSecondaryAction && (
          <TouchableOpacity
            className="bg-dark-500 rounded-lg px-3 py-2"
            onPress={onSecondaryAction}
            disabled={loading}
          >
            <Text className="text-dark-200 text-sm font-medium">
              {secondaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}
        {actionLabel && onAction && (
          <TouchableOpacity
            className="bg-lavender rounded-lg px-3 py-2"
            onPress={onAction}
            disabled={loading}
          >
            <Text className="text-dark-900 text-sm font-medium">
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
