import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../../components/Avatar';

describe('Avatar', () => {
  it('renders initials when no URL', () => {
    const { getByText } = render(<Avatar name="Test User" />);
    expect(getByText('TU')).toBeTruthy();
  });

  it('renders single initial for single name', () => {
    const { getByText } = render(<Avatar name="Alice" />);
    expect(getByText('A')).toBeTruthy();
  });

  it('truncates to 2 initials for long names', () => {
    const { getByText } = render(<Avatar name="John Michael Smith" />);
    expect(getByText('JM')).toBeTruthy();
  });

  it('renders image when URL provided', () => {
    const { queryByText } = render(
      <Avatar name="Test User" url="https://example.com/avatar.jpg" />
    );
    // Should not show initials when URL is present
    expect(queryByText('TU')).toBeNull();
  });
});
