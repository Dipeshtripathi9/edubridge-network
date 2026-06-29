'use client';

import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGoogleAuth, useRequestMagicLink } from '@/hooks/use-auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function SocialAuth({ mode }: { mode: 'login' | 'signup' }) {
  const google = useGoogleAuth();
  const magic = useRequestMagicLink();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<{ devLink?: string } | null>(null);

  const sendLink = () => {
    if (!email.trim()) {
      toast.error('Enter your email');
      return;
    }
    magic.mutate(
      { email: email.trim() },
      {
        onSuccess: (res) => {
          setSent({ devLink: res.devLink });
          toast.success('Check your email for a sign-in link.');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
      </div>

      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(cred) =>
                cred.credential ? google.mutate(cred.credential) : toast.error('Google sign-in failed')
              }
              onError={() => toast.error('Google sign-in failed')}
              text={mode === 'signup' ? 'signup_with' : 'signin_with'}
              shape="pill"
              width="320"
            />
          </div>
        </GoogleOAuthProvider>
      ) : null}

      {/* Passwordless email link */}
      {sent ? (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <p>
            📧 We sent a sign-in link to <strong>{email}</strong>. Open it to continue — it expires in 15 minutes.
          </p>
          {sent.devLink ? (
            <p className="mt-2">
              <a className="font-medium text-primary underline" href={sent.devLink}>
                Open sign-in link (dev)
              </a>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendLink()}
          />
          <Button variant="outline" className="w-full" onClick={sendLink} disabled={magic.isPending}>
            ✉️ Email me a sign-in link
          </Button>
        </div>
      )}
    </div>
  );
}
