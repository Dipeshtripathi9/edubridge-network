'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  GraduationCap,
  Home,
  LayoutGrid,
  MessageSquare,
  Repeat,
  ShieldCheck,
  Target,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/communities', label: 'Communities', icon: LayoutGrid },
  { href: '/transfer', label: 'Transfer Hub', icon: Repeat },
  { href: '/opportunities', label: 'Opportunities', icon: Target },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/leaderboard', label: 'Leaderboard', icon: Award },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const nav = isAdmin ? [...NAV, { href: '/admin', label: 'Admin', icon: ShieldCheck }] : NAV;
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
      <Link href="/dashboard" className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">EduBridge</span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-6 py-4 text-xs text-muted-foreground">Your Future, Our Network</p>
    </aside>
  );
}
