'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/useAuthStore';
import { useDailyRatingStats, useSubmitDailyRating } from '@/hooks/useRatings';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DailyRating() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDailyRatingStats();
  const submitRating = useSubmitDailyRating();

  const [rating, setRating] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isHovering, setIsHovering] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRating = rating || stats?.today;
    if (!user || !finalRating) return;

    submitRating.mutate(
      { rating: finalRating, description },
      {
        onSuccess: () => {
          toast.success('Rating saved for today!');
        },
        onError: (err: unknown) => {
          toast.error(
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              'Failed to save rating',
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col bg-background shadow-none border-border/40">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-dashed">
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-9 w-24 self-end rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasRatedToday = stats?.today !== null && stats?.today !== undefined;

  return (
    <Card
      className="h-full flex flex-col bg-background shadow-none border-border/40"
      data-tour-highlight="daily-review-section"
    >
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Daily Review</span>
          {hasRatedToday && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              Completed Today
            </span>
          )}
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

        <TabsContent value="today" className="flex-1 flex flex-col gap-4 overflow-y-auto mt-0 pr-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-dashed"
          >
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-sm text-muted-foreground mb-2">How was your day?</span>
              <div className="flex gap-1" onMouseLeave={() => setIsHovering(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110 focus:outline-none"
                    onMouseEnter={() => setIsHovering(star)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        isHovering >= star ||
                        (!isHovering && rating >= star) ||
                        (!isHovering && !rating && (stats?.today ?? 0) >= star)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground opacity-30 cursor-pointer'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {(rating > 0 || hasRatedToday) && (
                <span className="text-xs font-bold text-foreground mt-2">
                  {rating || stats?.today} / 5
                </span>
              )}
            </div>

            <Textarea
              placeholder="Journal a brief description of your day..."
              className="text-sm resize-none min-h-[60px]"
              defaultValue={stats?.description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={(!rating && !stats?.today) || submitRating.isPending}
              >
                {hasRatedToday ? 'Update Review' : 'Save Review'}
              </Button>
            </div>
          </form>

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
              stats.history.map((entry) => (
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
                  {entry.description && (
                    <p className="text-sm text-foreground bg-background border p-2 rounded-lg italic">
                      &quot;{entry.description}&quot;
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No historical reviews found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
