import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, BarChart3 } from 'lucide-react';
import { useChartThemeStore, CHART_THEMES } from '@/store/useChartThemeStore';
import { toast } from 'sonner';

export function ChartThemeSection() {
  const { themeId, setThemeId } = useChartThemeStore();

  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Graph Theme</CardTitle>
        </div>
        <CardDescription>
          Choose a color palette for charts and graphs on the Stats page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Available Themes
          </Label>
          <div className="flex flex-wrap gap-4">
            {CHART_THEMES.map((t) => {
              const c1 = t.colors[0];
              const c2 = t.colors[1] || t.colors[0];
              const c3 = t.colors[2] || t.colors[0];
              const isSelected = themeId === t.id;

              return (
                <div key={t.id} className="flex flex-col items-center gap-1.5 group/theme">
                  <button
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      toast.success(`Graph theme set to ${t.name}`);
                    }}
                    className="group relative h-8 w-8 rounded-full  transition-transform hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${c1} 33%, ${c2} 33% 66%, ${c3} 66%)`,
                    }}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    )}
                    <span className="sr-only">Select theme {t.name}</span>
                  </button>
                  <span
                    className={`text-[10px] font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover/theme:text-foreground'}`}
                  >
                    {t.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
