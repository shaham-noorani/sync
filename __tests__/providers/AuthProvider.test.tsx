import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';

function TestConsumer() {
  const { session, user, isLoading } = useAuth();
  return (
    <>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="session">{session ? 'has-session' : 'no-session'}</Text>
      <Text testID="user">{user?.id ?? 'no-user'}</Text>
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state', () => {
    // Make getSession hang so we can check loading state
    (supabase.auth.getSession as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(getByTestId('loading').props.children).toBe('true');
  });

  it('provides null session when not authenticated', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });
    expect(getByTestId('session').props.children).toBe('no-session');
    expect(getByTestId('user').props.children).toBe('no-user');
  });

  it('subscribes to auth state changes', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });
});
