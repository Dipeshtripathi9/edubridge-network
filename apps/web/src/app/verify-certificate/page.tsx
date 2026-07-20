'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyCertificateEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const onCheck = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/verify-certificate/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold tracking-tight">EduBridge Network</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-20">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-xl font-bold">Verify a certificate</p>
              <p className="mt-1 text-sm text-muted-foreground">Enter the certificate code to check it — no login required.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="EB-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCheck()}
                className="flex-1 text-center font-mono"
              />
              <Button onClick={onCheck} disabled={!code.trim()}>
                Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
