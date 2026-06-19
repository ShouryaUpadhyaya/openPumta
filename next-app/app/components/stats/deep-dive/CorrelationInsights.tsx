import React from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface CorrelationInsightsProps {
  correlations: {
    name: string;
    avgRatingWhenChecked: number;
    avgRatingWhenUnchecked: number;
    diff: number;
    occurrences: number;
  }[];
}

export default function CorrelationInsights({ correlations }: CorrelationInsightsProps) {
  if (!correlations?.length) return null;

  return (
    <div className="bg-card border rounded-xl p-4 md:p-6 flex flex-col h-full max-h-[400px]">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Correlation Insights (Avg Rating With Habit Completion)
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {correlations.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 p-3 bg-muted/10 border border-primary/20 rounded-lg justify-center transition-colors hover:bg-muted/30"
            >
              <span
                className="font-semibold text-xs text-muted-foreground truncate"
                title={item.name}
              >
                Avg Rating ({item.name}):
              </span>
              <span className="text-lg font-bold text-primary">
                {item.avgRatingWhenChecked.toFixed(1)} / 5
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
