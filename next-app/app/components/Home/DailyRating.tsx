'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDailyRatingStats, useSubmitDailyRating } from '@/hooks/useRatings';
import Loading from './review/Loading';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FullScreenReview from './review/FullScreenReview';
import { getLocalIsoDate } from '@/lib/utils';
import { DailyRatingHeader } from './DailyRating/DailyRatingHeader';
import { DailyRatingToday } from './DailyRating/DailyRatingToday';
import { DailyRatingHistory } from './DailyRating/DailyRatingHistory';

export default function DailyRating() {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialJournal = (todayStats.content as any).journal || '';
  } else if (todayStats?.content && Array.isArray(todayStats.content)) {
    initialJournal = 'Legacy review format. Open fullscreen to view.';
  }

  const handleJournalChange = (newJournal: string) => {
    const currentRating = todayStats?.rating || 0;

    const newContent = { journal: newJournal, customQuestions: [] };
    if (todayStats?.content && !Array.isArray(todayStats.content)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newContent.customQuestions = (todayStats.content as any).customQuestions || [];
    }

    submitRating.mutate({
      rating: currentRating === 0 ? undefined : currentRating,
      date: selectedDateStr,
      content: newContent,
    });
  };

  const handleRatingChange = (newRating: number) => {
    const newContent = { journal: initialJournal, customQuestions: [] };
    if (todayStats?.content && !Array.isArray(todayStats.content)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <DailyRatingHeader
          setSelectedDate={setSelectedDate}
          isToday={isToday}
          selectedDateStr={selectedDateStr}
          hasRatedToday={hasRatedToday}
          setIsFullScreenOpen={setIsFullScreenOpen}
        />

        <Tabs
          defaultValue="today"
          className="flex-1 flex flex-col h-full overflow-hidden px-6 pb-6 pt-2"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <DailyRatingToday
            stats={stats}
            initialJournal={initialJournal}
            handleRatingChange={handleRatingChange}
            handleJournalChange={handleJournalChange}
          />

          <DailyRatingHistory
            stats={stats}
            onSelectHistory={(date) => {
              setSelectedDate(date);
              setIsFullScreenOpen(true);
            }}
          />
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
