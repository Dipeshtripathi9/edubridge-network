'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './course-path-selector.module.css';

// Single-field variant of CoursePathSelector's trigger+search-panel pattern,
// for open string fields (e.g. category) where the list is suggestions, not
// a closed taxonomy — typing a value with no match still commits that value.
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search or type a new one...',
  label = 'Options',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = () => setOpen(false);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = options.some((o) => o.toLowerCase() === search.trim().toLowerCase());
  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: 'none' }}
    >
      <div className={styles.field}>
        <button
          type="button"
          className={cn(styles.trigger, open && styles.triggerOpen)}
          onClick={(e) => {
            e.stopPropagation();
            setSearch('');
            setOpen((o) => !o);
          }}
        >
          {value ? <span className={styles.chosen}>{value}</span> : <span className={styles.placeholder}>{placeholder}</span>}
          <span className={cn(styles.chev, open && styles.chevOpen)}>▾</span>
        </button>

        {open && (
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <span>{label}</span>
              <button type="button" className={styles.panelClose} onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className={styles.searchBox}>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) commit(search.trim());
                }}
              />
            </div>
            <div className={styles.optList}>
              {search.trim() && !exactMatch && (
                <div className={styles.optItem} onClick={() => commit(search.trim())}>
                  Use &ldquo;{search.trim()}&rdquo;
                </div>
              )}
              {filtered.map((item) => (
                <div
                  key={item}
                  className={cn(styles.optItem, item === value && styles.optItemActive)}
                  onClick={() => commit(item)}
                >
                  {item}
                </div>
              ))}
              {filtered.length === 0 && !search.trim() && <div className={styles.noMatch}>No suggestions yet</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
