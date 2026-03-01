'use client';
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const dummySubjects = [
  { name: 'Math', workSecs: 3600, goalWorkSecs: 7200 },
  { name: 'Science', workSecs: 1800, goalWorkSecs: 3600 },
  { name: 'History', workSecs: 5400, goalWorkSecs: 3600 },
  { name: 'English', workSecs: 2700, goalWorkSecs: 5400 },
];

const dummyHabits = [
  { name: 'Read', completed: true },
  { name: 'Exercise', completed: false },
  { name: 'Meditate', completed: true },
  { name: 'Code', completed: true },
];

const FALLBACK_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF8042'];

function Stats() {
  const [chartColors, setChartColors] = useState<string[]>(FALLBACK_COLORS);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const colors = [
      rootStyles.getPropertyValue('--chart-1').trim(),
      rootStyles.getPropertyValue('--chart-2').trim(),
      rootStyles.getPropertyValue('--chart-3').trim(),
      rootStyles.getPropertyValue('--chart-4').trim(),
      rootStyles.getPropertyValue('--chart-5').trim(),
    ].filter((color) => color);

    if (colors.length > 0) {
      requestAnimationFrame(() => {
        setChartColors(colors);
      });
    }
  }, []);

  const completedHabits = dummyHabits.filter((habit) => habit.completed).length;
  const totalHabits = dummyHabits.length;
  const habitsData = [
    { name: 'Completed', value: completedHabits },
    { name: 'Pending', value: totalHabits - completedHabits },
  ];

  return (
    <section className="flex flex-col h-full p-4 overflow-hidden">
      <h1 className="text-2xl font-bold mb-4 shrink-0">Statistics</h1>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium">Subject Progress (hrs)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dummySubjects.map((s) => ({
                  ...s,
                  workHrs: s.workSecs / 3600,
                  goalHrs: s.goalWorkSecs / 3600,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="workHrs" fill={chartColors[0]} radius={[2, 2, 0, 0]} name="Worked" />
                <Bar dataKey="goalHrs" fill={chartColors[1]} radius={[2, 2, 0, 0]} name="Goal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-medium">Habit Completion</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={habitsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  fill={chartColors[0]}
                  dataKey="value"
                >
                  {habitsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default Stats;
