'use client';

import { use } from 'react';
import { uniqueById } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  MapPin,
  Repeat,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { ResourceCard } from '@/components/resource-card';
import { ResourceUpload } from '@/components/resource-upload';
import { EmptyState } from '@/components/ui/empty-state';
import { useResources } from '@/hooks/use-resources';
import {
  useCollegeHub,
  useCollegeTransferStories,
  useFaqs,
} from '@/hooks/use-college-hub';

function StatPill({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Users;
  tone: string;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] font-bold text-muted-foreground shadow-sm">
      <Icon className={`h-[15px] w-[15px] ${tone}`} />{' '}
      <b className="font-display text-foreground">{value.toLocaleString()}</b> {label}
    </span>
  );
}

function Transfers({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useCollegeTransferStories(collegeId);
  const stories = data?.data ?? [];
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm text-muted-foreground">
            Considering transferring here? Check eligibility & requirements.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/transfer">
              Transfer Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : stories.length === 0 ? (
        <EmptyState icon={Repeat} title="No transfer stories yet" description="Be the first to share your transfer journey to or from this college." />
      ) : (
        stories.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Avatar src={s.user.profile?.avatarUrl} name={s.user.profile?.fullName} />
                <p className="text-sm font-medium">{s.user.profile?.fullName ?? 'Student'}</p>
                <span className="text-xs text-muted-foreground">
                  {s.fromCollege?.name ?? '—'} → {s.toCollege?.name ?? '—'}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.story}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function Resources({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useResources({ collegeId });
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ResourceUpload collegeId={collegeId} />
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="No resources shared yet" description="Notes, PDFs and reports shared for this college will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function Faqs({ collegeId }: { collegeId: string }) {
  const { data, isLoading } = useFaqs(collegeId);
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!data?.length)
    return <EmptyState icon={HelpCircle} title="No FAQs yet" description="Common questions about this college will be answered here." />;
  return (
    <div className="space-y-3">
      {data.map((f) => {
        // FAQs that route to expert guidance get a clickable CTA to the guidance page.
        const isGuidance = f.answer.includes('Get Expert Guidance');
        return (
          <Card key={f.id}>
            <CardContent className="p-4">
              <p className="font-medium">{f.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
              {isGuidance && (
                <Button asChild size="sm" className="mt-3">
                  <Link href="/home#get-expert-guidance">
                    Get Expert Guidance <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function CollegeHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: hub, isLoading } = useCollegeHub(slug);

  if (isLoading) return <Skeleton className="mx-auto h-72 max-w-5xl" />;
  if (!hub) return <p className="py-16 text-center text-muted-foreground">College not found.</p>;

  const c = hub.college;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div
          className="h-28 bg-secondary sm:h-32"
          style={{
            backgroundImage:
              'radial-gradient(60% 130% at 12% 0%, hsl(var(--primary) / .30), transparent 60%), radial-gradient(52% 130% at 92% 12%, hsl(var(--marigold) / .28), transparent 62%)',
          }}
        />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="-mt-16 grid h-20 w-20 flex-none place-items-center rounded-[20px] border-4 border-card bg-accent text-primary shadow-sm">
              <GraduationCap className="h-9 w-9" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[2.6px] text-primary">
                <span className="h-0.5 w-[20px] rounded-full bg-marigold" /> College Hub
              </span>
              <h1 className="mt-1.5 font-display text-[clamp(23px,4vw,34px)] font-extrabold leading-[1.08] tracking-[-.02em]">
                {c.name}
              </h1>
              {(c.city || c.state) && (
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {[c.city, c.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 border-t border-border px-6 py-4">
          <StatPill
            icon={BadgeCheck}
            tone="text-green"
            label="verified students"
            value={hub.counts.verifiedStudents}
          />
          <StatPill icon={FileText} tone="text-primary" label="resources" value={hub.counts.resources} />
          <StatPill icon={HelpCircle} tone="text-marigold" label="FAQs" value={hub.counts.faqs} />
        </div>
      </section>

      {/* Sections — Resources, and college-only Transfers & FAQs */}
      <Tabs defaultValue="resources">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resources">Resources ({hub.counts.resources})</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({hub.counts.faqs})</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <Resources collegeId={c.id} />
        </TabsContent>
        <TabsContent value="transfers">
          <Transfers collegeId={c.id} />
        </TabsContent>
        <TabsContent value="faqs">
          <Faqs collegeId={c.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
