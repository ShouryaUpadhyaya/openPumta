import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Clock } from 'lucide-react';
import { useTimerStore } from '@/store/useTimerStore';

export function GeneralSettings() {
  const store = useTimerStore();

  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>General</CardTitle>
        </div>
        <CardDescription>Configure how the timer behaves and what it displays.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Separator className="bg-border/40" />
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
        <Separator className="bg-border/40" />
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="avatar-toggle" className="text-sm font-medium">
              Show Avatar
            </Label>
            <p className="text-xs text-muted-foreground">
              Display your focus companion above the timer.
            </p>
          </div>
          <Switch
            id="avatar-toggle"
            checked={store.showAvatar}
            onCheckedChange={store.setShowAvatar}
          />
        </div>
      </CardContent>
    </Card>
  );
}
