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

  React.useEffect(() => {
    const handleExpoToken = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const token = customEvent.detail;
      if (token) {
        try {
          const api = (await import('@/lib/api')).default;
          await api.post('/user/push-token', { expoPushToken: token });
          console.log('Expo push token registered successfully');
        } catch (error) {
          console.error('Failed to register expo push token', error);
        }
      }
    };

    window.addEventListener('expoTokenReady', handleExpoToken);

    // Check if it's already set (in case the event fired before React mounted)
    // @ts-expect-error global property
    if (window.EXPO_PUSH_TOKEN) {
      // @ts-expect-error global property
      handleExpoToken(new CustomEvent('expoTokenReady', { detail: window.EXPO_PUSH_TOKEN }));
    }

    return () => {
      window.removeEventListener('expoTokenReady', handleExpoToken);
    };
  }, []);

  return (
    <>
      <OnboardingModal />
      <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-clip">
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
    </>
  );
}
