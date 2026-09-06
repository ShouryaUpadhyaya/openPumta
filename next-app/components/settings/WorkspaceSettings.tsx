import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LayoutGrid } from 'lucide-react';
import { useWorkspaceSettingsStore } from '@/store/useWorkspaceSettingsStore';

export function WorkspaceSettings() {
  const { autoArrangeNewTextBoxes, setAutoArrangeNewTextBoxes } = useWorkspaceSettingsStore();

  return (
    <Card className="bg-background border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <CardTitle>Workspace</CardTitle>
        </div>
        <CardDescription>Configure how your workspaces behave and display items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-arrange-toggle" className="text-sm font-medium">
              Auto-arrange new text boxes
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically position newly created text boxes in an organized layout without
              affecting manually arranged items.
            </p>
          </div>
          <Switch
            id="auto-arrange-toggle"
            checked={autoArrangeNewTextBoxes}
            onCheckedChange={setAutoArrangeNewTextBoxes}
          />
        </div>
      </CardContent>
    </Card>
  );
}
