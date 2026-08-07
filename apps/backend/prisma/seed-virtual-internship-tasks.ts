/* eslint-disable no-console */
// Standalone, idempotent seed for the Virtual Internship curriculum
// (VirtualInternshipTask rows) ONLY — safe to run against a live database.
// Populates the initial admin-editable task content (objective, deliverable,
// key steps, estimated hours) for both tracks so the curriculum isn't empty
// before an admin edits it. Re-running updates existing rows in place.
// Usage: DATABASE_URL="..." npx ts-node prisma/seed-virtual-internship-tasks.ts
import { PrismaClient, VirtualInternshipTrack } from '@prisma/client';

const prisma = new PrismaClient();

interface WeekSeed {
  weekNum: number;
  title: string;
  objective: string;
  deliverable: string;
  steps: string[];
  hours: string;
}

function weekSetFor(projectLabel: string): WeekSeed[] {
  return [
    {
      weekNum: 1,
      title: 'Onboarding & team matching',
      objective: `Get matched with your team and your ${projectLabel}, and set up your development environment before writing any code.`,
      deliverable: 'A working local repo with the starter project running, and a short intro shared with your mentor.',
      steps: [
        'Get matched to your team and project',
        'Set up your GitHub repo and local environment',
        'Review the project brief and clarify scope with your mentor',
        'Confirm your weekly working hours with your team',
      ],
      hours: '8–10 hours',
    },
    {
      weekNum: 2,
      title: 'Planning & architecture',
      objective: `Turn the project brief into a concrete technical plan for your ${projectLabel} before writing production code.`,
      deliverable: 'A short architecture note or diagram outlining your approach, data model, and milestones for the weeks ahead.',
      steps: [
        'Break the project into buildable milestones',
        'Choose your tech stack and note why',
        'Sketch the architecture / data flow',
        'Get mentor sign-off before you start building',
      ],
      hours: '8–10 hours',
    },
    {
      weekNum: 3,
      title: 'Core build',
      objective: `Build the core features of your ${projectLabel}, with regular mentor check-ins along the way.`,
      deliverable: 'A working build with the core features implemented, pushed to your GitHub repo.',
      steps: [
        'Implement the core features from your plan',
        'Commit progress regularly with clear messages',
        'Flag blockers early in your mentor check-in',
        'Do a self-review before submitting for review',
      ],
      hours: '12–15 hours',
    },
    {
      weekNum: 4,
      title: 'Review, submit & certify',
      objective: `Finalize your ${projectLabel}, fold in mentor feedback, and submit for certification.`,
      deliverable: 'Final project submitted via your GitHub repo link, plus a short write-up of what you built.',
      steps: [
        'Address mentor review feedback',
        'Polish and test your final build',
        'Submit your GitHub repo link for review',
        'Get your certificate + LOR once approved',
      ],
      hours: '8–10 hours',
    },
  ];
}

const monthSeeds = [
  {
    monthNum: 1,
    monthTitle: 'Onboarding & Project 1',
    monthDesc: 'Foundations + Project 1 — get matched to your team and ship your first minor project.',
    weeks: weekSetFor('Project 1 task'),
  },
  {
    monthNum: 2,
    monthTitle: 'Project 2, build in public',
    monthDesc: 'Project 2 — build in public, with weekly progress updates keeping you accountable.',
    weeks: weekSetFor('Project 2 task'),
  },
  {
    monthNum: 3,
    monthTitle: 'Project 3, deployment focus',
    monthDesc: 'Project 3 — deployment focus. This is where it goes live on a real server.',
    weeks: weekSetFor('Project 3 task'),
  },
  {
    monthNum: 4,
    monthTitle: 'Capstone, review & certify',
    monthDesc: 'Project 4 + wrap-up — final project, resume review, certificate & LOR.',
    weeks: weekSetFor('capstone task'),
  },
];

const weekTrackSeeds = weekSetFor('assigned project');

async function upsertTask(params: {
  track: VirtualInternshipTrack;
  monthNum: number | null;
  weekNum: number;
  monthTitle?: string;
  monthDesc?: string;
  title: string;
  objective: string;
  deliverable: string;
  steps: string[];
  hours: string;
}) {
  const existing = await prisma.virtualInternshipTask.findFirst({
    where: { track: params.track, monthNum: params.monthNum, weekNum: params.weekNum },
  });
  const data = {
    monthTitle: params.monthTitle,
    monthDesc: params.monthDesc,
    title: params.title,
    objective: params.objective,
    deliverable: params.deliverable,
    steps: params.steps,
    hours: params.hours,
  };
  if (existing) {
    await prisma.virtualInternshipTask.update({ where: { id: existing.id }, data });
  } else {
    await prisma.virtualInternshipTask.create({
      data: { track: params.track, monthNum: params.monthNum, weekNum: params.weekNum, ...data },
    });
  }
}

async function main() {
  console.log('🌱 Seeding Virtual Internship curriculum tasks...');

  for (const w of weekTrackSeeds) {
    await upsertTask({
      track: VirtualInternshipTrack.FOUR_WEEK,
      monthNum: null,
      weekNum: w.weekNum,
      title: w.title,
      objective: w.objective,
      deliverable: w.deliverable,
      steps: w.steps,
      hours: w.hours,
    });
  }

  for (const m of monthSeeds) {
    for (const w of m.weeks) {
      await upsertTask({
        track: VirtualInternshipTrack.FOUR_MONTH,
        monthNum: m.monthNum,
        weekNum: w.weekNum,
        monthTitle: m.monthTitle,
        monthDesc: m.monthDesc,
        title: w.title,
        objective: w.objective,
        deliverable: w.deliverable,
        steps: w.steps,
        hours: w.hours,
      });
    }
  }

  const total = weekTrackSeeds.length + monthSeeds.reduce((sum, m) => sum + m.weeks.length, 0);
  console.log(`✓ ${total} curriculum tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
