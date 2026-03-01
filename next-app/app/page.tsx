'use client';
import Clock from './components/Home/Clock';
import Habits from './components/Home/Habits';
import Stats from './components/Home/Stats';
import Subjects from './components/Home/Subjects';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn, LogOut, User } from 'lucide-react';

export default function Home() {
  const { user, logout, loading } = useAuthStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 bg-background text-foreground">
      {/* Header */}
      <header className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">OpenPumta</h1>
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
                      <img
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

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 grid-rows-2 gap-4 min-h-0 pb-4">
        {/* Top Row */}
        <div className="lg:col-span-4 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col items-center justify-center p-4">
          <Clock />
        </div>
        <div className="lg:col-span-8 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <Subjects />
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-6 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <Habits />
        </div>
        <div className="lg:col-span-6 bg-background rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <Stats />
        </div>
      </main>
    </div>
  );
}
