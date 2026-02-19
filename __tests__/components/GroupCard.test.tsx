import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GroupCard } from '../../components/GroupCard';

describe('GroupCard', () => {
  it('renders group name', () => {
    const { getByText } = render(<GroupCard name="Weekend Warriors" />);
    expect(getByText('Weekend Warriors')).toBeTruthy();
  });

  it('renders description when provided', () => {
    const { getByText } = render(
      <GroupCard name="Test" description="A test group" />
    );
    expect(getByText('A test group')).toBeTruthy();
  });

  it('renders role badge', () => {
    const { getByText } = render(
      <GroupCard name="Test" role="owner" />
    );
    expect(getByText('owner')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <GroupCard name="Test Group" onPress={onPress} />
    );
    fireEvent.press(getByText('Test Group'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not show role when not provided', () => {
    const { queryByText } = render(<GroupCard name="Test" />);
    expect(queryByText('owner')).toBeNull();
    expect(queryByText('member')).toBeNull();
  });
});
