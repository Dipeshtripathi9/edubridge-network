'use client';

import { MobileNav } from '@/components/mobile-nav';
import { AccountMenu } from '@/components/account-menu';

export function Topbar() {
  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/70 px-4 md:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center">
        <AccountMenu />
      </div>
    </header>
  );
}
