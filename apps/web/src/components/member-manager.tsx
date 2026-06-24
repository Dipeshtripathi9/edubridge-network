'use client';

import { toast } from 'sonner';
import { Ban, MicOff, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembers, useModerateMember, useSetMemberRole } from '@/hooks/use-communities';
import { useAuthStore } from '@/stores/auth.store';

const ROLES = [
  'MEMBER',
  'MODERATOR',
  'CAMPUS_LEAD',
  'OPPORTUNITY_HEAD',
  'STUDENT_RELATIONS_HEAD',
  'ADMIN',
] as const;

const roleLabel = (r: string) => r.replace(/_/g, ' ').toLowerCase();

export function MemberManager({ slug }: { slug: string }) {
  const { data, isLoading } = useMembers(slug);
  const setRole = useSetMemberRole(slug);
  const moderate = useModerateMember(slug);
  const members = data?.data ?? [];
  // Only platform admins can change roles; managers manage but never reassign roles.
  const globalRole = useAuthStore((s) => s.user?.role);
  const canManageRoles = globalRole === 'ADMIN' || globalRole === 'SUPER_ADMIN';

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" /> Manage members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {members.map((m) => {
          const muted = m.mutedUntil && new Date(m.mutedUntil) > new Date();
          return (
            <div key={m.id} className="flex flex-wrap items-center gap-3 p-3">
              <Avatar src={m.user.profile?.avatarUrl} name={m.user.profile?.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.user.profile?.fullName ?? 'Student'}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant={m.role === 'MEMBER' ? 'secondary' : 'default'} className="capitalize">
                    {roleLabel(m.role)}
                  </Badge>
                  {m.bannedAt && <span className="text-xs text-destructive">banned</span>}
                  {muted && <span className="text-xs text-amber-600">muted</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {canManageRoles && (
                  <select
                    value={m.role}
                    title="Set role (admin only)"
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm capitalize"
                    onChange={(e) =>
                      setRole.mutate(
                        { userId: m.user.id, role: e.target.value },
                        {
                          onSuccess: () => toast.success(`Role → ${roleLabel(e.target.value)}`),
                          onError: (err) => toast.error((err as Error).message),
                        },
                      )
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">
                        {roleLabel(r)}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    moderate.mutate(
                      { userId: m.user.id, action: muted ? 'unmute' : 'mute', minutes: 60 },
                      { onSuccess: () => toast.success(muted ? 'Unmuted' : 'Muted 1h'), onError: (e) => toast.error((e as Error).message) },
                    )
                  }
                >
                  <MicOff className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={m.bannedAt ? 'outline' : 'destructive'}
                  onClick={() =>
                    moderate.mutate(
                      { userId: m.user.id, action: m.bannedAt ? 'unban' : 'ban' },
                      { onSuccess: () => toast.success(m.bannedAt ? 'Unbanned' : 'Banned'), onError: (e) => toast.error((e as Error).message) },
                    )
                  }
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
