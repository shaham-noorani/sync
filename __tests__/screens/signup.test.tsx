import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../../app/(auth)/signup';
import { renderWithProviders } from '../test-utils';
import { supabase } from '../../lib/supabase';

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );
    expect(getByText('sync')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('At least 6 characters')).toBeTruthy();
    expect(getByPlaceholderText('your_username')).toBeTruthy();
    expect(getByPlaceholderText('How friends see you')).toBeTruthy();
  });

  it('validates required fields before proceeding', () => {
    const { getByText } = renderWithProviders(<SignupScreen />);
    fireEvent.press(getByText('Next — Pick Interests'));
    expect(getByText('Please fill in all required fields')).toBeTruthy();
  });

  it('validates password length', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('At least 6 characters'), '123');
    fireEvent.changeText(getByPlaceholderText('your_username'), 'user123');
    fireEvent.changeText(getByPlaceholderText('How friends see you'), 'User');
    fireEvent.press(getByText('Next — Pick Interests'));

    expect(getByText('Password must be at least 6 characters')).toBeTruthy();
  });

  it('validates username length', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('At least 6 characters'), 'password');
    fireEvent.changeText(getByPlaceholderText('your_username'), 'ab');
    fireEvent.changeText(getByPlaceholderText('How friends see you'), 'User');
    fireEvent.press(getByText('Next — Pick Interests'));

    expect(getByText('Username must be at least 3 characters')).toBeTruthy();
  });

  it('moves to interests step after valid info', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('At least 6 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('your_username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('How friends see you'), 'Test User');
    fireEvent.press(getByText('Next — Pick Interests'));

    expect(getByText('Pick your interests')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('calls signUp and create_profile RPC on submit', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Fill info step
    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('At least 6 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('your_username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('How friends see you'), 'Test User');
    fireEvent.press(getByText('Next — Pick Interests'));

    // Select an interest and submit
    fireEvent.press(getByText('Hiking'));
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('create_profile', {
        p_user_id: 'test-user-id',
        p_username: 'testuser',
        p_display_name: 'Test User',
        p_city: null,
        p_interests: ['Hiking'],
      });
    });
  });

  it('displays auth error from signUp', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Email already registered' },
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'dup@test.com');
    fireEvent.changeText(getByPlaceholderText('At least 6 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('your_username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('How friends see you'), 'Test');
    fireEvent.press(getByText('Next — Pick Interests'));
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(getByText('Email already registered')).toBeTruthy();
    });
  });

  it('has a link to login', () => {
    const { getByText } = renderWithProviders(<SignupScreen />);
    expect(getByText('Sign In')).toBeTruthy();
  });
});
