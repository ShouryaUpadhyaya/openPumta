import React from 'react';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { PRESET_COLORS } from './constants';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Subject Color
      </Label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="group relative h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: c }}
          >
            {color === c && (
              <Check className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            )}
            <span className="sr-only">Select color {c}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
