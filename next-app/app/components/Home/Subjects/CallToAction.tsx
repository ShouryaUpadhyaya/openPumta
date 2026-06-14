import React from 'react';
import { BookOpen } from 'lucide-react';

const CallToAction = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-orange-500 mb-4" />

      <h3 className="text-lg font-semibold">Start tracking your study sessions</h3>

      <p className="text-sm text-muted-foreground max-w-sm mt-2">
        Create your first subject and start a focus session. Your study time, streaks and analytics
        will appear here.
      </p>
    </div>
  );
};

export default CallToAction;
