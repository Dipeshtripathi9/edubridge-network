'use client';

import Link from 'next/link';
import { ArrowRight, Code2, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// EduBridge's featured student startups with their own standalone landing pages.
const FEATURED = [
  {
    href: '/startups/99x-developers',
    icon: Code2,
    name: '99x Developers',
    desc: 'Web design, development & digital marketing — EduBridge Network’s in-house studio.',
  },
  {
    href: '/startups/ez-rentbuddy',
    icon: HomeIcon,
    name: 'EZ-Rentbuddy',
    desc: 'Student housing — find PGs, hostels, flats & rooms, or earn cashback by sharing properties.',
  },
];

export function FeaturedStartups() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Startups</h2>
        <p className="text-sm text-muted-foreground">
          Student-led startups on the network — launch, join a team, or use their services.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURED.map((s) => (
          <Card key={s.href} className="card-interactive border-primary/30">
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href={s.href}>
                    Visit <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
