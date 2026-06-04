'use client';
import React from 'react';
import { toast } from 'sonner';
import { useTimerStore } from '@/store/useTimerStore';
import { useTimerEngine } from '@/hooks/useTimerEngine';
import ClockCircle from '../components/pomodoro/ClockCircle';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { IoIosPlay, IoIosRefresh, IoIosSkipForward, IoIosSquare } from 'react-icons/io';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubjects } from '@/hooks/useSubjects';

function PomodoroPage() {
  const { data: Subjects = [], isLoading } = useSubjects();
  const store = useTimerStore();
  const { remainingMs, elapsedMs, progress, phase, mode, activeSubjectId, completedPomodoros } =
    useTimerEngine();

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

  let totalWorkedSecs = 0;
  const totalBreakSecs = 0;
  let goalWorkSecs = 0;
  let goalBreakSecs = 0;

  if (runningSubject) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const logsToday = [...(runningSubject.subjectLogs || [])]
      .filter((log) => new Date(log.startedAt).getTime() >= startOfToday)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    totalWorkedSecs =
      logsToday.reduce((acc, log) => acc + (log.duration || 0), 0) +
      (phase === 'work' ? Math.floor(elapsedMs / 1000) : 0);

    goalWorkSecs = runningSubject.goalWorkSecs || 0;
    const breakRatio = store.settings.shortBreakDuration / store.settings.workDuration;
    goalBreakSecs = Math.floor(goalWorkSecs * breakRatio);
  }

  const isBreak = phase === 'shortBreak' || phase === 'longBreak';
  const goalProgressPercent = isBreak
    ? goalBreakSecs
      ? Math.min(100, (totalBreakSecs / goalBreakSecs) * 100)
      : 0
    : goalWorkSecs
      ? Math.min(100, (totalWorkedSecs / goalWorkSecs) * 100)
      : 0;

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
    <section className="flex flex-col justify-between items-center h-[calc(100dvh-4rem)] lg:h-screen w-full p-4 md:p-6 lg:p-8 relative overflow-hidden bg-background">
      {/* Header Bar */}
      <div className="w-full max-w-md flex items-center justify-center px-4 py-2 shrink-0">
        {runningSubject && (
          <h1 className="text-lg sm:text-2xl  font-bold tracking-tight text-center truncate mx-2 text-foreground">
            {runningSubject.name}
          </h1>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-lg px-4 md:px-10 gap-2 overflow-hidden">
        <ClockCircle
          percent={cyclePercent}
          size="lg"
          currentColor={currentColor}
          backgroundColor={backgroundColor}
        >
          <div className="flex flex-col items-center justify-center p-2 text-center select-none">
            <div
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-mono font-bold mb-1 transition-colors duration-500 tracking-tight"
              style={{ color: primaryColor }}
            >
              {isOverflow ? '+' : ''}
              {pad(displayTime.hours)}:{pad(displayTime.minutes)}:{pad(displayTime.seconds)}
            </div>
            <div className="text-xs sm:text-sm md:text-lg font-semibold text-muted-foreground uppercase tracking-widest mt-1">
              {getPhaseLabel()}
            </div>
            <div className="text-[10px] sm:text-xs md:text-md font-medium text-muted-foreground/60 mt-1">
              {mode === 'pomodoro'
                ? `Completed: ${completedPomodoros}`
                : `Session: ${pad(Math.floor(elapsedMs / 3600000))}:${pad(Math.floor((elapsedMs % 3600000) / 60000))}`}
            </div>
          </div>
        </ClockCircle>

        {runningSubject && store.showProgressBar && (
          <div className="w-full max-w-xs sm:max-w-md mt-2">
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
                  {isBreak ? 'Daily Break Total: ' : 'Daily Work Goal: '}
                  {isBreak
                    ? `${pad(Math.floor(totalBreakSecs / 3600))}:${pad(Math.floor((totalBreakSecs % 3600) / 60))}`
                    : `${pad(Math.floor(goalWorkSecs / 3600))}:${pad(Math.floor((goalWorkSecs % 3600) / 60))}`}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 md:gap-8 pb-6 sm:pb-8 shrink-0">
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
        >
          <IoIosRefresh size={20} />
        </Button>

        {phase === 'work' || phase === 'idle' ? (
          <Button
            onClick={handleMainAction}
            variant="secondary"
            className="rounded-full w-20 h-20 sm:w-24 sm:h-24 shadow-lg hover:scale-105 transition-all flex items-center justify-center"
          >
            {phase === 'work' ? <IoIosSquare size={32} /> : <IoIosPlay size={40} />}
          </Button>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center" />
        )}

        {isBreak && (
          <Button
            onClick={handleSkip}
            variant="outline"
            className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
          >
            <IoIosSkipForward size={20} />
          </Button>
        )}
      </div>
    </section>
  );
}

export default PomodoroPage;
