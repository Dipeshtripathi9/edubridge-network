import type { Scholarship } from '@/hooks/use-scholarships';

export interface MatchableProfile {
  cgpa?: number | null;
  course?: string | null;
  state?: string | null;
}

function includesLoose(list: string[], value: string) {
  const v = value.trim().toLowerCase();
  return list.some((item) => {
    const i = item.trim().toLowerCase();
    return i === v || i.includes(v) || v.includes(i);
  });
}

// Scores a scholarship against whichever of its structured eligibility
// criteria AND the student's real profile fields are both present — never
// checks (or fabricates a result for) a criterion neither side has data for.
// Returns null when nothing is checkable, so the caller can skip the ring
// entirely rather than show a meaningless number.
export function matchPercent(scholarship: Scholarship, profile: MatchableProfile | null | undefined): number | null {
  if (!profile) return null;

  let checkable = 0;
  let passed = 0;

  if (scholarship.minCgpa != null && profile.cgpa != null) {
    checkable += 1;
    if (profile.cgpa >= scholarship.minCgpa) passed += 1;
  }

  if (scholarship.eligibleCourses.length > 0 && profile.course) {
    checkable += 1;
    if (includesLoose(scholarship.eligibleCourses, profile.course)) passed += 1;
  }

  if (scholarship.eligibleStates.length > 0 && profile.state) {
    checkable += 1;
    if (includesLoose(scholarship.eligibleStates, profile.state)) passed += 1;
  }

  if (checkable === 0) return null;
  return Math.round((passed / checkable) * 100);
}
