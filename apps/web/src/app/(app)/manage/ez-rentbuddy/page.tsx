'use client';

import Link from 'next/link';
import { ArrowUpRight, Home as HomeIcon, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth.store';
import { type RentalLead, useRentalLeads } from '@/hooks/use-rentals';

function Meta({ lead }: { lead: RentalLead }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold">{lead.name}</span>
      {lead.phone && <span className="text-xs text-muted-foreground">📞 {lead.phone}</span>}
      {lead.email && (
        <a href={`mailto:${lead.email}`} className="text-xs text-primary hover:underline">
          {lead.email}
        </a>
      )}
      <span className="ml-auto text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm">{value}</p>
    </div>
  );
}

function Panel({
  kind,
  empty,
  render,
}: {
  kind: 'SEEKER' | 'PROPERTY';
  empty: string;
  render: (l: RentalLead) => React.ReactNode;
}) {
  const { data, isLoading } = useRentalLeads(kind);
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  const leads = data ?? [];
  if (!leads.length) return <p className="py-12 text-center text-muted-foreground">{empty}</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{leads.length} submission{leads.length === 1 ? '' : 's'}</p>
      {leads.map((l) => (
        <Card key={l.id}>
          <CardContent className="space-y-3 p-4">
            <Meta lead={l} />
            {render(l)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ManageEzRentbuddyPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  if (!isAdmin) return <p className="py-16 text-center text-muted-foreground">Admins only.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <HomeIcon className="h-6 w-6 text-primary" /> EZ-Rentbuddy · Manage
          </h1>
          <p className="text-muted-foreground">Accommodation requests & property submissions from students and owners.</p>
        </div>
        <Link href="/startups/ez-rentbuddy" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View landing page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <Tabs defaultValue="seekers">
        <TabsList>
          <TabsTrigger value="seekers">
            <Search className="mr-1 h-4 w-4" /> Accommodation requests
          </TabsTrigger>
          <TabsTrigger value="properties">
            <HomeIcon className="mr-1 h-4 w-4" /> Property submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seekers" className="mt-4">
          <Panel
            kind="SEEKER"
            empty="No accommodation requests yet."
            render={(l) => (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                  <Field label="Type" value={l.propertyType} />
                  <Field label="Location" value={l.location} />
                  <Field label="Budget" value={l.budget ? `₹${l.budget}` : undefined} />
                  <Field label="Move-in" value={l.moveInDate} />
                  <Field label="College" value={l.college} />
                  <Field label="Occupants" value={l.occupants} />
                  <Field label="Gender" value={l.gender} />
                  <Field label="Furnished" value={l.furnished} />
                </div>
                {l.requirements && <p className="text-sm text-muted-foreground">{l.requirements}</p>}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <Panel
            kind="PROPERTY"
            empty="No property submissions yet."
            render={(l) => (
              <>
                {l.participant && <Badge variant="secondary">{l.participant}</Badge>}
                {l.driveUrl && (
                  <p className="text-sm">
                    Drive folder:{' '}
                    <a href={l.driveUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      Open ↗
                    </a>
                  </p>
                )}
                {l.details && <p className="text-sm text-muted-foreground">{l.details}</p>}
              </>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
