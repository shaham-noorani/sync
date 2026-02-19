import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FriendCard } from '../../components/FriendCard';

describe('FriendCard', () => {
  const defaultProps = {
    displayName: 'Alice',
    username: 'alice123',
    avatarUrl: null,
  };

  it('renders display name and username', () => {
    const { getByText } = render(<FriendCard {...defaultProps} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('@alice123')).toBeTruthy();
  });

  it('renders action button and calls onAction', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <FriendCard {...defaultProps} actionLabel="Accept" onAction={onAction} />
    );
    fireEvent.press(getByText('Accept'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action button', () => {
    const onSecondary = jest.fn();
    const { getByText } = render(
      <FriendCard
        {...defaultProps}
        actionLabel="Accept"
        onAction={() => {}}
        secondaryActionLabel="Decline"
        onSecondaryAction={onSecondary}
      />
    );
    fireEvent.press(getByText('Decline'));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('does not render action buttons when not provided', () => {
    const { queryByText } = render(<FriendCard {...defaultProps} />);
    expect(queryByText('Accept')).toBeNull();
    expect(queryByText('Decline')).toBeNull();
  });
});
