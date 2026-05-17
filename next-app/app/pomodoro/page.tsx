'use client';
// add a changing avatar in the middle of the pomodoro
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubjectTimerStore } from '@/store/useSubjectStore';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import ClockCircle from '../components/pomodoro/ClockCircle';
import ClockTime from '../components/pomodoro/ClockTime';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { IoIosPause, IoIosPlay, IoIosRefresh } from 'react-icons/io';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubjects, useSubjectTimer } from '@/hooks/useSubjects';
import { useAuthStore } from '@/store/useAuthStore';

function PomodoroPage() {
  const { user } = useAuthStore();
  const { data: Subjects = [], isLoading } = useSubjects();
  const { timerRunningSubjectId, stopLocalTimer, activeSeconds, tick } = useSubjectTimerStore();
  const { endTimer } = useSubjectTimer();
  const { 
    mode, 
    phase, 
    workDuration, 
    breakDuration, 
    breakElapsedSeconds, 
    tickBreak, 
    togglePhase, 
    resetBreak 
  } = usePomodoroStore();
  const router = useRouter();

  // Unified Interval for Work and Break
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerRunningSubjectId && phase === 'WORK') {
        tick();
      } else if (phase === 'BREAK') {
        tickBreak();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunningSubjectId, phase, tick, tickBreak]);

  const handlePauseClick = async () => {
    if (timerRunningSubjectId) {
      try {
        await endTimer.mutateAsync(timerRunningSubjectId);
      } catch (error) {
        console.error('Failed to end timer:', error);
      }
      stopLocalTimer();
    }
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="text-2xl font-semibold">Loading timer...</span>
      </div>
    );
  }

  const runningSubject = Subjects.find((subject) => subject.id === timerRunningSubjectId);

  // Time Calculations
  let sessionSecs = 0;
  let totalWorkedSecs = 0;
  let goalWorkSecs = 0;

  if (runningSubject) {
    const activeLog = runningSubject.subjectLogs?.find((log) => !log.endedAt);
    const pastLogsDuration =
      runningSubject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;

    sessionSecs = activeLog
      ? Math.floor((new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000)
      : activeSeconds;

    totalWorkedSecs = pastLogsDuration + sessionSecs;
    goalWorkSecs = runningSubject.goalWorkSecs || 0;
  }

  // Phase & Mode Logic
  let displayTime = { hours: 0, minutes: 0, seconds: 0 };
  let circlePercent = 0;
  let bottomText = "";
  let subText = "";

  if (mode === 'POMODORO') {
    if (phase === 'WORK') {
      const remainingWork = Math.max(0, workDuration - (totalWorkedSecs % workDuration));
      displayTime = ConvertSecsToTimer({ workSecs: remainingWork });
      circlePercent = ((totalWorkedSecs % workDuration) / workDuration) * 100;
      bottomText = "WORK PHASE";
      subText = runningSubject ? `Session: ${pad(ConvertSecsToTimer({workSecs: sessionSecs}).minutes)}:${pad(ConvertSecsToTimer({workSecs: sessionSecs}).seconds)}` : "Select a subject to start";
      
      // Auto-transition to Break
      if (remainingWork === 0 && timerRunningSubjectId) {
        handlePauseClick();
        togglePhase();
      }
    } else {
      const remainingBreak = Math.max(0, breakDuration - breakElapsedSeconds);
      displayTime = ConvertSecsToTimer({ workSecs: remainingBreak });
      circlePercent = (breakElapsedSeconds / breakDuration) * 100;
      bottomText = "BREAK PHASE";
      subText = "Time to rest!";

      // Auto-transition to Work
      if (remainingBreak === 0) {
        togglePhase();
      }
    }
  } else {
    // NORMAL MODE (Stopwatch Session)
    displayTime = ConvertSecsToTimer({ workSecs: sessionSecs });
    circlePercent = goalWorkSecs ? (totalWorkedSecs / goalWorkSecs) * 100 : 0;
    bottomText = "DEEP WORK";
    subText = `Daily Total: ${pad(ConvertSecsToTimer({workSecs: totalWorkedSecs}).hours)}:${pad(ConvertSecsToTimer({workSecs: totalWorkedSecs}).minutes)}`;
  }

  const progressBarPercent = goalWorkSecs ? (totalWorkedSecs / goalWorkSecs) * 100 : 0;

  return (
    <section className="flex flex-col justify-center items-center h-screen w-screen gap-0">
      {runningSubject && <h1 className="text-5xl font-bold mb-4">{runningSubject.name}</h1>}
      
      <ClockCircle percent={circlePercent} size="lg">
        <div className="flex flex-col items-center">
          <div className="text-7xl font-bold text-primary mb-2">
            {pad(displayTime.hours)}:{pad(displayTime.minutes)}:{pad(displayTime.seconds)}
          </div>
          <div className="text-2xl font-semibold text-muted-foreground uppercase tracking-widest">
            {bottomText}
          </div>
          <div className="text-lg font-medium text-muted-foreground/60 mt-1">
            {subText}
          </div>
        </div>
      </ClockCircle>

      {runningSubject && (
        <div className="w-1/2 mb-12">
          <Tooltip>
            <TooltipTrigger asChild>
              <Progress value={progressBarPercent} className="h-4" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="font-semibold text-lg">
                Goal: {pad(ConvertSecsToTimer({workSecs: goalWorkSecs}).hours)}:{pad(ConvertSecsToTimer({workSecs: goalWorkSecs}).minutes)}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="flex items-center gap-12">
        {mode === 'POMODORO' && (
           <Button 
            onClick={togglePhase} 
            variant="outline" 
            className="rounded-full w-16 h-16"
          >
            <IoIosRefresh size={32} />
          </Button>
        )}
        
        <Button 
          onClick={handlePauseClick} 
          variant="secondary" 
          className="rounded-full w-24 h-24 shadow-lg hover:scale-105 transition-transform"
        >
          <IoIosPause size={48} />
        </Button>
      </div>
    </section>
  );
}

export default PomodoroPage;
