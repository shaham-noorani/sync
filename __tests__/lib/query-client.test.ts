import { queryClient } from '../../lib/query-client';

describe('queryClient', () => {
  it('is defined', () => {
    expect(queryClient).toBeDefined();
  });

  it('has default stale time of 5 minutes', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(1000 * 60 * 5);
  });

  it('has retry set to 2', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(2);
  });
});
