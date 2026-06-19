'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useDailyRatingStats, useSubmitDailyRating } from '@/hooks/useRatings';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Loading from './review/Loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FullScreenReview from './review/FullScreenReview';
import { getLocalIsoDate } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import debounce from 'lodash/debounce';

function DebouncedTextarea({
  initialValue,
  onChange,
  placeholder,
  className,
}: {
  initialValue: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((newVal: string) => onChange(newVal), 1000),
    [onChange],
  );

  return (
    <Textarea
      placeholder={placeholder}
      className={className}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        debouncedOnChange(e.target.value);
      }}
    />
  );
}

export default function DailyRating() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDailyRatingStats();
  const submitRating = useSubmitDailyRating();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedDateStr = getLocalIsoDate(selectedDate);
  const isToday = selectedDateStr === getLocalIsoDate(new Date());

  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  const hasRatedToday = stats?.today !== null && stats?.today !== undefined && stats.today > 0;

  const todayStats = stats?.history?.find((h) => h.date.startsWith(selectedDateStr));
  let initialJournal = '';
  if (todayStats?.content && !Array.isArray(todayStats.content)) {
    initialJournal = (todayStats.content as any).journal || '';
  } else if (todayStats?.content && Array.isArray(todayStats.content)) {
    initialJournal = 'Legacy review format. Open fullscreen to view.';
  }

  const handleJournalChange = (newJournal: string) => {
    const currentRating = todayStats?.rating || 0;

    let newContent = { journal: newJournal, customQuestions: [] };
    if (todayStats?.content && !Array.isArray(todayStats.content)) {
      newContent.customQuestions = (todayStats.content as any).customQuestions || [];
    }

    submitRating.mutate({
      rating: currentRating === 0 ? undefined : currentRating,
      date: selectedDateStr,
      content: newContent,
    });
  };

  const handleRatingChange = (newRating: number) => {
    let newContent = { journal: initialJournal, customQuestions: [] };
    if (todayStats?.content && !Array.isArray(todayStats.content)) {
      newContent.customQuestions = (todayStats.content as any).customQuestions || [];
    }

    submitRating.mutate({
      rating: newRating,
      date: selectedDateStr,
      content: newContent,
    });
  };

  return (
    <>
      <Card
        className="h-full flex flex-col bg-background shadow-none border-border/40"
        data-tour-highlight="daily-review-section"
      >
        <CardHeader className="pb-2 relative">
          <CardTitle className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setSelectedDate((d) => {
                    const nd = new Date(d);
                    nd.setDate(nd.getDate() - 1);
                    return nd;
                  })
                }
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="text-lg md:text-2xl font-bold flex flex-col items-center">
                Daily Review
                <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider text-center">
                  {isToday ? 'Today' : selectedDateStr}
                </span>
              </div>
              <button
                onClick={() =>
                  setSelectedDate((d) => {
                    const nd = new Date(d);
                    nd.setDate(nd.getDate() + 1);
                    return nd;
                  })
                }
                disabled={isToday}
                className="p-1 hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasRatedToday && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium hidden sm:inline-flex">
                  Completed
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsFullScreenOpen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <Tabs
          defaultValue="today"
          className="flex-1 flex flex-col h-full overflow-hidden px-6 pb-6 pt-2"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent
            value="today"
            className="flex-1 flex flex-col gap-4 overflow-y-auto mt-0 pr-1"
          >
            <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-dashed transition-colors hover:border-primary/30">
              <div className="flex flex-col items-center justify-center py-2">
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
                          (stats?.today ?? 0) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground opacity-30 cursor-pointer'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full mt-2">
                <DebouncedTextarea
                  initialValue={initialJournal}
                  onChange={handleJournalChange}
                  placeholder="Journal your day here..."
                  className="min-h-[80px] text-sm resize-none bg-background rounded-xl border-border/50 focus-visible:ring-1"
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

          <TabsContent value="history" className="flex-1 overflow-y-auto mt-0 pr-1">
            <div className="flex flex-col gap-3">
              {stats?.history?.length ? (
                stats.history
                  .filter((e) => e.rating > 0)
                  .slice(0, 21)
                  .map((entry) => {
                    let journalText = '';
                    if (entry.content && !Array.isArray(entry.content)) {
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
        </Tabs>
      </Card>

      {isFullScreenOpen && (
        <FullScreenReview
          open={isFullScreenOpen}
          onOpenChange={setIsFullScreenOpen}
          initialDate={selectedDate}
        />
      )}
    </>
  );
}
