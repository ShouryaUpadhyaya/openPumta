'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const { user, loading, fetchUser, guestLogin, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
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
              ? "You are currently in Guest Mode. Sign in to save your progress."
              : "Enter your email below to login to your account"}
          </p>
        </div>
        <form className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="bg-background"
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                Forgot your password?
              </a>
            </div>
            <Input id="password" type="password" required className="bg-background" />
          </Field>
          <Field>
            <Button type="submit" className="w-full">Login</Button>
          </Field>
        </form>
        
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-muted dark:*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
        
        <div className="flex flex-col gap-2">
          <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Login with Google
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
