'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeIndianRupee, GraduationCap, Home, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSubmitRentalLead } from '@/hooks/use-rentals';

const PROPERTY_TYPES = ['PG', 'Hostel', 'Flat', 'Room'];
const PARTICIPANTS = ['Property Owner', 'Broker', 'Student', 'Local Resident'];
const NAV = ['Find', 'Cashback', 'Submit', 'Policy'];

function SeekerForm() {
  const submit = useSubmitRentalLead();
  const [f, setF] = useState({
    name: '',
    phone: '',
    college: '',
    location: '',
    propertyType: 'PG',
    budget: '',
    moveInDate: '',
    occupants: '',
    gender: '',
    furnished: '',
    requirements: '',
  });
  const set = (k: keyof typeof f, v: string) => setF((cur) => ({ ...cur, [k]: v }));

  const onSubmit = () => {
    if (!f.name.trim() || !f.phone.trim()) {
      toast.error('Please add your name and phone number');
      return;
    }
    submit.mutate(
      { kind: 'SEEKER', ...f },
      {
        onSuccess: () => {
          toast.success('Request sent! Our accommodation team will contact you.');
          setF({ name: '', phone: '', college: '', location: '', propertyType: 'PG', budget: '', moveInDate: '', occupants: '', gender: '', furnished: '', requirements: '' });
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card className="border-primary/30 shadow-sm">
      <CardContent className="space-y-3 p-6">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Name *" value={f.name} onChange={(e) => set('name', e.target.value)} />
          <Input placeholder="Phone number *" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
          <Input placeholder="College / University" value={f.college} onChange={(e) => set('college', e.target.value)} />
          <Input placeholder="Preferred location" value={f.location} onChange={(e) => set('location', e.target.value)} />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Property type</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set('propertyType', t)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm',
                  f.propertyType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Budget (₹ / month)" value={f.budget} onChange={(e) => set('budget', e.target.value)} />
          <label className="text-xs text-muted-foreground">
            Move-in date
            <Input type="date" value={f.moveInDate} onChange={(e) => set('moveInDate', e.target.value)} />
          </label>
          <Input placeholder="Number of occupants" value={f.occupants} onChange={(e) => set('occupants', e.target.value)} />
          <select
            value={f.gender}
            onChange={(e) => set('gender', e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Gender preference</option>
            <option>Male</option>
            <option>Female</option>
            <option>Any</option>
          </select>
          <select
            value={f.furnished}
            onChange={(e) => set('furnished', e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Furnished / Unfurnished</option>
            <option>Furnished</option>
            <option>Semi-furnished</option>
            <option>Unfurnished</option>
          </select>
        </div>

        <Textarea placeholder="Additional requirements" value={f.requirements} onChange={(e) => set('requirements', e.target.value)} />
        <Button onClick={onSubmit} disabled={submit.isPending}>
          Find My Accommodation <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Our accommodation team will contact you with suitable options.</p>
      </CardContent>
    </Card>
  );
}

function PropertyForm() {
  const submit = useSubmitRentalLead();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [participant, setParticipant] = useState(PARTICIPANTS[0]);
  const [driveUrl, setDriveUrl] = useState('');
  const [details, setDetails] = useState('');

  const onSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Please add your name and phone number');
      return;
    }
    submit.mutate(
      { kind: 'PROPERTY', name: name.trim(), phone: phone.trim(), participant, driveUrl: driveUrl.trim() || undefined, details: details.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Property submitted! We’ll verify and reach out about cashback.');
          setName('');
          setPhone('');
          setDriveUrl('');
          setDetails('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card className="border-green-500/40 bg-green-500/5">
      <CardContent className="space-y-3 p-6">
        <p className="text-sm text-muted-foreground">
          Upload a Google Drive folder with: <strong>property photos, videos, location, owner/broker contact, rent
          details & amenities</strong> — or describe it directly below.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">You are a…</p>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANTS.map((p) => (
              <button
                key={p}
                onClick={() => setParticipant(p)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm',
                  participant === p ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <Input placeholder="Google Drive folder link (https://drive.google.com/…)" value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} />
        <Textarea placeholder="Or property details directly — rent, amenities, location, contact…" value={details} onChange={(e) => setDetails(e.target.value)} />
        <Button onClick={onSubmit} disabled={submit.isPending}>
          <Upload className="h-4 w-4" /> Submit Property
        </Button>
        <p className="text-xs text-muted-foreground">
          Earn up to <strong>₹1,000 cashback</strong> when your referral leads to a successful booking.*
        </p>
      </CardContent>
    </Card>
  );
}

export default function EzRentbuddyPage() {
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
              <p className="text-xs font-semibold text-primary">EZ-Rentbuddy · Stays</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="hover:text-foreground">
                {n}
              </a>
            ))}
          </nav>
          <Button asChild size="sm">
            <a href="#find">Find a place</a>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 [&_section[id]]:scroll-mt-24">
        {/* Hero */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-14 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Home className="h-3.5 w-3.5" /> A startup on EduBridge Network
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Find your perfect <span className="text-primary">PG, hostel, flat or room</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Tell us what you’re looking for and our team helps you find the best options near your college — or
            share a property you know and earn cashback.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="#find">Find My Accommodation</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#submit">Share a Property · Earn ₹1,000</a>
            </Button>
          </div>
        </section>

        {/* Part of EduBridge */}
        <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </span>
          <div>
            <p className="font-semibold">Part of EduBridge Network</p>
            <p className="text-sm text-muted-foreground">
              EZ-Rentbuddy is a student-housing startup inside EduBridge Network — verified options near your
              campus, and a way to earn passive income by sharing properties you know.
            </p>
          </div>
        </section>

        {/* Find */}
        <section id="find" className="space-y-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Search className="h-6 w-6 text-primary" /> Looking for accommodation?
            </h2>
            <p className="text-muted-foreground">Fill out this simple request and our team will reach out with options.</p>
          </div>
          <SeekerForm />
        </section>

        {/* Cashback */}
        <section id="cashback" className="space-y-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <BadgeIndianRupee className="h-6 w-6 text-primary" /> Earn cashback by sharing properties
            </h2>
            <p className="text-muted-foreground">
              Know a PG, hostel, flat or room for rent? Share it and earn up to <strong>₹1,000 cashback</strong>{' '}
              when your referral leads to a successful booking.*
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="mb-2 text-sm font-medium">Who can participate?</p>
              <div className="flex flex-wrap gap-2">
                {[...PARTICIPANTS, 'Anyone wanting passive income'].map((p) => (
                  <span key={p} className="rounded-full border border-border px-3 py-1 text-sm">
                    {p}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Submit */}
        <section id="submit" className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold">Submit a property</h2>
            <p className="text-muted-foreground">Share a Google Drive folder or the details directly.</p>
          </div>
          <PropertyForm />
        </section>

        {/* Policy */}
        <section id="policy" className="space-y-3">
          <h2 className="text-2xl font-bold">Cashback policy</h2>
          <Card>
            <CardContent className="space-y-2 p-6 text-sm text-muted-foreground">
              <p>• Cashback is paid only after successful verification and booking.</p>
              <p>• Cashback amount depends on the property type and booking value.</p>
              <p>• Duplicate or invalid submissions are not eligible.</p>
              <p>• Additional terms &amp; conditions apply.</p>
            </CardContent>
          </Card>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <p className="font-semibold text-foreground">EduBridge Network · EZ-Rentbuddy</p>
          </div>
          <p className="mt-1">Student housing — PGs, hostels, flats & rooms near your campus.</p>
          <p className="mt-2">
            <Link href="/" className="text-primary hover:underline">
              ← Back to EduBridge Network
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
