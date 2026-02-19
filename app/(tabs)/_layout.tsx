import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '../../providers/ThemeProvider';
import { useProposals } from '../../hooks/useProposals';
import { useAuth } from '../../providers/AuthProvider';

export default function TabLayout() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { data: proposals } = useProposals();

  const pendingCount = proposals?.filter(
    (p) => p.created_by !== user?.id && (p.my_response === null || p.my_response === 'pending')
  ).length ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#a4a8d1' : '#7278b3',
        tabBarInactiveTintColor: isDark ? '#64748b' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#141b2b' : '#ffffff',
          borderTopColor: isDark ? '#1e293b' : '#e5e7eb',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="propose"
        options={{
          title: 'Proposals',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#a4a8d1', color: '#0f1420', fontSize: 10 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
