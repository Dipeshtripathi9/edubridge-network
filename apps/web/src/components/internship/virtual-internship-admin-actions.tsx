'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useCompleteVirtualInternshipEnrollment,
  useConfirmVirtualInternshipPayment,
  useEvaluateVirtualInternshipEnrollment,
  type VirtualInternshipEnrollment,
} from '@/hooks/use-virtual-internship';

function InlinePanel({
  label,
  open,
  onToggle,
  children,
  variant = 'outline',
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  variant?: 'outline' | 'default';
}) {
  return (
    <div>
      <Button size="sm" variant={variant} onClick={onToggle}>
        {label} {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
      {open && <div className="mt-2 space-y-2 rounded-xl border border-border bg-accent/20 p-3">{children}</div>}
    </div>
  );
}

export function VirtualInternshipAdminActions({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  const [panel, setPanel] = useState<'confirm' | 'evaluate' | null>(null);
  const [mentorNote, setMentorNote] = useState('');
  const [evalNote, setEvalNote] = useState('');

  const confirmPayment = useConfirmVirtualInternshipPayment();
  const evaluate = useEvaluateVirtualInternshipEnrollment();
  const complete = useCompleteVirtualInternshipEnrollment();

  const togglePanel = (p: 'confirm' | 'evaluate') => setPanel((cur) => (cur === p ? null : p));

  return (
    <div className="flex flex-wrap gap-2">
      {enrollment.status === 'PENDING_PAYMENT' && (
        <InlinePanel label="Confirm payment" open={panel === 'confirm'} onToggle={() => togglePanel('confirm')} variant="default">
          <Textarea placeholder="Optional mentor note" value={mentorNote} onChange={(e) => setMentorNote(e.target.value)} />
          <Button
            size="sm"
            disabled={confirmPayment.isPending}
            onClick={() =>
              confirmPayment.mutate(
                { id: enrollment.id, mentorNote: mentorNote.trim() || undefined },
                {
                  onSuccess: () => {
                    toast.success('Payment confirmed');
                    setPanel(null);
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Confirm
          </Button>
        </InlinePanel>
      )}

      {enrollment.status === 'ACTIVE' && (
        <InlinePanel label="Evaluate final project" open={panel === 'evaluate'} onToggle={() => togglePanel('evaluate')}>
          <Textarea placeholder="Optional note (feedback, reason for failing, etc.)" value={evalNote} onChange={(e) => setEvalNote(e.target.value)} />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={evaluate.isPending}
              onClick={() =>
                evaluate.mutate(
                  { id: enrollment.id, passed: true, note: evalNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Marked as passed');
                      setEvalNote('');
                      setPanel(null);
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              Pass
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={evaluate.isPending}
              onClick={() =>
                evaluate.mutate(
                  { id: enrollment.id, passed: false, note: evalNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Marked as failed');
                      setEvalNote('');
                      setPanel(null);
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              Fail
            </Button>
          </div>
        </InlinePanel>
      )}

      {enrollment.status === 'ACTIVE' && enrollment.evaluationStatus === 'PASSED' && (
        <Button
          size="sm"
          disabled={complete.isPending}
          onClick={() =>
            complete.mutate(enrollment.id, {
              onSuccess: () => toast.success('Enrollment marked complete — certificate issued'),
              onError: (e) => toast.error((e as Error).message),
            })
          }
        >
          Mark complete
        </Button>
      )}
    </div>
  );
}
