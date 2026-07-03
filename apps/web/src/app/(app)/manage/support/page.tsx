'use client';

import { CheckCircle2, LifeBuoy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import {
  type ManagerSupportRequest,
  SUPPORT_TOPICS,
  useManagerSupportRequests,
  useResolveManagerSupport,
} from '@/hooks/use-leadership';

const TOPIC_LABEL: Record<string, string> = Object.fromEntries(
  SUPPORT_TOPICS.map((t) => [t.value, t.label]),
);
const roleLabel = (r: string) => r.replace(/_/g, ' ').toLowerCase();

function RequestCard({ r }: { r: ManagerSupportRequest }) {
  const resolve = useResolveManagerSupport();
  const name = r.user.profile?.fullName ?? 'Community manager';
  const leads = r.user.communityMembers ?? [];
  const resolved = r.status === 'RESOLVED';

  return (
    <Card className={resolved ? 'opacity-70' : undefined}>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{name}</span>
          <Badge variant="secondary">{TOPIC_LABEL[r.topic] ?? r.topic}</Badge>
          {r.user.profile?.college?.name && (
            <span className="text-xs text-muted-foreground">{r.user.profile.college.name}</span>
          )}
          {resolved && (
            <Badge className="bg-emerald-500/15 text-emerald-600">Resolved</Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(r.createdAt).toLocaleString()}
          </span>
        </div>

        {leads.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Leads:{' '}
            {leads.map((l, i) => (
              <span key={l.community.slug}>
                {i > 0 && ', '}
                <span className="text-foreground">{l.community.name}</span> ({roleLabel(l.role)})
              </span>
            ))}
          </p>
        )}

        <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-sm">{r.message}</p>

        <div className="flex items-center gap-2">
          {r.user.email && (
            <a
              href={`mailto:${r.user.email}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Mail className="h-3 w-3" /> {r.user.email}
            </a>
          )}
          {!resolved && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              disabled={resolve.isPending}
              onClick={() =>
                resolve.mutate(r.id, { onError: (e) => toast.error((e as Error).message) })
              }
            >
              <CheckCircle2 className="h-4 w-4" /> Mark resolved
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManageSupportPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const { data, isLoading, isError, error, refetch } = useManagerSupportRequests();

  if (!isAdmin) return <p className="py-16 text-center text-muted-foreground">Admins only.</p>;

  const rows = data ?? [];
  const open = rows.filter((r) => r.status !== 'RESOLVED').length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <LifeBuoy className="h-6 w-6 text-primary" /> Manager Requests
        </h1>
        <p className="text-muted-foreground">
          Community managers reaching out for referrals, mentorship or help.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load requests: {(error as Error)?.message ?? 'unknown error'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No manager requests yet.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {open} open · {rows.length} total
          </p>
          {rows.map((r) => (
            <RequestCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
