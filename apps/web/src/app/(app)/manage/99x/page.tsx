'use client';

import Link from 'next/link';
import { ArrowUpRight, Briefcase, Code2, FileText, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth.store';
import { type AgencyLead, useAgencyLeads } from '@/hooks/use-agency';

function LeadMeta({ lead }: { lead: AgencyLead }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold">{lead.name}</span>
      <a href={`mailto:${lead.email}`} className="text-xs text-primary hover:underline">
        {lead.email}
      </a>
      {lead.phone && <span className="text-xs text-muted-foreground">📞 {lead.phone}</span>}
      <span className="ml-auto text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</span>
    </div>
  );
}

function KindPanel({
  kind,
  empty,
  render,
}: {
  kind: 'PROPOSAL' | 'CAREER' | 'INFLUENCER';
  empty: string;
  render: (l: AgencyLead) => React.ReactNode;
}) {
  const { data, isLoading } = useAgencyLeads(kind);
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  const leads = data ?? [];
  if (!leads.length) return <p className="py-12 text-center text-muted-foreground">{empty}</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{leads.length} submission{leads.length === 1 ? '' : 's'}</p>
      {leads.map((l) => (
        <Card key={l.id}>
          <CardContent className="space-y-2 p-4">
            <LeadMeta lead={l} />
            {render(l)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Manage99xPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  if (!isAdmin) return <p className="py-16 text-center text-muted-foreground">Admins only.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Code2 className="h-6 w-6 text-primary" /> 99x Developers · Manage
          </h1>
          <p className="text-muted-foreground">Proposals, job applications & influencer submissions from your studio.</p>
        </div>
        <Link href="/startups/99x-developers" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View landing page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <Tabs defaultValue="proposals">
        <TabsList>
          <TabsTrigger value="proposals">
            <FileText className="mr-1 h-4 w-4" /> Proposals
          </TabsTrigger>
          <TabsTrigger value="careers">
            <Briefcase className="mr-1 h-4 w-4" /> Job applicants
          </TabsTrigger>
          <TabsTrigger value="influencers">
            <Video className="mr-1 h-4 w-4" /> Influencers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-4">
          <KindPanel
            kind="PROPOSAL"
            empty="No proposal requests yet."
            render={(l) => (
              <>
                {l.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {l.services.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
                {l.message && <p className="text-sm text-muted-foreground">{l.message}</p>}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="careers" className="mt-4">
          <KindPanel
            kind="CAREER"
            empty="No job applications yet."
            render={(l) => (
              <>
                {l.role && <Badge variant="secondary">{l.role}</Badge>}
                {l.projectUrl && (
                  <p className="text-sm">
                    Portfolio:{' '}
                    <a href={l.projectUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      {l.projectUrl}
                    </a>
                  </p>
                )}
                {l.message && <p className="text-sm text-muted-foreground">{l.message}</p>}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="influencers" className="mt-4">
          <KindPanel
            kind="INFLUENCER"
            empty="No influencer submissions yet."
            render={(l) => (
              <>
                {l.videoUrls.length > 0 && (
                  <div className="space-y-1">
                    {l.videoUrls.map((v, i) => (
                      <p key={i} className="text-sm">
                        Video {i + 1}:{' '}
                        <a href={v} target="_blank" rel="noreferrer" className="text-primary underline">
                          {v}
                        </a>
                      </p>
                    ))}
                  </div>
                )}
                {l.message && <p className="text-sm text-muted-foreground">{l.message}</p>}
              </>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
