'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForgotPassword } from '@/hooks/use-auth';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgot.mutate(email, {
      onSuccess: () => setSent(true),
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <p className="text-sm text-muted-foreground">We&apos;ll email you a reset link.</p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm">
            If that email exists, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
