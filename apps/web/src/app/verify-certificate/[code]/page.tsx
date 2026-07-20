'use client';

import { use } from 'react';
import Link from 'next/link';
import { Award, ExternalLink, GraduationCap, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { API_URL } from '@/lib/api';
import { usePublicCertificate } from '@/hooks/use-certificates';

const SOURCE_LABEL: Record<string, string> = {
  TRACK_A_ENROLLMENT: 'Track A — Learn & Build',
  TRACK_B_APPLICATION: 'Track B — Apply & Get Selected',
};

export default function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { data: certificate, isLoading, isError } = usePublicCertificate(code);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold tracking-tight">EduBridge Network</span>
          </Link>
          <Link href="/verify-certificate" className="text-sm text-primary hover:underline">
            Check another code
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14">
        {isLoading && <Skeleton className="h-64 w-full" />}

        {!isLoading && isError && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="h-6 w-6" />
              </span>
              <b className="font-display text-lg">No certificate found for “{code}”</b>
              <p className="max-w-sm text-sm text-muted-foreground">
                Double-check the code — it looks like <span className="font-mono">EB-XXXXXXXX</span>.
              </p>
              <Button asChild variant="outline">
                <Link href="/verify-certificate">Try another code</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && certificate && (
          <Card>
            <CardContent className="space-y-5 p-8 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-marigold-soft text-amber-600">
                <Award className="h-7 w-7" />
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold tracking-tight">{certificate.title}</p>
                <p className="mt-1 text-muted-foreground">Issued to {certificate.recipientName}</p>
              </div>

              {certificate.revoked ? (
                <Badge variant="outline" className="border-destructive text-destructive">
                  Revoked
                </Badge>
              ) : (
                <Badge className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified certificate
                </Badge>
              )}

              <div className="grid gap-3 rounded-2xl border border-border bg-accent/20 p-4 text-left text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Certificate code</p>
                  <p className="font-mono font-semibold">{certificate.code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued on</p>
                  <p className="font-semibold">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Program</p>
                  <p className="font-semibold">{SOURCE_LABEL[certificate.sourceType] ?? certificate.sourceType}</p>
                </div>
              </div>

              <Button asChild>
                <a href={`${API_URL}/internships/certificates/verify/${code}/pdf`} target="_blank" rel="noreferrer">
                  View certificate PDF <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
