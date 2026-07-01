'use client';

import { useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useColleges } from '@/hooks/use-colleges';
import { cn } from '@/lib/utils';

export interface CollegeSelection {
  collegeId?: string; // set when picked from the directory
  collegeName: string; // always set (directory name or free-typed)
}

// Searchable college/university picker. Pick from the directory, or type a name
// that isn't listed and add it as a new one.
export function CollegePicker({
  value,
  onChange,
}: {
  value: CollegeSelection | null;
  onChange: (v: CollegeSelection | null) => void;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const { data } = useColleges({ q: q.trim() || undefined, sort: 'name' });
  const colleges = (data?.pages.flatMap((p) => p.data) ?? []).slice(0, 8);

  const typed = q.trim();
  const exactExists = colleges.some((c) => c.name.toLowerCase() === typed.toLowerCase());

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span className="font-medium">{value.collegeName}</span>
          {!value.collegeId && <span className="text-xs text-amber-600">(new — admin will verify)</span>}
        </span>
        <button
          className="text-xs text-muted-foreground underline"
          onClick={() => {
            onChange(null);
            setQ('');
          }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search your college / university…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && typed.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
          {colleges.map((c) => (
            <button
              key={c.id}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => {
                onChange({ collegeId: c.id, collegeName: c.name });
                setOpen(false);
              }}
            >
              <span className="font-medium">{c.name}</span>
              {c.city && <span className="text-xs text-muted-foreground">{c.city}</span>}
            </button>
          ))}
          {!exactExists && (
            <button
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-accent"
              onClick={() => {
                onChange({ collegeName: typed });
                setOpen(false);
              }}
            >
              <Plus className="h-4 w-4" /> Add “{typed}” as a new college
            </button>
          )}
        </div>
      )}
    </div>
  );
}
