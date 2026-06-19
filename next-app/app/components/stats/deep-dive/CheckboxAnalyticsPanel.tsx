import React from 'react';
import { Progress } from '@/components/ui/progress';

interface CheckboxAnalyticsPanelProps {
  analytics: {
    name: string;
    completionRate: number;
    streak: number;
    missedDays: number;
    totalDays: number;
  }[];
}

export default function CheckboxAnalyticsPanel({ analytics }: CheckboxAnalyticsPanelProps) {
  if (!analytics?.length) return null;

  return (
    <div className="bg-card border rounded-xl p-4 md:p-6 flex flex-col h-full max-h-[400px]">
      <h3 className="text-lg font-bold mb-4">Habit Trackers</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
        {analytics.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-3 bg-muted/20 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm truncate" title={item.name}>{item.name}</span>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {item.completionRate}%
              </span>
            </div>
            <Progress value={item.completionRate} className="h-1.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{item.totalDays - item.missedDays} / {item.totalDays} Days</span>
              <span className="flex items-center gap-1">
                Streak: <span className="text-foreground font-semibold">{item.streak}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
