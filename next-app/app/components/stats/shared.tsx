import React from 'react';

// ─── Custom Recharts Tooltip ────────────────────────────────────────────────

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

export function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  className = '',
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/5 ${className}`}
    >
      <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase truncate">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini Stat Tile ─────────────────────────────────────────────────────────

export function MiniStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/20 border border-border/20">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Fading Divider Stat Table ──────────────────────────────────────────────
// Excel-like table with no outer border, fading divider lines between rows.
// Each row has a label and a value. Groups numbers in a clean, data-dense format.

export interface StatRow {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string; // per-row color override
}

export function StatTable({ rows, accent }: { rows: StatRow[]; accent: string }) {
  return (
    <div className="w-full">
      {rows.map((row, i) => (
        <div key={i} className="relative">
          <div className="flex items-center justify-between py-2.5 px-1">
            <span className="text-xs text-muted-foreground font-medium">{row.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: row.accent || accent }}
              >
                {row.value}
              </span>
              {row.sub && <span className="text-[10px] text-muted-foreground">{row.sub}</span>}
            </div>
          </div>
          {/* Fading divider — not on last row */}
          {i < rows.length - 1 && (
            <div
              className="h-px"
              style={{
                background: `linear-gradient(to right, transparent 0%, ${accent}25 20%, ${accent}20 80%, transparent 100%)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  icon: Icon,
  accent,
}: {
  title: string;
  icon: any;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4" style={{ color: accent }} />
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: accent }}>
        {title}
      </h3>
    </div>
  );
}

// ─── Heat Cell ──────────────────────────────────────────────────────────────

export function HeatCell({
  intensity,
  label,
  value,
  accent,
}: {
  intensity: number;
  label: string;
  value: string;
  accent: string;
}) {
  const opacity = Math.max(0.05, intensity);
  return (
    <div
      className="group relative flex items-center justify-center rounded-md aspect-square cursor-default transition-transform hover:scale-110"
      style={{ backgroundColor: accent, opacity: 0.1 + opacity * 0.9 }}
    >
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border/50 rounded-lg px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10 pointer-events-none text-foreground">
        {label}: {value}
      </div>
    </div>
  );
}

// ─── Horizontal Bar ─────────────────────────────────────────────────────────

export function HBar({
  label,
  value,
  maxValue,
  color,
  suffix = '',
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  suffix?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0 text-right truncate">
        {label}
      </span>
      <div className="flex-1 h-4 bg-muted/20 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
        {value}
        {suffix}
      </span>
    </div>
  );
}
