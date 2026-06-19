import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from 'sonner';

export function AccountPreferences() {
  const { user } = useAuthStore();

  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Account Preferences</CardTitle>
        </div>
        <CardDescription>
          Configure how the dashboard calculates daily stats and habits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="start-of-day" className="text-sm font-medium">
              Start of Day
            </Label>
            <p className="text-xs text-muted-foreground">
              When should the timers and habits reset? (Default is 05:00 AM)
            </p>
          </div>
          <TimePicker
            value={user?.startOfDay || '05:00'}
            onChange={(val) => {
              if (val) {
                useAuthStore.getState().updateUserPreferences({ startOfDay: val });
                toast.success('Start of day updated to ' + val);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
