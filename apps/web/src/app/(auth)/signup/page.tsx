'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SocialAuth } from '@/components/social-auth';
import { useSignup } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/stores/auth.store';

interface AuthResult {
  tokens: { accessToken: string; refreshToken: string };
  user: AuthUser;
}

export default function SignupPage() {
  const signup = useSignup();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup.mutate(
      { fullName, email, password },
      {
        onSuccess: async (res) => {
          // If the account is active immediately, log in and go to onboarding.
          if (res.autoVerified) {
            try {
              const result = await api.post<AuthResult>(
                '/auth/login',
                { email, password },
                { auth: false },
              );
              setSession(result.tokens.accessToken, result.tokens.refreshToken, result.user);
              toast.success('Welcome to EduBridge!');
              router.push('/onboarding');
              return;
            } catch {
              /* fall through to the verify-then-login path */
            }
          }
          toast.success('Account created! Check your email to verify, then log in.');
          router.push('/login');
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <p className="text-sm text-muted-foreground">Join EduBridge — you&apos;re already in college.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (8+ chars, upper, lower, number)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <div className="mt-4">
          <SocialAuth mode="signup" />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
