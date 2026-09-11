'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

export function BoolField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">{children}</p>;
}

// Inline confirm instead of window.confirm — native confirm() dialogs are
// blocking and inconsistent with the rest of the UI.
export function ConfirmDeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
        >
          Confirm delete
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
