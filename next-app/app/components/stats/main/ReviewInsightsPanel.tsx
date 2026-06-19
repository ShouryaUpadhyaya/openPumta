import React from 'react';
import { Smile, Meh, Frown, CheckCircle2, ListTodo } from 'lucide-react';

interface ReviewInsightsPanelProps {
  moodRating: number | null; // out of 5
  reviewInsights: {
    total: number;
    completed: number;
    completionRate: number;
    items: { text: string; checked: boolean }[];
  };
}

export default function ReviewInsightsPanel({
  moodRating,
  reviewInsights,
}: ReviewInsightsPanelProps) {
  const getMoodIcon = (rating: number | null) => {
    if (rating === null) return <Meh className="w-12 h-12 text-muted-foreground" />;
    if (rating >= 4) return <Smile className="w-12 h-12 text-green-500" />;
    if (rating >= 2.5) return <Meh className="w-12 h-12 text-yellow-500" />;
    return <Frown className="w-12 h-12 text-red-500" />;
  };

  const getMoodText = (rating: number | null) => {
    if (rating === null) return 'No Data';
    if (rating >= 4) return 'Good';
    if (rating >= 2.5) return 'Okay';
    return 'Poor';
  };

  const { total, completed, completionRate, items } = reviewInsights || { total: 0, completed: 0, completionRate: 0, items: [] };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-full min-h-[220px]">
      <h3 className="text-lg font-bold text-foreground mb-4">Today's Review</h3>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex flex-col items-center gap-2">
          {getMoodIcon(moodRating)}
          <span className="text-xl font-bold">
            {moodRating ? `${moodRating.toFixed(1)}/5` : '-'}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm text-muted-foreground">Overall Vibe</span>
          <span className="text-lg font-semibold">{getMoodText(moodRating)}</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <ListTodo className="h-3 w-3" />
            Checklist Items
          </span>
          {total > 0 && (
            <span className="text-xs font-bold text-primary">
              {completed} / {total} ({completionRate}%)
            </span>
          )}
        </div>
        
        {total > 0 ? (
          <div className="flex flex-col gap-1.5 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md border border-border/50">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.checked ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                <span className={`text-xs truncate ${item.checked ? 'text-foreground font-medium' : 'text-muted-foreground line-through'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-3 bg-muted/20 border border-dashed rounded-lg">
            <span className="text-xs text-muted-foreground">No checklist items today</span>
          </div>
        )}
      </div>
    </div>
  );
}
