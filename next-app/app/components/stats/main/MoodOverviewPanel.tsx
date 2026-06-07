import React from 'react';
import { Smile, Meh, Frown, Moon, Zap } from 'lucide-react';

interface MoodOverviewPanelProps {
  moodRating: number | null; // out of 5
  sleepHours?: number;
  energyLevel?: string;
}

export default function MoodOverviewPanel({
  moodRating,
  sleepHours,
  energyLevel,
}: MoodOverviewPanelProps) {
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

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-full min-h-[220px]">
      <h3 className="text-lg font-bold text-foreground mb-4">Daily Mood</h3>

      <div className="flex items-center gap-6 mb-6">
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

      <div className="flex gap-4 mt-auto">
        <div className="flex-1 flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/50">
          <Moon className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Sleep</span>
            <span className="text-sm font-semibold">{sleepHours ? `${sleepHours}h` : '--'}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/50">
          <Zap className="w-5 h-5 text-yellow-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Energy</span>
            <span className="text-sm font-semibold capitalize">{energyLevel || '--'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
