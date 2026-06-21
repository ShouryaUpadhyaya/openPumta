import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DailyRatingHeaderProps {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  isToday: boolean;
  selectedDateStr: string;
  hasRatedToday: boolean;
  setIsFullScreenOpen: (open: boolean) => void;
}

export function DailyRatingHeader({
  setSelectedDate,
  isToday,
  selectedDateStr,
  hasRatedToday,
  setIsFullScreenOpen,
}: DailyRatingHeaderProps) {
  return (
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
  );
}
