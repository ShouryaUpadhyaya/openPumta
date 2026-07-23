import { renderHook, act } from '@testing-library/react';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import { useAuthStore } from '@/store/useAuthStore';
import { useTimerStore } from '@/store/useTimerStore';
import { toast } from 'sonner';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/store/useAuthStore');
vi.mock('@/store/useTimerStore');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('useTimerEngine post-action nudge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('shows standard toast for logged in users when work phase completes', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { isGuest: false } } as any);

    let state = {
      running: true,
      phase: 'work',
      mode: 'pomodoro',
      phaseStartedAt: Date.now(),
      durationMs: 1000,
      settings: { notificationsEnabled: true },
      endWork: vi.fn(),
      completeBreak: vi.fn(),
    };

    vi.mocked(useTimerStore).mockImplementation((selector: any) => selector(state));

    const { result } = renderHook(() => useTimerEngine());

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Focus Session Complete!',
      expect.objectContaining({
        description: 'Great job! Time for a break.',
        action: undefined,
      }),
    );
  });

  it('shows nudge toast with Sign Up action for guest users when work phase completes', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: { isGuest: true } } as any);

    let state = {
      running: true,
      phase: 'work',
      mode: 'pomodoro',
      phaseStartedAt: Date.now(),
      durationMs: 1000,
      settings: { notificationsEnabled: true },
      endWork: vi.fn(),
      completeBreak: vi.fn(),
    };

    vi.mocked(useTimerStore).mockImplementation((selector: any) => selector(state));

    const { result } = renderHook(() => useTimerEngine());

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Focus Session Complete!',
      expect.objectContaining({
        description:
          'Great job! Keep the streak going by creating an account to save your progress.',
        action: expect.objectContaining({
          label: 'Sign Up',
        }),
      }),
    );
  });
});
