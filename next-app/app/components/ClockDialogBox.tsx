import React from 'react';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { ConvertSecsToTimer, ConvertTimerToSecs } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

export function TimerSwitchDescription() {
  const { mode, setMode } = usePomodoroStore();
  return (
    <Field orientation="horizontal" className="max-w-sm">
      <FieldContent>
        <FieldLabel htmlFor="switch-focus-mode">Pomodoro Mode</FieldLabel>
        <FieldDescription>
          {mode === 'POMODORO' 
            ? "Cycles between work and breaks." 
            : "Continuous tracking with session stopwatch."}
        </FieldDescription>
      </FieldContent>
      <Switch
        id="switch-focus-mode"
        checked={mode === 'POMODORO'}
        onCheckedChange={(checked) => setMode(checked ? 'POMODORO' : 'NORMAL')}
      />
    </Field>
  );
}

type Props = { child: React.ReactNode };

const ClockDialogBox = (props: Props) => {
  const { setDurations, workDuration, breakDuration } = usePomodoroStore();

  const {
    hours: workHours,
    minutes: workMinutes,
    seconds: workSeconds,
  } = ConvertSecsToTimer({ workSecs: workDuration });

  const {
    hours: breakHours,
    minutes: breakMinutes,
    seconds: breakSeconds,
  } = ConvertSecsToTimer({ workSecs: breakDuration });

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <div>{props.child}</div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] lg:px-10 lg:py-14">
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

              setDurations(
                newWorkSecs || workDuration,
                newBreakSecs || breakDuration,
              );
            }}
          >
            <DialogHeader>
              <DialogTitle>
                <h1 className="text-2xl font-bold mb-4">Timer settings</h1>
              </DialogTitle>
              <TimerSwitchDescription />
            </DialogHeader>
            <div className="grid gap-4 mt-4">
              <div className="grid gap-3">
                <Label htmlFor="work-time">Work Duration</Label>
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
                <Label htmlFor="break-time">Break Duration</Label>
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
    </>
  );
};
export default ClockDialogBox;
