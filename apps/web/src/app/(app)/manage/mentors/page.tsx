'use client';

import { useState } from 'react';
import { Headset, IdCard, Phone, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { type MentorRequest, useMentorRequests } from '@/hooks/use-mentors';
import { useProfileLeads } from '@/hooks/use-profile-leads';
import { ProfileLeadCard } from '@/components/profile-lead-card';

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm">{value}</p>
    </div>
  );
}

function RequestCard({ m }: { m: MentorRequest }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{m.name}</span>
          <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Phone className="h-3 w-3" /> {m.phone}
          </a>
          {m.email && (
            <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline">
              {m.email}
            </a>
          )}
          {m.contactMethod && (
            <Badge variant="secondary">prefers {m.contactMethod === 'CALL' ? 'call' : 'chat'}</Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          <Field label="Course" value={m.course} />
          <Field label="Location" value={m.location} />
          <Field label="Marks" value={m.marks} />
          <Field label="Budget" value={m.budget ? `₹${m.budget}` : undefined} />
          <Field label="Category" value={m.category} />
          <Field label="Preferred college" value={m.preferredCollege} />
        </div>

        {m.message && <p className="rounded-md bg-muted/40 p-2 text-sm text-muted-foreground">{m.message}</p>}
      </CardContent>
    </Card>
  );
}

function ProfileLeadsSection() {
  const { data, isLoading } = useProfileLeads();
  const [q, setQ] = useState('');
  const all = data ?? [];
  const term = q.trim().toLowerCase();
  const rows = term
    ? all.filter((l) => [l.name, l.phone, l.email].filter(Boolean).some((v) => v!.toLowerCase().includes(term)))
    : all;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <IdCard className="h-6 w-6 text-primary" /> Student Profiles
        </h2>
        <p className="text-muted-foreground">One card per student — swipe the 4 steps, add a note, or delete with a reason.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search profiles by name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {all.length === 0 ? 'No student profiles yet.' : `No profiles match “${q}”.`}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{rows.length} profile{rows.length === 1 ? '' : 's'}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((l) => <ProfileLeadCard key={l.id} lead={l} />)}
          </div>
        </>
      )}
    </section>
  );
}

export default function ManageMentorsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const { data, isLoading } = useMentorRequests();
  const [q, setQ] = useState('');

  if (!isAdmin) return <p className="py-16 text-center text-muted-foreground">Admins only.</p>;

  const all = data ?? [];
  const term = q.trim().toLowerCase();
  const rows = term
    ? all.filter((m) =>
        [m.name, m.phone, m.email, m.course, m.location, m.preferredCollege]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term)),
      )
    : all;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <ProfileLeadsSection />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Headset className="h-6 w-6 text-primary" /> Mentors · Guidance Requests
        </h1>
        <p className="text-muted-foreground">Students who requested 1:1 expert guidance — reach out by call or chat.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, phone, course, college…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {all.length === 0 ? 'No guidance requests yet.' : `No requests match “${q}”.`}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{rows.length} request{rows.length === 1 ? '' : 's'}</p>
          {rows.map((m) => (
            <RequestCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
