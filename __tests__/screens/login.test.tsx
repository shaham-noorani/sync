import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';
import { renderWithProviders } from '../test-utils';
import { supabase } from '../../lib/supabase';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen />
    );
    expect(getByText('sync')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows error when fields are empty', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Sign In'));
    expect(getByText('Please fill in all fields')).toBeTruthy();
  });

  it('calls signInWithPassword with trimmed email', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen />
    );

    fireEvent.changeText(
      getByPlaceholderText('you@example.com'),
      '  test@test.com  '
    );
    fireEvent.changeText(getByPlaceholderText('Your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('displays auth error messages', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen />
    );

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'bad@test.com');
    fireEvent.changeText(getByPlaceholderText('Your password'), 'wrong');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(getByText('Invalid login credentials')).toBeTruthy();
    });
  });

  it('has a link to signup', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText('Sign Up')).toBeTruthy();
  });
});
