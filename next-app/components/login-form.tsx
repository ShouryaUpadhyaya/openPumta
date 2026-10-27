'use client';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldGroup } from '@/components/ui/field';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { user, loading, fetchUser, guestLogin, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Don't spawn a guest account just for visiting the auth page
    fetchUser({ guestFallback: false });
  }, [fetchUser]);
  const queryClient = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: async () => (window.location.href = '/api/auth/google'),
    onSuccess: async () => {
      console.log('inside onSuccess login');
      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      queryClient.clear();
      console.log('cleared cache');
      setTimeout(() => {}, 1000);
    },
    onError: (error) => {
      console.error('login failed', error);
    },
    onSettled: () => {
      console.log('mutation finished');
    },
  });

  const handleGoogleLogin = () => {
    loginMutation.mutate();
  };

  const handleGuestLogin = async () => {
    await guestLogin();
    router.push('/');
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (user && !user.isGuest) {
    return (
      <div className={cn('flex flex-col gap-6 text-center', className)}>
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground text-sm">
          You are already signed in as <strong>{user.email}</strong>
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {user?.isGuest
              ? 'You are currently in Guest Mode. Sign in to save your progress.'
              : 'Sign in with Google to access your dashboard'}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>

          {!user?.isGuest && (
            <Button variant="secondary" type="button" onClick={handleGuestLogin} className="w-full">
              Continue as Guest
            </Button>
          )}
        </div>

        <FieldDescription className="text-center">
          Don&apos;t have an account?{' '}
          <Link href={'/signup'} className="underline underline-offset-4">
            Sign up
          </Link>
        </FieldDescription>
      </FieldGroup>
    </div>
  );
}
