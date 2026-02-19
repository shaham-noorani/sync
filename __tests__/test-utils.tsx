import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// Mock auth context values
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
};

export const mockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const mockProfile = {
  id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  city: 'San Francisco',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  interests: ['Hiking', 'Coffee'],
};

// Wrapper with providers for rendering hooks/components
export function createWrapper() {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// Custom render with providers
export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
}
