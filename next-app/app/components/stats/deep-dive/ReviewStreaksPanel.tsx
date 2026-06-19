import React from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface ReviewStreaksPanelProps {
  streaks: {
    currentStreak: number;
    longestStreak: number;
    consistency: number;
  };
}

export default function ReviewStreaksPanel({ streaks }: ReviewStreaksPanelProps) {
  return (
    <div className="bg-card border rounded-xl p-4 md:p-6 flex flex-col justify-between">
      <h3 className="text-lg font-bold mb-4">Journaling Habits</h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-dashed">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-full">
            <Flame className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <span className="text-2xl font-bold">{streaks?.currentStreak || 0} <span className="text-sm font-normal text-muted-foreground">days</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Longest</span>
              <span className="text-lg font-bold">{streaks?.longestStreak || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">90-Day</span>
              <span className="text-lg font-bold">{streaks?.consistency || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
