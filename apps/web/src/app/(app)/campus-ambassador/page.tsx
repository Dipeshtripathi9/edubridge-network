'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useApplyCampusAmbassador,
  useCampusAmbassadorSettings,
  useMyCampusAmbassadorApplication,
} from '@/hooks/use-campus-ambassador';

const STATUS_COPY: Record<string, { icon: typeof Clock; label: string; body: string; className: string }> = {
  PENDING: {
    icon: Clock,
    label: 'Application submitted',
    body: 'We’re reviewing it — you’ll hear back soon.',
    className: 'text-amber-600 dark:text-amber-400',
  },
  APPROVED: {
    icon: CheckCircle2,
    label: 'You’re a Campus Ambassador! 🎉',
    body: 'Welcome aboard — thanks for helping other students discover EduBridge.',
    className: 'text-green-600 dark:text-green-400',
  },
  REJECTED: {
    icon: XCircle,
    label: 'Application not accepted this time',
    body: 'Thanks for your interest — keep an eye out for future opportunities.',
    className: 'text-destructive',
  },
};

function ApplicationStatus({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const copy = STATUS_COPY[status];
  const Icon = copy.icon;
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-6">
        <Icon className={`h-6 w-6 flex-none ${copy.className}`} />
        <div>
          <p className={`font-semibold ${copy.className}`}>{copy.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplyForm({ open }: { open: boolean }) {
  const [reason, setReason] = useState('');
  const apply = useApplyCampusAmbassador();

  if (!open) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Applications are currently closed. Check back soon.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Why do you want to become a Campus Ambassador?</span>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Tell us why you'd be a great fit — at least 20 characters."
          />
        </label>
        <Button
          disabled={reason.trim().length < 20 || apply.isPending}
          onClick={() =>
            apply.mutate(reason.trim(), {
              onSuccess: () => toast.success('Application submitted!'),
              onError: (e) => toast.error((e as Error).message),
            })
          }
        >
          Submit application
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CampusAmbassadorPage() {
  const { data: settings, isLoading: settingsLoading } = useCampusAmbassadorSettings();
  const { data: myApplication, isLoading: applicationLoading } = useMyCampusAmbassadorApplication();

  const loading = settingsLoading || applicationLoading;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHero
        eyebrow="Campus Ambassador"
        title="Represent EduBridge"
        accent="on your campus."
        sub="Help other students discover colleges, internships, and opportunities — and get recognized for it."
      />

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : myApplication ? (
        <ApplicationStatus status={myApplication.status} />
      ) : (
        <ApplyForm open={settings?.applicationsOpen ?? false} />
      )}
    </div>
  );
}
