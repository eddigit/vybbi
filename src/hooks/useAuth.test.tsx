import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn((tableName) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => {
            if (tableName === 'profiles') {
                return { maybeSingle: vi.fn().mockResolvedValue({ data: { onboarding_completed: true }, error: null }) };
            }
            return Promise.resolve({ data: [], error: null });
        }),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('@/hooks/useAdminSettings', () => ({
    useAdminSettings: vi.fn(() => ({
        getAdminEmail: vi.fn(),
        getSecuritySettings: vi.fn()
    }))
}));


describe('useAuth', () => {
  it('should set loading to true during auth state change before fetching profile', async () => {
    let onAuthStateChangeCallback: (event: string, session: any) => void;

    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      onAuthStateChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } } });

    act(() => {
      onAuthStateChangeCallback('SIGNED_IN', { user: { id: '123' } });
    });

    // Before the fix, this assertion will fail because loading is not set to true.
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});