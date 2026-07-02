'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Code2,
  Crown,
  GraduationCap,
  Headset,
  Home,
  LayoutGrid,
  Repeat,
  Rocket,
  ShieldCheck,
  Target,
  BookOpen,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

export const NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/communities', label: 'Communities', icon: LayoutGrid },
  { href: '/startups', label: 'Startups', icon: Rocket },
  { href: '/opportunities', label: 'Opportunities', icon: Target },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/transfer', label: 'Transfer Hub', icon: Repeat },
  { href: '/network', label: 'Network', icon: Users },
  { href: '/leadership', label: 'Leadership', icon: Crown },
];

// Admin-only nav items, appended after the shared nav.
export const ADMIN_NAV = [
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
  { href: '/manage/mentors', label: 'Mentors', icon: Headset },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/manage/99x', label: '99x Developers', icon: Code2 },
  { href: '/manage/ez-rentbuddy', label: 'EZ-Rentbuddy', icon: Home },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const nav = [...NAV, ...(isAdmin ? ADMIN_NAV : [])];
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
      <Link href="/home" className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-sm shadow-primary/30">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">EduBridge Network</span>
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
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'text-muted-foreground hover:translate-x-0.5 hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4 transition-transform duration-200', !active && 'group-hover:scale-110')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-6 py-4 text-xs text-muted-foreground">Your Future, Our Network</p>
    </aside>
  );
}
