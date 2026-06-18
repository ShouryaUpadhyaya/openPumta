import * as React from 'react';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, setHours, setMinutes } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({ value, onChange, disabled, className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState<string>(value ? format(value, 'HH:mm') : '00:00');

  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTime(format(value, 'HH:mm'));
    } else {
      setDate(undefined);
      setTime('00:00');
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = setMinutes(setHours(selectedDate, hours), minutes);
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = setMinutes(setHours(date, hours), minutes);
      onChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'MMM d, yyyy h:mm a') : <span>Select date & time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border shadow-md" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} autoFocus />
        <div className="p-3 border-t border-border flex items-center justify-between gap-2 bg-muted/30">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            disabled={!date}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
