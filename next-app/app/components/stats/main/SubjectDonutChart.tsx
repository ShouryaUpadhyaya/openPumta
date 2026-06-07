import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface SubjectDonutChartProps {
  subjectData: { name: string; value: number; color: string }[];
  totalStudySecs: number;
  studySecs: number;
  breakSecs: number;
  otherSecs: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  coding: '#E8521A',
  dsa: '#C4840A',
  devops: '#2A7A7A',
  backend: '#3A5A8A',
  exam: '#C44A2A',
};

const formatTime = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}`;
  return `0:${m.toString().padStart(2, '0')}`;
};

export default function SubjectDonutChart({
  subjectData,
  totalStudySecs,
  studySecs,
  breakSecs,
  otherSecs,
}: SubjectDonutChartProps) {
  const totalActivitySecs = studySecs + breakSecs + otherSecs;

  const activityData = [
    { name: 'Study', value: studySecs, color: '#E8521A' },
    { name: 'Break', value: breakSecs, color: '#4A8C9E' }, // teal/blue
    { name: 'Other', value: otherSecs, color: '#7E8590' }, // grey
  ].filter((d) => d.value > 0);

  const renderSubjectLegend = () => {
    return (
      <div className="flex flex-col gap-2 justify-center h-full">
        {subjectData.map((s) => {
          const color = SUBJECT_COLORS[s.name.toLowerCase()] || s.color || '#E8521A';
          const pct = totalStudySecs > 0 ? Math.round((s.value / totalStudySecs) * 100) : 0;
          return (
            <div key={s.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground w-16 truncate" title={s.name}>
                {s.name}
              </span>
              <span className="font-medium text-foreground w-12 text-right">
                {formatTime(s.value)}
              </span>
              <span className="text-muted-foreground w-10 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderActivityLegend = () => {
    return (
      <div className="flex flex-col gap-2 justify-center h-full">
        {activityData.map((a) => {
          const pct = totalActivitySecs > 0 ? Math.round((a.value / totalActivitySecs) * 100) : 0;
          return (
            <div key={a.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: a.color }} />
              <span className="text-muted-foreground w-16">{a.name}</span>
              <span className="font-medium text-foreground w-12 text-right">
                {formatTime(a.value)}
              </span>
              <span className="text-muted-foreground w-10 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[460px]">
      {/* Top Donut - Subjects */}
      <div className="flex-1 flex gap-4 border-b border-border/50 pb-4 mb-4">
        <div className="w-1/2 relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                dataKey="value"
                stroke="none"
              >
                {subjectData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SUBJECT_COLORS[entry.name.toLowerCase()] || entry.color || '#E8521A'}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: any) => formatTime(value || 0)}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-foreground">{formatTime(totalStudySecs)}</span>
          </div>
        </div>
        <div className="w-1/2 overflow-y-auto">
          {subjectData.length > 0 ? (
            renderSubjectLegend()
          ) : (
            <div className="h-full flex items-center text-muted-foreground text-sm">
              No study data
            </div>
          )}
        </div>
      </div>

      {/* Bottom Donut - Activity */}
      <div className="flex-1 flex gap-4 relative">
        <div className="w-1/2 relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                dataKey="value"
                stroke="none"
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: any) => formatTime(value || 0)}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2">
          {activityData.length > 0 ? (
            renderActivityLegend()
          ) : (
            <div className="h-full flex items-center text-muted-foreground text-sm">
              No activity data
            </div>
          )}
        </div>

        <div className="absolute bottom-0 right-0">
          <button className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground px-2 py-1 rounded transition-colors">
            Break time by tag
          </button>
        </div>
      </div>
    </div>
  );
}
