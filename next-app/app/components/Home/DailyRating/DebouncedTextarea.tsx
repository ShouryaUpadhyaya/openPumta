import React, { useState, useEffect, useRef } from 'react';
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
  const [prevInitial, setPrevInitial] = useState(initialValue);

  if (initialValue !== prevInitial) {
    setPrevInitial(initialValue);
    if (!isFocused) {
      setVal(initialValue);
    }
  }

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const debouncedOnChangeRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedOnChangeRef.current = debounce((newVal: string) => {
      onChangeRef.current(newVal);
    }, 2000);

    return () => {
      debouncedOnChangeRef.current?.cancel();
    };
  }, []);

  return (
    <Textarea
      placeholder={placeholder}
      className={className}
      value={val}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(e) => {
        setVal(e.target.value);
        debouncedOnChangeRef.current?.(e.target.value);
      }}
    />
  );
}
