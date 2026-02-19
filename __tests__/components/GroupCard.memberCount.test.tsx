import React from 'react';
import { render } from '@testing-library/react-native';
import { GroupCard } from '../../components/GroupCard';

describe('GroupCard memberCount', () => {
  it('shows member count when provided', () => {
    const { getByText } = render(<GroupCard name="Test" memberCount={5} />);
    expect(getByText('5 members')).toBeTruthy();
  });

  it('shows singular "member" for count of 1', () => {
    const { getByText } = render(<GroupCard name="Test" memberCount={1} />);
    expect(getByText('1 member')).toBeTruthy();
  });

  it('shows description as fallback when memberCount is not provided', () => {
    const { getByText } = render(
      <GroupCard name="Test" description="A fun group" />
    );
    expect(getByText('A fun group')).toBeTruthy();
  });

  it('memberCount takes precedence over description', () => {
    const { getByText, queryByText } = render(
      <GroupCard name="Test" memberCount={3} description="A fun group" />
    );
    expect(getByText('3 members')).toBeTruthy();
    expect(queryByText('A fun group')).toBeNull();
  });

  it('hides role badge when role is "member"', () => {
    const { queryByText } = render(
      <GroupCard name="Test" role="member" />
    );
    expect(queryByText('member')).toBeNull();
  });

  it('shows role badge for non-member roles', () => {
    const { getByText } = render(
      <GroupCard name="Test" role="owner" />
    );
    expect(getByText('owner')).toBeTruthy();
  });
});
