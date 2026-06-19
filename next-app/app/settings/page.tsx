'use client';

import React, { useState, useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { ConvertSecsToTimer } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { AutomationSettings } from '@/components/settings/AutomationSettings';
import { AccountPreferences } from '@/components/settings/AccountPreferences';
import { DurationsSettings } from '@/components/settings/DurationsSettings';
import { ThemeColorsSettings } from '@/components/settings/ThemeColorsSettings';
import { ChartThemeSection } from '@/components/settings/ChartThemeSection';
import { DataExportSection } from '@/components/settings/DataExportSection';
import { SystemSettings } from '@/components/settings/SystemSettings';

export default function SettingsPage() {
  const store = useTimerStore();

  const [isSaving, setIsSaving] = useState(false);
  const [workColor, setWorkColor] = useState(store.workColor);
  const [shortColor, setShortColor] = useState(store.shortBreakColor);
  const [longColor, setLongColor] = useState(store.longBreakColor);

  // Keep color state in sync if store changes externally
  useEffect(() => {
    setWorkColor(store.workColor);
    setShortColor(store.shortBreakColor);
    setLongColor(store.longBreakColor);
  }, [store.workColor, store.shortBreakColor, store.longBreakColor]);

  const work = ConvertSecsToTimer({ workSecs: Math.floor(store.settings.workDuration / 1000) });
  const shortBreak = ConvertSecsToTimer({
    workSecs: Math.floor(store.settings.shortBreakDuration / 1000),
  });
  const longBreak = ConvertSecsToTimer({
    workSecs: Math.floor(store.settings.longBreakDuration / 1000),
  });

  const handleTimerSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      const getMs = (prefix: string) => {
        const h = Number(formData.get(`${prefix}Hr`)) || 0;
        const m = Number(formData.get(`${prefix}Min`)) || 0;
        const s = Number(formData.get(`${prefix}Sec`)) || 0;
        return (h * 3600 + m * 60 + s) * 1000;
      };

      const newWork = getMs('work');
      const newShort = getMs('short');
      const newLong = getMs('long');

      if (newWork < 60000) {
        toast.error('Work duration must be at least 1 minute');
        return;
      }

      store.setSettings({
        workDuration: newWork,
        shortBreakDuration: newShort,
        longBreakDuration: newLong,
      });
      store.setColors(workColor, shortColor, longColor);

      toast.success('Timer settings saved', {
        description: `${Math.floor(newWork / 60000)}m focus / ${Math.floor(newShort / 60000)}m break`,
      });
    } catch {
      toast.error('Failed to save timer settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
      </div>

      <form onSubmit={handleTimerSave} className="grid gap-6">
        <GeneralSettings />
        <AutomationSettings />
        <AccountPreferences />
        <DurationsSettings work={work} shortBreak={shortBreak} longBreak={longBreak} />

        <ThemeColorsSettings
          workColor={workColor}
          setWorkColor={setWorkColor}
          shortColor={shortColor}
          setShortColor={setShortColor}
          longColor={longColor}
          setLongColor={setLongColor}
        />

        <ChartThemeSection />

        {/* ── Save Button ──────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Save Timer Settings'}
          </Button>
        </div>

        <DataExportSection />
        <SystemSettings />
      </form>
    </div>
  );
}
