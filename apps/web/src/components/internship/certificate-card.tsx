'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Award, Download, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { Certificate } from '@/hooks/use-certificates';

/**
 * The download endpoint is authenticated (JWT via `Authorization` header only —
 * no query-param token support), so a plain `<a href>`/`window.open` would 401.
 * Fetch the PDF with the bearer token as a blob, then trigger the save via a
 * throwaway anchor — this still hits the real backend `pdfkit` PDF directly,
 * it just carries the auth header a navigation can't.
 */
async function downloadCertificate(id: string, code: string, token: string | null) {
  const res = await fetch(`${API_URL}/internships/certificates/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Could not download certificate');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${code}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const token = useAuthStore((s) => s.accessToken);
  const [downloading, setDownloading] = useState(false);

  const onCopyLink = () => {
    navigator.clipboard
      ?.writeText(`${window.location.origin}/verify-certificate/${certificate.code}`)
      .catch(() => {});
    toast.success('Verify link copied to clipboard');
  };

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadCertificate(certificate.id, certificate.code, token);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-marigold-soft text-amber-600">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-[15.5px] font-bold leading-tight">{certificate.title}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{certificate.code}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Issued {new Date(certificate.issuedAt).toLocaleDateString()}
            </p>
            {certificate.revokedAt ? (
              <Badge variant="outline" className="mt-2 border-destructive text-destructive">
                Revoked
              </Badge>
            ) : (
              <Badge className="mt-2">Verified</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-none gap-2">
          <Button variant="outline" size="sm" onClick={onCopyLink} title="Copy verify link">
            <Link2 className="h-4 w-4" />
          </Button>
          <Button size="sm" disabled={downloading} onClick={onDownload}>
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
