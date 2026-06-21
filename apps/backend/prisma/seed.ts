/* eslint-disable no-console */
import { PrismaClient, CommunityType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Seeding EduBridge Network...');

  // ---------- Universities & Colleges ----------
  const collegeSeeds = [
    { name: 'Bennett University', state: 'Uttar Pradesh', city: 'Greater Noida', nirfRank: 84, type: 'Private', pkg: 8.5 },
    { name: 'IILM University', state: 'Uttar Pradesh', city: 'Greater Noida', nirfRank: 120, type: 'Private', pkg: 6.2 },
    { name: 'VIT', state: 'Tamil Nadu', city: 'Vellore', nirfRank: 11, type: 'Deemed', pkg: 9.1 },
    { name: 'SRM Institute of Science and Technology', state: 'Tamil Nadu', city: 'Chennai', nirfRank: 13, type: 'Deemed', pkg: 8.0 },
    { name: 'Thapar Institute of Engineering and Technology', state: 'Punjab', city: 'Patiala', nirfRank: 29, type: 'Deemed', pkg: 9.5 },
  ];

  const colleges = [];
  for (const c of collegeSeeds) {
    const university = await prisma.university.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, state: c.state, city: c.city, type: c.type },
    });
    const college = await prisma.college.upsert({
      where: { slug: slugify(c.name) },
      update: { nirfRank: c.nirfRank, avgPlacementPackage: c.pkg },
      create: {
        name: c.name,
        slug: slugify(c.name),
        universityId: university.id,
        state: c.state,
        city: c.city,
        type: c.type,
        nirfRank: c.nirfRank,
        avgPlacementPackage: c.pkg,
        sourceSystem: 'manual',
      },
    });
    colleges.push(college);
  }
  console.log(`✓ ${colleges.length} colleges`);

  // ---------- Cutoffs & Transfer requirements ----------
  for (const college of colleges.slice(0, 3)) {
    await prisma.collegeCutoff.create({
      data: {
        collegeId: college.id,
        year: 2024,
        round: 1,
        branch: 'Computer Science and Engineering',
        category: 'GEN',
        openingRank: 5000,
        closingRank: 18000,
        sourceSystem: 'JoSAA',
      },
    });
    await prisma.transferRequirement.create({
      data: {
        collegeId: college.id,
        branch: 'Computer Science and Engineering',
        minCgpa: 7.5,
        minYear: 1,
        maxYear: 2,
        creditTransfer: true,
        feeAmount: 250000,
        notes: 'Lateral transfer subject to seat availability and entrance review.',
        sourceSystem: 'manual',
      },
    });
  }
  console.log('✓ cutoffs + transfer requirements');

  // ---------- Badges ----------
  const badges = [
    { key: 'contributor', name: 'Contributor', tier: 'BRONZE' as const, threshold: 50 },
    { key: 'campus_expert', name: 'Campus Expert', tier: 'SILVER' as const, threshold: 200 },
    { key: 'placement_expert', name: 'Placement Expert', tier: 'GOLD' as const, threshold: 500 },
    { key: 'transfer_expert', name: 'Transfer Expert', tier: 'GOLD' as const, threshold: 500 },
    { key: 'community_leader', name: 'Community Leader', tier: 'PLATINUM' as const, threshold: 1000 },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { key: b.key },
      update: {},
      create: { key: b.key, name: b.name, tier: b.tier, threshold: b.threshold },
    });
  }
  console.log(`✓ ${badges.length} badges`);

  // ---------- Users ----------
  const adminHash = await argon2.hash('Admin@12345', { type: argon2.argon2id });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edubridge.network' },
    update: {},
    create: {
      email: 'admin@edubridge.network',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      reputationPoints: 1000,
      profile: { create: { fullName: 'EduBridge Admin', username: 'admin' } },
    },
  });

  const studentHash = await argon2.hash('Student@123', { type: argon2.argon2id });
  const studentSeeds = [
    { email: 'aarav@example.com', name: 'Aarav Sharma', username: 'aarav', college: 0, interests: ['DSA', 'Placement', 'AI'], points: 260 },
    { email: 'diya@example.com', name: 'Diya Patel', username: 'diya', college: 2, interests: ['Startups', 'Research'], points: 120 },
    { email: 'kabir@example.com', name: 'Kabir Singh', username: 'kabir', college: 4, interests: ['Transfer', 'Higher Studies', 'DSA'], points: 540 },
  ];
  const students = [];
  for (const s of studentSeeds) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: studentHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        reputationPoints: s.points,
        profile: {
          create: {
            fullName: s.name,
            username: s.username,
            collegeId: colleges[s.college].id,
            course: 'B.Tech',
            branch: 'Computer Science and Engineering',
            year: 2,
            cgpa: 8.2,
            state: colleges[s.college].state,
            city: colleges[s.college].city,
            collegeVerification: 'VERIFIED',
            interests: s.interests,
          },
        },
      },
    });
    students.push(user);
  }
  console.log(`✓ admin + ${students.length} students`);

  // ---------- Communities ----------
  const communities = [];
  for (const college of colleges) {
    const community = await prisma.community.upsert({
      where: { slug: slugify(college.name) + '-community' },
      update: {},
      create: {
        name: college.name,
        slug: slugify(college.name) + '-community',
        description: `Official student community for ${college.name}.`,
        type: CommunityType.COLLEGE,
        collegeId: college.id,
        createdById: admin.id,
        memberCount: 0,
      },
    });
    communities.push(community);
  }
  const topics = ['AI', 'DSA', 'Startups', 'Placement', 'Data Science'];
  for (const topic of topics) {
    const community = await prisma.community.upsert({
      where: { slug: slugify(topic) },
      update: {},
      create: {
        name: topic,
        slug: slugify(topic),
        description: `Everything about ${topic}.`,
        type: CommunityType.TOPIC,
        topic,
        createdById: admin.id,
        memberCount: 0,
      },
    });
    communities.push(community);
  }
  console.log(`✓ ${communities.length} communities`);

  // ---------- Memberships ----------
  for (const student of students) {
    for (const community of communities.slice(0, 4)) {
      await prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: community.id, userId: student.id } },
        update: {},
        create: { communityId: community.id, userId: student.id },
      });
    }
  }
  // Recompute member counts.
  for (const community of communities) {
    const count = await prisma.communityMember.count({ where: { communityId: community.id } });
    await prisma.community.update({ where: { id: community.id }, data: { memberCount: count } });
  }
  console.log('✓ memberships');

  // ---------- Posts, poll, comments ----------
  const dsa = communities.find((c) => c.slug === 'dsa')!;
  const post1 = await prisma.post.create({
    data: {
      communityId: dsa.id,
      authorId: students[0].id,
      type: 'TEXT',
      title: 'How I cracked my first DSA interview',
      body: 'Sharing my 90-day prep plan that landed me an offer. Consistency over intensity!',
      hashtags: ['dsa', 'placement', 'interview'],
      likeCount: 2,
    },
  });
  await prisma.community.update({ where: { id: dsa.id }, data: { postCount: { increment: 1 } } });

  await prisma.post.create({
    data: {
      communityId: dsa.id,
      authorId: students[1].id,
      type: 'POLL',
      body: 'Which DSA topic should we cover next?',
      poll: {
        create: {
          question: 'Which DSA topic should we cover next?',
          options: { create: [{ text: 'Graphs' }, { text: 'Dynamic Programming' }, { text: 'Trees' }] },
        },
      },
    },
  });
  await prisma.community.update({ where: { id: dsa.id }, data: { postCount: { increment: 1 } } });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: students[2].id,
      body: 'This is super helpful, thanks for sharing!',
    },
  });
  await prisma.post.update({ where: { id: post1.id }, data: { commentCount: { increment: 1 } } });

  await prisma.reaction.createMany({
    data: [
      { userId: students[1].id, postId: post1.id, type: 'LIKE' },
      { userId: students[2].id, postId: post1.id, type: 'LIKE' },
    ],
    skipDuplicates: true,
  });
  console.log('✓ posts, poll, comments, reactions');

  // ---------- Opportunities ----------
  await prisma.opportunity.createMany({
    data: [
      {
        type: 'INTERNSHIP',
        title: 'Software Engineering Intern',
        organization: 'Razorpay',
        description: 'Summer internship for pre-final year students. Backend focus.',
        location: 'Bangalore',
        applyUrl: 'https://razorpay.com/jobs',
        tags: ['backend', 'internship', 'sde'],
        stipend: '₹60,000/month',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
        collegeId: colleges[0].id,
        sourceSystem: 'manual',
      },
      {
        type: 'SCHOLARSHIP',
        title: 'Reliance Foundation Scholarship',
        organization: 'Reliance Foundation',
        description: 'Merit-cum-means scholarship for undergraduate students.',
        applyUrl: 'https://scholarships.reliancefoundation.org',
        tags: ['scholarship', 'merit', 'higher studies'],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
        sourceSystem: 'manual',
      },
      {
        type: 'COMPETITION',
        title: 'Smart India Hackathon 2026',
        organization: 'Government of India',
        description: 'National hackathon to solve real-world problem statements.',
        location: 'Pan India',
        applyUrl: 'https://sih.gov.in',
        tags: ['hackathon', 'startups', 'dsa'],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
        sourceSystem: 'manual',
      },
      {
        type: 'RESEARCH',
        title: 'Summer Research Fellowship',
        organization: 'Indian Academy of Sciences',
        description: 'Two-month research internship under leading scientists.',
        applyUrl: 'https://www.ias.ac.in/fellowship',
        tags: ['research', 'ai', 'higher studies'],
        stipend: '₹20,000 total',
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
        sourceSystem: 'manual',
      },
      {
        type: 'FELLOWSHIP',
        title: 'AI Residency Program',
        organization: 'Microsoft Research India',
        description: 'One-year fellowship working on applied AI research.',
        location: 'Bangalore',
        applyUrl: 'https://www.microsoft.com/en-us/research/academic-program',
        tags: ['ai', 'research', 'data science'],
        stipend: 'Competitive',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
        sourceSystem: 'manual',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ opportunities');

  // ---------- Reviews (by verified students of each college) ----------
  // students[0]=Bennett(0), students[1]=VIT(2), students[2]=Thapar(4)
  const reviewSeeds = [
    { college: 0, author: 0, category: 'PLACEMENT' as const, rating: 4, title: 'Solid placement support', body: 'Good companies visit campus; CDC is responsive. Prep on your own too.', upvotes: 5 },
    { college: 0, author: 0, category: 'HOSTEL' as const, rating: 3, title: 'Decent hostels', body: 'Rooms are okay, food could be better. Wifi is reliable.', upvotes: 2 },
    { college: 2, author: 1, category: 'FACULTY' as const, rating: 5, title: 'Great faculty', body: 'Professors are approachable and research-active.', upvotes: 8 },
    { college: 4, author: 2, category: 'CAMPUS_LIFE' as const, rating: 5, title: 'Vibrant campus', body: 'Clubs, fests and an active coding culture. Loved my time here.', upvotes: 6 },
  ];
  const reviewedColleges = new Set<string>();
  for (const r of reviewSeeds) {
    const collegeId = colleges[r.college].id;
    await prisma.review.upsert({
      where: {
        collegeId_authorId_category: {
          collegeId,
          authorId: students[r.author].id,
          category: r.category,
        },
      },
      update: {},
      create: {
        collegeId,
        authorId: students[r.author].id,
        category: r.category,
        rating: r.rating,
        title: r.title,
        body: r.body,
        isVerified: true,
        upvotes: r.upvotes,
      },
    });
    reviewedColleges.add(collegeId);
  }
  // Recompute denormalized college rating aggregates.
  for (const collegeId of reviewedColleges) {
    const agg = await prisma.review.aggregate({
      where: { collegeId, deletedAt: null },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.college.update({
      where: { id: collegeId },
      data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
  }
  console.log('✓ reviews + college rating aggregates');

  // ---------- Transfer journey + public story ----------
  const existingTransfer = await prisma.transfer.findFirst({
    where: { userId: students[2].id, toCollegeId: colleges[2].id },
  });
  if (!existingTransfer) {
    await prisma.transfer.create({
      data: {
        userId: students[2].id,
        fromCollegeId: colleges[4].id,
        toCollegeId: colleges[2].id,
        currentYear: 2,
        cgpa: 8.6,
        branch: 'Computer Science and Engineering',
        status: 'COMPLETED',
        story:
          'I transferred in my second year after keeping my CGPA above 8.5. The credit transfer covered most of my first-year courses. Tip: start the paperwork early and talk to current students before applying.',
        isStoryPublic: true,
      },
    });
  }
  console.log('✓ transfer journey + story');

  // ---------- Resources ----------
  const existingResource = await prisma.resource.findFirst({ where: { title: 'DSA Master Roadmap 2026' } });
  if (!existingResource) {
    const resourceSeeds = [
      { uploader: 0, type: 'ROADMAP' as const, title: 'DSA Master Roadmap 2026', description: 'Topic-by-topic roadmap with curated problems.', tags: ['dsa', 'placement'], downloadCount: 42, avgRating: 4.6, ratingCount: 9 },
      { uploader: 1, type: 'PLACEMENT_REPORT' as const, title: 'On-Campus Placement Report (CSE)', description: 'Roles, CTCs and interview rounds from last season.', tags: ['placement', 'cse'], downloadCount: 30, avgRating: 4.2, ratingCount: 6 },
      { uploader: 2, type: 'NOTES' as const, title: 'Operating Systems Quick Notes', description: 'Exam-ready OS notes covering scheduling, memory, file systems.', tags: ['os', 'notes'], downloadCount: 18, avgRating: 4.0, ratingCount: 4 },
    ];
    for (const r of resourceSeeds) {
      await prisma.resource.create({
        data: {
          uploaderId: students[r.uploader].id,
          type: r.type,
          title: r.title,
          description: r.description,
          fileKey: `resources/seed-${slugify(r.title)}.pdf`,
          mimeType: 'application/pdf',
          tags: r.tags,
          collegeId: colleges[studentSeeds[r.uploader].college].id,
          isFeatured: r.uploader === 0,
          downloadCount: r.downloadCount,
          avgRating: r.avgRating,
          ratingCount: r.ratingCount,
        },
      });
    }
  }
  console.log('✓ resources');

  // ---------- College FAQs (Bennett) ----------
  const faqCount = await prisma.collegeFaq.count({ where: { collegeId: colleges[0].id } });
  if (faqCount === 0) {
    await prisma.collegeFaq.createMany({
      data: [
        { collegeId: colleges[0].id, order: 1, question: 'What is the attendance policy?', answer: 'A minimum of 75% attendance is required to sit for end-semester exams.', createdById: admin.id },
        { collegeId: colleges[0].id, order: 2, question: 'How does campus placement eligibility work?', answer: 'Students with CGPA ≥ 6.5 and no active backlogs are eligible for placement drives.', createdById: admin.id },
        { collegeId: colleges[0].id, order: 3, question: 'Are hostels mandatory for first-years?', answer: 'Hostel is mandatory for first-year students living beyond 50 km; others may opt for day-scholar.', createdById: admin.id },
      ],
    });
  }
  console.log('✓ college FAQs');

  // ---------- Direct chat with messages ----------
  const existingChat = await prisma.chat.findFirst({
    where: {
      type: 'DIRECT',
      AND: [
        { participants: { some: { userId: students[0].id } } },
        { participants: { some: { userId: students[1].id } } },
      ],
    },
  });
  if (!existingChat) {
    const chat = await prisma.chat.create({
      data: {
        type: 'DIRECT',
        lastMessageAt: new Date(),
        participants: { create: [{ userId: students[0].id }, { userId: students[1].id }] },
      },
    });
    await prisma.message.createMany({
      data: [
        { chatId: chat.id, senderId: students[0].id, body: 'Hey! Saw your post on the DSA community 👋' },
        { chatId: chat.id, senderId: students[1].id, body: 'Thanks! Happy to share my prep sheet if useful.' },
        { chatId: chat.id, senderId: students[0].id, body: 'That would be amazing 🙌' },
      ],
    });
  }
  console.log('✓ direct chat + messages');

  // ---------- Notifications ----------
  const existingNotif = await prisma.notification.findFirst({
    where: { recipientId: students[0].id },
  });
  if (!existingNotif) {
    await prisma.notification.createMany({
      data: [
        {
          recipientId: students[0].id,
          actorId: students[1].id,
          type: 'LIKE',
          title: 'Diya Patel liked your post',
          data: { postId: post1.id },
        },
        {
          recipientId: students[0].id,
          actorId: students[2].id,
          type: 'COMMENT',
          title: 'Kabir Singh commented on your post',
          body: 'This is super helpful, thanks for sharing!',
          data: { postId: post1.id },
        },
        {
          recipientId: students[0].id,
          type: 'SCHOLARSHIP',
          title: 'New scholarship matches your profile',
          body: 'Reliance Foundation Scholarship — deadline in 45 days.',
          data: { link: '/opportunities' },
        },
      ],
    });
  }
  console.log('✓ notifications');

  // ---------- A sample open report for the moderation queue ----------
  const existingReport = await prisma.report.findFirst({ where: { targetId: post1.id } });
  if (!existingReport) {
    await prisma.report.create({
      data: {
        reporterId: students[1].id,
        targetType: 'POST',
        targetId: post1.id,
        reportedUserId: students[0].id,
        reason: 'Spam',
        details: 'Looks like self-promotion.',
      },
    });
  }
  console.log('✓ sample report');

  // ---------- Award badges (mirrors ReputationService.evaluateBadges) ----------
  const badgeByKey = Object.fromEntries(
    (await prisma.badge.findMany()).map((b) => [b.key, b.id]),
  );
  async function grant(userId: string, key: string) {
    const badgeId = badgeByKey[key];
    if (!badgeId) return;
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      update: {},
      create: { userId, badgeId },
    });
  }
  // admin: community leader (1000 pts)
  await grant(admin.id, 'contributor');
  await grant(admin.id, 'campus_expert');
  await grant(admin.id, 'community_leader');
  // students by points + activity
  for (const student of students) {
    const u = await prisma.user.findUnique({
      where: { id: student.id },
      select: { reputationPoints: true },
    });
    const pts = u?.reputationPoints ?? 0;
    if (pts >= 50) await grant(student.id, 'contributor');
    if (pts >= 200) await grant(student.id, 'campus_expert');
    if (pts >= 1000) await grant(student.id, 'community_leader');
    const placement = await prisma.review.count({
      where: { authorId: student.id, category: 'PLACEMENT', deletedAt: null },
    });
    if (placement >= 1 && pts >= 50) await grant(student.id, 'placement_expert');
    const stories = await prisma.transfer.count({
      where: { userId: student.id, isStoryPublic: true, story: { not: null } },
    });
    if (stories >= 1) await grant(student.id, 'transfer_expert');
  }
  console.log('✓ badges awarded');

  // ---------- Enriched demo: college-community discussions, heads, stories ----------
  const collegeCommunities = communities.slice(0, 5); // one per seeded college
  const alreadyEnriched = await prisma.post.findFirst({
    where: { communityId: collegeCommunities[0].id },
  });
  if (!alreadyEnriched) {
    const samplePosts = [
      { kind: 'PLACEMENT_EXPERIENCE', title: 'My SDE-1 offer journey', body: 'Cleared 5 rounds — DSA, system design, 2 tech + HR. Happy to share my prep sheet!' },
      { kind: 'QUESTION', title: 'Best electives for ML?', body: 'Which 5th-sem electives actually helped you for ML/AI roles?' },
      { kind: 'DISCUSSION', title: 'Fest season is here 🎉', body: 'Who is performing this year? Drop your picks and volunteer slots.' },
    ] as const;

    for (let i = 0; i < collegeCommunities.length; i++) {
      const community = collegeCommunities[i];
      const author = students[i % students.length];
      const other = students[(i + 1) % students.length];
      for (const u of [author, other]) {
        await prisma.communityMember.upsert({
          where: { communityId_userId: { communityId: community.id, userId: u.id } },
          update: {},
          create: { communityId: community.id, userId: u.id },
        });
      }
      for (let p = 0; p < samplePosts.length; p++) {
        const sp = samplePosts[(i + p) % samplePosts.length];
        const newPost = await prisma.post.create({
          data: {
            communityId: community.id,
            authorId: author.id,
            type: 'TEXT',
            kind: sp.kind,
            title: sp.title,
            body: sp.body,
            isPinned: p === 0,
            likeCount: 1,
            commentCount: 1,
          },
        });
        await prisma.reaction.create({ data: { userId: other.id, postId: newPost.id, type: 'LIKE' } });
        await prisma.comment.create({ data: { postId: newPost.id, authorId: other.id, body: 'Really helpful, thanks for sharing!' } });
      }
      const mc = await prisma.communityMember.count({ where: { communityId: community.id } });
      await prisma.community.update({
        where: { id: community.id },
        data: { postCount: samplePosts.length, memberCount: mc },
      });
    }

    // Appoint community heads (named roles)
    await prisma.communityMember.updateMany({
      where: { communityId: collegeCommunities[0].id, userId: students[0].id },
      data: { role: 'CAMPUS_LEAD' },
    });
    await prisma.communityMember.updateMany({
      where: { communityId: collegeCommunities[2].id, userId: students[1].id },
      data: { role: 'OPPORTUNITY_HEAD' },
    });

    // More public transfer stories (so college hubs show them)
    await prisma.transfer.create({
      data: { userId: students[0].id, fromCollegeId: colleges[1].id, toCollegeId: colleges[0].id, currentYear: 2, cgpa: 8.1, branch: 'Computer Science and Engineering', status: 'COMPLETED', story: 'Transferred into Bennett in 2nd year — credit transfer was smooth and the CSE peer group is strong.', isStoryPublic: true },
    });
    await prisma.transfer.create({
      data: { userId: students[1].id, fromCollegeId: colleges[0].id, toCollegeId: colleges[3].id, currentYear: 2, cgpa: 8.7, branch: 'Computer Science and Engineering', status: 'COMPLETED', story: 'Moved to SRM for research opportunities. Apply early and keep your CGPA above 8.', isStoryPublic: true },
    });

    // FAQs for more colleges
    await prisma.collegeFaq.createMany({
      data: [
        { collegeId: colleges[2].id, order: 1, question: 'Is the FFCS system hard to navigate?', answer: 'It takes a semester to get used to; seniors help a lot.', createdById: admin.id },
        { collegeId: colleges[4].id, order: 1, question: 'How active is the placement cell?', answer: 'Very — pre-placement talks start in July, with strong core + IT recruiters.', createdById: admin.id },
      ],
    });
  }
  console.log('✓ enriched demo content');

  console.log('✅ Seed complete.');
  console.log('   Admin login: admin@edubridge.network / Admin@12345');
  console.log('   Student login: aarav@example.com / Student@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
