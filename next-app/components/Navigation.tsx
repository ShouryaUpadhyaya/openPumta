'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart,
  Timer,
  ListChecks,
  User,
  LogIn,
  CheckCircle,
  Settings,
  Menu,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLayoutStore } from '@/store/useLayoutStore';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LogOut } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/pomodoro', label: 'Timer', icon: Timer },
  { href: '/habits', label: 'Habits', icon: CheckCircle },
  { href: '/todo', label: 'Workspace', icon: ListChecks },
  { href: '/stats', label: 'Stats', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navigation({ mounted }: { mounted: boolean }) {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { user, fetchUser, loading, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!mounted) {
    return (
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 border-r bg-card/50 backdrop-blur-xl z-40 p-4 w-64" />
    );
  }

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
      <TooltipProvider delayDuration={0}>
        <aside
          className={cn(
            'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 border-r bg-card/50 backdrop-blur-xl z-40 p-4 transition-all duration-300',
            isSidebarCollapsed ? 'w-20' : 'w-64',
          )}
        >
          <div
            className={cn(
              'flex items-center mb-6 py-4 transition-all duration-300',
              isSidebarCollapsed ? 'justify-center' : 'justify-between',
            )}
          >
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 px-2">
                <Image src="/icon.svg" alt="icon" width={10} height={10} className="w-9 h-9 " />
                <span className="font-bold text-xl tracking-tight">OpenPumta</span>
              </div>
            )}
            <Menu
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={toggleSidebar}
            />
          </div>

          <nav className="flex flex-1 flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const navLink = (
                <Link key={item.href} href={item.href} className="w-full">
                  <div
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-200 w-full',
                      isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'animate-pulse')} />
                    {!isSidebarCollapsed && (
                      <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              );

              return isSidebarCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                navLink
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2">
            {!loading && !user ? (
              isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/login" className="w-full">
                      <div className="flex items-center justify-center p-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
                        <LogIn className="h-5 w-5 shrink-0" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Login</TooltipContent>
                </Tooltip>
              ) : (
                <Link href="/login" className="w-full">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
                    <LogIn className="h-5 w-5 shrink-0" />
                    <span className="font-medium text-sm">Login</span>
                  </div>
                </Link>
              )
            ) : (
              user && (
                <>
                  {isSidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={user.isGuest ? '/login' : '/profile'} className="w-full">
                          <div
                            className={cn(
                              'flex items-center justify-center p-3 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground',
                              user.isGuest && 'border border-primary/20 bg-primary/5',
                            )}
                          >
                            {user.avatarUrl ? (
                              <Image
                                width={100}
                                height={100}
                                src={user.avatarUrl}
                                alt="Avatar"
                                className="h-6 w-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <User className="h-6 w-6 shrink-0" />
                            )}
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Profile</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link href={user.isGuest ? '/login' : '/profile'} className="w-full">
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground',
                          user.isGuest && 'border border-primary/20 bg-primary/5',
                        )}
                      >
                        {user.avatarUrl ? (
                          <Image
                            width={100}
                            height={100}
                            src={user.avatarUrl}
                            alt="Avatar"
                            className="h-6 w-6 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <User className="h-6 w-6 shrink-0" />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-sm text-foreground truncate">
                            {user.name || (user.isGuest ? 'Guest User' : 'User')}
                          </span>
                          <span className="text-xs truncate text-muted-foreground">
                            {user.email || (user.isGuest ? 'Save progress' : '')}
                          </span>
                        </div>
                        {user.isGuest && (
                          <div className="ml-auto px-1.5 py-0.5 rounded-md bg-primary text-[10px] text-primary-foreground font-bold uppercase tracking-wider">
                            Guest
                          </div>
                        )}
                      </div>
                    </Link>
                  )}
                  {isSidebarCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {user.isGuest ? (
                          <Link href="/signup" className="w-full">
                            <div className="flex items-center justify-center p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer animate-pulse">
                              <LogIn className="h-5 w-5 shrink-0" />
                            </div>
                          </Link>
                        ) : (
                          <div
                            onClick={logout}
                            className="flex items-center justify-center p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                          >
                            <LogOut className="h-5 w-5 shrink-0" />
                          </div>
                        )}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {user.isGuest ? 'Sign Up Now' : 'Logout'}
                      </TooltipContent>
                    </Tooltip>
                  ) : user.isGuest ? (
                    <Link href="/signup" className="w-full">
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer animate-pulse">
                        <LogIn className="h-5 w-5 shrink-0" />
                        <span className="font-medium text-sm">Sign Up Now</span>
                      </div>
                    </Link>
                  ) : (
                    <div
                      onClick={logout}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      <span className="font-medium text-sm">Logout</span>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
}
