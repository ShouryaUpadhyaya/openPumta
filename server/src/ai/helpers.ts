export function durationSecs(log: { startedAt: Date; endedAt: Date | null }): number {
  if (!log.endedAt) return 0;
  const start = new Date(log.startedAt).getTime();
  const end = new Date(log.endedAt).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 1000);
}

export function dayKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function lastNDays(n: number, today: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
export const avg = (arr: number[]): number => (arr.length ? sum(arr) / arr.length : 0);
export const round1 = (n: number): number => Math.round(n * 10) / 10;
