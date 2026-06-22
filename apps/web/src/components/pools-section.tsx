'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { useChatSocket, useMessages } from '@/hooks/use-messaging';
import { Pool, useCreatePool, useJoinPool, useLeavePool, usePools } from '@/hooks/use-pools';

function PoolChat({ pool, onBack }: { pool: Pool; onBack: () => void }) {
  const myId = useAuthStore((s) => s.user?.id);
  const { data: messages, isLoading } = useMessages(pool.chatId);
  const { send } = useChatSocket(pool.chatId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = () => {
    if (!text.trim()) return;
    send(text.trim());
    setText('');
  };

  return (
    <Card>
      <CardContent className="flex h-[28rem] flex-col p-0">
        <div className="flex items-center gap-2 border-b p-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm font-semibold">{pool.title}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Private · {pool.memberCount}/{pool.maxMembers}
            </p>
          </div>
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
  const [openId, setOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [max, setMax] = useState(8);

  const active = pools?.find((p) => p.id === openId);
  if (active && active.isMember) {
    return <PoolChat pool={active} onBack={() => setOpenId(null)} />;
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
                <div className="flex items-center justify-between">
                  <p className="font-medium">{p.title}</p>
                  <Badge variant={p.isFull ? 'outline' : 'secondary'}>
                    <Users className="mr-1 h-3 w-3" />
                    {p.memberCount}/{p.maxMembers}
                  </Badge>
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
