'use client';
// add a changing avatar in the middle of the pomodoro
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCounterStore } from '@/store/useStore';
import ClockCircle from '../components/pomodoro/ClockCircle';
import ClockTime from '../components/pomodoro/ClockTime';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { IoIosPause } from 'react-icons/io';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
function PomodoroPage() {
  const { timerRunningSubjectId, toggleTimer, Subjects, pomodoroTimer } = useCounterStore();
  const router = useRouter();

  const handlePauseClick = () => {
    if (timerRunningSubjectId) {
      toggleTimer(timerRunningSubjectId);
    }
    router.push('/');
  };

  const runningSubject = Subjects.find((subject) => subject.id === timerRunningSubjectId);

  let displayHours,
    displayMinutes,
    displaySeconds,
    circlePercent,
    progressBarPercent,
    goalWorkSecs = 0;

  if (runningSubject) {
    const workedSecs = runningSubject.workSecs ?? 0;
    goalWorkSecs = runningSubject.goalWorkSecs;
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
                {/* <span>{`${pad(displayHours)}:${pad(displayMinutes)}:${pad(
                  displaySeconds
                )}`}</span>
                <span className="border-b border-primary w-full my-1"></span> */}
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
