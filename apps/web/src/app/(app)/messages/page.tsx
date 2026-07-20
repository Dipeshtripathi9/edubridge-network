'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  useChatSocket,
  useChats,
  useMessages,
  type ChatSummary,
} from '@/hooks/use-messaging';

function ChatList({
  chats,
  activeId,
  onSelect,
}: {
  chats: ChatSummary[];
  activeId: string | null;
  onSelect: (c: ChatSummary) => void;
}) {
  return (
    <div className="flex flex-col">
      {chats.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className={cn(
            'flex items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-accent',
            activeId === c.id && 'bg-accent',
          )}
        >
          <div className="relative">
            <Avatar src={c.other?.profile?.avatarUrl} name={c.other?.profile?.fullName} className="h-10 w-10" />
            {c.otherOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="truncate font-medium">{c.title ?? 'Chat'}</p>
              {c.unread > 0 && <Badge>{c.unread}</Badge>}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {c.lastMessage?.body ?? 'No messages yet'}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function Conversation({ chat }: { chat: ChatSummary }) {
  const myId = useAuthStore((s) => s.user?.id);
  const { data: messages, isLoading } = useMessages(chat.id);
  const { send, setTyping, typingUsers } = useChatSocket(chat.id);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text.trim());
    setText('');
    setTyping(false);
  };

  const onChange = (v: string) => {
    setText(v);
    setTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 1500);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Avatar src={chat.other?.profile?.avatarUrl} name={chat.other?.profile?.fullName} />
        <div>
          <p className="font-medium">{chat.title ?? 'Chat'}</p>
          <p className="text-xs text-muted-foreground">
            {chat.otherOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          (messages ?? []).map((m) => {
            const mine = m.senderId === myId;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                    mine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted',
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={cn('mt-0.5 text-[10px]', mine ? 'opacity-70' : 'text-muted-foreground')}>
                    {timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <p className="text-xs italic text-muted-foreground">typing…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          placeholder="Type a message…"
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const { data: chats, isLoading } = useChats();
  const [active, setActive] = useState<ChatSummary | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <MessageSquare className="h-6 w-6 text-primary" />
        Messages
      </h1>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-[320px_1fr]">
        <div className="overflow-y-auto border-r border-border">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !chats?.length ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No conversations yet. Start one from a profile.
            </p>
          ) : (
            <ChatList chats={chats} activeId={active?.id ?? null} onSelect={setActive} />
          )}
        </div>
        <div className="hidden md:block">
          {active ? (
            <Conversation chat={active} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
