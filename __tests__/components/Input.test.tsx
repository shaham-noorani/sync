import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../../components/ui/Input';

describe('Input', () => {
  it('renders label and placeholder', () => {
    const { getByText, getByPlaceholderText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={() => {}}
        placeholder="you@example.com"
      />
    );
    expect(getByText('Email')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={onChangeText}
        placeholder="Type here"
      />
    );
    fireEvent.changeText(getByPlaceholderText('Type here'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('displays error message', () => {
    const { getByText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={() => {}}
        error="Invalid email"
      />
    );
    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('does not display error when not provided', () => {
    const { queryByText } = render(
      <Input label="Email" value="" onChangeText={() => {}} />
    );
    // No error text should be rendered
    expect(queryByText('Invalid')).toBeNull();
  });

  it('renders with secure text entry', () => {
    const { getByPlaceholderText } = render(
      <Input
        label="Password"
        value=""
        onChangeText={() => {}}
        placeholder="Password"
        secureTextEntry
      />
    );
    const input = getByPlaceholderText('Password');
    expect(input.props.secureTextEntry).toBe(true);
  });
});
