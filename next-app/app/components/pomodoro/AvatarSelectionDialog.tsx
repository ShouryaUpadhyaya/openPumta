'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AVATAR_SETS, AVATAR_MILESTONES, getAvatarImagePath, AvatarSet } from '@/lib/avatarConfig';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function AvatarSelectionDialog({ children }: { children: React.ReactNode }) {
  const { user, updateUserPreferences } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AvatarSet>(
    (user?.activeAvatar as AvatarSet) || 'warrior',
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async () => {
    setIsUpdating(true);
    try {
      await updateUserPreferences({ activeAvatar: activeTab });
      toast.success('Avatar updated!');
      setOpen(false);
    } catch {
      toast.error('Failed to update avatar');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Purchase Studicon</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Select your focus companion.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as AvatarSet)}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex justify-center mb-4">
            <TabsList className="bg-zinc-900 overflow-x-auto max-w-full justify-start sm:justify-center">
              {AVATAR_SETS.map((set) => (
                <TabsTrigger
                  key={set.id}
                  value={set.id}
                  className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                >
                  {set.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {AVATAR_SETS.map((set) => (
              <TabsContent key={set.id} value={set.id} className="mt-0 outline-none">
                <div className="flex flex-col items-center mb-8">
                  <div className="text-sm text-zinc-400 mb-2 flex gap-2">
                    <span className="bg-zinc-800 px-2 py-1 rounded-full">#{set.id}</span>
                    <span className="bg-zinc-800 px-2 py-1 rounded-full">#Growth</span>
                  </div>
                  <p className="text-center text-zinc-400 italic mt-4 px-4 bg-zinc-900 py-4 rounded-lg">
                    &quot;{set.description}&quot;
                  </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-8">
                  {/* We reverse milestones to show highest first as in screenshot */}
                  {[...AVATAR_MILESTONES].reverse().map((milestone) => (
                    <div key={milestone.stage} className="flex flex-col items-center group">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 transition-transform group-hover:scale-110">
                        <Image
                          src={getAvatarImagePath(set.id, milestone.stage)}
                          alt={`Stage ${milestone.stage}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-orange-500 text-xs sm:text-sm mt-2 font-mono">
                        souryaUp
                      </div>
                      <div className="text-orange-500/70 text-xs font-mono">{milestone.label}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="pt-4 border-t border-zinc-800 flex justify-center">
          <Button
            onClick={handleSelect}
            disabled={isUpdating || user?.activeAvatar === activeTab}
            className="w-full max-w-sm bg-orange-600 hover:bg-orange-700 text-white"
          >
            {user?.activeAvatar === activeTab ? 'Currently Selected' : 'Select Avatar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
