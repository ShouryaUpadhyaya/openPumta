import React from 'react';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { DailyRatingStatsResponse } from '@/hooks/useRatings';
import { DebouncedTextarea } from './DebouncedTextarea';

export interface DailyRatingTodayProps {
  stats: DailyRatingStatsResponse | undefined;
  initialJournal: string;
  currentRating: number;
  handleRatingChange: (rating: number) => void;
  handleJournalChange: (journal: string) => void;
}

export function DailyRatingToday({
  stats,
  initialJournal,
  currentRating,
  handleRatingChange,
  handleJournalChange,
}: DailyRatingTodayProps) {
  return (
    <TabsContent value="today" className="flex-1 flex flex-col gap-4 mt-0 pr-1">
      <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-dashed transition-colors hover:border-primary/30 flex-1">
        <div className="flex flex-col items-center justify-center py-2 shrink-0">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Main Rating
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => handleRatingChange(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    currentRating >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground opacity-30 cursor-pointer'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full mt-2 flex-1">
          <DebouncedTextarea
            initialValue={initialJournal}
            onChange={handleJournalChange}
            placeholder="Journal your day here..."
            className="min-h-[80px] h-full text-sm resize-y bg-background rounded-xl border-border/50 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-2 shrink-0">
        <div className="flex flex-col bg-card border rounded-xl p-3 items-center justify-center">
          <span className="text-xs text-muted-foreground">vs Yesterday</span>
          <div className="flex items-center gap-1 mt-1">
            {(stats?.difference ?? 0) > 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (stats?.difference ?? 0) < 0 ? (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-bold text-lg">
              {(stats?.difference ?? 0) > 0 ? '+' : ''}
              {stats?.difference ?? '-'}
            </span>
          </div>
        </div>

        <div className="flex flex-col bg-card border rounded-xl p-3 items-center justify-center">
          <span className="text-xs text-muted-foreground">7-Day Avg</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="font-bold text-lg">{stats?.weeklyAverage ?? '-'}</span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
        </div>
      </div>

      {(stats?.twentyOneDayAverage ?? 0) > 0 && (
        <div className="text-center text-xs text-muted-foreground mt-2 shrink-0">
          21-Day Average:{' '}
          <span className="font-semibold text-foreground">{stats?.twentyOneDayAverage}</span>
        </div>
      )}
    </TabsContent>
  );
}
