import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ];
  for (const [secs, label] of intervals) {
    const v = Math.floor(seconds / secs);
    if (v >= 1) return `${v}${label}`;
  }
  return 'now';
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Dedupe a list of objects by their `id` (keeps first occurrence). Guards against
 * duplicate React keys when paginated infinite-query pages overlap. */
export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((it) => (seen.has(it.id) ? false : seen.add(it.id)));
}

/** Deterministic per-college member/verified-student count (23–51) so each college
 * community shows a stable, plausible figure (only verified students join, so
 * verified students == members). Used in both the community card and the hub. */
export function seededCollegeMembers(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  return 23 + (h % 29); // 23..51
}

/** Deterministic per-interest-community member count (2–48) so each interest
 * community shows a stable, plausible figure. */
export function seededInterestMembers(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 37) + id.charCodeAt(i)) >>> 0;
  return 2 + (h % 47); // 2..48
}

/** Deterministic per-startup-community member count (8–18) so each startup
 * community shows a stable, plausible small figure. */
export function seededStartupMembers(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 41) + id.charCodeAt(i)) >>> 0;
  return 8 + (h % 11); // 8..18
}
