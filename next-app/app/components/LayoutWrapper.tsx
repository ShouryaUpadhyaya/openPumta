'use client';

import React, { useSyncExternalStore } from 'react';
import Navigation from '@/components/Navigation';
import { useLayoutStore } from '@/store/useLayoutStore';
import { cn } from '@/lib/utils';

import { OnboardingModal } from '@/components/onboarding/onboarding-modal';

const emptySubscribe = () => () => {};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useLayoutStore();

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <OnboardingModal />
      <Navigation mounted={isMounted} />
      <main
        className={cn(
          'flex-1 pb-16 lg:pb-0 transition-all duration-300 min-w-0',
          isMounted && isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        )}
      >
        {children}
      </main>
    </div>
  );
}
