'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart,
  Timer,
  ListChecks,
  User,
  LogIn,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/pomodoro', label: 'Timer', icon: Timer },
  { href: '/habits', label: 'Habits', icon: CheckCircle },
  { href: '/todo', label: 'Tasks', icon: ListChecks },
  { href: '/stats', label: 'Stats', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, fetchUser, loading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-background/80 backdrop-blur-md">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r bg-card/50 backdrop-blur-xl z-40 p-4">
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">O</span>
          </div>
          <span className="font-bold text-xl tracking-tight">OpenPumta</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50">
          {!loading && !user ? (
            <Link href="/login">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                <LogIn className="h-5 w-5" />
                <span className="font-medium text-sm">Login</span>
              </div>
            </Link>
          ) : (
            user && (
              <Link href="/profile">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-muted-foreground hover:bg-secondary hover:text-foreground">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">{user.name}</span>
                    <span className="text-xs truncate max-w-[120px]">{user.email}</span>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </aside>
    </>
  );
}
