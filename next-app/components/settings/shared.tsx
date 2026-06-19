import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

export const PRESET_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#71717a', // Zinc
];

export interface TimeInputGroupProps {
  label: string;
  prefix: string;
  defaultVal: { hours: number; minutes: number; seconds: number };
}

export function TimeInputGroup({ label, prefix, defaultVal }: TimeInputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1 p-2 rounded-lg bg-muted/30 border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all w-fit">
        <Input
          name={`${prefix}Hr`}
          type="number"
          min={0}
          defaultValue={defaultVal.hours}
          className="w-14 h-9 border-0 bg-transparent text-center text-base focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
          placeholder="00"
        />
        <span className="text-muted-foreground font-semibold text-lg">:</span>
        <Input
          name={`${prefix}Min`}
          type="number"
          min={0}
          max={59}
          defaultValue={defaultVal.minutes}
          className="w-14 h-9 border-0 bg-transparent text-center text-base focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
          placeholder="00"
        />
        <span className="text-muted-foreground font-semibold text-lg">:</span>
        <Input
          name={`${prefix}Sec`}
          type="number"
          min={0}
          max={59}
          defaultValue={defaultVal.seconds}
          className="w-14 h-9 border-0 bg-transparent text-center text-base focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
          placeholder="00"
        />
      </div>
    </div>
  );
}

export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex flex-wrap gap-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="group relative h-8 w-8 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm"
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <Check className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            )}
            <span className="sr-only">Select color {color}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
