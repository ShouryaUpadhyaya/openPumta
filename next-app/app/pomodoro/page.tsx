'use client';
import { toast } from 'sonner';
import { useTimerStore } from '@/store/useTimerStore';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import ClockCircle from '../components/pomodoro/ClockCircle';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { IoIosPlay, IoIosRefresh, IoIosSkipForward, IoIosSquare } from 'react-icons/io';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings2 } from 'lucide-react';
import ClockDialogBox from '../components/ClockDialogBox';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuthStore } from '@/store/useAuthStore';
import { AvatarDisplay } from '../components/pomodoro/AvatarDisplay';
import { AvatarSelectionDialog } from '../components/pomodoro/AvatarSelectionDialog';
import { AvatarSet } from '@/lib/avatarConfig';

function PomodoroPage() {
  const { data: Subjects = [], isLoading } = useSubjects();
  const store = useTimerStore();
  const { remainingMs, elapsedMs, progress, phase, mode, activeSubjectId } = useTimerEngine();
  const { user, lifetimeFocusMs } = useAuthStore();

  const runningSubject = Subjects.find((subject) => subject.id === activeSubjectId);

  const handleMainAction = async () => {
    if (phase === 'work') {
      await store.endWork(true);
    } else if (phase === 'idle') {
      if (activeSubjectId) {
        await store.startWork(activeSubjectId);
      } else if (Subjects.length > 0) {
        await store.startWork(Subjects[0].id);
      } else {
        toast.error('Please create a subject on the dashboard first!');
      }
    }
  };

  const handleSkip = () => {
    if (phase === 'shortBreak' || phase === 'longBreak') {
      store.skipBreak();
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the entire cycle?')) {
      store.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="text-2xl font-semibold">Loading timer...</span>
      </div>
    );
  }

  const isOverflow = remainingMs < 0;
  const displayMs = Math.abs(remainingMs);
  const displayTime = ConvertSecsToTimer({ workSecs: Math.floor(displayMs / 1000) });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const activeWorkSecs = phase === 'work' ? Math.floor(elapsedMs / 1000) : 0;
  const currentFocusMs = lifetimeFocusMs + activeWorkSecs * 1000;
  const activeAvatar = (user?.activeAvatar as AvatarSet) || 'warrior';

  const getSubjectLogSecs = (
    log: NonNullable<(typeof Subjects)[number]['subjectLogs']>[number],
  ) => {
    if (log.durationSecs !== undefined) return log.durationSecs;
    if (log.duration !== undefined) return log.duration;
    if (log.endedAt) {
      return Math.max(
        0,
        Math.floor((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 1000),
      );
    }
    return 0;
  };

  const getTodayWorkedSecs = (subject: (typeof Subjects)[number]) =>
    [...(subject.subjectLogs || [])]
      .filter((log) => new Date(log.startedAt).getTime() >= startOfToday)
      .reduce((acc, log) => acc + getSubjectLogSecs(log), 0);

  const subjectWorkedSecs = runningSubject
    ? getTodayWorkedSecs(runningSubject) + activeWorkSecs
    : 0;

  const totalWorkedSecs =
    Subjects.reduce((acc, subject) => acc + getTodayWorkedSecs(subject), 0) + activeWorkSecs;
  let goalWorkSecs = 0;

  if (runningSubject) {
    goalWorkSecs = runningSubject.goalWorkSecs || 0;
  }

  const isBreak = phase === 'shortBreak' || phase === 'longBreak';
  const goalProgressPercent = goalWorkSecs
    ? Math.min(100, (subjectWorkedSecs / goalWorkSecs) * 100)
    : 0;
  const formatDuration = (secs: number) =>
    `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(Math.floor(secs % 60))}`;

  const getPhaseColor = () => {
    if (mode === 'stopwatch') return store.workColor;
    switch (phase) {
      case 'work':
        return store.workColor;
      case 'shortBreak':
        return store.shortBreakColor;
      case 'longBreak':
        return store.longBreakColor;
      default:
        return 'var(--muted-foreground)';
    }
  };

  const getPhaseLabel = () => {
    if (mode === 'stopwatch') return 'STOPWATCH';
    switch (phase) {
      case 'work':
        return 'WORK PHASE';
      case 'shortBreak':
        return 'SHORT BREAK';
      case 'longBreak':
        return 'LONG BREAK';
      case 'idle':
        return 'READY';
      default:
        return 'IDLE';
    }
  };

  const primaryColor = getPhaseColor();
  const secondaryColor = `color-mix(in srgb, ${primaryColor} 50%, white)`;
  const loopIndex = Math.floor(progress / 100);
  const cyclePercent = progress % 100;

  let currentColor = primaryColor;
  let backgroundColor = 'var(--card)';
  if (loopIndex > 0) {
    if (loopIndex % 2 === 1) {
      currentColor = secondaryColor;
      backgroundColor = primaryColor;
    } else {
      currentColor = primaryColor;
      backgroundColor = secondaryColor;
    }
  }

  return (
    <section className="flex flex-col h-[calc(100dvh-5.5rem)] lg:h-screen w-full relative bg-background overflow-hidden">
      {/* ── Portrait layout: stacked ── / ── Landscape: 3-zone horizontal ── */}
      <div className="flex-1 flex flex-col max-lg:landscape:flex-row items-center max-lg:landscape:items-stretch min-h-0 overflow-hidden">
        {/* ── Settings gear (top bar - portrait only, hidden in landscape to save space) ── */}
        <div className="flex w-full items-center justify-between px-4 pt-3 pb-1 shrink-0 max-lg:landscape:hidden">
          {runningSubject ? (
            <h1 className="text-lg font-semibold tracking-tight truncate text-foreground flex-1 mr-2">
              {runningSubject.name}
            </h1>
          ) : (
            <div className="flex-1" />
          )}
          <ClockDialogBox
            child={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground shrink-0"
              >
                <Settings2 className="h-5 w-5" />
              </Button>
            }
          />
        </div>

        {/* ── LEFT / CENTER (portrait): Clock circle ── */}
        <div className="flex-1 flex flex-col max-lg:landscape:flex-row items-center max-lg:landscape:items-center justify-center max-lg:landscape:justify-start gap-2 max-lg:landscape:gap-0 max-lg:landscape:pl-4 max-lg:landscape:py-3 min-h-0 overflow-hidden w-full">
          {/* Clock */}
          <div className="flex items-center justify-center max-lg:landscape:shrink-0">
            <ClockCircle
              percent={cyclePercent}
              size="lg"
              currentColor={currentColor}
              backgroundColor={backgroundColor}
            >
              <div className="flex flex-col items-center justify-center p-2 text-center select-none">
                <div
                  className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl max-lg:landscape:text-3xl font-bold mb-1 transition-colors duration-500 tracking-tight tabular-nums"
                  style={{ color: primaryColor, fontFamily: 'var(--font-timer)' }}
                >
                  {isOverflow ? '+' : ''}
                  {pad(displayTime.hours)}:{pad(displayTime.minutes)}:{pad(displayTime.seconds)}
                </div>
                {/* Phase label inside clock — portrait only */}
                <div className="text-xs font-medium text-muted-foreground/70 tracking-wide mt-0.5 max-lg:landscape:hidden">
                  {getPhaseLabel().charAt(0).toUpperCase() + getPhaseLabel().slice(1).toLowerCase()}
                </div>
              </div>
            </ClockCircle>
          </div>

          {/* ── CENTER column: phase + timer + stats (landscape only, sits beside clock) ── */}
          <div className="hidden max-lg:landscape:flex flex-col justify-center pl-8 gap-2 flex-1 min-w-0">
            {/* Phase label */}
            <div className="text-sm font-medium text-muted-foreground/70 tracking-wide">
              {runningSubject ? (
                <span className="text-foreground font-semibold text-base">
                  {runningSubject.name}
                </span>
              ) : (
                getPhaseLabel().charAt(0).toUpperCase() + getPhaseLabel().slice(1).toLowerCase()
              )}
            </div>

            {/* Big timer */}
            <div
              className="text-5xl font-bold tabular-nums tracking-tight leading-none transition-colors duration-500"
              style={{ color: primaryColor, fontFamily: 'var(--font-timer)' }}
            >
              {isOverflow ? '+' : ''}
              {pad(displayTime.hours)}:{pad(displayTime.minutes)}:{pad(displayTime.seconds)}
            </div>

            {/* Phase sub-label when running */}
            <div className="text-xs text-muted-foreground/60">
              {getPhaseLabel().charAt(0).toUpperCase() + getPhaseLabel().slice(1).toLowerCase()}
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-1">
              <div>
                <div className="text-[10px] font-medium text-muted-foreground/50 mb-0.5">
                  {runningSubject?.name || 'Subject'}
                </div>
                <div className="text-sm tabular-nums" style={{ fontFamily: 'var(--font-timer)' }}>
                  {formatDuration(subjectWorkedSecs)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-muted-foreground/50 mb-0.5">
                  Total time today
                </div>
                <div className="text-sm tabular-nums" style={{ fontFamily: 'var(--font-timer)' }}>
                  {formatDuration(totalWorkedSecs)}
                </div>
              </div>
            </div>

            {/* Progress bar (landscape) */}
            {runningSubject && store.showProgressBar && (
              <div className="w-full max-w-xs mt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Progress
                      value={goalProgressPercent}
                      className="h-1.5 transition-all"
                      indicatorStyle={{ backgroundColor: getPhaseColor() }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="font-semibold text-xs">
                      {formatDuration(goalWorkSecs)} / {formatDuration(subjectWorkedSecs)}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* ── RIGHT column: avatar + settings gear (landscape only) ── */}
          <div className="hidden max-lg:landscape:flex flex-col items-center justify-center gap-3 pr-4 shrink-0">
            <ClockDialogBox
              child={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              }
            />
            {store.showAvatar && (
              <AvatarSelectionDialog>
                <AvatarDisplay activeAvatar={activeAvatar} focusMs={currentFocusMs} />
              </AvatarSelectionDialog>
            )}
          </div>
        </div>

        {/* ── Portrait-only stats (inside clock on portrait, below clock as context) ── */}
        <div className="flex gap-8 max-lg:landscape:hidden pb-1 shrink-0">
          <div className="text-center">
            <div className="text-[10px] font-medium text-muted-foreground/50">
              {runningSubject?.name || 'Subject'}
            </div>
            <div className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-timer)' }}>
              {formatDuration(subjectWorkedSecs)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-medium text-muted-foreground/50">Total today</div>
            <div className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-timer)' }}>
              {formatDuration(totalWorkedSecs)}
            </div>
          </div>
        </div>

        {/* Portrait progress bar */}
        {runningSubject && store.showProgressBar && (
          <div className="w-full max-w-xs sm:max-w-md px-4 max-lg:landscape:hidden shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Progress
                  value={goalProgressPercent}
                  className="h-2.5 sm:h-4 transition-all"
                  indicatorStyle={{ backgroundColor: getPhaseColor() }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="font-semibold text-xs sm:text-base">
                  {formatDuration(goalWorkSecs)} / {formatDuration(subjectWorkedSecs)}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Portrait avatar */}
        {store.showAvatar && (
          <div className="mt-4 mb-2 z-10 max-lg:landscape:hidden shrink-0">
            <AvatarSelectionDialog>
              <AvatarDisplay activeAvatar={activeAvatar} focusMs={currentFocusMs} />
            </AvatarSelectionDialog>
          </div>
        )}
      </div>

      {/* ── Action buttons — always bottom center ── */}
      <div className="flex items-center justify-center gap-6 md:gap-8 py-4 max-lg:landscape:py-2 shrink-0">
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-full w-11 h-11 max-lg:landscape:w-10 max-lg:landscape:h-10 sm:w-14 sm:h-14"
          aria-label="Reset timer"
        >
          <IoIosRefresh size={18} />
        </Button>

        {phase === 'work' || phase === 'idle' ? (
          <Button
            onClick={handleMainAction}
            variant="secondary"
            className="rounded-full w-16 h-16 max-lg:landscape:w-14 max-lg:landscape:h-14 sm:w-24 sm:h-24 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            aria-label={phase === 'work' ? 'Stop timer' : 'Start timer'}
          >
            {phase === 'work' ? <IoIosSquare size={28} /> : <IoIosPlay size={36} />}
          </Button>
        ) : (
          <div className="w-16 h-16 max-lg:landscape:w-14 max-lg:landscape:h-14 sm:w-24 sm:h-24 flex items-center justify-center" />
        )}

        {isBreak ? (
          <Button
            onClick={handleSkip}
            variant="outline"
            className="rounded-full w-11 h-11 max-lg:landscape:w-10 max-lg:landscape:h-10 sm:w-14 sm:h-14"
            aria-label="Skip break"
          >
            <IoIosSkipForward size={18} />
          </Button>
        ) : (
          <div className="w-11 h-11 max-lg:landscape:w-10 max-lg:landscape:h-10 sm:w-14 sm:h-14" />
        )}
      </div>
    </section>
  );
}

export default PomodoroPage;
