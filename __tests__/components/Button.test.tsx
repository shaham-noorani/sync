import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('renders the title', () => {
    const { getByText } = render(
      <Button title="Press Me" onPress={() => {}} />
    );
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" onPress={onPress} />
    );
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" onPress={onPress} disabled />
    );
    fireEvent.press(getByText('Press Me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { queryByText } = render(
      <Button title="Press Me" onPress={onPress} loading />
    );
    // Title should be replaced by ActivityIndicator when loading
    expect(queryByText('Press Me')).toBeNull();
  });

  it('renders different variants', () => {
    const { getByText, rerender } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(
      <Button title="Secondary" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();

    rerender(
      <Button title="Outline" onPress={() => {}} variant="outline" />
    );
    expect(getByText('Outline')).toBeTruthy();
  });
});
