// Accurate, factual FAQs for each Delhi-NCR college/university community.
// Only verifiable facts (type, location, affiliation/approvals, program types,
// admission route). Fees/placements/cutoffs are NOT invented — they route the
// student to EduBridge "Get Expert Guidance". Idempotent: re-running refreshes
// these four FAQs without touching any others.
//   node prisma/seed-college-faqs.mjs   (loads DATABASE_URL from the root .env)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// type: univ = state private university (own degrees) | deemed = deemed-to-be
// university | aktu = AKTU-affiliated | ipu = GGSIPU-affiliated | pgdm = autonomous
// AICTE PGDM/management institute.
const DATA = {
  'Amity University Noida': { area: 'Sector 125', city: 'Noida', state: 'Uttar Pradesh', type: 'univ', programs: 'B.Tech, BCA/MCA, BBA/MBA, B.Com(H), law, biotechnology, design, media and liberal arts' },
  'Shiv Nadar University': { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'univ', note: 'a research-focused Institution of Eminence', programs: 'engineering, natural sciences, management, economics and humanities & social sciences' },
  'Sharda University': { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'univ', programs: 'engineering, medical & dental, allied health, pharmacy, law, business, computer applications and design' },
  'Galgotias University': { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'univ', programs: 'B.Tech, MBA, computer applications, law, pharmacy, sciences and liberal arts' },
  'Bennett University': { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'univ', note: 'established by The Times Group', programs: 'B.Tech (CSE and specialisations), management, law, media and liberal arts' },
  'Noida International University': { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'univ', note: 'has its own medical college and hospital', programs: 'engineering, medical, nursing, dental, management, law and sciences' },
  'Manav Rachna International Institute of Research and Studies': { city: 'Faridabad', state: 'Haryana', type: 'deemed', programs: 'engineering, applied sciences, management, computer applications, dental and allied health' },
  'Manav Rachna University': { city: 'Faridabad', state: 'Haryana', type: 'univ', programs: 'engineering, management, sciences, law and computer applications' },
  'GD Goenka University': { area: 'Sohna', city: 'Gurugram', state: 'Haryana', type: 'univ', programs: 'engineering, management, law, hospitality, medical/allied health and design' },
  'KR Mangalam University': { area: 'Sohna Road', city: 'Gurugram', state: 'Haryana', type: 'univ', programs: 'engineering, management, law, computer applications and sciences' },
  'The NorthCap University': { city: 'Gurugram', state: 'Haryana', type: 'univ', programs: 'engineering, management, law and applied sciences' },
  'BML Munjal University': { area: 'Sidhrawali', city: 'Gurugram', state: 'Haryana', type: 'univ', note: 'founded by the Hero (Munjal) group', programs: 'engineering, management, law and commerce' },
  'Ansal University': { city: 'Gurugram', state: 'Haryana', type: 'univ', note: 'since renamed Sushant University', programs: 'design, architecture, management, law and engineering' },
  'Sushant University': { city: 'Gurugram', state: 'Haryana', type: 'univ', note: 'formerly Ansal University', programs: 'design, architecture, planning, management, law and engineering' },
  'Apeejay Stya University': { area: 'Sohna', city: 'Gurugram', state: 'Haryana', type: 'univ', programs: 'engineering, biosciences, management, journalism, design and law' },
  'Starex University': { city: 'Gurugram', state: 'Haryana', type: 'univ', programs: 'engineering, sciences, management, agriculture, law and computer applications' },
  'World University of Design': { city: 'Sonipat', state: 'Haryana', type: 'univ', note: 'a design-focused university', programs: 'design, architecture, visual & performing arts, fashion and communication' },
  'Ashoka University': { city: 'Sonipat', state: 'Haryana', type: 'univ', note: 'a leading liberal-arts university', programs: 'liberal arts & sciences — humanities, social sciences, natural sciences, mathematics, computer science and economics' },
  'O. P. Jindal Global University': { city: 'Sonipat', state: 'Haryana', type: 'univ', note: 'an Institution of Eminence known for law and global studies', programs: 'law, business, international affairs, public policy, liberal arts, journalism and finance' },
  'SRM University Delhi-NCR': { city: 'Sonepat', state: 'Haryana', type: 'univ', programs: 'engineering, management and sciences' },
  'Geeta University': { city: 'Panipat', state: 'Haryana', type: 'univ', programs: 'engineering, pharmacy, management, computer applications, law and sciences' },
  'Jagannath University': { city: 'Bahadurgarh', state: 'Haryana', type: 'univ', programs: 'engineering, management, law, pharmacy, education and computer applications' },
  "Lingaya's Vidyapeeth": { city: 'Faridabad', state: 'Haryana', type: 'deemed', programs: 'engineering, management, computer applications, law, architecture and allied health' },
  'Jamia Hamdard': { city: 'New Delhi', type: 'deemed', note: 'renowned for pharmacy, medicine and nursing', programs: 'pharmacy, medicine & allied health, nursing, sciences, management, computer science and Islamic studies' },
  'CHRIST (Deemed to be University), Delhi NCR': { city: 'Ghaziabad', type: 'deemed', note: 'the Delhi-NCR off-campus of CHRIST (Deemed to be University), Bengaluru', programs: 'commerce, management, computer applications, sciences, humanities and engineering' },

  'ABES Engineering College': { city: 'Ghaziabad', type: 'aktu', programs: 'B.Tech (CSE, IT, ECE, ME, civil), MBA and MCA' },
  'Ajay Kumar Garg Engineering College': { city: 'Ghaziabad', type: 'aktu', programs: 'B.Tech (CSE, IT, ECE, ME, civil, electrical), MBA and MCA' },
  'KIET Group of Institutions': { city: 'Ghaziabad', type: 'aktu', programs: 'B.Tech, MBA, MCA, pharmacy and computer applications' },
  'IMS Engineering College': { city: 'Ghaziabad', type: 'aktu', programs: 'B.Tech, MBA and MCA' },
  RKGIT: { city: 'Ghaziabad', type: 'aktu', note: 'Raj Kumar Goel Institute of Technology', programs: 'B.Tech, MBA and MCA' },
  'ITS Engineering College': { city: 'Greater Noida', type: 'aktu', programs: 'B.Tech, MBA and MCA' },
  'GL Bajaj Institute of Technology and Management': { city: 'Greater Noida', type: 'aktu', programs: 'B.Tech, MBA and MCA' },
  'Greater Noida Institute of Technology': { city: 'Greater Noida', type: 'aktu', note: 'GNIOT', programs: 'B.Tech, MBA, MCA, pharmacy and allied health' },
  'Galgotias College of Engineering and Technology': { city: 'Greater Noida', type: 'aktu', programs: 'B.Tech, MBA and MCA' },
  'Noida Institute of Engineering and Technology': { city: 'Greater Noida', type: 'aktu', note: 'NIET', programs: 'B.Tech, MBA, MCA, pharmacy and biotechnology' },
  'JSS Academy of Technical Education, Noida': { city: 'Noida', type: 'aktu', programs: 'B.Tech, MBA and MCA' },
  'Accurate Institute of Management and Technology': { city: 'Greater Noida', type: 'aktu', programs: 'B.Tech, MBA, MCA and PGDM' },
  'Lloyd Institute of Engineering and Technology': { city: 'Greater Noida', type: 'aktu', note: 'the Lloyd group also runs pharmacy and law institutes', programs: 'B.Tech, MBA and MCA' },
  'IEC College of Engineering and Technology': { city: 'Greater Noida', type: 'aktu', programs: 'B.Tech, MBA and MCA' },
  'IIMT College of Engineering': { city: 'Greater Noida', type: 'aktu', programs: 'B.Tech, MBA, MCA and pharmacy' },
  'Sharda School of Engineering and Technology': { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'univ', note: 'the engineering school of Sharda University', programs: 'B.Tech and M.Tech across CSE, AI/ML, ECE, mechanical, civil and allied engineering' },
  'Amity School of Engineering and Technology': { area: 'Sector 125', city: 'Noida', state: 'Uttar Pradesh', type: 'univ', note: 'the engineering school of Amity University', programs: 'B.Tech/M.Tech across CSE, IT, ECE, mechanical, civil and emerging technologies' },

  'Jaipuria Institute of Management': { city: 'Noida', type: 'pgdm', programs: 'a two-year AICTE-approved PGDM with marketing, finance, HR, IB and analytics specialisations' },
  'Birla Institute of Management Technology': { city: 'Greater Noida', type: 'pgdm', note: 'BIMTECH', programs: 'PGDM in general management, insurance business, retail and international business' },
  'Institute of Management Studies Noida': { city: 'Noida', type: 'pgdm', programs: 'management (PGDM/MBA) and computer applications' },
  'Jagan Institute of Management Studies': { area: 'Rohini', city: 'Delhi', type: 'pgdm', note: 'JIMS Rohini — PGDM plus GGSIPU-affiliated UG programs', programs: 'PGDM and (GGSIPU-affiliated) BBA/BCA/MCA' },
  'New Delhi Institute of Management': { city: 'New Delhi', type: 'pgdm', programs: 'a two-year AICTE-approved PGDM' },
  'Delhi School of Business': { city: 'New Delhi', type: 'pgdm', note: 'the PGDM institute of VIPS Technical Campus', programs: 'PGDM with finance, marketing, HR and analytics specialisations' },
  'FORE School of Management': { city: 'New Delhi', type: 'pgdm', programs: 'PGDM, PGDM (International Business) and PGDM (Financial Management)' },
  'Lal Bahadur Shastri Institute of Management': { area: 'Dwarka', city: 'New Delhi', type: 'pgdm', note: 'LBSIM', programs: 'PGDM, PGDM (Finance) and PGDM (Research & Business Analytics)' },
  'Institute of Information Technology and Management': { area: 'Janakpuri', city: 'New Delhi', type: 'ipu', note: 'IITM, affiliated to GGSIPU', programs: 'BBA, BCA, B.Com, MCA, MBA and journalism' },

  'Maharaja Agrasen Institute of Technology': { area: 'Rohini', city: 'Delhi', type: 'ipu', note: 'MAIT', programs: 'B.Tech, MBA, MCA and BBA/BCA' },
  'Maharaja Surajmal Institute of Technology': { area: 'Janakpuri', city: 'New Delhi', type: 'ipu', note: 'MSIT', programs: 'B.Tech, MBA and MCA' },
  "Bharati Vidyapeeth's College of Engineering": { area: 'Paschim Vihar', city: 'New Delhi', type: 'ipu', programs: 'B.Tech, MBA and MCA' },
  'Vivekananda Institute of Professional Studies': { area: 'Pitampura', city: 'Delhi', type: 'ipu', note: 'VIPS', programs: 'law, journalism & mass communication, BBA, BCA, B.Com and management' },
  'JIMS Engineering Management Technical Campus': { city: 'Greater Noida', type: 'ipu', programs: 'B.Tech, BBA, BCA, MBA and MCA' },
  'Delhi Technical Campus': { city: 'Greater Noida', type: 'ipu', programs: 'B.Tech, BBA, BCA, MBA and MCA' },
  'Fairfield Institute of Management and Technology': { area: 'Kapashera', city: 'New Delhi', type: 'ipu', programs: 'law, education, management, computer applications and paramedical' },
  'Bhagwan Parshuram Institute of Technology': { area: 'Rohini', city: 'Delhi', type: 'ipu', note: 'BPIT', programs: 'B.Tech and MBA' },
  'Guru Tegh Bahadur Institute of Technology': { area: 'Rajouri Garden', city: 'New Delhi', type: 'ipu', note: 'GTBIT', programs: 'B.Tech' },
  'Maharaja Agrasen Institute of Management Studies': { area: 'Rohini', city: 'Delhi', type: 'ipu', note: 'MAIMS', programs: 'BBA, BCA, B.Com(H), MBA, journalism and law' },
};

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

function admission(name, d) {
  const base = `${name}${d.note ? ` (${d.note})` : ''} offers ${d.programs}.`;
  const routes = {
    univ: `Admission is through the university's own application/entrance and board merit; B.Tech programs also accept JEE Main scores, and management programs admit via CAT/MAT/CMAT or the university's own test plus GD/PI.`,
    deemed: `As a deemed-to-be university it admits through its own entrance/merit; B.Tech also via JEE Main and MBA via national or in-house entrance with interview.`,
    aktu: `As an AKTU-affiliated, AICTE-approved college, B.Tech admission is via JEE Main followed by UPTAC/AKTU counselling (with a direct/management quota); MBA and MCA are via state/national entrance.`,
    ipu: `As a GGSIPU-affiliated, AICTE-approved institute, B.Tech admission is via JEE Main followed by IPU counselling; management and other programs admit via IPU CET or national entrance exams.`,
    pgdm: `Admission is through national management-entrance scores (CAT / XAT / MAT / CMAT / GMAT) followed by group discussion and personal interview.`,
  };
  return `${base} ${routes[d.type]}`;
}

function location(name, d) {
  const place = [d.area, d.city, d.state].filter(Boolean).join(', ');
  return `${name}'s campus is located in ${place} (Delhi-NCR).`;
}

function approvals(d) {
  const map = {
    univ: `Recognised as a private university under the relevant State Private Universities Act and by the UGC; technical and professional programs are AICTE-approved. Degrees are awarded by the university itself. Check the official website for the current NAAC/NBA accreditation status.`,
    deemed: `A deemed-to-be university under Section 3 of the UGC Act; professional programs are AICTE-approved and degrees are awarded by the institution. Check the official website for current NAAC/NBA accreditation.`,
    aktu: `An AICTE-approved institute affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow — degrees are awarded by AKTU. Check the official site for current NBA accreditation of specific branches.`,
    ipu: `An AICTE-approved institute affiliated to Guru Gobind Singh Indraprastha University (GGSIPU), New Delhi — degrees are awarded by GGSIPU. Check the official site for current NBA accreditation.`,
    pgdm: `An AICTE-approved management institute; the PGDM is an autonomous post-graduate diploma (many carry AIU equivalence to an MBA and NBA/international accreditation). Verify current approvals and accreditation on the official website.`,
  };
  return map[d.type];
}

function guidance(name) {
  return `Exact fee structure, placement statistics, scholarships and category-wise cutoffs for ${name} change every year and vary by program — we don't publish unverified numbers here. For accurate, personalised guidance on fees, ROI, placements, scholarships and your admission strategy, use "Get Expert Guidance" on EduBridge to talk 1:1 with our verified experts, and read verified student reviews on the college page.`;
}

const QUESTIONS = [
  { order: 1, q: 'What courses does it offer and how do I get admission?', a: (n, d) => admission(n, d) },
  { order: 2, q: 'Where is the campus located?', a: (n, d) => location(n, d) },
  { order: 3, q: 'Is it recognised and approved? (UGC / AICTE / affiliation)', a: (n, d) => approvals(d) },
  { order: 4, q: 'What about fees, placements, scholarships and detailed guidance?', a: (n) => guidance(n) },
];

async function main() {
  let colleges = 0;
  let faqsWritten = 0;
  const missing = [];

  for (const [name, d] of Object.entries(DATA)) {
    const college = await prisma.college.findUnique({ where: { slug: slugify(name) } });
    if (!college) {
      missing.push(name);
      continue;
    }
    colleges++;
    const questions = QUESTIONS.map((x) => x.q);
    // idempotent: remove our four FAQs (by question) then re-create with fresh text
    await prisma.collegeFaq.deleteMany({ where: { collegeId: college.id, question: { in: questions } } });
    for (const item of QUESTIONS) {
      await prisma.collegeFaq.create({
        data: { collegeId: college.id, question: item.q, answer: item.a(name, d), order: item.order },
      });
      faqsWritten++;
    }
  }

  console.log(JSON.stringify({ colleges, faqsWritten, missing }, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
