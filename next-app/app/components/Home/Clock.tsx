import React from 'react';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { ConvertSecsToTimer } from '@/lib/utils';
import ClockCircle from '../pomodoro/ClockCircle';
import ClockTime from '../pomodoro/ClockTime';
import ClockDialogBox from '../ClockDialogBox';

function Clock() {
  const { workDuration } = usePomodoroStore();

  const {
    hours: workHours,
    minutes: workMinutes,
    seconds: workSeconds,
  } = ConvertSecsToTimer({ workSecs: workDuration });

  return (
    <section className="flex justify-center items-center">
      <ClockDialogBox
        child={
          <div className="relative flex justify-center items-center">
            <ClockCircle percent={100} size={'sm'} />
            <div className="absolute">
              <ClockTime
                hours={workHours}
                minutes={workMinutes}
                seconds={workSeconds}
                color={'#fff'}
              />
            </div>
          </div>
        }
      />
    </section>
  );
}

export default Clock;
