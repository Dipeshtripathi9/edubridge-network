'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/components/social-auth';
import { useLogin, useRequestMagicLink } from '@/hooks/use-auth';

export default function LoginPage() {
  const login = useLogin();
  const magic = useRequestMagicLink();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sentDevLink, setSentDevLink] = useState<string | null | undefined>(undefined);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, { onError: (err) => toast.error((err as Error).message) });
  };

  const sendMagicLink = () => {
    if (!email.trim()) {
      toast.error('Enter your email first');
      return;
    }
    magic.mutate(
      { email: email.trim() },
      {
        onSuccess: (res) => {
          setSentDevLink(res.devLink ?? null);
          toast.success('Sign-in link sent — check your email');
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Log in to EduBridge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        {/* Passwordless: email the user a one-time sign-in link. */}
        <Button
          variant="outline"
          className="w-full"
          disabled={magic.isPending}
          onClick={sendMagicLink}
        >
          {magic.isPending ? 'Sending link…' : 'Email me a sign-in link'}
        </Button>
        {sentDevLink !== undefined && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2 text-center text-xs">
            {sentDevLink ? (
              <>
                <p className="mb-1 text-muted-foreground">Email isn’t configured here — open the link directly:</p>
                <Link href={sentDevLink} className="font-medium text-primary underline">
                  Open sign-in link
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">
                Check your inbox for the sign-in link. It expires in 15 minutes.
              </p>
            )}
          </div>
        )}

        <GoogleAuthButton mode="login" />

        <Button asChild variant="outline" className="w-full">
          <Link href="/signup">Create New Account</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
