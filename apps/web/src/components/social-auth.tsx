'use client';

import { useEffect, useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider, useGoogleOAuth, type GoogleLoginProps } from '@react-oauth/google';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGoogleAuth, useRequestMagicLink } from '@/hooks/use-auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Whether Google auth is configured (a client id is present). */
export const googleEnabled = !!GOOGLE_CLIENT_ID;

// The accounts.google.com script this button depends on can take several
// seconds to load (or fail entirely behind an ad blocker). Without a loading
// state the button area is just blank until then, which reads as broken.
function GoogleButtonInner(props: GoogleLoginProps) {
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (scriptLoadedSuccessfully) return;
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [scriptLoadedSuccessfully]);

  return (
    <div className="relative flex h-10 w-[320px] items-center justify-center">
      {!scriptLoadedSuccessfully && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full border border-input bg-muted/40 text-xs text-muted-foreground">
          {slow ? 'Still loading — check your connection or ad blocker' : 'Loading Google sign-in…'}
        </div>
      )}
      <div className={scriptLoadedSuccessfully ? undefined : 'invisible'}>
        <GoogleLogin {...props} />
      </div>
    </div>
  );
}

/** Shared Google button shell: loading skeleton while the script loads, inline error if it never does. */
function GoogleButtonSlot(props: GoogleLoginProps) {
  const [scriptError, setScriptError] = useState(false);
  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} onScriptLoadError={() => setScriptError(true)}>
      <div className="flex justify-center">
        {scriptError ? (
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Couldn&apos;t load Google sign-in — disable any ad blocker or check your connection, then reload the
            page.
          </p>
        ) : (
          <GoogleButtonInner {...props} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

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
  return (
    <GoogleButtonSlot
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
  );
}

/** Standalone "Continue with Google" button (shown only when a client id is set). */
export function GoogleAuthButton({ mode, redirectTo }: { mode: 'login' | 'signup'; redirectTo?: string }) {
  const google = useGoogleAuth();
  return (
    <GoogleButtonSlot
      onSuccess={(cred) =>
        cred.credential
          ? google.mutate({ idToken: cred.credential, redirectTo })
          : toast.error('Google sign-in failed')
      }
      onError={() => toast.error('Google sign-in failed')}
      text={mode === 'signup' ? 'signup_with' : 'signin_with'}
      shape="pill"
      width="320"
    />
  );
}

export function SocialAuth({
  mode,
  showDivider = true,
  redirectTo,
}: {
  mode: 'login' | 'signup';
  showDivider?: boolean;
  redirectTo?: string;
}) {
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

      <GoogleButtonSlot
        onSuccess={(cred) =>
          cred.credential
            ? google.mutate({ idToken: cred.credential, redirectTo })
            : toast.error('Google sign-in failed')
        }
        onError={() => toast.error('Google sign-in failed')}
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        shape="pill"
        width="320"
      />

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
