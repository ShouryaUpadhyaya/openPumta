import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import { TimeInputGroup } from './shared';

interface DurationsSettingsProps {
  work: { hours: number; minutes: number; seconds: number };
  shortBreak: { hours: number; minutes: number; seconds: number };
  longBreak: { hours: number; minutes: number; seconds: number };
}

export function DurationsSettings({ work, shortBreak, longBreak }: DurationsSettingsProps) {
  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <CardTitle>Durations</CardTitle>
        </div>
        <CardDescription>
          Set the length of each work and break interval (HH : MM : SS).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TimeInputGroup label="Work Session" prefix="work" defaultVal={work} />
          <TimeInputGroup label="Short Break" prefix="short" defaultVal={shortBreak} />
          <TimeInputGroup label="Long Break" prefix="long" defaultVal={longBreak} />
        </div>
      </CardContent>
    </Card>
  );
}
