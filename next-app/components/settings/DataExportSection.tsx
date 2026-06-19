import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import api from '@/lib/api';
import { computeAllMetricsBundle } from '@/app/stats/lib/metrics';

export function DataExportSection() {
  const { user } = useAuthStore();
  const [isExportingStats, setIsExportingStats] = useState(false);

  const handleExport = async (format: 'json' | 'txt') => {
    if (!user) return;

    try {
      const response = await api.get(`/export?format=${format}`, {
        responseType: 'blob',
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `openpumta-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data exported as ${format.toUpperCase()} successfully`);
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleExportStats = async () => {
    if (!user) return;
    setIsExportingStats(true);

    try {
      // Fetch required raw data directly
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 21);
      const fromStr = from.toISOString();
      const toStr = to.toISOString();

      const [dashboardRes, subjectsRes, ratingRes, todosRes, habitsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get(`/subject/stats?from=${fromStr}&to=${toStr}`),
        api.get('/daily-rating/stats'),
        api.get('/todo'),
        api.get(`/habits/logs`, { params: { from: fromStr } }),
      ]);

      const statsData = dashboardRes.data.data;
      const subjects = subjectsRes.data.data;
      const ratingStats = ratingRes.data.data;
      const todos = todosRes.data.data;
      const habitsData = habitsRes.data.data;

      // Compute all complex metrics on the client
      const bundle = computeAllMetricsBundle(statsData, subjects, habitsData, todos, ratingStats);

      // Create downloadable JSON blob
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'openpumta-stats-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Stats computed and exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to compute and export stats');
    } finally {
      setIsExportingStats(false);
    }
  };

  return (
    <Card className="bg-background border-border/40 shadow-sm" data-tour-highlight="export-section">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Data Export</CardTitle>
        </div>
        <CardDescription>
          Download a copy of all your Openpumta data, including subjects, habits, tasks, and daily
          ratings.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Button
          type="button"
          onClick={() => handleExport('json')}
          variant="default"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export as JSON
        </Button>
        <Button
          type="button"
          onClick={() => handleExport('txt')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export as Text
        </Button>
        <Button
          type="button"
          onClick={handleExportStats}
          variant="secondary"
          className="flex items-center gap-2"
          disabled={isExportingStats}
        >
          {isExportingStats ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Computing...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              Export Stats
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
