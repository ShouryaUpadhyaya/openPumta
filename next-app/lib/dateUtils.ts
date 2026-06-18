export function getStartOfDay(startOfDayOffset: string, date: Date = new Date()): Date {
  const [offsetHours, offsetMinutes] = startOfDayOffset.split(':').map(Number);

  const targetDate = new Date(date);

  // If the current time is before the startOfDayOffset, we belong to the "previous" day logically
  const currentHours = targetDate.getHours();
  const currentMinutes = targetDate.getMinutes();

  if (
    currentHours < offsetHours ||
    (currentHours === offsetHours && currentMinutes < offsetMinutes)
  ) {
    targetDate.setDate(targetDate.getDate() - 1);
  }

  targetDate.setHours(offsetHours, offsetMinutes, 0, 0);
  return targetDate;
}

export function getEndOfDay(startOfDayOffset: string, date: Date = new Date()): Date {
  const startOfDay = getStartOfDay(startOfDayOffset, date);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1);
  return endOfDay;
}
