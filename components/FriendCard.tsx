import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

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
  const hasButtons = !!(actionLabel || secondaryActionLabel);

  const inner = (
    <View className="flex-row items-center">
      <Avatar url={avatarUrl} name={displayName} size={44} />
      <View className="flex-1 ml-3">
        <Text className="text-gray-900 dark:text-dark-50 font-semibold text-sm">
          {displayName}
        </Text>
        <Text className="text-gray-400 dark:text-dark-400 text-xs mt-0.5">@{username}</Text>
      </View>
      {hasButtons ? (
        <View className="flex-row gap-2">
          {secondaryActionLabel && onSecondaryAction && (
            <TouchableOpacity
              className="bg-gray-100 dark:bg-dark-600 rounded-lg px-3 py-2"
              onPress={onSecondaryAction}
              disabled={loading}
            >
              <Text className="text-gray-600 dark:text-dark-200 text-sm font-medium">
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
              <Text className="text-dark-900 text-sm font-semibold">
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#475569" />
      )}
    </View>
  );

  if (onPress || (!hasButtons)) {
    return (
      <TouchableOpacity
        className="bg-white dark:bg-dark-700 rounded-2xl px-4 py-3 mb-2"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white dark:bg-dark-700 rounded-2xl px-4 py-3 mb-2">
      {inner}
    </View>
  );
}
