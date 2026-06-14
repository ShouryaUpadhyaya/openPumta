'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { generateDemoData } from './demo-data-generator';

interface OnboardingCompletionProps {
  onClose: () => void;
}

export function OnboardingCompletion({ onClose }: OnboardingCompletionProps) {
  const { markOnboardingComplete } = useOnboardingStore();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  const handleStartFresh = () => {
    markOnboardingComplete('fresh');
    onClose();
  };

  const handleUseDemo = async () => {
    setLoadingDemo(true);
    try {
      await generateDemoData();
      setDemoSuccess(true);
      // Brief pause to show success state before closing
      setTimeout(() => {
        markOnboardingComplete('demo');
        onClose();
      }, 1200);
    } catch {
      // Generator catches internally; this is a safety net
      markOnboardingComplete('demo');
      onClose();
    } finally {
      setLoadingDemo(false);
    }
  };

  const options = [
    {
      id: 'fresh',
      icon: <Play className="h-6 w-6" />,
      title: 'Start Fresh',
      description: 'Create your own subjects, habits, workspaces, and goals from scratch.',
      cta: 'Start Fresh',
      action: handleStartFresh,
      loading: false,
      variant: 'outline' as const,
      accent: 'border-white/20 hover:border-primary/50 hover:bg-primary/5',
    },
    {
      id: 'demo',
      icon: demoSuccess ? (
        <CheckCircle className="h-6 w-6 text-emerald-400" />
      ) : loadingDemo ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Sparkles className="h-6 w-6" />
      ),
      title: 'Explore Demo Data',
      description:
        'Generate realistic example data — subjects, habits, workspaces, and reviews — so you can immediately see how OpenPumta works.',
      cta: demoSuccess ? 'Done! Loading…' : loadingDemo ? 'Generating…' : 'Use Demo Data',
      action: handleUseDemo,
      loading: loadingDemo,
      variant: 'default' as const,
      accent: 'border-primary/40 bg-primary/10 hover:bg-primary/15',
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
            className={`flex flex-col gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${opt.accent}`}
            onClick={!opt.loading && !demoSuccess ? opt.action : undefined}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!opt.loading && !demoSuccess) opt.action();
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
              disabled={opt.loading || demoSuccess}
              className="w-full mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                if (!opt.loading && !demoSuccess) opt.action();
              }}
            >
              {opt.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground">
        All demo data can be edited or deleted later.
      </p>
    </motion.div>
  );
}
