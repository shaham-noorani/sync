import { INTERESTS } from '../../lib/constants';

describe('constants', () => {
  it('has a non-empty INTERESTS array', () => {
    expect(INTERESTS.length).toBeGreaterThan(0);
  });

  it('has no duplicate interests', () => {
    const unique = new Set(INTERESTS);
    expect(unique.size).toBe(INTERESTS.length);
  });

  it('all interests are non-empty strings', () => {
    INTERESTS.forEach((interest) => {
      expect(typeof interest).toBe('string');
      expect(interest.trim().length).toBeGreaterThan(0);
    });
  });
});
