'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** The `beforeinstallprompt` event isn't in the TS DOM lib yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * "Install App" button for the topbar. Uses the PWA install prompt on
 * Chrome/Edge/Android; on iOS (no prompt event) it shows Add-to-Home-Screen
 * steps. Renders nothing when already installed or when install isn't offered.
 */
export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we trigger it ourselves
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowIosHelp(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Show when we have a real prompt, or on iOS where we show manual steps.
  const canShow = !installed && (deferred !== null || ios);
  if (!canShow) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferred(null);
      return;
    }
    // iOS: no programmatic prompt — guide the user.
    setShowIosHelp(true);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick} aria-label="Install app">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Install App</span>
      </Button>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Install EduBridge on iPhone"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Install EduBridge</h2>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 hover:bg-accent"
                onClick={() => setShowIosHelp(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="font-medium text-foreground">1.</span>
                Tap the <Share className="inline h-4 w-4" /> Share button in Safari&apos;s toolbar.
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> Scroll down and tap{' '}
                <span className="font-medium text-foreground">&ldquo;Add to Home Screen&rdquo;</span>.
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span> Tap{' '}
                <span className="font-medium text-foreground">&ldquo;Add&rdquo;</span> — EduBridge
                appears on your home screen.
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
