import React from 'react';
import { renderWithProviders } from '../test-utils';
import FeedScreen from '../../app/(tabs)/feed';

jest.mock('../../providers/ThemeProvider', () => ({
  useTheme: () => ({ isDark: true, toggleTheme: jest.fn() }),
}));

jest.mock('../../hooks/useHangouts', () => ({
  useFeed: jest.fn(),
  useToggleReaction: () => ({ mutate: jest.fn(), isPending: false }),
  getPhotoUrl: (path: string) => `https://example.com/${path}`,
}));

const { useFeed } = require('../../hooks/useHangouts');

describe('FeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Feed header', () => {
    useFeed.mockReturnValue({ data: [], isLoading: false });
    const { getByText } = renderWithProviders(<FeedScreen />);
    expect(getByText('Feed')).toBeTruthy();
  });

  it('shows empty state when no hangouts', () => {
    useFeed.mockReturnValue({ data: [], isLoading: false });
    const { getByText } = renderWithProviders(<FeedScreen />);
    expect(getByText('Nothing here yet')).toBeTruthy();
    expect(getByText('Log a Hangout')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    useFeed.mockReturnValue({ data: undefined, isLoading: true });
    const { queryByText } = renderWithProviders(<FeedScreen />);
    // No empty state shown during loading
    expect(queryByText('Nothing here yet')).toBeNull();
  });

  it('renders hangout cards when data is present', () => {
    useFeed.mockReturnValue({
      data: [
        {
          id: 'hangout-1',
          title: 'Friday tennis',
          activity_tag: 'tennis',
          date: '2026-02-20',
          created_by: 'user-1',
          created_at: '2026-02-19T10:00:00Z',
          creator: { display_name: 'Shaham', avatar_url: null, username: 'shaham' },
          attendees: [],
          photos: [],
          reactions: [],
          my_reaction: null,
          location_name: null,
          location_city: null,
          group_id: null,
          proposal_id: null,
        },
      ],
      isLoading: false,
    });
    const { getByText } = renderWithProviders(<FeedScreen />);
    expect(getByText('Friday tennis')).toBeTruthy();
    expect(getByText('Shaham')).toBeTruthy();
  });
});
