'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialAuth } from '@/components/social-auth';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">Sign in with Google or your email — no password needed.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialAuth mode="login" showDivider={false} />
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
