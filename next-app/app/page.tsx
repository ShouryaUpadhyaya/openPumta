'use client';
import Clock from './components/Home/Clock';
import Habits from './components/Home/Habits';
import Stats from './components/Home/Stats';
import Subjects from './components/Home/Subjects';
import DailyRating from './components/Home/DailyRating';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, LogOut, User } from 'lucide-react';
import { GettingStartedCard } from '@/components/onboarding/getting-started-card';

export default function Home() {
  const { user, logout, loading } = useAuthStore();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden p-4 bg-background text-foreground pb-24 lg:pb-4 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Header */}
      <header className="flex justify-between items-center mb-4 shrink-0 lg:hidden">
        <h1 className="flex text-2xl font-bold justify-center items-center tracking-tight">
          <Image src="/icon.svg" alt="icon" width={10} height={10} className="w-8 h-8 mr-2" />
          openPumta
          <span className="sr-only"> - The Ultimate Yelpumta & Notion Productivity System</span>
        </h1>
        <div className="flex gap-2">
          {!loading && !user ? (
            <Button asChild variant="default" size="sm" className="gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          ) : (
            user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <Button asChild variant="outline" size="icon" className="rounded-full shrink-0">
                  <Link href="/profile">
                    {user.avatarUrl ? (
                      <Image
                        width={100}
                        height={100}
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-12 gap-4 min-h-0">
        {!subjectsLoading && subjects.length === 0 ? (
          <div className="lg:col-span-12 lg:row-span-12 flex flex-col items-center justify-center h-full min-h-[60vh]">
            <div className="w-full max-w-2xl bg-background rounded-xl border shadow-sm overflow-hidden p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Subjects />
            </div>
          </div>
        ) : (
          <>
            {/* Top Row - Clock and Subjects */}
            <div className="lg:col-span-4 lg:row-span-5 bg-background rounded-xl border shadow-sm overflow-clip flex flex-col items-center justify-center p-4 min-h-65 lg:min-h-0">
              <Clock />
            </div>
            {/* Middle Row - Habits and General Subjects/Stats space */}
            <div className="lg:col-span-8 lg:row-span-6 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-70 lg:min-h-0">
              <Subjects />
            </div>
            <div className="lg:col-span-4 lg:row-span-7 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-70 lg:min-h-0">
              <Habits />
            </div>

            {/* Bottom Row - Rating and Stats */}
            <div className="lg:col-span-4 lg:row-span-6 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-55 lg:min-h-0">
              <DailyRating />
            </div>
            <div className="lg:col-span-4 lg:row-span-6 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-55 lg:min-h-0">
              <Stats />
            </div>
          </>
        )}
      </main>
      <GettingStartedCard />
    </div>
  );
}
