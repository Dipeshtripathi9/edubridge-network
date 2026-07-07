'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Heart, Lock, LogOut, Send, Share2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useChatSocket, useMessages, useSendMessage } from '@/hooks/use-messaging';
import {
  Pool,
  useCreatePool,
  useDeletePool,
  useJoinPool,
  useLeavePool,
  useLikePool,
  usePools,
  useSharePool,
  useSimilarPools,
} from '@/hooks/use-pools';

export function PoolChat({
  pool,
  onBack,
  communitySlug,
}: {
  pool: Pool;
  onBack: () => void;
  communitySlug?: string;
}) {
  const myId = useAuthStore((s) => s.user?.id);
  const { data: messages, isLoading } = useMessages(pool.chatId);
  // Socket drives live receive + typing; sending goes through REST (reliable
  // even if the socket hasn't connected yet) and still broadcasts over WS.
  useChatSocket(pool.chatId);
  const sendMessage = useSendMessage(pool.chatId);
  const like = useLikePool();
  const share = useSharePool();
  const leave = useLeavePool(communitySlug ?? pool.community?.slug ?? '');
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = () => {
    const body = text.trim();
    if (!body || sendMessage.isPending) return;
    sendMessage.mutate(body, { onError: (e) => toast.error((e as Error).message) });
    setText('');
  };

  const onShare = () => {
    const url = `${window.location.origin}/pools/${pool.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    share.mutate(pool.id);
    toast.success('Pool link copied');
  };

  return (
    <Card>
      <CardContent className="flex h-[28rem] flex-col p-0">
        <div className="flex items-center gap-2 border-b p-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-semibold">{pool.title}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Private · {pool.memberCount}/{pool.maxMembers}
            </p>
          </div>
          <button
            className={cn('flex items-center gap-1 px-1 text-sm text-muted-foreground hover:text-foreground', pool.likedByMe && 'text-amber-500')}
            title="Like"
            onClick={() => like.mutate(pool.id)}
          >
            <Heart className={cn('h-4 w-4', pool.likedByMe && 'fill-current')} /> {pool.likeCount ?? 0}
          </button>
          <button className="flex items-center gap-1 px-1 text-sm text-muted-foreground hover:text-foreground" title="Share" onClick={onShare}>
            <Share2 className="h-4 w-4" /> {pool.shareCount ?? 0}
          </button>
          <Button
            variant="ghost"
            size="icon"
            title="Leave pool"
            onClick={() =>
              leave.mutate(pool.id, {
                onSuccess: () => {
                  toast.success('Left pool');
                  onBack();
                },
                onError: (e) => toast.error((e as Error).message),
              })
            }
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (messages?.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say hi 👋</p>
          ) : (
            messages!.map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  m.senderId === myId ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {m.senderId !== myId && (
                  <p className="text-xs font-medium opacity-70">{m.sender?.profile?.fullName ?? 'Member'}</p>
                )}
                {m.body}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t p-3">
          <Input
            placeholder="Message the pool…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <Button size="icon" onClick={onSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PoolsSection({ slug }: { slug: string }) {
  const { data: pools, isLoading } = usePools(slug);
  const create = useCreatePool(slug);
  const join = useJoinPool(slug);
  const leave = useLeavePool(slug);
  const del = useDeletePool(slug);
  const myId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const [openId, setOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [max, setMax] = useState(8);

  // Debounce the title so we suggest similar existing pools as the user types.
  const [debouncedTitle, setDebouncedTitle] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title), 350);
    return () => clearTimeout(t);
  }, [title]);
  const similar = useSimilarPools(slug, showForm ? debouncedTitle : '');

  const active = pools?.find((p) => p.id === openId);
  if (active && active.isMember) {
    return <PoolChat pool={active} onBack={() => setOpenId(null)} communitySlug={slug} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Private group chats — set a member limit, only joiners can talk.
        </p>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            New pool
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <Input placeholder="Pool heading" value={title} onChange={(e) => setTitle(e.target.value)} />
            {similar.data && similar.data.length > 0 && (
              <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 p-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Similar pools already exist — join one instead?
                </p>
                {similar.data.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate">
                      {p.title}{' '}
                      <span className="text-xs text-muted-foreground">
                        · {p.memberCount}/{p.maxMembers}
                      </span>
                    </span>
                    {p.isMember ? (
                      <span className="text-xs text-muted-foreground">Joined</span>
                    ) : p.isFull ? (
                      <span className="text-xs text-muted-foreground">Full</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          join.mutate(p.id, {
                            onSuccess: () => {
                              toast.success(`Joined “${p.title}”`);
                              setShowForm(false);
                              setTitle('');
                              setOpenId(p.id);
                            },
                            onError: (e) => toast.error((e as Error).message),
                          })
                        }
                      >
                        Join
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Max members
              <Input
                type="number"
                min={2}
                max={50}
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="w-24"
              />
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                disabled={create.isPending}
                onClick={() => {
                  if (!title.trim()) {
                    toast.error('Give the pool a heading');
                    return;
                  }
                  create.mutate(
                    { title, maxMembers: Math.min(50, Math.max(2, max)) },
                    {
                      onSuccess: (p) => {
                        toast.success('Pool created');
                        setShowForm(false);
                        setTitle('');
                        setOpenId(p.id);
                      },
                      onError: (e) => toast.error((e as Error).message),
                    },
                  );
                }}
              >
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (pools?.length ?? 0) === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No pools yet — create the first.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pools!.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 font-medium">
                    <span className="truncate">{p.title}</span>
                    {!p.isFull && (p.memberCount >= 2 || (p.likeCount ?? 0) >= 1) && (
                      <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-600">
                        🔥 Trending
                      </span>
                    )}
                    {p.isFull && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        Full
                      </span>
                    )}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge variant={p.isFull ? 'outline' : 'secondary'}>
                      <Users className="mr-1 h-3 w-3" />
                      {p.memberCount}/{p.maxMembers}
                    </Badge>
                    {(isAdmin || p.createdById === myId) && (
                      <button
                        title={isAdmin ? 'Delete pool (admin)' : 'Delete pool'}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`Delete the pool “${p.title}”? This can't be undone.`)) {
                            del.mutate(p.id, {
                              onSuccess: () => toast.success('Pool deleted'),
                              onError: (e) => toast.error((e as Error).message),
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {p.isMember ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setOpenId(p.id)}>
                      Open chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => leave.mutate(p.id, { onSuccess: () => toast.success('Left pool') })}
                    >
                      Leave
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={p.isFull || join.isPending}
                    onClick={() =>
                      join.mutate(p.id, {
                        onSuccess: () => {
                          toast.success('Joined pool');
                          setOpenId(p.id);
                        },
                        onError: (e) => toast.error((e as Error).message),
                      })
                    }
                  >
                    {p.isFull ? 'Full' : 'Join'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
