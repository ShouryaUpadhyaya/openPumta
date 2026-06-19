import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import { ColorPicker } from './shared';

interface ThemeColorsSettingsProps {
  workColor: string;
  setWorkColor: (val: string) => void;
  shortColor: string;
  setShortColor: (val: string) => void;
  longColor: string;
  setLongColor: (val: string) => void;
}

export function ThemeColorsSettings({
  workColor,
  setWorkColor,
  shortColor,
  setShortColor,
  longColor,
  setLongColor,
}: ThemeColorsSettingsProps) {
  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Theme Colors</CardTitle>
        </div>
        <CardDescription>Choose an accent color for each timer phase.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ColorPicker label="Work Phase" value={workColor} onChange={setWorkColor} />
          <ColorPicker label="Short Break" value={shortColor} onChange={setShortColor} />
          <ColorPicker label="Long Break" value={longColor} onChange={setLongColor} />
        </div>
      </CardContent>
    </Card>
  );
}
