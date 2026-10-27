'use client';

import React, { useState, useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { ConvertSecsToTimer } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const PRESET_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#71717a', // Zinc
];

interface TimeInputGroupProps {
  label: string;
  prefix: string;
  defaultVal: { hours: number; minutes: number; seconds: number };
}

function TimeInputGroup({ label, prefix, defaultVal }: TimeInputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all">
        <Input
          name={`${prefix}Hr`}
          type="number"
          min={0}
          defaultValue={defaultVal.hours}
          className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
          placeholder="00"
        />
        <span className="text-muted-foreground font-medium">:</span>
        <Input
          name={`${prefix}Min`}
          type="number"
          min={0}
          max={59}
          defaultValue={defaultVal.minutes}
          className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
          placeholder="00"
        />
        <span className="text-muted-foreground font-medium">:</span>
        <Input
          name={`${prefix}Sec`}
          type="number"
          min={0}
          max={59}
          defaultValue={defaultVal.seconds}
          className="w-12 h-8 border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
          placeholder="00"
        />
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="group relative h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <Check className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            )}
            <span className="sr-only">Select color {color}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = { child: React.ReactNode };

const ClockDialogBox = ({ child }: Props) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const store = useTimerStore();

  // Local state for colors to allow selection
  const [workColor, setWorkColor] = useState(store.workColor);
  const [shortColor, setShortColor] = useState(store.shortBreakColor);
  const [longColor, setLongColor] = useState(store.longBreakColor);

  useEffect(() => {
    if (open) {
      setWorkColor(store.workColor);
      setShortColor(store.shortBreakColor);
      setLongColor(store.longBreakColor);
    }
  }, [open, store.workColor, store.shortBreakColor, store.longBreakColor]);

  const work = ConvertSecsToTimer({ workSecs: Math.floor(store.settings.workDuration / 1000) });
  const shortBreak = ConvertSecsToTimer({
    workSecs: Math.floor(store.settings.shortBreakDuration / 1000),
  });
  const longBreak = ConvertSecsToTimer({
    workSecs: Math.floor(store.settings.longBreakDuration / 1000),
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      const getMs = (prefix: string) => {
        const h = Number(formData.get(`${prefix}Hr`)) || 0;
        const m = Number(formData.get(`${prefix}Min`)) || 0;
        const s = Number(formData.get(`${prefix}Sec`)) || 0;
        return (h * 3600 + m * 60 + s) * 1000;
      };

      const newWork = getMs('work');
      const newShort = getMs('short');
      const newLong = getMs('long');

      // Validation
      if (newWork < 60000) {
        toast.error('Work duration must be at least 1 minute');
        setIsSaving(false);
        return;
      }

      store.setSettings({
        workDuration: newWork,
        shortBreakDuration: newShort,
        longBreakDuration: newLong,
      });
      store.setColors(workColor, shortColor, longColor);

      toast.success('Settings saved successfully', {
        description: `${Math.floor(newWork / 60000)}m focus / ${Math.floor(newShort / 60000)}m break`,
      });

      setOpen(false);
    } catch (_err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{child}</div>
      </DialogTrigger>
      <DialogContent className="max-w-[450px] lg:max-w-[500px] overflow-hidden p-0 gap-0 border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 bg-muted/20 pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Timer Settings
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col">
          <div className="p-6 pt-2 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {/* General Settings */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest px-1">
                General
              </h3>
              <Card className="p-4 space-y-4 bg-muted/10 border-muted-foreground/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="mode-toggle" className="text-sm font-medium">
                      Pomodoro Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Cycle between structured work and rest intervals.
                    </p>
                  </div>
                  <Switch
                    id="mode-toggle"
                    checked={store.mode === 'pomodoro'}
                    onCheckedChange={(checked) => store.setMode(checked ? 'pomodoro' : 'stopwatch')}
                  />
                </div>
                <Separator className="bg-muted-foreground/5" />
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="progress-toggle" className="text-sm font-medium">
                      Show Progress Bar
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Display daily goal progress below the timer.
                    </p>
                  </div>
                  <Switch
                    id="progress-toggle"
                    checked={store.showProgressBar}
                    onCheckedChange={store.setShowProgressBar}
                  />
                </div>
                <Separator className="bg-muted-foreground/5" />
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="stopwatch-toggle" className="text-sm font-medium">
                      Show Stopwatch
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      A separate stopwatch to time anything, independent of subjects.
                    </p>
                  </div>
                  <Switch
                    id="stopwatch-toggle"
                    checked={store.showStopwatch}
                    onCheckedChange={store.setShowStopwatch}
                  />
                </div>
              </Card>
            </section>

            {/* Auto-start Settings */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest px-1">
                Automation
              </h3>
              <Card className="p-4 space-y-4 bg-muted/10 border-muted-foreground/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-break-toggle" className="text-sm font-medium">
                      Auto-start Breaks
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Start break timer automatically after work session.
                    </p>
                  </div>
                  <Switch
                    id="auto-break-toggle"
                    checked={store.settings.autoStartBreaks}
                    onCheckedChange={(checked) => store.setSettings({ autoStartBreaks: checked })}
                  />
                </div>
                <Separator className="bg-muted-foreground/5" />
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-work-toggle" className="text-sm font-medium">
                      Auto-start Work
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Start next work session automatically after break.
                    </p>
                  </div>
                  <Switch
                    id="auto-work-toggle"
                    checked={store.settings.autoStartWork}
                    onCheckedChange={(checked) => store.setSettings({ autoStartWork: checked })}
                  />
                </div>
              </Card>
            </section>

            {/* Durations */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest px-1">
                Durations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <TimeInputGroup label="Work Session" prefix="work" defaultVal={work} />
                <TimeInputGroup label="Short Break" prefix="short" defaultVal={shortBreak} />
                <div className="md:col-span-2">
                  <TimeInputGroup label="Long Break" prefix="long" defaultVal={longBreak} />
                </div>
              </div>
            </section>

            {/* Theme Colors */}
            <section className="space-y-6">
              <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest px-1">
                Theme Colors
              </h3>
              <div className="space-y-6 px-1">
                <ColorPicker label="Work Phase" value={workColor} onChange={setWorkColor} />
                <ColorPicker label="Short Break" value={shortColor} onChange={setShortColor} />
                <ColorPicker label="Long Break" value={longColor} onChange={setLongColor} />
              </div>
            </section>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-muted-foreground/5 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClockDialogBox;
