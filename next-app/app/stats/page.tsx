'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDailyTimeline } from '@/hooks/useStats';
import { ConvertSecsToTimer, pad } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, RefreshCcw, Clock } from 'lucide-react';

export default function StatsPage() {
  const { user } = useAuthStore();
  const { data: timeline = [], isLoading } = useDailyTimeline();

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-semibold animate-pulse">Loading Statistics...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-6 pb-24 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Your Performance</h1>
            <p className="text-muted-foreground">See everything you&apos;ve accomplished today</p>
          </div>
        </CardHeader>
      </Card>

      <div className="relative space-y-8">
        {/* Timeline Line */}
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border hidden sm:block" />

        {timeline.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-xl text-muted-foreground">No activities recorded yet today</p>
          </div>
        ) : (
          timeline.map((item, index) => (
            <div key={index} className="relative pl-0 sm:pl-16 group">
              {/* Timeline dot */}
              <div className="absolute left-[21px] top-6 w-3 h-3 rounded-full bg-primary border-2 border-background hidden sm:block group-hover:scale-150 transition-transform" />

              <Card className="transition-all hover:shadow-md border-muted-foreground/10">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${getTypeColor(item.type)}`}>
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`capitalize text-[10px] py-0 px-2 ${getTypeColor(item.type)}`}
                          >
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.startedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold leading-none">{item.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:text-right">
                      {item.duration > 0 && (
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">
                            Duration
                          </p>
                          <p className="font-mono text-lg">
                            {(() => {
                              const { hours, minutes, seconds } = ConvertSecsToTimer({
                                workSecs: item.duration,
                              });
                              return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                            })()}
                          </p>
                        </div>
                      )}
                      {!item.endedAt && (
                        <Badge className="bg-primary animate-pulse">Active Now</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
