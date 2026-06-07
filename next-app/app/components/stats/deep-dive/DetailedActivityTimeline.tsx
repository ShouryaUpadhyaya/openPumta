import React from 'react';
import { TimelineItem } from '@/hooks/useStats';
import { BookOpen, CheckSquare, Zap, Clock } from 'lucide-react';

interface DetailedActivityTimelineProps {
  timeline: TimelineItem[];
}

export default function DetailedActivityTimeline({ timeline }: DetailedActivityTimelineProps) {
  // Sort by start time ascending
  const sorted = [...timeline].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  const formatTime = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subject':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'habit':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'todo':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subject':
        return <BookOpen className="w-4 h-4" />;
      case 'habit':
        return <Zap className="w-4 h-4" />;
      case 'todo':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-full min-h-[400px] overflow-hidden">
      <h3 className="text-lg font-bold text-foreground mb-4">Activity Timeline</h3>

      {sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No activities logged for this day.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/50" />

          <div className="flex flex-col gap-6 relative">
            {sorted.map((item, idx) => {
              const colorClass = getTypeColor(item.type);

              return (
                <div key={item.id || idx} className="flex gap-4 relative">
                  {/* Icon Circle */}
                  <div
                    className={`w-14 h-14 rounded-full flex shrink-0 items-center justify-center border-4 border-card z-10 ${colorClass}`}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 rounded-lg border p-3 ${colorClass.replace('text-', 'border-l-4 border-l-')}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {item.name}
                      </span>
                      <span className="text-xs font-medium bg-background px-2 py-1 rounded">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <span className="text-foreground/80 font-medium">
                        {formatTime(item.startedAt)}
                      </span>
                      {item.endedAt && (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-foreground/80 font-medium">
                            {formatTime(item.endedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
