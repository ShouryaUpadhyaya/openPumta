import React from 'react';
import { BookOpen } from 'lucide-react';
import { AddSubjectDialog } from './AddSubjectDialog';
import { Habit } from '@/hooks/useHabits';

interface CallToActionProps {
  habits: Habit[];
}

const CallToAction = ({ habits }: CallToActionProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-primary mb-4" />

      <h3 className="text-xl font-bold tracking-tight mb-2">Start your focus journey</h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Create your first subject and start tracking your study sessions. Your focus time, streaks,
        and analytics will appear here.
      </p>

      <AddSubjectDialog habits={habits} empty={true} />
    </div>
  );
};

export default CallToAction;
