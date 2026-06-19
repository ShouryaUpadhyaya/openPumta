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
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold">Mood Correlations</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        How specific habits impact your daily rating.
      </p>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
        {correlations.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-3 bg-muted/20 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate max-w-[150px]" title={item.name}>{item.name}</span>
              <div className="flex items-center gap-1">
                {item.diff > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                )}
                <span className={`text-xs font-bold ${item.diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)} stars
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                <span>Done: {item.avgRatingWhenChecked.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <span>Missed: {item.avgRatingWhenUnchecked.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
