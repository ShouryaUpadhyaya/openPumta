import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface SystemGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemGuideModal({ open, onOpenChange }: SystemGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-0 gap-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2.5 rounded-xl text-primary-foreground shadow-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              The Science of Habits
            </DialogTitle>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <div className="bg-background/60 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="text-primary">1.</span> The Minimum Viable Habit
              </h3>
              <p className="text-muted-foreground mb-3">
                {`Motivation is unreliable. When you have zero energy, the friction to start a
                1-hour workout is too high. By shrinking the habit down to a 2-minute version
                (e.g., "Do 1 pushup"), you eliminate the friction of starting.`}
              </p>
              <p className="font-medium">
                <strong>The Goal:</strong> Never throw up a zero. Complete the minimum baseline to
                keep your streak alive.
              </p>
            </div>

            <div className="bg-background/60 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="text-primary">2.</span> Never Miss Twice
              </h3>
              <p className="text-muted-foreground">
                {`Missing one day is an accident. Missing two days is the start of a new (bad)
                habit. Don't aim for perfection; aim to bounce back immediately. A "minimum"
                completion counts as a win.`}
              </p>
            </div>

            <div className="bg-background/60 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="text-primary">3.</span> Identity Over Outcomes
              </h3>
              <p className="text-muted-foreground">
                Every time you complete a habit—even the minimum version—you cast a vote for the
                type of person you want to become. You are building proof of your identity, not just
                chasing a number.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-8 shadow-lg shadow-primary/20"
            >
              Got It
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
