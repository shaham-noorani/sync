const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
}));

export const supabase = {
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' }, session: {} },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: mockFrom,
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: 'https://example.com/avatar.jpg' },
      })),
    })),
  },
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
  })),
  removeChannel: jest.fn(),
};
