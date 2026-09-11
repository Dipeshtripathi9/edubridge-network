'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Field, ConfirmDeleteButton } from '@/components/admin/catalog-form-helpers';
import { useAuthStore } from '@/stores/auth.store';
import { useInternshipCategories, OPPORTUNITY_TYPE_LABEL, type OpportunityType } from '@/hooks/use-internship-listings';
import {
  useAdminInternshipListings,
  useCreateInternshipListing,
  useUpdateInternshipListing,
  useDeleteInternshipListing,
  type InternshipListingAdmin,
} from '@/hooks/use-catalog-admin';

function InternshipListingForm({ initial, onDone }: { initial?: InternshipListingAdmin; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    company: initial?.company ?? '',
    location: initial?.location ?? '',
    isRemote: initial?.isRemote ?? false,
    type: initial?.type ?? 'INTERNSHIP',
    stipend: initial?.stipend?.toString() ?? '',
    duration: initial?.duration ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    applyUrl: initial?.applyUrl ?? '',
  });
  const create = useCreateInternshipListing();
  const update = useUpdateInternshipListing();
  const pending = create.isPending || update.isPending;
  const { data: categories } = useInternshipCategories();

  const submit = () => {
    if (!form.title.trim() || !form.company.trim() || !form.applyUrl.trim()) {
      return toast.error('Title, company, and apply URL are required');
    }
    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || 'Remote',
      isRemote: form.isRemote,
      type: form.type,
      stipend: form.stipend ? Number(form.stipend) : undefined,
      duration: form.duration.trim() || 'Flexible',
      category: form.category.trim() || 'General',
      description: form.description.trim() || 'See apply link for details',
      applyUrl: form.applyUrl.trim(),
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'Internship listing updated' : 'Internship listing created');
        onDone();
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    };
    if (initial) update.mutate({ id: initial.id, ...payload }, onSettled);
    else create.mutate(payload, onSettled);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2">
      <Field label="Title">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>
      <Field label="Company">
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </Field>
      <Field label="Location">
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </Field>
      <Field label="Remote?">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.isRemote ? 'yes' : 'no'}
          onChange={(e) => setForm({ ...form, isRemote: e.target.value === 'yes' })}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </Field>
      <Field label="Opportunity type">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as OpportunityType })}
        >
          {Object.entries(OPPORTUNITY_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Stipend (₹/month, blank = unpaid)">
        <Input type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
      </Field>
      <Field label="Duration">
        <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 months" />
      </Field>
      <Field label="Category">
        <SearchableSelect
          label="Category"
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v })}
          options={categories ?? []}
          placeholder="Select or type a category"
          searchPlaceholder="Search or type: Engineering, Design…"
        />
      </Field>
      <Field label="Apply URL">
        <Input value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save' : 'Add internship'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function InternshipListingsSection() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<InternshipListingAdmin | 'new' | null>(null);
  const { data, isLoading } = useAdminInternshipListings(q);
  const del = useDeleteInternshipListing();
  const listings = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internships</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search internships…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => setEditing('new')}>
            + Add internship
          </Button>
        </div>

        {editing === 'new' && <InternshipListingForm onDone={() => setEditing(null)} />}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {listings.length === 0 && <p className="p-4 text-sm text-muted-foreground">No internship listings yet.</p>}
            {listings.map((l) =>
              editing !== 'new' && editing?.id === l.id ? (
                <div key={l.id} className="p-2">
                  <InternshipListingForm initial={l} onDone={() => setEditing(null)} />
                </div>
              ) : (
                <div key={l.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {l.title} · {l.company}
                    </p>
                    <p className="text-muted-foreground">
                      {OPPORTUNITY_TYPE_LABEL[l.type]} · {l.isRemote ? 'Remote' : l.location} · {l.category} ·{' '}
                      {l.stipend ? `₹${l.stipend.toLocaleString()}/mo` : 'Unpaid'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(l)}>
                      Edit
                    </Button>
                    <ConfirmDeleteButton
                      onConfirm={() =>
                        del.mutate(l.id, {
                          onSuccess: () => toast.success('Internship listing deleted'),
                          onError: (e) => toast.error((e as Error).message),
                        })
                      }
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IndustryInternshipManagerPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Building2 className="h-6 w-6 text-primary" />
          Industry Internship Manager
        </h1>
        <p className="text-muted-foreground">Add, edit, and remove external internship/job listings shown on the directory.</p>
      </div>

      <InternshipListingsSection />
    </div>
  );
}
