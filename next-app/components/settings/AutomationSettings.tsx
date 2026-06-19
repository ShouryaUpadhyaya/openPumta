import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Zap } from 'lucide-react';
import { useTimerStore } from '@/store/useTimerStore';
import { toast } from 'sonner';

export function AutomationSettings() {
  const store = useTimerStore();

  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle>Automation</CardTitle>
        </div>
        <CardDescription>
          Control automatic transitions between work and break sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-break-toggle" className="text-sm font-medium">
              Auto-start Breaks
            </Label>
            <p className="text-xs text-muted-foreground">
              Start break timer automatically after work session.
            </p>
          </div>
          <Switch
            id="auto-break-toggle"
            checked={store.settings.autoStartBreaks}
            onCheckedChange={(checked) => store.setSettings({ autoStartBreaks: checked })}
          />
        </div>
        <Separator className="bg-border/40" />
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-work-toggle" className="text-sm font-medium">
              Auto-start Work
            </Label>
            <p className="text-xs text-muted-foreground">
              Start next work session automatically after break.
            </p>
          </div>
          <Switch
            id="auto-work-toggle"
            checked={store.settings.autoStartWork}
            onCheckedChange={(checked) => store.setSettings({ autoStartWork: checked })}
          />
        </div>
        <Separator className="bg-border/40" />
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-toggle" className="text-sm font-medium">
              Desktop Notifications
            </Label>
            <p className="text-xs text-muted-foreground">
              Get notified when a session or break ends.
            </p>
          </div>
          <Switch
            id="notifications-toggle"
            checked={store.settings.notificationsEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                if ('Notification' in window) {
                  Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                      store.setSettings({ notificationsEnabled: true });
                      toast.success('Notifications enabled');
                    } else {
                      toast.error('Notification permission denied by browser.');
                      store.setSettings({ notificationsEnabled: false });
                    }
                  });
                } else {
                  toast.error('Notifications are not supported in this browser.');
                }
              } else {
                store.setSettings({ notificationsEnabled: false });
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
