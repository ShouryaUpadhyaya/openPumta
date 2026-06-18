'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { removeDemoData } from './demo-data-generator';

interface OnboardingCompletionProps {
  onClose: () => void;
}

export function OnboardingCompletion({ onClose }: OnboardingCompletionProps) {
  const { markOnboardingComplete, demoDataIds, setDemoDataIds } = useOnboardingStore();
  const [loadingFresh, setLoadingFresh] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const handleStartFresh = async () => {
    setLoadingFresh(true);
    try {
      if (demoDataIds) {
        await removeDemoData(demoDataIds, false);
        setDemoDataIds(null);
      }
      markOnboardingComplete('fresh');
      onClose();
      // Clear React Query persisted cache
      window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      // Reload to invalidate all caches and reset state
      window.location.href = '/';
    } catch {
      markOnboardingComplete('fresh');
      onClose();
      window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      window.location.href = '/';
    } finally {
      setLoadingFresh(false);
    }
  };

  const handleUseTemplate = async () => {
    setLoadingTemplate(true);
    try {
      if (demoDataIds) {
        await removeDemoData(demoDataIds, true);
        setDemoDataIds(null);
      }
      // Clear React Query persisted cache
      window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      // Brief pause to show success state before closing
      setTimeout(() => {
        markOnboardingComplete('demo');
        onClose();
        window.location.href = '/';
      }, 600);
    } catch {
      markOnboardingComplete('demo');
      onClose();
      window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      window.location.href = '/';
    } finally {
      setLoadingTemplate(false);
    }
  };

  const options = [
    {
      id: 'template',
      icon: loadingTemplate ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Sparkles className="h-6 w-6" />
      ),
      title: 'Use Predefined Template',
      description:
        'Keep the Computer Science subjects, habits, and workspace planners to kickstart your journey. (Historical stats will be wiped clean for you)',
      cta: loadingTemplate ? 'Setting up...' : 'Use Template',
      action: handleUseTemplate,
      loading: loadingTemplate || loadingFresh,
      variant: 'default' as const,
      accent: 'border-primary/40 bg-primary/10 hover:bg-primary/15',
    },
    {
      id: 'fresh',
      icon: loadingFresh ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Play className="h-6 w-6" />
      ),
      title: 'Start Fresh',
      description:
        'Wipe all demo data and start from a blank canvas. Set up your own subjects, habits, workspaces, and goals from scratch.',
      cta: loadingFresh ? 'Clearing...' : 'Start Fresh',
      action: handleStartFresh,
      loading: loadingTemplate || loadingFresh,
      variant: 'outline' as const,
      accent: 'border-white/20 hover:border-primary/50 hover:bg-primary/5',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          How would you like to begin?
        </h2>
        <p className="text-sm text-muted-foreground">Choose your starting point.</p>
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.1, duration: 0.3 }}
            className={`flex flex-col gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${opt.accent} ${
              opt.loading ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={!opt.loading ? opt.action : undefined}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!opt.loading) opt.action();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                {opt.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">{opt.title}</h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {opt.description}
            </p>

            <Button
              variant={opt.variant}
              size="sm"
              disabled={opt.loading}
              className="w-full mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                if (!opt.loading) opt.action();
              }}
            >
              {opt.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
