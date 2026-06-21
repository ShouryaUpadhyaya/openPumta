import React from 'react';
import { Star } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { DailyRatingStatsResponse } from '@/hooks/useRatings';

export interface DailyRatingHistoryProps {
  stats: DailyRatingStatsResponse | undefined;
}

export function DailyRatingHistory({ stats }: DailyRatingHistoryProps) {
  return (
    <TabsContent value="history" className="flex-1 overflow-y-auto mt-0 pr-1">
      <div className="flex flex-col gap-3">
        {stats?.history?.length ? (
          stats.history
            .filter((e) => e.rating > 0)
            .slice(0, 21)
            .map((entry) => {
              let journalText = '';
              if (entry.content && !Array.isArray(entry.content)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                journalText = (entry.content as any).journal || '';
              } else if (entry.description) {
                journalText = entry.description;
              }

              return (
                <div
                  key={entry.date}
                  className="flex flex-col gap-2 p-3 bg-muted/20 border rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(entry.date))}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{entry.rating}</span>
                    </div>
                  </div>
                  {journalText && (
                    <p className="text-sm text-foreground bg-background border border-border/50 p-2 rounded-lg italic line-clamp-3">
                      &quot;{journalText}&quot;
                    </p>
                  )}
                </div>
              );
            })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No historical reviews found.</p>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
