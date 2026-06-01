'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, CheckCircle, RefreshCcw } from 'lucide-react';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { TimelineItem } from '@/hooks/useStats';

const getIcon = (type: string) => {
  switch (type) {
    case 'subject':
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case 'habit':
      return <RefreshCcw className="h-5 w-5 text-green-500" />;
    case 'todo':
      return <CheckCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'subject':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'habit':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'todo':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export default function DailyTimeline({
  timeline,
  accentColor,
}: {
  timeline: TimelineItem[];
  accentColor: string;
}) {
  return (
    <Card className="bg-card border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: accentColor }} />
          Today&apos;s Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed border-border/40">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-20" />
            <p className="text-muted-foreground">No activities recorded yet today</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-border/20 hover:border-border/50 transition-all group"
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${getTypeColor(item.type)}`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge
                      variant="outline"
                      className={`capitalize text-[9px] py-0 px-1.5 ${getTypeColor(item.type)}`}
                    >
                      {item.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.startedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                </div>
                <div className="text-right shrink-0">
                  {item.duration > 0 ? (
                    <p className="font-mono text-sm">
                      {(() => {
                        const { hours, minutes, seconds } = ConvertSecsToTimer({
                          workSecs: item.duration,
                        });
                        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                      })()}
                    </p>
                  ) : !item.endedAt ? (
                    <Badge className="bg-primary animate-pulse text-[10px]">Active</Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
