import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

export function SystemSettings() {
  const { resetOnboarding } = useOnboardingStore();

  return (
    <>
      <Card className="bg-background border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <CardTitle>Restart Onboarding</CardTitle>
          </div>
          <CardDescription>
            Launch the welcome tour again to learn about openPumta&apos;s philosophy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            onClick={() => resetOnboarding()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Tour
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-background border-border/40 shadow-sm border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Clear Local Data</CardTitle>
          </div>
          <CardDescription>
            Remove all local storage and clear the cache. This will log you out if you are using a
            guest account or offline mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all local data and cache?')) {
                window.localStorage.clear();
                queryClient.clear();
                toast.success('Local data and cache cleared');
                window.location.href = '/';
              }
            }}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Local Data
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
