'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowUpRight, Award, Check, ChevronDown, ChevronUp, ClipboardList, GraduationCap, Inbox, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterChips } from '@/components/ui/filter-chips';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/stores/auth.store';
import {
  useAdminAssignVirtualInternshipTask,
  useAdminReviewVirtualInternshipTask,
  useAdminSetScholarshipCapacity,
  useAdminVirtualInternshipEnrollments,
  useAdminVirtualInternshipStats,
  useAdminVirtualInternshipSubmissions,
  useVirtualInternshipScholarshipStatus,
  type VirtualInternshipAdminSubmission,
  type VirtualInternshipEnrollmentStatus,
  type VirtualInternshipTrack,
} from '@/hooks/use-virtual-internship';

const TRACK_OPTIONS: { value: VirtualInternshipTrack | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All tracks' },
  { value: 'WEEK', label: '4-week' },
  { value: 'MONTH', label: '4-month' },
];

const STATUS_OPTIONS: { value: VirtualInternshipEnrollmentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'ACTIVE', label: 'Active' },
];

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function StatsRow() {
  const { data, isLoading } = useAdminVirtualInternshipStats();
  if (isLoading || !data) return <Skeleton className="h-24 w-full" />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Active enrollments" value={data.active} />
      <Stat label="Pending payment" value={data.pendingPayment} />
      <Stat label="4-week / 4-month" value={`${data.byTrack.WEEK} / ${data.byTrack.MONTH}`} />
      <Stat label="Awaiting review" value={data.submissionsPendingReview} />
    </div>
  );
}

function AssignTaskPanel({ enrollmentId }: { enrollmentId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const assign = useAdminAssignVirtualInternshipTask();

  return (
    <div className="pt-1">
      <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
        Assign task {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
      {open && (
        <div className="mt-2 space-y-2 rounded-xl border border-border bg-accent/20 p-3">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            size="sm"
            disabled={assign.isPending || !title.trim()}
            onClick={() =>
              assign.mutate(
                { enrollmentId, title: title.trim(), description: description.trim() || undefined },
                {
                  onSuccess: () => {
                    toast.success('Task assigned');
                    setTitle('');
                    setDescription('');
                    setOpen(false);
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Assign
          </Button>
        </div>
      )}
    </div>
  );
}

function EnrollmentsPanel() {
  const [track, setTrack] = useState<VirtualInternshipTrack | 'ALL'>('ALL');
  const [status, setStatus] = useState<VirtualInternshipEnrollmentStatus | 'ALL'>('ALL');
  const { data, isLoading } = useAdminVirtualInternshipEnrollments(
    track === 'ALL' ? undefined : track,
    status === 'ALL' ? undefined : status,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <FilterChips options={TRACK_OPTIONS} value={track} onChange={setTrack} />
        <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !data?.data.length ? (
        <EmptyState icon={GraduationCap} title="No enrollments" description="No virtual internship enrollments match this filter." />
      ) : (
        <div className="space-y-3">
          {data.data.map((enrollment) => {
            const tasks = enrollment.tasks ?? [];
            const approved = tasks.filter((t) => t.status === 'APPROVED').length;
            return (
              <Card key={enrollment.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{enrollment.user?.profile?.fullName ?? 'Unknown student'}</p>
                      {enrollment.user?.email && (
                        <p className="text-xs text-muted-foreground">{enrollment.user.email}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {enrollment.track === 'MONTH' ? '4-month' : '4-week'} · ₹{enrollment.feeAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary">{enrollment.status.replaceAll('_', ' ')}</Badge>
                      {tasks.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {approved}/{tasks.length} tasks approved
                        </span>
                      )}
                    </div>
                  </div>
                  {enrollment.status === 'ACTIVE' && <AssignTaskPanel enrollmentId={enrollment.id} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission }: { submission: VirtualInternshipAdminSubmission }) {
  const [note, setNote] = useState('');
  const review = useAdminReviewVirtualInternshipTask();

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{submission.title}</p>
            <p className="text-xs text-muted-foreground">
              {submission.enrollment.user.profile?.fullName ?? 'Unknown student'} · {submission.enrollment.track === 'MONTH' ? '4-month' : '4-week'} · Task {submission.taskIndex}
            </p>
          </div>
        </div>
        {submission.submissionUrl && (
          <a href={submission.submissionUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
            View submission
          </a>
        )}
        {submission.submissionNote && <p className="text-sm text-muted-foreground">{submission.submissionNote}</p>}
        <Input placeholder="Review note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-xs" />
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={review.isPending}
            onClick={() =>
              review.mutate(
                { taskId: submission.id, approve: true, reviewNote: note.trim() || undefined },
                { onSuccess: () => toast.success('Task approved'), onError: (e) => toast.error((e as Error).message) },
              )
            }
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={review.isPending}
            onClick={() =>
              review.mutate(
                { taskId: submission.id, approve: false, reviewNote: note.trim() || undefined },
                { onSuccess: () => toast.success('Sent back for changes'), onError: (e) => toast.error((e as Error).message) },
              )
            }
          >
            <X className="h-3.5 w-3.5" /> Request changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewQueuePanel() {
  const { data, isLoading } = useAdminVirtualInternshipSubmissions();

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data?.length) {
    return <EmptyState icon={Inbox} title="Nothing to review" description="No task submissions are waiting on a mentor review." />;
  }
  return (
    <div className="space-y-3">
      {data.map((submission) => (
        <SubmissionRow key={submission.id} submission={submission} />
      ))}
    </div>
  );
}

const SCHOLARSHIP_TRACKS: { key: VirtualInternshipTrack; label: string }[] = [
  { key: 'WEEK', label: '4-week' },
  { key: 'MONTH', label: '4-month' },
];

function ScholarshipTrackRow({
  track,
  label,
  capacity,
  used,
}: {
  track: VirtualInternshipTrack;
  label: string;
  capacity: number;
  used: number;
}) {
  const [value, setValue] = useState(String(capacity));
  const setCapacity = useAdminSetScholarshipCapacity();
  const dirty = value !== String(capacity);

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {used} of {capacity} seat{capacity === 1 ? '' : 's'} claimed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-24 text-sm"
          />
          <Button
            size="sm"
            disabled={!dirty || setCapacity.isPending || Number(value) < 0 || Number.isNaN(Number(value))}
            onClick={() =>
              setCapacity.mutate(
                { track, capacity: Number(value) },
                {
                  onSuccess: () => toast.success(`${label} scholarship cap set to ${value}`),
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScholarshipPanel() {
  const { data, isLoading } = useVirtualInternshipScholarshipStatus();

  if (isLoading || !data) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Set how many students can join each track with a 100% fee waiver. Seats are claimed automatically,
        first-come-first-served, until the cap is reached — set to 0 to close a track.
      </p>
      {SCHOLARSHIP_TRACKS.map(({ key, label }) => (
        <ScholarshipTrackRow key={key} track={key} label={label} capacity={data[key].capacity} used={data[key].used} />
      ))}
    </div>
  );
}

export default function ManageVirtualInternshipPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ClipboardList className="h-6 w-6 text-primary" /> Virtual Internship · Manage
          </h1>
          <p className="text-muted-foreground">Enrollment counts and task submission review.</p>
        </div>
        <Link href="/virtual-internship" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View landing page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <StatsRow />

      <Tabs defaultValue="enrollments">
        <TabsList>
          <TabsTrigger value="enrollments">
            <GraduationCap className="mr-1 h-4 w-4" /> Enrollments
          </TabsTrigger>
          <TabsTrigger value="review">
            <Inbox className="mr-1 h-4 w-4" /> Review queue
          </TabsTrigger>
          <TabsTrigger value="scholarship">
            <Award className="mr-1 h-4 w-4" /> Scholarship
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-4">
          <EnrollmentsPanel />
        </TabsContent>

        <TabsContent value="review" className="mt-4">
          <ReviewQueuePanel />
        </TabsContent>

        <TabsContent value="scholarship" className="mt-4">
          <ScholarshipPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
