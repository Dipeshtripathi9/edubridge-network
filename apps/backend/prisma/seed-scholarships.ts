/* eslint-disable no-console */
// Standalone, idempotent seed for Scholarship rows ONLY — safe to run against
// a live database with real user activity, unlike the full seed.ts (which
// also creates fake test users, messages, notifications, and reports).
// Usage: DATABASE_URL="..." npx ts-node prisma/seed-scholarships.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const scholarshipSeeds = [
  {
    title: 'STEM Excellence Scholarship',
    provider: 'EduBridge Network',
    amountPerYear: 180000,
    renewalYears: 4,
    category: 'Merit',
    eligibilityText: 'Enrolled in an engineering or computer science program with a minimum CGPA of 8.5.',
    minCgpa: 8.5,
    eligibleCourses: ['Engineering', 'Computer Science'],
    eligibleStates: [],
    applyUrl: 'https://edubridgenetwork.in/scholarships/stem-excellence-scholarship/apply',
    deadline: new Date('2026-08-30'),
  },
  {
    title: 'First-Gen Scholar Grant',
    provider: 'Sundale Trust',
    amountPerYear: 90000,
    renewalYears: null,
    category: 'Need-based',
    eligibilityText: 'Open to first-generation college students across all courses and states.',
    minCgpa: null,
    eligibleCourses: [],
    eligibleStates: [],
    applyUrl: 'https://edubridgenetwork.in/scholarships/first-gen-scholar-grant/apply',
    deadline: new Date('2026-09-15'),
  },
  {
    title: 'Women in Tech Award',
    provider: 'Kessler Foundation',
    amountPerYear: 120000,
    renewalYears: 2,
    category: 'Women in STEM',
    eligibilityText: 'For women enrolled in a computer science or engineering program with a minimum CGPA of 7.5.',
    minCgpa: 7.5,
    eligibleCourses: ['Engineering', 'Computer Science'],
    eligibleStates: [],
    applyUrl: 'https://edubridgenetwork.in/scholarships/women-in-tech-award/apply',
    deadline: new Date('2026-10-05'),
  },
  {
    title: 'Punjab Merit Scholarship',
    provider: 'EduBridge Network',
    amountPerYear: 75000,
    renewalYears: 3,
    category: 'Merit',
    eligibilityText: 'For students from Punjab with a minimum CGPA of 8.0, any course.',
    minCgpa: 8.0,
    eligibleCourses: [],
    eligibleStates: ['Punjab'],
    applyUrl: 'https://edubridgenetwork.in/scholarships/punjab-merit-scholarship/apply',
    deadline: new Date('2026-08-20'),
  },
  {
    title: 'Design Futures Grant',
    provider: 'Kessler Foundation',
    amountPerYear: 90000,
    renewalYears: null,
    category: 'Merit',
    eligibilityText: 'For students enrolled in a design program with a minimum CGPA of 7.0.',
    minCgpa: 7.0,
    eligibleCourses: ['Design'],
    eligibleStates: [],
    applyUrl: 'https://edubridgenetwork.in/scholarships/design-futures-grant/apply',
    deadline: new Date('2026-11-01'),
  },
  {
    title: 'Tamil Nadu Access Bursary',
    provider: 'Sundale Trust',
    amountPerYear: 60000,
    renewalYears: 4,
    category: 'Need-based',
    eligibilityText: 'For students from Tamil Nadu, any course, no minimum CGPA requirement.',
    minCgpa: null,
    eligibleCourses: [],
    eligibleStates: ['Tamil Nadu'],
    applyUrl: 'https://edubridgenetwork.in/scholarships/tamil-nadu-access-bursary/apply',
    deadline: new Date('2026-09-30'),
  },
  {
    title: 'Business Leaders Fellowship',
    provider: 'EduBridge Network',
    amountPerYear: 100000,
    renewalYears: 2,
    category: 'Merit',
    eligibilityText: 'For students enrolled in a business or management program with a minimum CGPA of 8.0.',
    minCgpa: 8.0,
    eligibleCourses: ['Business', 'Management'],
    eligibleStates: [],
    applyUrl: 'https://edubridgenetwork.in/scholarships/business-leaders-fellowship/apply',
    deadline: new Date('2026-12-15'),
  },
  {
    title: 'Community Impact Scholarship',
    provider: 'Kessler Foundation',
    amountPerYear: 50000,
    renewalYears: null,
    category: 'Need-based',
    eligibilityText: 'Open to all students who have volunteered 20+ hours in their community, any course or state.',
    minCgpa: null,
    eligibleCourses: [],
    eligibleStates: [],
    applyUrl: 'https://edubridgenetwork.in/scholarships/community-impact-scholarship/apply',
    deadline: new Date('2026-08-10'),
  },
];

async function main() {
  console.log('🌱 Seeding scholarships only...');
  for (const s of scholarshipSeeds) {
    await prisma.scholarship.upsert({
      where: { slug: slugify(s.title) },
      update: { amountPerYear: s.amountPerYear, deadline: s.deadline },
      create: { ...s, slug: slugify(s.title) },
    });
  }
  console.log(`✓ ${scholarshipSeeds.length} scholarships`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
