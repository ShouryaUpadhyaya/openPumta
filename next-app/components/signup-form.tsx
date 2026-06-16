'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldGroup } from '@/components/ui/field';
import Link from 'next/link';
import api from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: async () => api.post('/auth/logout'),
    onSuccess: async () => {
      console.log('inside onSuccess');
      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      queryClient.clear();
      console.log('cleared cache');
      setTimeout(() => {}, 1000);
    },
    onError: (error) => {
      console.error('logout failed', error);
    },

    onSettled: () => {
      console.log('mutation finished');
    },
  });
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/user')
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google';
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (user) {
    return (
      <div className={cn('flex flex-col gap-6 text-center', className)}>
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground text-sm">
          You already have an account and are signed in as <strong>{user.email}</strong>
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Sign up with Google to get started
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <Button variant="outline" type="button" onClick={handleGoogleSignup} className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Sign up with Google
          </Button>
        </div>

        <FieldDescription className="text-center">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </div>
  );
}
