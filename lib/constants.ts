export const INTERESTS = [
  'Hiking',
  'Coffee',
  'Movies',
  'Gaming',
  'Cooking',
  'Reading',
  'Music',
  'Travel',
  'Fitness',
  'Photography',
  'Art',
  'Sports',
  'Tech',
  'Food',
  'Board Games',
  'Yoga',
  'Dancing',
  'Camping',
  'Beach',
  'Shopping',
] as const;

export type Interest = (typeof INTERESTS)[number];
