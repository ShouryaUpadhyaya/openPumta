'use client';
// add a changing avatar in the middle of the pomodoro
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubjectTimerStore } from '@/store/useSubjectStore';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import ClockCircle from '../components/pomodoro/ClockCircle';
import ClockTime from '../components/pomodoro/ClockTime';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { IoIosPause } from 'react-icons/io';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubjects, useSubjectTimer } from '@/hooks/useSubjects';
import { useAuthStore } from '@/store/useAuthStore';

function PomodoroPage() {
  const { user } = useAuthStore();
  const { data: Subjects = [], isLoading } = useSubjects();
  const { timerRunningSubjectId, stopLocalTimer, activeSeconds, tick } = useSubjectTimerStore();
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const { endTimer } = useSubjectTimer();
  const { pomodoroTimer } = usePomodoroStore();
  const router = useRouter();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunningSubjectId) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunningSubjectId, tick]);

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

  let displayHours,
    displayMinutes,
    displaySeconds,
    circlePercent,
    progressBarPercent,
    goalWorkSecs = 0;

  if (runningSubject) {
    const activeLog = runningSubject.subjectLogs?.find((log) => !log.endedAt);
    const pastLogsDuration =
      runningSubject.subjectLogs?.reduce((acc, log) => acc + (log.duration || 0), 0) || 0;

    let workedSecs = pastLogsDuration;
    if (activeLog) {
      workedSecs += Math.floor(
        (new Date().getTime() - new Date(activeLog.startedAt).getTime()) / 1000,
      );
    } else {
      workedSecs += activeSeconds;
    }

    goalWorkSecs = runningSubject.goalWorkSecs || 0;

    const { hours, minutes, seconds } = ConvertSecsToTimer({
      workSecs: workedSecs,
    });
    displayHours = hours;
    displayMinutes = minutes;
    displaySeconds = seconds;

    circlePercent = ((workedSecs % pomodoroTimer) / pomodoroTimer) * 100;
    progressBarPercent = goalWorkSecs ? (workedSecs / goalWorkSecs) * 100 : 0;
  } else {
    const { hours, minutes, seconds } = ConvertSecsToTimer({
      workSecs: pomodoroTimer,
    });
    displayHours = hours;
    displayMinutes = minutes;
    displaySeconds = seconds;
    circlePercent = 100;
    progressBarPercent = 0;
  }

  return (
    <section className="flex flex-col justify-center items-center h-screen w-screen gap-0">
      {runningSubject && <h1 className="text-5xl font-bold">{runningSubject.name}</h1>}
      <ClockCircle percent={circlePercent} size="lg" />
      {runningSubject && (
        <div className="w-1/2 mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Progress value={progressBarPercent} draggable={false} className="h-5" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col items-center text-primary font-semibold text-lg">
                <span>
                  {(() => {
                    const { hours, minutes, seconds } = ConvertSecsToTimer({
                      workSecs: goalWorkSecs,
                    });
                    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                  })()}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <div className="flex flex-col items-center gap-8">
        <ClockTime hours={displayHours} minutes={displayMinutes} seconds={displaySeconds} />
        <Button onClick={handlePauseClick} variant="secondary" className="scale-150 ">
          <IoIosPause size={48} />
        </Button>
      </div>
    </section>
  );
}

export default PomodoroPage;
