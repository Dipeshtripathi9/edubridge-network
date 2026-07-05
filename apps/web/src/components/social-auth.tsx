'use client';

import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGoogleAuth, useRequestMagicLink } from '@/hooks/use-auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Whether Google auth is configured (a client id is present). */
export const googleEnabled = !!GOOGLE_CLIENT_ID;

/**
 * Google button used to VERIFY (not log in) during signup. It returns the raw ID
 * token (re-verified server-side) plus the decoded email/name for prefill, so the
 * user completes the signup form rather than being logged straight in.
 */
export function GoogleVerifyButton({
  onVerified,
}: {
  onVerified: (credential: string, profile: { email?: string; name?: string }) => void;
}) {
  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(cred) => {
            if (!cred.credential) return toast.error('Google verification failed');
            let profile: { email?: string; name?: string } = {};
            try {
              // Google ID tokens are base64url — normalize before decoding.
              const part = cred.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')));
              profile = { email: payload.email, name: payload.name };
            } catch {
              /* server re-verifies the token regardless */
            }
            onVerified(cred.credential, profile);
          }}
          onError={() => toast.error('Google verification failed')}
          text="signup_with"
          shape="pill"
          width="320"
        />
      </div>
    </GoogleOAuthProvider>
  );
}

/** Standalone "Continue with Google" button (shown only when a client id is set). */
export function GoogleAuthButton({ mode }: { mode: 'login' | 'signup' }) {
  const google = useGoogleAuth();
  if (!GOOGLE_CLIENT_ID) return null;
  return (
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
  );
}

export function SocialAuth({ mode, showDivider = true }: { mode: 'login' | 'signup'; showDivider?: boolean }) {
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
      {showDivider && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
        </div>
      )}

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
        <div className="space-y-3">
          {sent.devLink ? (
            <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                ⚠️ Email isn’t configured here, so the link wasn’t emailed.
              </p>
              <p className="mt-1 text-muted-foreground">Click below to sign in directly:</p>
              <Button asChild className="mt-2 w-full">
                <a href={sent.devLink}>Continue sign-in →</a>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p>
                📧 We sent a sign-in link to <strong>{email}</strong>. Open it to continue — it expires in 15 minutes.
              </p>
            </div>
          )}
          <button onClick={() => setSent(null)} className="text-xs text-muted-foreground underline">
            Use a different email
          </button>
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
