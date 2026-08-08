'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Download,
  IndianRupee,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualInternshipFeedbackForm } from './virtual-internship-feedback-form';
import {
  useMarkVirtualInternshipPaymentLinkClicked,
  useSubmitVirtualInternshipPaymentReference,
  type VirtualInternshipEnrollment,
} from '@/hooks/use-virtual-internship';
import { useMyCertificates } from '@/hooks/use-certificates';
import { API_URL } from '@/lib/api';
import { LEGAL, SUPPORT_WHATSAPP_URL } from '@/lib/legal-placeholders';

function PaymentQrCode({ link }: { link: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(link, { width: 176, margin: 1, color: { dark: '#1b2a1d', light: '#ffffff' } })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [link]);

  if (!dataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="Scan to open the payment link" width={176} height={176} className="rounded-lg" />
      <p className="text-center text-xs text-muted-foreground">Scan to open the payment link on your phone</p>
    </div>
  );
}

function HelpButtons() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-xs font-medium text-muted-foreground">Facing an issue?</span>
      <Button asChild size="sm" variant="outline" className="bg-background">
        <a href={`tel:${LEGAL.supportPhone}`}>
          <Phone className="h-3.5 w-3.5" /> Call {LEGAL.supportPhone}
        </a>
      </Button>
      <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#1ebe57]">
        <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp us
        </a>
      </Button>
    </div>
  );
}

export function VirtualInternshipPaymentBox({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  const [note, setNote] = useState(enrollment.paymentReferenceNote ?? '');
  const submitRef = useSubmitVirtualInternshipPaymentReference();
  const markClicked = useMarkVirtualInternshipPaymentLinkClicked();
  const { data: certificates, isLoading: certsLoading } = useMyCertificates();

  if (enrollment.status === 'COMPLETED') {
    const certificate = certificates?.find(
      (c) => c.sourceType === 'VIRTUAL_INTERNSHIP' && c.sourceId === enrollment.id,
    );

    return (
      <div className="space-y-4">
        <Card className="border-green/40 bg-green-soft/40">
          <CardContent className="flex items-start gap-3.5 p-5">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-green text-white shadow-sm">
              <Award className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-display text-lg font-bold leading-tight">Track complete — certificate issued</p>
              <p className="text-sm text-muted-foreground">
                {enrollment.completedAt
                  ? `Completed on ${new Date(enrollment.completedAt).toLocaleDateString()}.`
                  : 'Nice work!'}
              </p>
              {certsLoading ? (
                <Skeleton className="mt-3 h-9 w-40" />
              ) : certificate ? (
                <Button asChild size="sm" className="mt-3">
                  <a href={`${API_URL}/internships/certificates/${certificate.id}/download`} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" /> Download certificate
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <VirtualInternshipFeedbackForm enrollmentId={enrollment.id} />
      </div>
    );
  }

  if (enrollment.status !== 'PENDING_PAYMENT') {
    return (
      <Card className="border-green/40 bg-green-soft/30">
        <CardContent className="flex items-start gap-3.5 p-5">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-green-soft text-green shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight">Payment confirmed</p>
            <p className="text-sm text-muted-foreground">
              ₹{enrollment.totalAmount.toLocaleString()} received
              {enrollment.paidAt && ` on ${new Date(enrollment.paidAt).toLocaleDateString()}`}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = () => {
    if (!note.trim()) {
      toast.error('Enter your UTR / transaction ID');
      return;
    }
    submitRef.mutate(
      { id: enrollment.id, paymentReferenceNote: note.trim() },
      {
        onSuccess: () => toast.success('Submitted — we’ll confirm your payment within 60 minutes'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card className="overflow-hidden border-marigold/40">
      {/* Header band: amount due + the primary "Pay" action, top-right */}
      <div className="border-b border-marigold/25 bg-marigold-soft/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-marigold text-white shadow-sm">
              <IndianRupee className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">Complete your payment</p>
              <p className="text-sm text-muted-foreground">₹{enrollment.totalAmount.toLocaleString()} due</p>
            </div>
          </div>
          {enrollment.paymentLink ? (
            <Button
              asChild
              size="lg"
              className="bg-marigold text-white shadow-sm hover:bg-marigold/90"
            >
              <a
                href={enrollment.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markClicked.mutate(enrollment.id)}
              >
                Pay ₹{enrollment.totalAmount.toLocaleString()} <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <span className="rounded-full border border-dashed border-marigold/50 bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground">
              Payment link coming soon — contact support
            </span>
          )}
        </div>
        {enrollment.paymentLink && (
          <div className="mt-4 flex justify-center sm:justify-start">
            <PaymentQrCode link={enrollment.paymentLink} />
          </div>
        )}
      </div>

      <CardContent className="space-y-5 p-5">
        {/* Receipt-style fee breakdown */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Track fee</span>
            <span className="font-medium">₹{enrollment.feeAmount.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">GST ({enrollment.gstPercent}%)</span>
            <span className="font-medium">₹{enrollment.gstAmount.toLocaleString()}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold">Total payable</span>
            <span className="font-display text-lg font-extrabold text-marigold">
              ₹{enrollment.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* UTR / transaction ID submission */}
        <div>
          <label htmlFor="vi-utr" className="text-sm font-semibold">
            UTR / Transaction ID
          </label>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pay using the button or QR code above, then paste the UTR (or transaction ID) from your UPI app&apos;s
            confirmation screen here — we&apos;ll confirm your payment within 60 minutes.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Input
              id="vi-utr"
              placeholder="e.g. 302481234567"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1"
            />
            <Button disabled={submitRef.isPending || !note.trim()} onClick={onSubmit}>
              {enrollment.paymentReferenceNote ? 'Update UTR / transaction ID' : 'Submit UTR / transaction ID'}
            </Button>
          </div>
        </div>

        {enrollment.paymentReferenceNote ? (
          <div className="space-y-3.5 rounded-2xl border border-green/40 bg-green-soft/40 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-green text-white">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">UTR received — under review</p>
                <p className="text-sm text-muted-foreground">
                  Your track will be active within 1 hour of submitting your UTR / transaction ID.
                </p>
              </div>
            </div>
            <HelpButtons />
          </div>
        ) : (
          <div className="border-t border-border pt-4">
            <HelpButtons />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
