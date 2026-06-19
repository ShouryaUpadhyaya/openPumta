import React, { useMemo } from 'react';
import { getLocalIsoDate } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function RatingHeatmap({ history }: { history: any[] }) {
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    (history || []).forEach(h => {
      if (h.rating > 0) {
        map.set(getLocalIsoDate(new Date(h.date)), h.rating);
      }
    });
    return map;
  }, [history]);

  const weeks = useMemo(() => {
    const weeksArr = [];
    const endDate = new Date();
    // Start 90 days ago
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 89);
    
    // Adjust startDate to the previous Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currDate = new Date(startDate);
    while (currDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dStr = getLocalIsoDate(currDate);
        if (currDate <= endDate) {
          week.push({
            date: dStr,
            rating: dataMap.get(dStr) || 0
          });
        } else {
          week.push({ date: dStr, rating: -1 }); // future
        }
        currDate.setDate(currDate.getDate() + 1);
      }
      weeksArr.push(week);
    }
    return weeksArr;
  }, [dataMap]);

  const getColor = (rating: number) => {
    if (rating === -1) return 'bg-transparent'; // future
    if (rating === 0) return 'bg-muted/30'; // missed
    if (rating >= 4.5) return 'bg-yellow-400';
    if (rating >= 3.5) return 'bg-yellow-400/80';
    if (rating >= 2.5) return 'bg-yellow-400/50';
    if (rating >= 1.5) return 'bg-yellow-400/30';
    return 'bg-yellow-400/10'; // 1
  };

  return (
    <div className="bg-card border rounded-xl p-4 md:p-6 flex flex-col w-full overflow-hidden">
      <h3 className="text-lg font-bold mb-4">Rating Heatmap</h3>
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                day.rating !== -1 ? (
                  <TooltipProvider key={dIdx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${getColor(day.rating)} border border-border/10 cursor-pointer hover:border-foreground/30 transition-colors`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          <span className="font-semibold text-foreground mr-2">{day.date}</span>
                          {day.rating > 0 ? `${day.rating} Stars` : 'No rating'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <div key={dIdx} className="w-3 h-3 md:w-4 md:h-4" />
                )
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-end w-full">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400/10" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400/30" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400/50" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
