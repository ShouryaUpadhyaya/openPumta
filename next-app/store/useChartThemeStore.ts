'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChartTheme {
  id: string;
  name: string;
  colors: string[];
  // gradient stops for area charts
  gradientFrom: string;
  gradientTo: string;
}

export const CHART_THEMES: ChartTheme[] = [
  {
    id: 'ember',
    name: 'Ember',
    colors: ['#f97316', '#fb923c', '#fdba74', '#ef4444', '#f87171', '#fca5a5'],
    gradientFrom: '#f97316',
    gradientTo: '#f9731600',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#06b6d4', '#22d3ee', '#67e8f9', '#3b82f6', '#60a5fa', '#93c5fd'],
    gradientFrom: '#06b6d4',
    gradientTo: '#06b6d400',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: ['#a855f7', '#c084fc', '#d8b4fe', '#ec4899', '#f472b6', '#f9a8d4'],
    gradientFrom: '#a855f7',
    gradientTo: '#a855f700',
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#22c55e', '#4ade80', '#86efac', '#14b8a6', '#2dd4bf', '#5eead4'],
    gradientFrom: '#22c55e',
    gradientTo: '#22c55e00',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#fbbf24', '#fde68a'],
    gradientFrom: '#f43f5e',
    gradientTo: '#f43f5e00',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#a1a1aa', '#d4d4d8', '#e4e4e7', '#71717a', '#52525b', '#3f3f46'],
    gradientFrom: '#a1a1aa',
    gradientTo: '#a1a1aa00',
  },
];

interface ChartThemeState {
  themeId: string;
  getTheme: () => ChartTheme;
  setThemeId: (id: string) => void;
}

export const useChartThemeStore = create<ChartThemeState>()(
  persist(
    (set, get) => ({
      themeId: 'ember',
      getTheme: () => {
        const found = CHART_THEMES.find((t) => t.id === get().themeId);
        return found || CHART_THEMES[0];
      },
      setThemeId: (id) => set({ themeId: id }),
    }),
    {
      name: 'chart-theme-storage',
    },
  ),
);
