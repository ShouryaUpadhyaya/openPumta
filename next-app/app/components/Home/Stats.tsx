"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dummySubjects = [
  { name: "Math", workSecs: 3600, goalWorkSecs: 7200 },
  { name: "Science", workSecs: 1800, goalWorkSecs: 3600 },
  { name: "History", workSecs: 5400, goalWorkSecs: 3600 },
  { name: "English", workSecs: 2700, goalWorkSecs: 5400 },
];

const dummyHabits = [
  { name: "Read", completed: true },
  { name: "Exercise", completed: false },
  { name: "Meditate", completed: true },
  { name: "Code", completed: true },
];

function Stats() {
  const [chartColors, setChartColors] = useState<string[]>([]);
  const FALLBACK_COLORS = [
    "#0088FE",
    "#FF8042",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
  ];

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const colors = [
      rootStyles.getPropertyValue("--chart-1").trim(),
      rootStyles.getPropertyValue("--chart-2").trim(),
      rootStyles.getPropertyValue("--chart-3").trim(),
      rootStyles.getPropertyValue("--chart-4").trim(),
      rootStyles.getPropertyValue("--chart-5").trim(),
    ].filter((color) => color); // Filter out empty strings if CSS variables are not found
    setChartColors(colors.length > 0 ? colors : FALLBACK_COLORS);
  }, []);

  const completedHabits = dummyHabits.filter((habit) => habit.completed).length;
  const totalHabits = dummyHabits.length;
  const habitsData = [
    { name: "Completed", value: completedHabits },
    { name: "Pending", value: totalHabits - completedHabits },
  ];

  return (
    <section className="container mr-10 py-10">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Subject Progress (in hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dummySubjects.map((s) => ({
                  ...s,
                  workHrs: s.workSecs / 3600,
                  goalHrs: s.goalWorkSecs / 3600,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="workHrs"
                  fill={chartColors[0]}
                  name="Worked Hours"
                />
                <Bar
                  dataKey="goalHrs"
                  fill={chartColors[1]}
                  name="Goal Hours"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily Habits Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={habitsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={chartColors[0]}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {habitsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
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
