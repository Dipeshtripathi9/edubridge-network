// Seed the Opportunity Playbook as a GLOBAL resource that links to the in-app guide
// page (/guides/opportunity-playbook). Global → shows in the sidebar Resources feed
// and, via resource scoping, in every college/university community. Idempotent.
//   node prisma/seed-playbook-resource.mjs   (loads DATABASE_URL from root .env)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const URL = '/guides/opportunity-playbook';

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
  });
  if (!admin) throw new Error('No admin user found to own the resource');

  await prisma.resource.deleteMany({ where: { externalUrl: URL } });

  const r = await prisma.resource.create({
    data: {
      uploaderId: admin.id,
      type: 'ROADMAP',
      title: '📘 The Opportunity Playbook — NCR Students',
      description:
        'Curated guide to 70+ opportunities (scholarships, internships, hackathons, research, fellowships & certifications) organised by stream, with official links. Open to read the full playbook.',
      externalUrl: URL,
      tags: ['opportunity-playbook', 'guide', 'careers'],
      isFeatured: true,
    },
  });
  console.log(JSON.stringify({ created: r.id, title: r.title, externalUrl: r.externalUrl }, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
