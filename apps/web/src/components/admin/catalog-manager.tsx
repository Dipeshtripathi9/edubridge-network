'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import type { College } from '@/hooks/use-colleges';
import {
  useAdminColleges,
  useCreateCollege,
  useUpdateCollege,
  useDeleteCollege,
  useAdminScholarships,
  useCreateScholarship,
  useUpdateScholarship,
  useDeleteScholarship,
  useAdminInternshipListings,
  useCreateInternshipListing,
  useUpdateInternshipListing,
  useDeleteInternshipListing,
  type Scholarship,
  type InternshipListingAdmin,
} from '@/hooks/use-catalog-admin';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

// ---------- Colleges ----------

function CollegeForm({ initial, onDone }: { initial?: College; onDone: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    state: initial?.state ?? '',
    city: initial?.city ?? '',
    type: initial?.type ?? '',
    nirfRank: initial?.nirfRank?.toString() ?? '',
    accreditation: initial?.accreditation ?? '',
    admissionPrimary: initial?.admissionPrimary ?? '',
    admissionSecondary: initial?.admissionSecondary ?? '',
    tuitionFeePerYear: initial?.tuitionFeePerYear?.toString() ?? '',
    verified: initial?.verified ?? false,
    hasScholarship: initial?.hasScholarship ?? false,
  });
  const create = useCreateCollege();
  const update = useUpdateCollege();
  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (!form.name.trim()) return toast.error('Name is required');
    const payload = {
      name: form.name.trim(),
      state: form.state.trim() || undefined,
      city: form.city.trim() || undefined,
      type: form.type.trim() || undefined,
      nirfRank: form.nirfRank ? Number(form.nirfRank) : undefined,
      accreditation: form.accreditation.trim() || undefined,
      admissionPrimary: form.admissionPrimary.trim() || undefined,
      admissionSecondary: form.admissionSecondary.trim() || undefined,
      tuitionFeePerYear: form.tuitionFeePerYear ? Number(form.tuitionFeePerYear) : undefined,
      verified: form.verified,
      hasScholarship: form.hasScholarship,
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'College updated' : 'College created');
        onDone();
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    };
    if (initial) update.mutate({ id: initial.id, ...payload }, onSettled);
    else create.mutate(payload, onSettled);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2">
      <Field label="Name">
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="NIRF rank">
        <Input type="number" value={form.nirfRank} onChange={(e) => setForm({ ...form, nirfRank: e.target.value })} />
      </Field>
      <Field label="City">
        <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </Field>
      <Field label="State">
        <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
      </Field>
      <Field label="Type">
        <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Engineering, Design…" />
      </Field>
      <Field label="Accreditation">
        <Input
          value={form.accreditation}
          onChange={(e) => setForm({ ...form, accreditation: e.target.value })}
          placeholder="UGC · AICTE Approved"
        />
      </Field>
      <Field label="Admission criteria (line 1)">
        <Input
          value={form.admissionPrimary}
          onChange={(e) => setForm({ ...form, admissionPrimary: e.target.value })}
          placeholder="Direct Admission"
        />
      </Field>
      <Field label="Admission criteria (line 2)">
        <Input
          value={form.admissionSecondary}
          onChange={(e) => setForm({ ...form, admissionSecondary: e.target.value })}
          placeholder="Board score >50%"
        />
      </Field>
      <Field label="Tuition fee / year (₹)">
        <Input
          type="number"
          value={form.tuitionFeePerYear}
          onChange={(e) => setForm({ ...form, tuitionFeePerYear: e.target.value })}
        />
      </Field>
      <div className="flex items-end gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(e) => setForm({ ...form, verified: e.target.checked })}
          />
          Verified
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.hasScholarship}
            onChange={(e) => setForm({ ...form, hasScholarship: e.target.checked })}
          />
          Scholarship available
        </label>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save' : 'Add college'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CollegesSection() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<College | 'new' | null>(null);
  const { data, isLoading } = useAdminColleges(q);
  const del = useDeleteCollege();
  const colleges = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colleges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search colleges…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => setEditing('new')}>
            + Add college
          </Button>
        </div>

        {editing === 'new' && <CollegeForm onDone={() => setEditing(null)} />}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {colleges.length === 0 && <p className="p-4 text-sm text-muted-foreground">No colleges yet.</p>}
            {colleges.map((c) =>
              editing !== 'new' && editing?.id === c.id ? (
                <div key={c.id} className="p-2">
                  <CollegeForm initial={c} onDone={() => setEditing(null)} />
                </div>
              ) : (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-muted-foreground">
                      {[c.city, c.state].filter(Boolean).join(', ')}
                      {c.nirfRank ? ` · NIRF #${c.nirfRank}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Delete ${c.name}? This can’t be undone.`)) {
                          del.mutate(c.id, {
                            onSuccess: () => toast.success('College deleted'),
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
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

// ---------- Scholarships ----------

function ScholarshipForm({ initial, onDone }: { initial?: Scholarship; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    provider: initial?.provider ?? '',
    amountPerYear: initial?.amountPerYear?.toString() ?? '',
    category: initial?.category ?? '',
    eligibilityText: initial?.eligibilityText ?? '',
    applyUrl: initial?.applyUrl ?? '',
    deadline: initial?.deadline ? initial.deadline.slice(0, 10) : '',
  });
  const create = useCreateScholarship();
  const update = useUpdateScholarship();
  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (!form.title.trim() || !form.provider.trim() || !form.deadline) {
      return toast.error('Title, provider, and deadline are required');
    }
    const payload = {
      title: form.title.trim(),
      provider: form.provider.trim(),
      amountPerYear: Number(form.amountPerYear) || 0,
      category: form.category.trim() || 'General',
      eligibilityText: form.eligibilityText.trim() || 'See apply link for details',
      applyUrl: form.applyUrl.trim(),
      deadline: form.deadline,
      eligibleCourses: initial?.eligibleCourses ?? [],
      eligibleStates: initial?.eligibleStates ?? [],
    };
    const onSettled = {
      onSuccess: () => {
        toast.success(initial ? 'Scholarship updated' : 'Scholarship created');
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
      <Field label="Provider">
        <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
      </Field>
      <Field label="Amount / year (₹)">
        <Input
          type="number"
          value={form.amountPerYear}
          onChange={(e) => setForm({ ...form, amountPerYear: e.target.value })}
        />
      </Field>
      <Field label="Category">
        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Merit, Need-based…" />
      </Field>
      <Field label="Apply URL">
        <Input value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
      </Field>
      <Field label="Deadline">
        <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Eligibility">
          <Textarea
            value={form.eligibilityText}
            onChange={(e) => setForm({ ...form, eligibilityText: e.target.value })}
            rows={2}
          />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {initial ? 'Save' : 'Add scholarship'}
        </Button>
        <Button size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ScholarshipsSection() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Scholarship | 'new' | null>(null);
  const { data, isLoading } = useAdminScholarships(q);
  const del = useDeleteScholarship();
  const scholarships = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scholarships</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search scholarships…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => setEditing('new')}>
            + Add scholarship
          </Button>
        </div>

        {editing === 'new' && <ScholarshipForm onDone={() => setEditing(null)} />}

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {scholarships.length === 0 && <p className="p-4 text-sm text-muted-foreground">No scholarships yet.</p>}
            {scholarships.map((s) =>
              editing !== 'new' && editing?.id === s.id ? (
                <div key={s.id} className="p-2">
                  <ScholarshipForm initial={s} onDone={() => setEditing(null)} />
                </div>
              ) : (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-muted-foreground">
                      {s.provider} · ₹{s.amountPerYear.toLocaleString()}/yr · {s.category}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Delete ${s.title}? This can’t be undone.`)) {
                          del.mutate(s.id, {
                            onSuccess: () => toast.success('Scholarship deleted'),
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
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

// ---------- Internship listings ----------

function InternshipListingForm({ initial, onDone }: { initial?: InternshipListingAdmin; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    company: initial?.company ?? '',
    location: initial?.location ?? '',
    isRemote: initial?.isRemote ?? false,
    stipend: initial?.stipend?.toString() ?? '',
    duration: initial?.duration ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    applyUrl: initial?.applyUrl ?? '',
  });
  const create = useCreateInternshipListing();
  const update = useUpdateInternshipListing();
  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (!form.title.trim() || !form.company.trim() || !form.applyUrl.trim()) {
      return toast.error('Title, company, and apply URL are required');
    }
    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || 'Remote',
      isRemote: form.isRemote,
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
      <Field label="Stipend (₹/month, blank = unpaid)">
        <Input type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
      </Field>
      <Field label="Duration">
        <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 months" />
      </Field>
      <Field label="Category">
        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Engineering, Design…" />
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
                      {l.isRemote ? 'Remote' : l.location} · {l.category} ·{' '}
                      {l.stipend ? `₹${l.stipend.toLocaleString()}/mo` : 'Unpaid'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(l)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Delete ${l.title}? This can’t be undone.`)) {
                          del.mutate(l.id, {
                            onSuccess: () => toast.success('Internship listing deleted'),
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
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

export function CatalogManager() {
  return (
    <div className="space-y-6">
      <CollegesSection />
      <ScholarshipsSection />
      <InternshipListingsSection />
    </div>
  );
}
