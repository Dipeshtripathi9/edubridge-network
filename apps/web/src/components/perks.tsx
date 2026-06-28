'use client';

import { useState } from 'react';
import { Briefcase, ExternalLink, PartyPopper, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useClaimDiscount,
  useCreateReferral,
  useDeleteReferral,
  useDiscountStatus,
  useReferrals,
} from '@/hooks/use-perks';

/** Perk 2 — 45%-off web-dev unlock when a community crosses 600 members. */
export function DiscountUnlock({ slug }: { slug: string }) {
  const { data } = useDiscountStatus(slug);
  const claim = useClaimDiscount(slug);
  if (!data) return null;

  if (data.claim) {
    return (
      <Card className="border-green-500/40 bg-green-500/5">
        <CardContent className="flex items-center gap-2 p-4 text-sm">
          <PartyPopper className="h-4 w-4 text-green-600" />
          45% off website development — <strong>claimed</strong>. Our team will reach out to you.
        </CardContent>
      </Card>
    );
  }

  if (!data.eligible) {
    const togo = data.minMembers - data.memberCount;
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          🎯 Grow to <strong>{data.minMembers} members</strong> to unlock <strong>45% off website
          development</strong> — {togo} to go ({data.memberCount}/{data.minMembers}).
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div className="text-sm">
          <p className="flex items-center gap-1.5 font-medium">
            <PartyPopper className="h-4 w-4 text-primary" /> You unlocked 45% off website development!
          </p>
          <p className="text-muted-foreground">{data.memberCount}+ members. Claim it and we’ll reach out.</p>
        </div>
        <Button
          size="sm"
          disabled={claim.isPending}
          onClick={() =>
            claim.mutate(undefined, {
              onSuccess: () => toast.success('Claimed — we’ll be in touch!'),
              onError: (e) => toast.error((e as Error).message),
            })
          }
        >
          Claim 45% off
        </Button>
      </CardContent>
    </Card>
  );
}

/** Perk 3 — career referrals visible to leaders; admins post them. */
export function ReferralsSection({ enabled, isAdmin }: { enabled: boolean; isAdmin: boolean }) {
  const { data: referrals, isLoading } = useReferrals(enabled);
  const create = useCreateReferral();
  const del = useDeleteReferral();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [desc, setDesc] = useState('');
  const [link, setLink] = useState('');

  if (!enabled) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Briefcase className="h-5 w-5 text-primary" /> Career referrals
        </h3>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? 'Cancel' : 'Post referral'}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Referral opportunities for community leaders — a perk of leading on EduBridge Network.
      </p>

      {isAdmin && open && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <Input placeholder="Role / title" value={role} onChange={(e) => setRole(e.target.value)} />
            <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input placeholder="Link (optional, https://)" value={link} onChange={(e) => setLink(e.target.value)} />
            <Button
              size="sm"
              disabled={!role.trim() || !company.trim() || create.isPending}
              onClick={() =>
                create.mutate(
                  { role: role.trim(), company: company.trim(), description: desc.trim() || undefined, link: link.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Referral posted');
                      setOpen(false);
                      setRole('');
                      setCompany('');
                      setDesc('');
                      setLink('');
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              Post referral
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (referrals?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No referral opportunities yet — check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {referrals!.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">
                    {r.role} <span className="text-muted-foreground">· {r.company}</span>
                  </p>
                  {isAdmin && (
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove"
                      onClick={() => del.mutate(r.id, { onSuccess: () => toast.success('Removed') })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
