// Seed interest-based (TOPIC) communities. Idempotent: upserts by slug, safe to
// re-run (refreshes name/description/topic without duplicating).
//   node prisma/seed-interest-communities.mjs   (loads DATABASE_URL from root .env)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// [emoji, name, topic, description]
const INTERESTS = [
  ['🤖', 'Artificial Intelligence', 'AI/ML', 'AI, LLMs, ChatGPT, GenAI and machine-learning discussions.'],
  ['💻', 'Web Development', 'Web Dev', 'HTML, CSS, JavaScript, React, Next.js and Node.js.'],
  ['📱', 'App Development', 'App Dev', 'Android, iOS, Flutter and React Native.'],
  ['☁️', 'Cloud & DevOps', 'Cloud/DevOps', 'AWS, Azure, Docker, Kubernetes and CI/CD.'],
  ['🔐', 'Cyber Security', 'Security', 'Ethical hacking, bug bounty, CTFs and security.'],
  ['📊', 'Data Science & Analytics', 'Data Science', 'Python, SQL, Power BI, Tableau and analytics.'],
  ['⚡', 'Competitive Programming', 'CP/DSA', 'LeetCode, Codeforces, DSA and ICPC.'],
  ['💼', 'Placements & Internships', 'Placements', 'Internship updates and placement preparation.'],
  ['📄', 'Resume & Interviews', 'Interviews', 'ATS resumes, mock interviews and HR rounds.'],
  ['🚀', 'Startups & Entrepreneurship', 'Startups', 'Startup ideas, founders, funding and SaaS.'],
  ['🎯', 'Career Guidance', 'Career', 'Career planning, roadmaps and mentorship.'],
  ['🎓', 'Higher Studies', 'Higher Studies', 'GATE, GRE, GMAT, MS, MBA and MTech.'],
  ['🌍', 'Study Abroad', 'Study Abroad', 'Universities, visas and scholarships.'],
  ['💰', 'Personal Finance & Investing', 'Personal Finance', 'Stocks, mutual funds, SIPs and budgeting.'],
  ['📈', 'Quant Finance', 'Quant Finance', 'Trading, quantitative finance, CFA and FRM.'],
  ['🎨', 'UI/UX & Product Design', 'Design', 'Figma, UX research and product thinking.'],
  ['🎮', 'Gaming & Esports', 'Gaming', 'PC gaming, mobile gaming and esports.'],
  ['🎥', 'Content Creation', 'Content', 'YouTube, Instagram, LinkedIn and podcasting.'],
  ['📸', 'Photography & Videography', 'Photography', 'Cameras, editing and filmmaking.'],
  ['🎭', 'Clubs & Campus Events', 'Campus Events', 'College fests, hackathons and competitions.'],
  ['🤝', 'Networking', 'Networking', 'Student networking, collaborations and referrals.'],
  ['📚', 'Research & Innovation', 'Research', 'Publications, projects and innovation.'],
  ['🏆', 'Hackathons & Competitions', 'Hackathons', 'SIH, Google Solution Challenge and Kaggle.'],
  ['🧠', 'Productivity & Study Tips', 'Productivity', 'Time management, note-taking and learning.'],
  ['❤️', 'Mental Health & Wellness', 'Wellness', 'Stress management, counselling and well-being.'],
  ['💪', 'Fitness & Sports', 'Fitness', 'Gym, yoga, running, cricket and football.'],
  ['🏠', 'Hostel & College Life', 'College Life', 'Hostel experiences, roommates and campus life.'],
  ['🔄', 'College Transfers', 'Transfers', 'Migration, lateral entry and transfer guidance.'],
  ['🎁', 'Scholarships & Opportunities', 'Scholarships', 'Scholarships, fellowships, grants and contests.'],
  ['💬', 'General Student Lounge', 'General', 'Casual discussions, memes, introductions and Q&A.'],
];

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

async function main() {
  let created = 0;
  let updated = 0;

  for (const [emoji, name, topic, desc] of INTERESTS) {
    const slug = slugify(name);
    const displayName = `${emoji} ${name}`;
    const description = `${desc} Any verified student can join to post, discuss, share resources and opportunities. Anyone can browse.`;

    const existing = await prisma.community.findUnique({ where: { slug } });
    if (existing) {
      await prisma.community.update({
        where: { id: existing.id },
        data: { name: displayName, topic, description, type: 'TOPIC' },
      });
      updated++;
    } else {
      await prisma.community.create({
        data: {
          name: displayName,
          slug,
          type: 'TOPIC',
          topic,
          visibility: 'PUBLIC',
          description,
          memberCount: 0,
        },
      });
      created++;
    }
  }

  const totalTopic = await prisma.community.count({ where: { type: 'TOPIC' } });
  console.log(JSON.stringify({ created, updated, totalInterestCommunitiesNow: totalTopic }, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
