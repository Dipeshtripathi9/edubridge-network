'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSignup } from '@/hooks/use-auth';

export default function SignupPage() {
  const signup = useSignup();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup.mutate(
      { email: email.trim(), password, fullName: fullName.trim(), gender: gender || undefined },
      {
        onSuccess: (res) => {
          // Stash the dev verification link (no SMTP in dev) for the verify page.
          if (res.devLink) sessionStorage.setItem('ebd_verify_devlink', res.devLink);
          toast.success('Account created — verify your email to continue.');
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started on EduBridge</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign up to boost your career with resources, opportunities, and expert guidance.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <p className="mt-1 text-xs text-muted-foreground">You may receive a verification link from us.</p>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="8+ chars, upper, lower, number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>

          <p className="text-xs text-muted-foreground">
            By tapping Submit, you agree to create an account and accept EduBridge Network&apos;s Terms, Privacy
            Policy, and Community Policy.
          </p>

          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? 'Submitting…' : 'Submit'}
          </Button>
        </form>

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
