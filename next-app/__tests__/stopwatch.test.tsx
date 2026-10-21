// Written for Vitest + @testing-library/react. For Jest, replace `vi` with `jest`.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getElapsedMs, useStopwatchStore } from '@/store/useStopwatchStore';
import { useTimerStore } from '@/store/useTimerStore';
import Stopwatch from '@/app/components/pomodoro/Stopwatch';

const elapsed = () => getElapsedMs(useStopwatchStore.getState(), Date.now());

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  localStorage.clear();
  useStopwatchStore.setState({ startedAt: null, accumulatedMs: 0 });
});
afterEach(() => vi.useRealTimers());

describe('useStopwatchStore', () => {
  it('accumulates correctly across start → pause → resume', () => {
    const s = useStopwatchStore.getState();
    s.start();
    vi.advanceTimersByTime(5000);
    s.pause();
    expect(useStopwatchStore.getState().accumulatedMs).toBe(5000);

    vi.advanceTimersByTime(10_000); // paused: must not count
    expect(elapsed()).toBe(5000);

    s.start();
    vi.advanceTimersByTime(2000);
    expect(elapsed()).toBe(7000);
    s.pause();
    expect(useStopwatchStore.getState().accumulatedMs).toBe(7000);
  });

  it('ignores double start / double pause', () => {
    const s = useStopwatchStore.getState();
    s.start();
    vi.advanceTimersByTime(1000);
    s.start();
    vi.advanceTimersByTime(1000);
    expect(elapsed()).toBe(2000);
    s.pause();
    s.pause();
    expect(useStopwatchStore.getState().accumulatedMs).toBe(2000);
  });

  it('reset clears everything', () => {
    const s = useStopwatchStore.getState();
    s.start();
    vi.advanceTimersByTime(3000);
    s.reset();
    expect(useStopwatchStore.getState().startedAt).toBeNull();
    expect(elapsed()).toBe(0);
  });

  it('does not touch the Pomodoro timer store', () => {
    const before = useTimerStore.getState();
    const s = useStopwatchStore.getState();
    s.start();
    vi.advanceTimersByTime(1000);
    s.pause();
    s.reset();
    expect(useTimerStore.getState()).toBe(before); // same reference => never set()
  });

  it('persists only startedAt and accumulatedMs', () => {
    useStopwatchStore.getState().start();
    const saved = JSON.parse(localStorage.getItem('stopwatch-store')!);
    expect(Object.keys(saved.state).sort()).toEqual(['accumulatedMs', 'startedAt']);
  });
});

describe('<Stopwatch />', () => {
  it('two mounted instances (portrait + landscape) stay in sync', () => {
    render(
      <>
        <Stopwatch />
        <Stopwatch variant="compact" />
      </>,
    );
    fireEvent.click(screen.getAllByLabelText('Start stopwatch')[0]);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getAllByText('00:00:03')).toHaveLength(2);
    expect(screen.getAllByLabelText('Pause stopwatch')).toHaveLength(2);
  });

  it('resumes from persisted state after remount (navigation)', () => {
    const { unmount } = render(<Stopwatch />);
    fireEvent.click(screen.getByLabelText('Start stopwatch'));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    unmount();

    vi.advanceTimersByTime(2000); // still running while away
    render(<Stopwatch />);
    expect(screen.getByText('00:00:06')).toBeTruthy();
  });
});
