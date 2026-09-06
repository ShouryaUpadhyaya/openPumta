'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const SPACE_ICONS = [
  '📋',
  '🏠',
  '💼',
  '🎓',
  '💻',
  '🏋️',
  '🎯',
  '📚',
  '🧪',
  '🌟',
  '🎨',
  '🎵',
  '🌍',
  '🚀',
  '💡',
  '🔬',
  '✍️',
  '🌿',
  '🎮',
  '💰',
];

interface CreateSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSpace: (name: string, icon: string) => void;
  isLoading?: boolean;
}

export function CreateSpaceModal({
  open,
  onOpenChange,
  onCreateSpace,
  isLoading = false,
}: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📋');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the modal mounts (after animation)
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isLoading) return;
    onCreateSpace(trimmed, icon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden" onKeyDown={handleKeyDown}>
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold">Create workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Icon Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                {SPACE_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      'text-xl p-1.5 rounded-lg transition-all duration-150 hover:bg-muted/60',
                      icon === emoji
                        ? 'bg-primary/20 ring-1 ring-primary/50 scale-110 shadow-sm'
                        : '',
                    )}
                    aria-label={`Select icon ${emoji}`}
                    aria-pressed={icon === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="space-name-input"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Name
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none shrink-0">{icon}</span>
                <Input
                  id="space-name-input"
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily Planner, Study, Projects..."
                  className="flex-1"
                  maxLength={60}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 pb-6 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="min-w-[130px]">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create workspace'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
