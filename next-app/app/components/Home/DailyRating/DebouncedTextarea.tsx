import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import debounce from 'lodash/debounce';

export function DebouncedTextarea({
  initialValue,
  onChange,
  placeholder,
  className,
}: {
  initialValue: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [val, setVal] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setVal(initialValue);
    }
  }, [initialValue, isFocused]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((newVal: string) => onChange(newVal), 1000),
    [onChange],
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.flush();
    };
  }, [debouncedOnChange]);

  return (
    <Textarea
      placeholder={placeholder}
      className={className}
      value={val}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        debouncedOnChange.flush();
      }}
      onChange={(e) => {
        setVal(e.target.value);
        debouncedOnChange(e.target.value);
      }}
    />
  );
}
