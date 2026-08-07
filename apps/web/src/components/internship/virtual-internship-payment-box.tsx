'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Award, CheckCircle2, Download, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualInternshipFeedbackForm } from './virtual-internship-feedback-form';
import {
  useSubmitVirtualInternshipPaymentReference,
  type VirtualInternshipEnrollment,
} from '@/hooks/use-virtual-internship';
import { useMyCertificates } from '@/hooks/use-certificates';
import { API_URL } from '@/lib/api';

export function VirtualInternshipPaymentBox({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  const [note, setNote] = useState(enrollment.paymentReferenceNote ?? '');
  const submitRef = useSubmitVirtualInternshipPaymentReference();
  const { data: certificates, isLoading: certsLoading } = useMyCertificates();

  if (enrollment.status === 'COMPLETED') {
    const certificate = certificates?.find(
      (c) => c.sourceType === 'VIRTUAL_INTERNSHIP' && c.sourceId === enrollment.id,
    );

    return (
      <div className="space-y-4">
        <Card className="border-green/40 bg-green-soft/40">
          <CardContent className="flex items-start gap-3 p-5">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-green text-white">
              <Award className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Track complete — certificate issued</p>
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
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-green-soft text-green">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Payment confirmed</p>
            <p className="text-sm text-muted-foreground">
              ₹{enrollment.feeAmount.toLocaleString()} received
              {enrollment.paidAt && ` on ${new Date(enrollment.paidAt).toLocaleDateString()}`}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = () => {
    if (!note.trim()) {
      toast.error('Add a payment reference (UPI ref / transaction ID)');
      return;
    }
    submitRef.mutate(
      { id: enrollment.id, paymentReferenceNote: note.trim() },
      {
        onSuccess: () => toast.success('Reference submitted — we’ll confirm your payment shortly'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card className="border-marigold/40 bg-marigold-soft/40">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-marigold text-white">
            <IndianRupee className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold">Complete your payment</p>
            <p className="text-sm text-muted-foreground">₹{enrollment.feeAmount.toLocaleString()} due</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Pay via UPI to <strong className="text-foreground">edubridge@upi</strong>, then submit the
          transaction reference below. An admin will manually confirm it and activate your track.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="UPI ref / transaction ID"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1"
          />
          <Button disabled={submitRef.isPending || !note.trim()} onClick={onSubmit}>
            {enrollment.paymentReferenceNote ? 'Update reference' : 'Submit reference'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
