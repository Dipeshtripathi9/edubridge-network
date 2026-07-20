import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * True only for http(s) URLs. Used to validate user-supplied links before they
 * are stored and later rendered into href/src, blocking javascript:/data: URLs.
 */
export function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
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

/** Strip leading emoji / symbol decorations from a display name so the UI reads
 *  as one clean brand voice (no emojis). Falls back to the original if a name is
 *  entirely emoji. Names still keep any emoji they contain mid-string untouched. */
export function cleanName(name?: string | null): string {
  if (!name) return '';
  const stripped = name
    .replace(/^[\p{Extended_Pictographic}️‍☀-➿\s]+/u, '')
    .trim();
  return stripped || name.trim();
}

/** Dedupe a list of objects by their `id` (keeps first occurrence). Guards against
 * duplicate React keys when paginated infinite-query pages overlap. */
export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((it) => (seen.has(it.id) ? false : seen.add(it.id)));
}

