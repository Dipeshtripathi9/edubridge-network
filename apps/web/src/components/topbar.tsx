'use client';

import { NavMenu } from '@/components/nav-menu';
import { BrandLockup } from '@/components/brand-lockup';
import { AccountMenu } from '@/components/account-menu';
import { HeaderSearch } from '@/components/header-search';

export function Topbar() {
  return (
    <header className="glass sticky top-0 z-30 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border/70 px-4 md:px-6">
      <div className="justify-self-start">
        <NavMenu />
      </div>
      <BrandLockup className="justify-self-center" />
      <div className="flex items-center gap-1 justify-self-end">
        <HeaderSearch />
        <AccountMenu />
      </div>
    </header>
  );
}
