'use client';

import { useState } from 'react';
import { ExternalLink, Megaphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth.store';
import { isSafeHttpUrl } from '@/lib/utils';
import { useAdQuota, useBookAd, useCommunityAds, useDeleteAd } from '@/hooks/use-ads';

function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

/** Active advertisement cards, pinned at the top of the community. */
export function CommunityAds({ slug, canModerate = false }: { slug: string; canModerate?: boolean }) {
  const { data: ads } = useCommunityAds(slug);
  const del = useDeleteAd(slug);
  if (!ads || ads.length === 0) return null;
  return (
    <div className="space-y-2">
      {ads.map((ad) => (
        <Card key={ad.id} className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex gap-3 p-4">
            {ad.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <Megaphone className="h-3.5 w-3.5" /> Ad
              </p>
              <p className="font-semibold">{ad.title}</p>
              {ad.body && <p className="text-sm text-muted-foreground">{ad.body}</p>}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>by {ad.createdBy?.profile?.fullName ?? 'Community head'}</span>
                <span>· {daysLeft(ad.expiresAt)}d left</span>
                {ad.linkUrl && (
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Visit link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            {canModerate && (
              <button
                className="shrink-0 self-start text-muted-foreground hover:text-destructive"
                title="Remove ad"
                onClick={() =>
                  del.mutate(ad.id, { onSuccess: () => toast.success('Ad removed') })
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Booking form + weekly quota for a community head. */
export function BookAdCard({ slug }: { slug: string }) {
  const book = useBookAd(slug);
  const { data: quota } = useAdQuota(slug, true);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [date, setDate] = useState('');

  // Leaders book a future day (before midnight of the run day); admins may book today.
  const minDate = new Date(Date.now() + (isAdmin ? 0 : 86_400_000)).toISOString().slice(0, 10);

  const submit = () => {
    if (!title.trim() || !date) {
      toast.error('Add a title and pick a run date');
      return;
    }
    if (imageUrl.trim() && !isSafeHttpUrl(imageUrl.trim())) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    if (linkUrl.trim() && !isSafeHttpUrl(linkUrl.trim())) {
      toast.error('Link URL must start with http:// or https://');
      return;
    }
    book.mutate(
      {
        title: title.trim(),
        body: body.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        scheduledFor: date,
      },
      {
        onSuccess: () => {
          toast.success('Ad booked');
          setOpen(false);
          setTitle('');
          setBody('');
          setImageUrl('');
          setLinkUrl('');
          setDate('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Megaphone className="h-4 w-4" /> Book ad card
        {quota ? ` · ${quota.remaining}/${quota.limit} left` : ''}
      </Button>
    );
  }

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardContent className="space-y-2 p-3">
        <p className="text-sm font-medium">
          Book an advertisement card{quota ? ` (${quota.remaining} of ${quota.limit} left)` : ''}
        </p>
        <Input placeholder="Ad title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Short blurb (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
        <Input
          type="url"
          placeholder="Image URL (optional, https://)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Input
          type="url"
          placeholder="Link / CTA URL (optional, https://)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <label className="block text-xs text-muted-foreground">
          Run date {isAdmin ? '(today or later)' : '(book before midnight of that day)'}
          <Input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={book.isPending} onClick={submit}>
            Book ad
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
