import React from 'react';

interface ConsistencyTrackerProps {
  data: { date: string; goalMet: boolean }[];
  currentStreak: number;
}

export default function ConsistencyTracker({ data, currentStreak }: ConsistencyTrackerProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">21-Day Consistency</h3>
        <span className="text-sm font-semibold text-primary">
          Current streak: {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 items-center justify-between">
        {data.map((item, idx) => {
          const dateObj = new Date(item.date);
          const dayNum = dateObj.getDate();

          return (
            <div key={item.date} className="flex flex-col items-center gap-1 group relative">
              <div
                className={`w-8 h-8 rounded-md transition-colors ${
                  item.goalMet ? 'bg-primary' : 'bg-muted/50 border border-border/50'
                }`}
                title={`${item.date}: ${item.goalMet ? 'Goal Met' : 'Missed'}`}
              />
              <span className="text-[10px] text-muted-foreground">{dayNum}</span>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md border border-border">
                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}:{' '}
                {item.goalMet ? 'Goal Met' : 'Goal Missed'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
