import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface DailySubjectFocus {
  date: string; // YYYY-MM-DD
  [subjectName: string]: number | string; // hours per subject, plus 'date'
}

interface FocusStackedBarProps {
  data: DailySubjectFocus[];
  subjects: { name: string; color: string }[];
  onBarClick?: (dateStr: string) => void;
}

// Fallback colors for specific tags if not provided by backend
const SUBJECT_COLORS: Record<string, string> = {
  coding: '#E8521A',
  dsa: '#C4840A',
  devops: '#2A7A7A',
  backend: '#3A5A8A',
  exam: '#C44A2A',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Sort to show highest first
    const sorted = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-md">
        <p className="text-sm font-bold text-foreground mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          {sorted.map((entry, index) => {
            const hours = Math.floor(entry.value);
            const mins = Math.round((entry.value - hours) * 60);
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium text-foreground">
                  {hours > 0 ? `${hours}h ` : ''}
                  {mins}m
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedLabel = (props: any) => {
  const { x, y, width, height, value, name, payload } = props;

  if (!payload) return null;

  // Find the max subject for this day to only show one label per bar
  let maxSubject = '';
  let maxVal = 0;
  Object.keys(payload).forEach((key) => {
    if (key !== 'date' && typeof payload[key] === 'number') {
      if (payload[key] > maxVal) {
        maxVal = payload[key];
        maxSubject = key;
      }
    }
  });

  // Only render label if this segment is the max subject AND it's tall enough
  if (name !== maxSubject || height < 20 || value === 0) {
    return null;
  }

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      fontSize={10}
      fontWeight="bold"
      textAnchor="middle"
      dominantBaseline="middle"
      className="pointer-events-none"
    >
      {name}
    </text>
  );
};

export default function FocusStackedBar({ data, subjects, onBarClick }: FocusStackedBarProps) {
  const formattedData = useMemo(() => {
    return data.map((d) => {
      const dateObj = new Date(d.date);
      return {
        ...d,
        displayDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
      };
    });
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[320px]">
      <h3 className="text-lg font-bold text-foreground mb-4">Focus Time — Last 21 Days</h3>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0 && onBarClick) {
                onBarClick(e.activePayload[0].payload.date);
              }
            }}
          >
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              interval={2} // Show every 3rd label roughly
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}h`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />

            {subjects.map((subject, idx) => (
              <Bar
                key={subject.name}
                dataKey={subject.name}
                stackId="a"
                fill={
                  SUBJECT_COLORS[subject.name.toLowerCase()] || subject.color || 'var(--primary)'
                }
                radius={
                  // Round top corners of the top-most bar segment. Recharts handles this partially,
                  // but we apply it to all and let stack overlapping handle the rest.
                  idx === subjects.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                }
              >
                {/* Custom label to only show the largest segment */}
                <CustomizedLabel />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
