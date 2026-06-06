import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';

interface SessionStatsCardProps {
  stats: {
    avgDurationMins: number;
    longestMins: number;
    totalSessions: number;
  };
  color: string;
}

export function SessionStatsCard({ stats, color }: SessionStatsCardProps) {
  return (
    <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
      <CardHeader className="py-2 px-4 flex flex-row items-center gap-2">
        <Timer className="h-4 w-4" style={{ color }} />
        <CardTitle className="text-sm font-medium">Session Stats</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col justify-center gap-4">
        <div className="flex justify-between items-center border-b border-border/40 pb-2">
          <span className="text-sm text-muted-foreground">Avg Session</span>
          <span className="font-semibold">{stats.avgDurationMins}m</span>
        </div>
        <div className="flex justify-between items-center border-b border-border/40 pb-2">
          <span className="text-sm text-muted-foreground">Longest Session</span>
          <span className="font-semibold">{stats.longestMins}m</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Sessions (21 days)</span>
          <span className="font-semibold">{stats.totalSessions}</span>
        </div>
      </CardContent>
    </Card>
  );
}
