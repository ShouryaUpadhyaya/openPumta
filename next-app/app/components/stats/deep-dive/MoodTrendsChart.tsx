import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MoodTrendsChart({ history }: { history: any[] }) {
  const data = useMemo(() => {
    if (!history?.length) return [];
    
    // Sort chronological
    const sorted = [...history]
      .filter(h => h.rating > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    // Calculate a 7-day moving average to smooth the line
    return sorted.map((entry, idx) => {
      let sum = 0;
      let count = 0;
      for (let i = Math.max(0, idx - 6); i <= idx; i++) {
        sum += sorted[i].rating;
        count++;
      }
      return {
        date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(entry.date)),
        rating: entry.rating,
        movingAvg: Math.round((sum / count) * 10) / 10
      };
    });
  }, [history]);

  if (!data.length) return null;

  return (
    <div className="bg-card border rounded-xl p-4 md:p-6 flex flex-col h-[300px]">
      <h3 className="text-lg font-bold mb-4">Mood Trends (90 Days)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="movingAvg" name="7-Day Avg" stroke="#eab308" strokeWidth={3} fill="url(#colorMood)" />
            <Area type="monotone" dataKey="rating" name="Daily Rating" stroke="#eab308" strokeOpacity={0.3} strokeWidth={1} fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
