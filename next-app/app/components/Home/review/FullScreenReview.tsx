'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Maximize2, Info, Save } from 'lucide-react';
import { getLocalIsoDate } from '@/lib/utils';
import { useDailyRatingByDate, useSubmitDailyRating, useUpdateReviewTemplate } from '@/hooks/useRatings';
import { DynamicReviewEditor } from './DynamicReviewEditor';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import debounce from 'lodash/debounce';

interface FullScreenReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: Date;
}

export default function FullScreenReview({ open, onOpenChange, initialDate }: FullScreenReviewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const selectedDateStr = getLocalIsoDate(selectedDate);
  const isToday = selectedDateStr === getLocalIsoDate(new Date());

  const { data, isLoading } = useDailyRatingByDate(selectedDateStr);
  const submitRating = useSubmitDailyRating();
  const updateTemplate = useUpdateReviewTemplate();

  const [rating, setRating] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<number>(0);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editorContent, setEditorContent] = useState<any[] | null>(null);

  useEffect(() => {
    if (data) {
      setRating(data.rating?.rating || 0);
      
      // If there's existing content, load it. Otherwise, load the template.
      if (data.rating?.content && (data.rating.content as any[]).length > 0) {
        setEditorContent(data.rating.content as any[]);
      } else if (data.template && (data.template as any[]).length > 0) {
        setEditorContent(data.template as any[]);
      } else {
        setEditorContent([]); // empty editor
      }
    }
  }, [data, selectedDateStr]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    submitRating.mutate({
      rating: newRating,
      date: selectedDateStr,
      content: editorContent || undefined,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounce((newContent: any[], currentRating: number) => {
      submitRating.mutate({
        rating: currentRating,
        date: selectedDateStr,
        content: newContent,
      });
    }, 1000),
    [selectedDateStr, submitRating]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleContentChange = (newContent: any[]) => {
    setEditorContent(newContent);
    debouncedSaveContent(newContent, rating);
  };

  const handleSaveAsTemplate = () => {
    if (!editorContent || editorContent.length === 0) {
      toast.error('Cannot save an empty template');
      return;
    }
    updateTemplate.mutate({ template: editorContent }, {
      onSuccess: () => toast.success('Saved as your daily review template!'),
      onError: () => toast.error('Failed to save template'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background">
        <DialogHeader className="p-4 md:p-6 border-b shrink-0 flex flex-row items-center justify-between sticky top-0 bg-background/80 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">Daily Review</DialogTitle>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  <p className="font-semibold mb-1">Journaling & Tracking</p>
                  <p>Reflect on your day, write notes, and track daily habits using checkbox blocks (e.g., `- [ ] Exercise`). Checkboxes are automatically analyzed in the Stats page!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center bg-muted/30 rounded-full border border-muted-foreground/20 px-1 py-0.5">
            <button
              onClick={() => setSelectedDate((d) => {
                const nd = new Date(d);
                nd.setDate(nd.getDate() - 1);
                return nd;
              })}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-semibold px-4 w-32 text-center">
              {isToday ? 'Today' : selectedDateStr}
            </span>
            <button
              onClick={() => setSelectedDate((d) => {
                const nd = new Date(d);
                nd.setDate(nd.getDate() + 1);
                return nd;
              })}
              disabled={isToday}
              className="p-1.5 hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveAsTemplate} className="hidden md:flex gap-2 rounded-xl">
              <Save className="h-4 w-4" />
              Save as Template
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Rating Section */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-2xl border border-dashed gap-3">
                <span className="text-sm font-medium text-muted-foreground">How was your day?</span>
                <div className="flex gap-2" onMouseLeave={() => setIsHovering(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-transform hover:scale-110 focus:outline-none"
                      onMouseEnter={() => setIsHovering(star)}
                      onClick={() => handleRatingChange(star)}
                    >
                      <Star
                        className={`h-10 w-10 ${
                          isHovering >= star || (!isHovering && rating >= star)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground opacity-30 cursor-pointer'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <span className="text-sm font-bold text-foreground">
                    {rating} / 5
                  </span>
                )}
              </div>

              {/* Editor Section */}
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-semibold text-muted-foreground">Journal & Tracking</span>
                  <Button variant="ghost" size="sm" onClick={handleSaveAsTemplate} className="md:hidden text-xs h-7 px-2">
                    <Save className="h-3 w-3 mr-1" />
                    Save Template
                  </Button>
                </div>
                
                {editorContent !== null && (
                  <div className="flex-1 bg-card rounded-2xl border p-2 min-h-[400px]">
                    {/* The dynamic wrapper prevents SSR hydration mismatch */}
                    <DynamicReviewEditor 
                      initialContent={editorContent} 
                      onChange={handleContentChange} 
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
