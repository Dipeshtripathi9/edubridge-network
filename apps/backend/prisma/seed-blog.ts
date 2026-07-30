/* eslint-disable no-console */
// Standalone, idempotent seed for demo BlogPost rows ONLY — safe to run against
// a live database, unlike the full seed.ts. Unlike seed-scholarships.ts, blog
// posts need a real author (authorId is a required FK), so this NEVER creates
// a user — it attributes demo posts to existing verified-student accounts
// (created by `npm run db:seed`) and is a no-op if none exist yet.
// Usage: DATABASE_URL="..." npx ts-node prisma/seed-blog.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const blogSeeds = [
  {
    title: 'What my first freelance gig taught me',
    category: 'CAREER' as const,
    body: `I picked up my first freelance web project in my second year, mostly because I needed the money and thought it would look good on a resume. What I didn't expect was how much it would teach me about actually talking to a client instead of just writing code for an assignment.

The brief changed three times in the first week. Nobody tells you that's normal. I learned to write things down, confirm scope over email before starting, and say no to "just one more small thing" without sounding difficult about it.

The biggest surprise was how little the tech stack mattered compared to communication. I was building in plain HTML/CSS/JS, nothing fancy, and it was completely fine. What actually got me paid on time and referred to two more clients was replying fast and setting expectations clearly.

If you're thinking about your first freelance gig: start smaller than you think you should, get the scope in writing, and don't undercharge just because it's your first one.`,
  },
  {
    title: 'I almost picked my college for the wrong reason',
    category: 'COLLEGE' as const,
    body: `Everyone in my family kept talking about "brand name" colleges, and for a while that's all I cared about. I nearly turned down an offer from a college with a much stronger placement record in my actual field, just because it wasn't as well known outside our city.

What changed my mind was actually looking at placement data by branch, not just the college's overall brand. The "famous" college's reputation was carried by one or two departments that weren't mine. My branch's real numbers there were mediocre.

I ended up choosing based on: placement rate for my specific branch, how active the alumni network was in the industry I wanted, and whether current students said the curriculum was actually followed or just written on paper.

Two years in, I don't regret it once. If you're choosing between "famous" and "actually good for what I want to do," dig into the branch-level data before you decide — the brand name doesn't show up on your resume the way you think it will.`,
  },
  {
    title: 'What a startup internship actually looks like',
    category: 'JOB' as const,
    body: `Before my internship, I imagined a startup would mean ping-pong tables and chaos. It was mostly just... a lot of ownership, very fast. In my first week I was already shipping small features to production, with a senior engineer reviewing my PRs but not hand-holding every line.

Nobody explains everything to you upfront. You're expected to ask, read the existing code, and figure out the "why" behind decisions yourself. That was uncomfortable at first and became the thing I valued most by the end — I learned more in three months than in a year of coursework, just from being forced to actually understand a real, messy codebase.

The tradeoff is real: the hours were less predictable than a large company internship would have been, and there was no formal training program. But I walked away with a genuine feature I shipped, real code review experience, and enough context to speak intelligently about the product in interviews afterward.

If you're choosing between a big-company internship and a startup one: the startup will give you more ownership faster, but you have to be comfortable with ambiguity.`,
  },
];

async function main() {
  console.log('🌱 Seeding demo blog posts...');

  const authors = await prisma.user.findMany({
    where: { profile: { collegeVerification: 'VERIFIED' } },
    include: { profile: true },
    take: blogSeeds.length,
  });

  if (authors.length === 0) {
    console.log('No verified student accounts found — skipping blog seed. Run `npm run db:seed` first for local demo data.');
    return;
  }

  for (let i = 0; i < blogSeeds.length; i++) {
    const post = blogSeeds[i];
    const author = authors[i % authors.length];
    const slug = slugify(post.title);
    const wordCount = post.body.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: post.title,
        body: post.body,
        excerpt: post.body.trim().slice(0, 160),
        category: post.category,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readMinutes,
        authorId: author.id,
        collegeId: author.profile?.collegeId ?? null,
      },
    });
  }
  console.log(`✓ ${blogSeeds.length} demo blog posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
