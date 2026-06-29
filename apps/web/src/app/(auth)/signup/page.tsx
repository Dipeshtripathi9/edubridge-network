'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialAuth } from '@/components/social-auth';

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Join EduBridge with Google or your email — no password needed.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialAuth mode="signup" showDivider={false} />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
