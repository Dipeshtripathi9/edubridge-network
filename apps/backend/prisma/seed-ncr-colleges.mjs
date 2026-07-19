// Seed Delhi-NCR colleges/universities.
// Idempotent: upserts by slug, safe to re-run. Usage:
//   node prisma/seed-ncr-colleges.mjs   (loads DATABASE_URL from the root .env)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category headers in the source list that are NOT colleges — skip these.
const HEADERS = new Set([
  'Major Private Engineering Colleges',
  'Major Private Management & Commerce Colleges',
  'Private Colleges Affiliated to IP University',
]);

const NAMES = [
  'Amity University Noida',
  'Shiv Nadar University',
  'Sharda University',
  'Galgotias University',
  'Bennett University',
  'Noida International University',
  'Manav Rachna International Institute of Research and Studies',
  'Manav Rachna University',
  'GD Goenka University',
  'KR Mangalam University',
  'The NorthCap University',
  'BML Munjal University',
  'Ansal University',
  'Sushant University',
  'Apeejay Stya University',
  'Starex University',
  'World University of Design',
  'Ashoka University',
  'O. P. Jindal Global University',
  'SRM University Delhi-NCR',
  'Geeta University',
  'Jagannath University',
  "Lingaya's Vidyapeeth",
  'Jamia Hamdard',
  'CHRIST (Deemed to be University), Delhi NCR',
  'Major Private Engineering Colleges',
  'ABES Engineering College',
  'Ajay Kumar Garg Engineering College',
  'KIET Group of Institutions',
  'IMS Engineering College',
  'RKGIT',
  'ITS Engineering College',
  'GL Bajaj Institute of Technology and Management',
  'Greater Noida Institute of Technology',
  'Galgotias College of Engineering and Technology',
  'Noida Institute of Engineering and Technology',
  'JSS Academy of Technical Education, Noida',
  'Accurate Institute of Management and Technology',
  'Lloyd Institute of Engineering and Technology',
  'IEC College of Engineering and Technology',
  'IIMT College of Engineering',
  'Sharda School of Engineering and Technology',
  'Amity School of Engineering and Technology',
  'Major Private Management & Commerce Colleges',
  'Jaipuria Institute of Management',
  'Birla Institute of Management Technology',
  'Institute of Management Studies Noida',
  'Jagan Institute of Management Studies',
  'New Delhi Institute of Management',
  'Delhi School of Business',
  'FORE School of Management',
  'Lal Bahadur Shastri Institute of Management',
  'Institute of Information Technology and Management',
  'Private Colleges Affiliated to IP University',
  'Maharaja Agrasen Institute of Technology',
  'Maharaja Surajmal Institute of Technology',
  "Bharati Vidyapeeth's College of Engineering",
  'Vivekananda Institute of Professional Studies',
  'JIMS Engineering Management Technical Campus',
  'Delhi Technical Campus',
  'Fairfield Institute of Management and Technology',
  'Bhagwan Parshuram Institute of Technology',
  'Guru Tegh Bahadur Institute of Technology',
  'Maharaja Agrasen Institute of Management Studies',
];

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function main() {
  const colleges = NAMES.filter((n) => !HEADERS.has(n));
  let collegesCreated = 0;

  for (const name of colleges) {
    const collegeSlug = slugify(name);

    const college = await prisma.college.upsert({
      where: { slug: collegeSlug },
      update: {},
      create: { name, slug: collegeSlug, state: 'Delhi NCR' },
    });
    // upsert() returns the record; detect "created" by comparing timestamps
    if (college.createdAt.getTime() === college.updatedAt.getTime()) collegesCreated++;
  }

  const totalDelhiNcrColleges = await prisma.college.count({ where: { state: 'Delhi NCR' } });
  console.log(
    JSON.stringify(
      {
        processed: colleges.length,
        collegesCreated,
        totalDelhiNcrCollegesNow: totalDelhiNcrColleges,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
