'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SocialAuth } from '@/components/social-auth';
import { useLogin, useRequestOtp, useVerifyOtp } from '@/hooks/use-auth';

export default function LoginPage() {
  const login = useLogin();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const onPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, { onError: (err) => toast.error((err as Error).message) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">Log in to your EduBridge account.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex rounded-md bg-muted p-1 text-sm">
          <button
            className={`flex-1 rounded px-3 py-1.5 ${mode === 'password' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setMode('password')}
          >
            Email
          </button>
          <button
            className={`flex-1 rounded px-3 py-1.5 ${mode === 'otp' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setMode('otp')}
          >
            Phone OTP
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={onPasswordLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="you@college.edu"
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
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {otpSent && (
              <Input
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            )}
            {!otpSent ? (
              <Button
                className="w-full"
                disabled={requestOtp.isPending}
                onClick={() =>
                  requestOtp.mutate(phone, {
                    onSuccess: () => {
                      setOtpSent(true);
                      toast.success('OTP sent');
                    },
                    onError: (e) => toast.error((e as Error).message),
                  })
                }
              >
                Send OTP
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={verifyOtp.isPending}
                onClick={() =>
                  verifyOtp.mutate({ phone, code }, { onError: (e) => toast.error((e as Error).message) })
                }
              >
                Verify & Log in
              </Button>
            )}
          </div>
        )}

        <SocialAuth mode="login" />

        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
