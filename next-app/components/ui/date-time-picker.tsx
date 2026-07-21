import * as React from 'react';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, setHours, setMinutes } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({ value, onChange, disabled, className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [hour, setHour] = React.useState<string>(value ? format(value, 'HH') : '00');
  const [minute, setMinute] = React.useState<string>(value ? format(value, 'mm') : '00');

  React.useEffect(() => {
    if (value) {
      setDate(value);
      setHour(format(value, 'HH'));
      setMinute(format(value, 'mm'));
    } else {
      setDate(undefined);
      setHour('00');
      setMinute('00');
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const newDate = setMinutes(setHours(selectedDate, parseInt(hour)), parseInt(minute));
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    if (date) {
      const newDate = setHours(date, parseInt(newHour));
      onChange(newDate);
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    if (date) {
      const newDate = setMinutes(date, parseInt(newMinute));
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
        <div className="p-3 border-t border-border flex items-center justify-between gap-2 bg-muted/10">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-1 items-center gap-2">
            <Select value={hour} onValueChange={handleHourChange} disabled={!date}>
              <SelectTrigger className="w-full text-center h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                {Array.from({ length: 24 }).map((_, i) => {
                  const val = String(i).padStart(2, '0');
                  return (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground font-bold">:</span>
            <Select value={minute} onValueChange={handleMinuteChange} disabled={!date}>
              <SelectTrigger className="w-full text-center h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="h-[200px]">
                {Array.from({ length: 60 }).map((_, i) => {
                  const val = String(i).padStart(2, '0');
                  return (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
