'use client';

import { useEffect, useRef, useState } from 'react';
import { COURSE_TAXONOMY, COURSE_FIELDS } from '@/lib/course-taxonomy';
import { cn } from '@/lib/utils';
import styles from './course-path-selector.module.css';

export interface CoursePathValue {
  field: string;
  degree: string;
  specialization: string;
}

type PanelKey = 'field' | 'degree' | 'spec' | null;

function OptionList({
  items,
  activeValue,
  onPick,
}: {
  items: string[];
  activeValue: string;
  onPick: (item: string) => void;
}) {
  if (items.length === 0) {
    return <div className={styles.noMatch}>No matches</div>;
  }
  return (
    <div className={styles.optList}>
      {items.map((item) => (
        <div
          key={item}
          className={cn(styles.optItem, item === activeValue && styles.optItemActive)}
          onClick={(e) => {
            e.stopPropagation();
            onPick(item);
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  disabledPlaceholder,
  disabled,
  chosen,
  open,
  onToggle,
  searchPlaceholder,
  search,
  onSearch,
  options,
  activeValue,
  onPick,
}: {
  label: string;
  placeholder: string;
  disabledPlaceholder: string;
  disabled: boolean;
  chosen: string;
  open: boolean;
  onToggle: () => void;
  searchPlaceholder: string;
  search: string;
  onSearch: (v: string) => void;
  options: string[];
  activeValue: string;
  onPick: (item: string) => void;
}) {
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.field}>
      <button
        type="button"
        className={cn(styles.trigger, open && styles.triggerOpen)}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle();
        }}
      >
        {chosen ? (
          <span className={styles.chosen}>{chosen}</span>
        ) : (
          <span className={styles.placeholder}>{disabled ? disabledPlaceholder : placeholder}</span>
        )}
        <span className={cn(styles.chev, open && styles.chevOpen)}>▾</span>
      </button>

      {open && (
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <div className={styles.panelHeader}>
            <span>{label}</span>
            <button type="button" className={styles.panelClose} onClick={onToggle}>
              ×
            </button>
          </div>
          <div className={styles.searchBox}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
          <OptionList items={filtered} activeValue={activeValue} onPick={onPick} />
        </div>
      )}
    </div>
  );
}

export function CoursePathSelector({ value, onChange }: { value: CoursePathValue; onChange: (v: CoursePathValue) => void }) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [search, setSearch] = useState({ field: '', degree: '', spec: '' });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = () => setOpenPanel(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const togglePanel = (panel: PanelKey) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
    setSearch({ field: '', degree: '', spec: '' });
  };

  const degreeOptions = value.field ? Object.keys(COURSE_TAXONOMY[value.field] ?? {}) : [];
  const specOptions = value.field && value.degree ? COURSE_TAXONOMY[value.field]?.[value.degree] ?? [] : [];
  const specDisabled = !value.degree || specOptions.length === 0;

  return (
    <div ref={wrapRef} className={styles.wrap} onClick={(e) => e.stopPropagation()}>
      <div className={styles.row3}>
        <SelectField
          label="Field"
          placeholder="Select field"
          disabledPlaceholder="Select field"
          disabled={false}
          chosen={value.field}
          open={openPanel === 'field'}
          onToggle={() => togglePanel('field')}
          searchPlaceholder="Search field..."
          search={search.field}
          onSearch={(v) => setSearch((s) => ({ ...s, field: v }))}
          options={COURSE_FIELDS}
          activeValue={value.field}
          onPick={(f) => {
            onChange({ field: f, degree: '', specialization: '' });
            setOpenPanel(null);
          }}
        />

        <SelectField
          label="Degree"
          placeholder="Select degree"
          disabledPlaceholder="Select field first"
          disabled={!value.field}
          chosen={value.degree}
          open={openPanel === 'degree'}
          onToggle={() => togglePanel('degree')}
          searchPlaceholder="Search degree..."
          search={search.degree}
          onSearch={(v) => setSearch((s) => ({ ...s, degree: v }))}
          options={degreeOptions}
          activeValue={value.degree}
          onPick={(d) => {
            onChange({ ...value, degree: d, specialization: '' });
            setOpenPanel(null);
          }}
        />

        <SelectField
          label="Specialization"
          placeholder="Select specialization"
          disabledPlaceholder={!value.degree ? 'Select degree first' : 'Not applicable for this degree'}
          disabled={specDisabled}
          chosen={value.specialization}
          open={openPanel === 'spec'}
          onToggle={() => togglePanel('spec')}
          searchPlaceholder="Search specialization..."
          search={search.spec}
          onSearch={(v) => setSearch((s) => ({ ...s, spec: v }))}
          options={specOptions}
          activeValue={value.specialization}
          onPick={(s) => {
            onChange({ ...value, specialization: s });
            setOpenPanel(null);
          }}
        />
      </div>
    </div>
  );
}
