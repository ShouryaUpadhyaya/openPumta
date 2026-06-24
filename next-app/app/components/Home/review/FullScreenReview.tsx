'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Save, Trash2, GripVertical, Plus, X } from 'lucide-react';
import { getLocalIsoDate } from '@/lib/utils';
import {
  useDailyRatingByDate,
  useSubmitDailyRating,
  useUpdateReviewTemplate,
} from '@/hooks/useRatings';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Habits from '../Habits';

// --- DEBOUNCED TEXTAREA COMPONENT ---
function DebouncedTextarea({
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

// --- DEBOUNCED INPUT COMPONENT ---
function DebouncedInput({
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
    <Input
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

interface FullScreenReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: Date;
}

export default function FullScreenReview({
  open,
  onOpenChange,
  initialDate,
}: FullScreenReviewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const selectedDateStr = getLocalIsoDate(selectedDate);
  const isToday = selectedDateStr === getLocalIsoDate(new Date());

  const { data, isLoading, isFetching } = useDailyRatingByDate(selectedDateStr);
  const submitRating = useSubmitDailyRating();
  const updateTemplate = useUpdateReviewTemplate();

  const [rating, setRating] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<number>(0);

  const [journal, setJournal] = useState('');
  const [customQuestions, setCustomQuestions] = useState<
    { id: string; question: string; answer: string }[]
  >([]);

  const [isTemplateEdited, setIsTemplateEdited] = useState(false);

  const lastInitializedDate = useRef<string | null>(null);

  useEffect(() => {
    if (data && !isFetching && lastInitializedDate.current !== selectedDateStr) {
      setRating(data.rating?.rating || 0);

      const content = data.rating?.content || data.template;
      if (content && Array.isArray(content)) {
        // Legacy BlockNote format
        setJournal('Legacy review format detected. This review was written in the old editor.');
        setCustomQuestions([]);
      } else if (content) {
        setJournal((content as any).journal || '');
        setCustomQuestions((content as any).customQuestions || []);
      } else {
        setJournal('');
        setCustomQuestions([]);
      }

      lastInitializedDate.current = selectedDateStr;
    }
  }, [data, isFetching, selectedDateStr]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    saveData(newRating, journal, customQuestions);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveContent = useCallback(
    debounce((r, j, cq) => {
      submitRating.mutate({
        rating: r === 0 ? undefined : r,
        date: selectedDateStr,
        content: { journal: j, customQuestions: cq },
      });
    }, 1000),
    [selectedDateStr, submitRating],
  );

  const saveData = (r: number, j: string, cq: any[]) => {
    debouncedSaveContent(r, j, cq);
  };

  const handleSaveAsTemplate = () => {
    updateTemplate.mutate(
      {
        template: {
          journal: '',
          customQuestions: customQuestions.map((q) => ({ ...q, answer: '' })),
        },
      },
      {
        onSuccess: () => {
          toast.success('Saved as your daily review template!');
          setIsTemplateEdited(false);
        },
        onError: () => toast.error('Failed to save template'),
      },
    );
  };

  const addQuestion = () => {
    const newQ = { id: Math.random().toString(), question: 'New Question', answer: '' };
    const updated = [...customQuestions, newQ];
    setCustomQuestions(updated);
    setIsTemplateEdited(true);
    saveData(rating, journal, updated);
  };

  const updateQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    const updated = customQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q));
    setCustomQuestions(updated);
    if (field === 'question') {
      setIsTemplateEdited(true);
    }
    saveData(rating, journal, updated);
  };

  const removeQuestion = (id: string) => {
    const updated = customQuestions.filter((q) => q.id !== id);
    setCustomQuestions(updated);
    setIsTemplateEdited(true);
    saveData(rating, journal, updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:min-w-4xl md:min-w-3xl max-w-4xl w-full h-[100dvh] md:h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-none md:rounded-3xl bg-background border-0 md:border">
        <DialogHeader className="p-4 md:p-8 border-b shrink-0 flex flex-row items-center justify-between sticky top-0 bg-background/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setSelectedDate((d) => {
                  const nd = new Date(d);
                  nd.setDate(nd.getDate() - 1);
                  return nd;
                })
              }
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <DialogTitle className="text-xl md:text-2xl font-bold flex flex-col items-center tracking-tight text-foreground">
              <span className="hidden sm:inline">Daily Review</span>
              <span className="inline sm:hidden">Review</span>
              <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider text-center">
                {isToday ? 'Today' : selectedDateStr}
              </span>
            </DialogTitle>
            <button
              onClick={() =>
                setSelectedDate((d) => {
                  const nd = new Date(d);
                  nd.setDate(nd.getDate() + 1);
                  return nd;
                })
              }
              disabled={isToday}
              className="p-1 hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {isTemplateEdited && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAsTemplate}
                className="flex gap-1 md:gap-2 rounded-xl font-semibold px-2 md:px-3 text-[10px] md:text-sm h-8"
              >
                <Save className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Save Template</span>
                <span className="inline sm:hidden">Save</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 md:gap-10 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Rating Section */}
              <div className="flex flex-col items-center justify-center gap-3 mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Main Rating
                </span>
                <div className="flex gap-1 md:gap-2" onMouseLeave={() => setIsHovering(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-transform hover:scale-110 focus:outline-none"
                      onMouseEnter={() => setIsHovering(star)}
                      onClick={() => handleRatingChange(star)}
                    >
                      <Star
                        className={`h-8 w-8 md:h-10 md:w-10 ${
                          isHovering >= star || (!isHovering && rating >= star)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground opacity-30 cursor-pointer'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Section */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Journal
                </span>
                <DebouncedTextarea
                  placeholder="How was your day?"
                  className="min-h-[120px] resize-none rounded-2xl bg-muted/20 border-border text-base p-4"
                  initialValue={journal}
                  onChange={(newVal) => {
                    setJournal(newVal);
                    saveData(rating, newVal, customQuestions);
                  }}
                />
              </div>

              {/* Custom Questions Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Custom Questions
                  </span>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addQuestion}
                      className="h-8 px-3 text-xs font-semibold rounded-full bg-muted/50"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                </div>
                {customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col gap-3 p-4 bg-muted/10 rounded-2xl border border-border/50 group transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground/30 cursor-grab" />
                      <DebouncedInput
                        initialValue={q.question}
                        onChange={(newVal) => updateQuestion(q.id, 'question', newVal)}
                        className="h-9 font-semibold bg-transparent border-none px-0 shadow-none focus-visible:ring-0 text-base"
                        placeholder="Question..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <DebouncedTextarea
                      initialValue={q.answer}
                      onChange={(newVal) => updateQuestion(q.id, 'answer', newVal)}
                      className="min-h-[80px] resize-none text-base bg-background border-border/50 focus-visible:ring-1 rounded-xl p-3"
                      placeholder="Your answer..."
                    />
                  </div>
                ))}
              </div>

              {/* Habits Section */}
              <div className="flex flex-col gap-4 mb-20">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Daily Habits
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Habits passedDate={selectedDate} hideDatePicker={true} />
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
