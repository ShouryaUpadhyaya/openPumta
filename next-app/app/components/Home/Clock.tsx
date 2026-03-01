import React from 'react';
import { useCounterStore } from '@/store/useStore';
import { ConvertSecsToTimer, ConvertTimerToSecs } from '@/lib/utils';
import ClockCircle from '../pomodoro/ClockCircle';
import ClockTime from '../pomodoro/ClockTime';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function Clock() {
  const { timerRunningSubjectId, Subjects, changeTimerPomodoro, pomodoroTimer, BreakTimer } =
    useCounterStore();

  const {
    hours: workHours,
    minutes: workMinutes,
    seconds: workSeconds,
  } = ConvertSecsToTimer({ workSecs: pomodoroTimer, goalWorkSecs: pomodoroTimer });

  const {
    hours: breakHours,
    minutes: breakMinutes,
    seconds: breakSeconds,
  } = ConvertSecsToTimer({ workSecs: BreakTimer, goalWorkSecs: BreakTimer });

  const runningSubject = Subjects.find((subject) => subject.id === timerRunningSubjectId);

  const workSecs = runningSubject?.workSecs ?? pomodoroTimer;
  const goalWorkSecs = runningSubject?.goalWorkSecs;

  const { hours, minutes, seconds } = ConvertSecsToTimer({
    workSecs,
    goalWorkSecs,
  });
  let { percent } = ConvertSecsToTimer({
    workSecs,
    goalWorkSecs,
  });

  if (!runningSubject) {
    percent = 100;
  }

  return (
    <section className="flex justify-center items-center">
      <Dialog>
        <DialogTrigger asChild>
          {/* <Button variant="outline">Open Dialog</Button> */}
          <div className="relative flex justify-center items-center">
            <ClockCircle percent={percent} size={'sm'} />
            <div className="absolute">
              <ClockTime hours={hours} minutes={minutes} seconds={seconds} color={'#fff'} />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              const form = e.currentTarget;
              const workHr = Number((form.elements[0] as HTMLInputElement).value) || 0;
              const workMin = Number((form.elements[1] as HTMLInputElement).value) || 0;
              const workSec = Number((form.elements[2] as HTMLInputElement).value) || 0;

              const breakHr = Number((form.elements[3] as HTMLInputElement).value) || 0;
              const breakMin = Number((form.elements[4] as HTMLInputElement).value) || 0;
              const breakSec = Number((form.elements[5] as HTMLInputElement).value) || 0;

              const newWorkSecs = ConvertTimerToSecs({
                hr: workHr,
                min: workMin,
                sec: workSec,
              });

              const newBreakSecs = ConvertTimerToSecs({
                hr: breakHr,
                min: breakMin,
                sec: breakSec,
              });

              changeTimerPomodoro({
                workSecs: newWorkSecs || pomodoroTimer,
                breakSecs: newBreakSecs || BreakTimer,
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>Pomodoro Timer</DialogTitle>
              <DialogDescription>
                Make changes to your pomodoro timer here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="work-time">Work Timer</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="hh" type="number" min={0} defaultValue={workHours} />
                  <span>:</span>
                  <Input
                    placeholder="mm"
                    type="number"
                    min={0}
                    max={60}
                    defaultValue={workMinutes}
                  />
                  <span>:</span>
                  <Input
                    placeholder="ss"
                    defaultValue={workSeconds}
                    min={0}
                    max={60}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="break-time">Break Timer</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="hh" type="number" min={0} defaultValue={breakHours} />
                  <span>:</span>
                  <Input
                    placeholder="mm"
                    type="number"
                    min={0}
                    max={60}
                    defaultValue={breakMinutes}
                  />
                  <span>:</span>
                  <Input
                    placeholder="ss"
                    defaultValue={breakSeconds}
                    min={0}
                    max={60}
                    type="number"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Clock;
