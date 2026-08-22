// Shared between the /virtual-internship landing page and the "My courses"
// summary — split out so both can import it without a circular dependency
// (the page renders <MyCourses>, which needs this same track data).

export type TrackKey = 'month' | 'week';

interface TrackScheduleStep {
  t: string;
  d: string;
}

interface TrackData {
  online: string;
  badge: string;
  name: string;
  tagline: string;
  features: string[];
  priceNow: number;
  priceOld: number;
  hasReferral: boolean;
  detailEyebrow: string;
  buildTitle: string;
  buildCopy: string;
  certCopy: string;
  scheduleLabel: string;
  schedule: TrackScheduleStep[];
}

export const TRACKS: Record<TrackKey, TrackData> = {
  month: {
    online: 'ONLINE',
    badge: 'New',
    name: 'Web Development + DevOps (4 Months)',
    tagline: 'The complete career track — 3 minor projects and 1 major project every month.',
    features: [
      'Verified students only',
      '4-month guided track · mentor-reviewed',
      '1:1 mentorship throughout the track',
      'Letter of recommendation',
      'Work presentation (PPT)',
      'Virtual internship certificate',
      '1:1 resume review',
    ],
    priceNow: 7635,
    priceOld: 12999,
    hasReferral: true,
    detailEyebrow: 'Online · 4 months',
    buildTitle: '3 minor projects + 1 major project, 4 months',
    buildCopy:
      "Every month you ship a minor project reviewed by your mentor, and once a month that work builds toward one major, portfolio-grade project taken all the way to production. It's the depth version — more time to get the engineering right, not just the outcome.",
    certCopy:
      "Finish the track and you get a verified internship certificate plus a signed LOR from your mentors — not just a PDF, something you can actually use.",
    scheduleLabel: 'Track schedule',
    schedule: [
      {
        t: 'Month 1 — Onboarding & first minor project',
        d: 'Get matched with your team and project. Set up your repo and tools, then ship your first minor project.',
      },
      {
        t: 'Month 2 — Second minor project',
        d: 'Scope, build, and ship your second minor project, with mentor check-ins along the way.',
      },
      {
        t: 'Month 3 — Third minor project',
        d: "Build the third minor project, sharpening the skills you'll need for the major build in month four.",
      },
      {
        t: 'Month 4 — Major project, review & certify',
        d: "Take everything you've built into one major project, get full mentor review, and receive your certificate + LOR.",
      },
    ],
  },
  week: {
    online: 'ONLINE',
    badge: 'Fast track',
    name: 'Web Development (4 week)',
    tagline: 'The complete beginner-to-industry track — complete 4 real-world, industry-specific projects.',
    features: [
      'Verified students only',
      '4-week guided track · mentor-reviewed',
      'Mentorship throughout the track',
      'Letter of recommendation',
      'Work presentation (PPT)',
      'Virtual internship certificate',
    ],
    priceNow: 2699,
    priceOld: 4999,
    hasReferral: false,
    detailEyebrow: 'Online · 4 weeks',
    buildTitle: '4 real projects, 4 weeks',
    buildCopy:
      "You'll be assigned a real-world project we're already running — no idea-hunting, no scoping from scratch. Submit one minor project every week for 4 consecutive weeks, each one reviewed before you move to the next, so you build a real portfolio, not just a certificate.",
    certCopy:
      "Finish all 4 projects and you get a verified internship certificate plus a signed LOR from your mentors — not just a PDF, something you can actually use.",
    scheduleLabel: 'Track schedule',
    schedule: [
      {
        t: 'Week 1 — Onboarding & team matching',
        d: 'Get matched with your team and your project (your idea, or one we assign). Set up your repo and tools.',
      },
      {
        t: 'Week 2 — Planning & architecture',
        d: 'Scope the build, define milestones, and lock the architecture for your project.',
      },
      {
        t: 'Week 3 — Core build',
        d: 'Build the core features of your project, with mentor check-ins along the way.',
      },
      {
        t: 'Week 4 — Review, submit & certify',
        d: 'Finalize the project, get mentor review, and receive your verified certificate + LOR.',
      },
    ],
  },
};

export function trackKeyFor(track: 'WEEK' | 'MONTH'): TrackKey {
  return track === 'WEEK' ? 'week' : 'month';
}

export function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

/** Same as money(), but always shows paisa precision (e.g. ₹485.82) instead of rounding to a whole rupee. */
export function moneyPrecise(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInternshipDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
