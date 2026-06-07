import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdvancedPeriodTrendsProps {
  trendData: {
    thisWeek: number; // in seconds
    prevWeek: number; // in seconds
    pctChange: number;
    direction: 'up' | 'down' | 'flat';
    avgDaily: number; // in seconds
  };
}

export default function AdvancedPeriodTrends({ trendData }: AdvancedPeriodTrendsProps) {
  const formatHours = (secs: number) => {
    return (secs / 3600).toFixed(1);
  };

  const getTrendIcon = () => {
    switch (trendData.direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trendData.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full min-h-[200px]">
      <h3 className="text-lg font-bold text-foreground mb-4">Period Trends</h3>

      <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg border border-border/50 mb-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground mb-1">Week over Week</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getTrendColor()}`}>
              {trendData.pctChange > 0 ? '+' : ''}
              {trendData.pctChange}%
            </span>
            {getTrendIcon()}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex justify-between w-32 text-sm">
            <span className="text-muted-foreground">This week:</span>
            <span className="font-semibold">{formatHours(trendData.thisWeek)}h</span>
          </div>
          <div className="flex justify-between w-32 text-sm">
            <span className="text-muted-foreground">Last week:</span>
            <span className="font-medium">{formatHours(trendData.prevWeek)}h</span>
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="flex flex-col p-3 rounded-lg bg-muted/20 border border-border/50">
          <span className="text-xs text-muted-foreground mb-1">Daily Average</span>
          <span className="text-lg font-bold">{formatHours(trendData.avgDaily)}h</span>
        </div>
        <div className="flex flex-col p-3 rounded-lg bg-muted/20 border border-border/50">
          <span className="text-xs text-muted-foreground mb-1">Projected (30d)</span>
          <span className="text-lg font-bold">{formatHours(trendData.avgDaily * 30)}h</span>
        </div>
      </div>
    </div>
  );
}
