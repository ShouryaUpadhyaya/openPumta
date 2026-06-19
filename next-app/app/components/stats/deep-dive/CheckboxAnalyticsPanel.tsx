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
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Habit Completion Rate
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card border-b text-muted-foreground z-10">
            <tr>
              <th className="text-left pb-2 font-medium">Habit</th>
              <th className="text-left pb-2 font-medium">Completion Rate</th>
              <th className="text-right pb-2 font-medium">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {analytics.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td
                  className="py-3 font-medium text-foreground max-w-[150px] truncate pr-2"
                  title={item.name}
                >
                  {item.name}
                </td>
                <td className="py-3">
                  <span className="text-primary font-semibold">{item.completionRate}%</span>
                </td>
                <td className="py-3 text-right">
                  <span className="font-semibold">{item.streak}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
