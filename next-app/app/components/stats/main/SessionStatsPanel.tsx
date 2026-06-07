import React from 'react';

interface SessionStatsPanelProps {
  stats: {
    label: string;
    value: string;
    isHighlight?: boolean;
  }[];
}

export default function SessionStatsPanel({ stats }: SessionStatsPanelProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[460px]">
      <h3 className="text-lg font-bold text-foreground mb-4">Session Statistics</h3>

      <div className="flex flex-col gap-4 flex-1">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-baseline w-full">
            <span className="text-sm text-muted-foreground shrink-0">{stat.label}</span>
            <div className="flex-1 border-b-2 border-dotted border-border/50 mx-2 relative top-[-4px]" />
            <span
              className={`text-sm font-bold shrink-0 ${
                stat.isHighlight ? 'text-primary' : 'text-foreground'
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
