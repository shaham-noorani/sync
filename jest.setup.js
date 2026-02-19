// Auto-mock the supabase client via lib/__mocks__/supabase.ts
jest.mock('./lib/supabase');

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({ canceled: true, assets: [] })
  ),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: ({ children }) => children,
  Slot: ({ children }) => children,
  Stack: ({ children }) => children,
  Tabs: ({ children }) => children,
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');
