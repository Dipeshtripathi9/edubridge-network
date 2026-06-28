'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car, GraduationCap, MapPin, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { type TravelPool, useCreateTravelPool, useJoinTravelPool, useTravelPools } from '@/hooks/use-travel';

const STATUS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: '🟢 Open', cls: 'bg-green-500/15 text-green-600' },
  ALMOST_FULL: { label: '🟡 Almost full', cls: 'bg-amber-500/15 text-amber-600' },
  CONFIRMED: { label: '🔵 Confirmed', cls: 'bg-blue-500/15 text-blue-600' },
  COMPLETED: { label: '🔴 Completed', cls: 'bg-red-500/15 text-red-600' },
};

function PoolCard({ pool, loggedIn }: { pool: TravelPool; loggedIn: boolean }) {
  const join = useJoinTravelPool();
  const s = STATUS[pool.status];
  const full = pool.joined >= pool.seats;
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold">{pool.title}</p>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', s.cls)}>{s.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {pool.kind === 'TRIP'
            ? `${pool.joined}/${pool.seats} joined${pool.budget ? ` · ₹${pool.budget}` : ''}${pool.startDate ? ` · ${pool.startDate}` : ''}`
            : `${pool.joined}/${pool.seats} seats${pool.time ? ` · ${pool.time}` : ''}${pool.costPerPerson ? ` · ₹${pool.costPerPerson}/person` : ''}`}
        </p>
        {pool.description && <p className="line-clamp-2 text-sm text-muted-foreground">{pool.description}</p>}
        <Button
          size="sm"
          className="w-full"
          disabled={pool.isMember || full || !loggedIn || join.isPending}
          onClick={() =>
            join.mutate(pool.id, {
              onSuccess: () => toast.success('Joined the pool!'),
              onError: (e) => toast.error((e as Error).message),
            })
          }
        >
          {pool.isMember ? 'Joined' : full ? 'Full' : !loggedIn ? 'Log in to join' : pool.kind === 'TRIP' ? 'Join Pool' : 'Join Ride Pool'}
        </Button>
      </CardContent>
    </Card>
  );
}

function CreateTrip() {
  const create = useCreateTravelPool();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: '', destination: '', startDate: '', returnDate: '', budget: '', seats: '12', college: '', genderPref: '', description: '' });
  const set = (k: keyof typeof f, v: string) => setF((c) => ({ ...c, [k]: v }));
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Create Trip Pool
      </Button>
    );
  }
  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-2 p-4">
        <Input placeholder="Trip title (e.g. Manali Weekend Trip)" value={f.title} onChange={(e) => set('title', e.target.value)} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Destination" value={f.destination} onChange={(e) => set('destination', e.target.value)} />
          <Input placeholder="Budget (₹)" value={f.budget} onChange={(e) => set('budget', e.target.value)} />
          <label className="text-xs text-muted-foreground">Start date<Input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} /></label>
          <label className="text-xs text-muted-foreground">Return date<Input type="date" value={f.returnDate} onChange={(e) => set('returnDate', e.target.value)} /></label>
          <Input placeholder="Seats needed" type="number" value={f.seats} onChange={(e) => set('seats', e.target.value)} />
          <Input placeholder="College (optional)" value={f.college} onChange={(e) => set('college', e.target.value)} />
          <Input placeholder="Gender preference (optional)" value={f.genderPref} onChange={(e) => set('genderPref', e.target.value)} />
        </div>
        <Textarea placeholder="Description" value={f.description} onChange={(e) => set('description', e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            size="sm"
            disabled={create.isPending}
            onClick={() => {
              if (!f.title.trim()) return toast.error('Add a trip title');
              create.mutate(
                { kind: 'TRIP', ...f, seats: Number(f.seats) || 12 },
                { onSuccess: () => { toast.success('Trip pool created'); setOpen(false); }, onError: (e) => toast.error((e as Error).message) },
              );
            }}
          >
            Create Pool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateRide() {
  const create = useCreateTravelPool();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ fromLocation: '', toLocation: '', date: '', time: '', frequency: 'ONE_TIME', seats: '4', estimatedFare: '', costPerPerson: '', description: '' });
  const set = (k: keyof typeof f, v: string) => setF((c) => ({ ...c, [k]: v }));
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Create Ride Pool
      </Button>
    );
  }
  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-2 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="From" value={f.fromLocation} onChange={(e) => set('fromLocation', e.target.value)} />
          <Input placeholder="To" value={f.toLocation} onChange={(e) => set('toLocation', e.target.value)} />
          <label className="text-xs text-muted-foreground">Date<Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></label>
          <label className="text-xs text-muted-foreground">Time<Input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} /></label>
          <select value={f.frequency} onChange={(e) => set('frequency', e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
            <option value="ONE_TIME">One-time</option>
            <option value="DAILY">Daily</option>
          </select>
          <Input placeholder="Available seats" type="number" value={f.seats} onChange={(e) => set('seats', e.target.value)} />
          <Input placeholder="Estimated fare (₹)" value={f.estimatedFare} onChange={(e) => set('estimatedFare', e.target.value)} />
          <Input placeholder="Cost per person (₹)" value={f.costPerPerson} onChange={(e) => set('costPerPerson', e.target.value)} />
        </div>
        <Textarea placeholder="Notes (optional)" value={f.description} onChange={(e) => set('description', e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            size="sm"
            disabled={create.isPending}
            onClick={() => {
              if (!f.fromLocation.trim() || !f.toLocation.trim()) return toast.error('Add From and To');
              create.mutate(
                { kind: 'RIDE', title: `${f.fromLocation} → ${f.toLocation}`, ...f, seats: Number(f.seats) || 4 },
                { onSuccess: () => { toast.success('Ride pool created'); setOpen(false); }, onError: (e) => toast.error((e as Error).message) },
              );
            }}
          >
            Create Ride Pool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PoolList({ kind, loggedIn }: { kind: 'TRIP' | 'RIDE'; loggedIn: boolean }) {
  const { data, isLoading } = useTravelPools(kind);
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No active pools yet — create the first.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.map((p) => (
        <PoolCard key={p.id} pool={p} loggedIn={loggedIn} />
      ))}
    </div>
  );
}

export default function GoTogetherPage() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-background to-accent/20">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">EduBridge Network</p>
              <p className="text-xs font-semibold text-primary">GoTogether · Travel</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#trips" className="hover:text-foreground">Trip Pools</a>
            <a href="#rides" className="hover:text-foreground">Ride Pools</a>
          </nav>
          {!loggedIn && (
            <Button asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-12 [&_section[id]]:scroll-mt-24">
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-12 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Car className="h-3.5 w-3.5" /> A startup on EduBridge Network
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Travel together — <span className="text-primary">trips & rides</span> with verified students.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            GoTogether helps verified students find others with the same travel plan — before creating a trip or
            booking a cab. Pool up, split costs, travel safer.
          </p>
        </section>

        {/* Trip pools */}
        <section id="trips" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">🌍 Trip Pools</h2>
            {loggedIn ? <CreateTrip /> : <Button asChild size="sm" variant="outline"><Link href="/login">Log in to create</Link></Button>}
          </div>
          <p className="text-muted-foreground">Planning a trip? Create a pool and let others join.</p>
          <PoolList kind="TRIP" loggedIn={loggedIn} />
        </section>

        {/* Ride pools */}
        <section id="rides" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">🚕 Ride Share Pools</h2>
            {loggedIn ? <CreateRide /> : <Button asChild size="sm" variant="outline"><Link href="/login">Log in to create</Link></Button>}
          </div>
          <p className="text-muted-foreground">Travelling daily or occasionally? Create a ride pool and split the fare.</p>
          <PoolList kind="RIDE" loggedIn={loggedIn} />
        </section>

        {/* Status legend */}
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Pool status</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-3 py-1 text-green-600"><Users className="h-3.5 w-3.5" /> Open – accepting members</span>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-600">Almost full – few seats left</span>
            <span className="flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-blue-600"><MapPin className="h-3.5 w-3.5" /> Confirmed – ready to travel</span>
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-600">Completed</span>
          </div>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <p className="font-semibold text-foreground">EduBridge Network · GoTogether</p>
          </div>
          <p className="mt-1">Travel & ride sharing for verified students — pool up & split costs.</p>
          <p className="mt-2"><Link href="/" className="text-primary hover:underline">← Back to EduBridge Network</Link></p>
        </footer>
      </main>
    </div>
  );
}
