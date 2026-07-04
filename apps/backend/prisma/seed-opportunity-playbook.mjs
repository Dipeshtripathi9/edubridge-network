// Seed the "Opportunity Playbook" — real programs (scholarships, fellowships,
// internships, competitions, research, certifications) as GLOBAL opportunities
// (no college/community) so every student sees them in the Opportunities feed.
// Idempotent: clears + reinserts the batch (sourceSystem = 'opportunity-playbook').
//   node prisma/seed-opportunity-playbook.mjs   (loads DATABASE_URL from root .env)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// [type, title, url, description, ...tags]
const P = [
  // ---- Universal / everyone ----
  ['CERTIFICATION', 'NPTEL', 'https://nptel.ac.in', 'Free IIT/IIM courses with cheap proctored certification; "Elite/Gold" certs counter outdated syllabi.', 'everyone', 'skills'],
  ['CERTIFICATION', 'SWAYAM', 'https://swayam.gov.in', "India's national MOOC platform — free university courses, some with academic credit.", 'everyone', 'skills'],
  ['COMPETITION', 'Smart India Hackathon (SIH)', 'https://sih.gov.in', "Ministry of Education's national hackathon, open to any AICTE-approved college. Finaling outweighs your college name.", 'everyone', 'hackathon'],
  ['COMPETITION', 'Unstop', 'https://unstop.com', 'Where most Indian corporate competitions, case challenges and off-campus internships live.', 'everyone', 'platform'],
  ['INTERNSHIP', 'Internshala', 'https://internshala.com', 'India’s largest platform for off-campus internships and trainings.', 'everyone', 'platform'],
  ['SCHOLARSHIP', 'National Scholarship Portal (NSP)', 'https://scholarships.gov.in', 'Central + post-matric scholarships in one portal.', 'everyone', 'scholarship'],
  ['SCHOLARSHIP', 'UP Scholarship (AKTU students)', 'https://scholarship.up.gov.in', 'UP state scholarship, accepted at AKTU colleges.', 'aktu', 'scholarship'],
  ['SCHOLARSHIP', 'Delhi Scholarships (e-District, IPU students)', 'https://edistrict.delhigovt.nic.in', 'Delhi higher-education merit-cum-means aid for IPU-college students.', 'ipu', 'scholarship'],
  ['SCHOLARSHIP', 'Buddy4Study', 'https://www.buddy4study.com', 'Hub for private scholarships (Sitaram Jindal, Reliance Foundation, LIC, Colgate and more).', 'everyone', 'scholarship'],
  ['SCHOLARSHIP', 'Reliance Foundation UG Scholarships', 'https://scholarships.reliancefoundation.org', 'Undergraduate merit + means scholarships from Reliance Foundation.', 'everyone', 'scholarship'],
  ['SCHOLARSHIP', 'Sitaram Jindal Foundation Scholarship', 'https://www.sitaramjindalfoundation.org', 'Need-based scholarship for students across streams.', 'everyone', 'scholarship'],
  ['SCHOLARSHIP', 'Glow & Lovely Careers (for girls)', 'https://www.glowandlovelycareers.in', 'Scholarships and career support for women students.', 'everyone', 'scholarship'],
  ['INTERNSHIP', 'AICTE Internship Portal', 'https://internship.aicte-india.org', 'Thousands of listed internships incl. government ones — free and underused.', 'everyone'],
  ['CERTIFICATION', 'NSS (National Service Scheme)', 'https://nss.gov.in', 'Community-service hours that strengthen study-abroad and PSU applications.', 'everyone'],
  ['CERTIFICATION', 'NCC (National Cadet Corps)', 'https://indiancc.nic.in', "NCC 'C' certificate gives real advantages in defence/government recruitment.", 'everyone'],
  ['CERTIFICATION', 'GitHub Student Developer Pack', 'https://education.github.com/pack', 'Free developer tools and credits for students.', 'engineering', 'skills'],
  ['CERTIFICATION', 'AWS Educate', 'https://aws.amazon.com/education/awseducate', 'Free cloud training and credits — earn what colleges sell via their cells.', 'engineering', 'skills'],
  ['CERTIFICATION', 'Microsoft Learn Student Ambassadors', 'https://studentambassadors.microsoft.com', 'Student community + free Microsoft certifications and mentorship.', 'engineering', 'skills'],
  ['CERTIFICATION', 'Coursera (per-course financial aid)', 'https://www.coursera.org', 'Apply for financial aid to waive fees on most certificate courses.', 'everyone', 'skills'],
  ['CERTIFICATION', 'edX', 'https://www.edx.org', 'University-grade MOOCs from MIT, Harvard and more.', 'everyone', 'skills'],
  ['CERTIFICATION', 'Toastmasters', 'https://www.toastmasters.org', 'Public-speaking and leadership clubs — the cheap soft-skills fix employers notice.', 'everyone'],

  // ---- Engineering / CS ----
  ['COMPETITION', 'Google Summer of Code (GSoC)', 'https://summerofcode.withgoogle.com', 'Paid summer open-source contribution; selection ignores your college name.', 'engineering', 'open-source'],
  ['COMPETITION', 'Hacktoberfest', 'https://hacktoberfest.com', 'Annual open-source on-ramp — build a real GitHub profile.', 'engineering', 'open-source'],
  ['COMPETITION', 'GirlScript Summer of Code', 'https://gssoc.girlscript.tech', 'Beginner-friendly open-source program; on-ramp to GSoC.', 'engineering', 'open-source'],
  ['COMPETITION', 'TCS CodeVita', 'https://www.tcscodevita.com', 'Global coding contest; finalists routinely get TCS interviews/PPIs.', 'engineering', 'coding'],
  ['COMPETITION', 'KPIT Sparkle', 'https://sparkle.kpit.com', 'National innovation & design contest in mobility and energy.', 'engineering'],
  ['COMPETITION', 'ICPC', 'https://icpc.global', 'The premier collegiate competitive-programming championship.', 'engineering', 'coding'],
  ['COMPETITION', 'Codeforces', 'https://codeforces.com', 'Competitive-programming practice + contests.', 'engineering', 'coding'],
  ['COMPETITION', 'LeetCode', 'https://leetcode.com', 'DSA + interview-prep practice used by every placed-well student.', 'engineering', 'coding'],
  ['CERTIFICATION', 'GATE', 'https://gate.iitkgp.ac.in', 'The core-branch escape hatch — M.Tech at IITs/NITs + PSU jobs (IOCL, ONGC, NTPC, BHEL).', 'engineering', 'exam'],
  ['RESEARCH', 'IAS Summer Research Fellowship (SRFP)', 'https://www.ias.ac.in', 'Funded summer research with Indian Academy of Sciences.', 'engineering', 'research'],
  ['RESEARCH', 'SURGE (IIT Kanpur)', 'https://surge.iitk.ac.in', 'Summer undergraduate research at IIT Kanpur.', 'engineering', 'research'],
  ['RESEARCH', 'SRIP (IIT Gandhinagar)', 'https://iitgn.ac.in/srip', 'Summer research internship program at IIT Gandhinagar.', 'engineering', 'research'],
  ['RESEARCH', 'MITACS Globalink (Canada)', 'https://www.mitacs.ca', 'Funded summer research abroad for Indian undergrads (CGPA 8+ helps).', 'engineering', 'abroad', 'research'],
  ['RESEARCH', 'DAAD WISE (Germany)', 'https://www.daad.in', 'Funded science & engineering summer research in Germany.', 'engineering', 'abroad', 'research'],
  ['RESEARCH', 'Charpak Lab Scholarship (France)', 'https://www.inde.campusfrance.org', 'Funded lab research internships in France.', 'engineering', 'abroad', 'research'],
  ['INTERNSHIP', 'DRDO Internships', 'https://www.drdo.gov.in', 'Government R&D internships across DRDO labs.', 'engineering', 'government'],
  ['INTERNSHIP', 'ISRO Internships / START', 'https://www.isro.gov.in', 'Space-research internships and the START online programme.', 'engineering', 'government'],
  ['INTERNSHIP', 'BARC', 'https://www.barc.gov.in', 'Nuclear science & engineering training and internships.', 'engineering', 'government'],
  ['COMPETITION', 'e-Yantra (IIT Bombay)', 'https://www.e-yantra.org', 'Robotics competition + training; any college team can compete.', 'engineering', 'robotics'],
  ['CERTIFICATION', 'Virtual Labs (IIT Delhi)', 'https://www.vlab.co.in', 'Free remote engineering lab simulations.', 'engineering', 'skills'],
  ['COMPETITION', 'Startup India Seed Fund', 'https://www.startupindia.gov.in', 'Seed funding + recognition for student/early-stage startups.', 'startup'],
  ['COMPETITION', 'Atal Innovation Mission / Incubation Centres', 'https://aim.gov.in', 'Incubation, mentoring and grants for student innovators.', 'startup'],
  ['COMPETITION', 'National Entrepreneurship Challenge (E-Cell IIT Bombay)', 'https://www.ecell.in', 'Build your college E-Cell and compete nationally.', 'startup'],

  // ---- Management / commerce ----
  ['COMPETITION', 'Tata Crucible', 'https://www.tatacrucible.com', "India's biggest business quiz — finalists get recruiter visibility.", 'management'],
  ['CERTIFICATION', 'CFA', 'https://www.cfainstitute.org', 'CFA Level 1 (doable in final year) outranks the college name for finance roles.', 'management', 'finance'],
  ['CERTIFICATION', 'FRM (GARP)', 'https://www.garp.org', 'Financial Risk Manager certification for risk/finance careers.', 'management', 'finance'],
  ['CERTIFICATION', 'NISM Certifications', 'https://www.nism.ac.in', 'SEBI-mandated certifications for capital-market roles.', 'management', 'finance'],
  ['CERTIFICATION', 'Google Skillshop (Ads/Analytics)', 'https://skillshop.withgoogle.com', 'Free Google Ads & Analytics certifications for marketing roles.', 'management', 'marketing'],
  ['CERTIFICATION', 'HubSpot Academy', 'https://academy.hubspot.com', 'Free inbound-marketing and CRM certifications.', 'management', 'marketing'],
  ['CERTIFICATION', 'Meta Blueprint', 'https://www.facebook.com/business/learn', 'Free digital-marketing certifications from Meta.', 'management', 'marketing'],
  ['INTERNSHIP', 'Forage (virtual experience programs)', 'https://www.theforage.com', 'Free virtual job simulations incl. Big-4 and top firms.', 'management'],
  ['CERTIFICATION', 'CII Young Indians (Yi)', 'https://youngindians.net', 'Student membership + young-manager competitions and networking.', 'management'],
  ['CERTIFICATION', 'TiE', 'https://tie.org', 'Entrepreneurship network with student chapters and mentoring.', 'startup', 'management'],
  ['CERTIFICATION', 'AIMA', 'https://www.aima.in', 'All India Management Association — young-manager competitions and events.', 'management'],
  ['CERTIFICATION', 'Company Secretary (ICSI)', 'https://www.icsi.edu', 'CS Executive as a parallel credential the campus cell can’t take away.', 'management', 'commerce'],
  ['CERTIFICATION', 'CMA (ICMAI)', 'https://icmai.in', 'Cost & Management Accountancy as a parallel commerce credential.', 'management', 'commerce'],

  // ---- Law ----
  ['COMPETITION', 'Jessup Moot (ILSA)', 'https://www.ilsa.org', "The world's largest moot court competition — the best law-school CV builder.", 'law', 'moot'],
  ['INTERNSHIP', 'NALSA / Legal-Aid Clinics', 'https://nalsa.gov.in', 'Legal-aid and Lok Adalat volunteering — differentiating for judiciary/LLM.', 'law'],
  ['INTERNSHIP', 'NHRC Internships', 'https://nhrc.nic.in', 'Structured human-rights internships open to all law colleges.', 'law', 'government'],
  ['INTERNSHIP', 'PRS Legislative Research (+ LAMP)', 'https://prsindia.org', 'Policy research internships and the LAMP legislative fellowship.', 'law', 'policy'],
  ['INTERNSHIP', 'Vidhi Centre for Legal Policy', 'https://vidhilegalpolicy.in', 'Legal-policy research internships and projects.', 'law', 'policy'],
  ['INTERNSHIP', 'Lawctopus', 'https://www.lawctopus.com', 'Where real law internships and job listings live.', 'law', 'platform'],
  ['CERTIFICATION', 'Bar & Bench', 'https://www.barandbench.com', 'Legal news + a place to publish case notes for credibility.', 'law'],
  ['CERTIFICATION', 'Live Law', 'https://www.livelaw.in', 'Legal news and analysis; publish to build a legal profile.', 'law'],
  ['CERTIFICATION', 'Indian Council of Arbitration (ADR)', 'https://www.icaindia.co.in', 'Arbitration/mediation certificates — the fastest-growing legal niche.', 'law'],

  // ---- Design & architecture ----
  ['COMPETITION', 'NASA India (architecture)', 'https://www.nasaindia.co', 'National Association of Students of Architecture — design competitions & conventions.', 'design'],
  ['CERTIFICATION', 'CEED (M.Des at IITs/IISc)', 'https://www.ceed.iitb.ac.in', 'Common Entrance Exam for Design — postgraduate design at IITs/IISc.', 'design', 'exam'],
  ['CERTIFICATION', 'NID Admissions', 'https://admissions.nid.edu', 'National Institute of Design entrance for PG/UG design.', 'design', 'exam'],
  ['CERTIFICATION', 'NIFT', 'https://www.nift.ac.in', 'National Institute of Fashion Technology admissions.', 'design', 'exam'],
  ['CERTIFICATION', 'Council of Architecture', 'https://www.coa.gov.in', 'Regulator + recognised workshops and competitions for architecture students.', 'design'],
  ['INTERNSHIP', 'INTACH', 'https://www.intach.org', 'Heritage documentation internships for architecture students.', 'design'],
  ['COMPETITION', 'CII Design Excellence / Young Designer', 'https://www.cii.in', 'National design awards and challenges with jury exposure.', 'design'],
  ['CERTIFICATION', 'Behance (portfolio)', 'https://www.behance.net', 'Build a public design portfolio from year 1 — the real differentiator.', 'design'],

  // ---- Pharmacy / health ----
  ['CERTIFICATION', 'GPAT (NBEMS)', 'https://natboard.edu.in', 'Gateway exam for scholarship-backed M.Pharm seats.', 'pharmacy', 'exam'],
  ['CERTIFICATION', 'NIPER', 'https://niper.gov.in', 'NIPER-JEE entry to the top pharma masters institutes — biggest brand upgrade.', 'pharmacy', 'exam'],
  ['RESEARCH', 'ICMR STS (for MBBS)', 'https://www.icmr.gov.in', 'Funded Short Term Studentship — a prestigious research line on the CV.', 'health', 'research'],
  ['CERTIFICATION', 'NABH (Hospital Quality)', 'https://www.nabh.co', 'Hospital-quality internships for nursing/allied-health/hospital-admin tracks.', 'health'],

  // ---- Liberal arts / fellowships / abroad ----
  ['FELLOWSHIP', 'Young India Fellowship (Ashoka)', 'https://www.ashoka.edu.in', 'Flagship one-year liberal-arts fellowship with heavy aid, open to any graduate.', 'liberal-arts', 'fellowship'],
  ['FELLOWSHIP', 'LAMP Fellowship', 'https://prsindia.org', 'Work with an MP for a year — premier policy launchpad.', 'liberal-arts', 'policy'],
  ['FELLOWSHIP', 'Teach For India', 'https://www.teachforindia.org', 'Two-year leadership fellowship feeding consulting/development/policy careers.', 'liberal-arts'],
  ['FELLOWSHIP', 'Gandhi Fellowship', 'https://www.gandhifellowship.org', 'Funded grassroots leadership fellowship.', 'liberal-arts'],
  ['FELLOWSHIP', 'SBI Youth for India', 'https://www.youthforindia.org', 'Rural-development fellowship that feeds top global masters.', 'liberal-arts'],
  ['FELLOWSHIP', 'Azim Premji Foundation', 'https://azimpremjifoundation.org', 'Associate roles in education and development.', 'liberal-arts'],
  ['INTERNSHIP', 'ORF (Observer Research Foundation)', 'https://www.orfonline.org', 'Think-tank research internships and publications.', 'liberal-arts', 'policy'],
  ['INTERNSHIP', 'CPR (Centre for Policy Research)', 'https://cprindia.org', 'Public-policy research internships.', 'liberal-arts', 'policy'],
  ['INTERNSHIP', 'CSDS', 'https://www.csds.in', 'Social-science research assistantships and internships.', 'liberal-arts', 'policy'],
  ['CERTIFICATION', 'UPSC', 'https://upsc.gov.in', 'Civil-services track — do it with a structured plan, not drift.', 'liberal-arts', 'exam'],
  ['SCHOLARSHIP', 'Chevening (UK)', 'https://www.chevening.org', 'Fully-funded UK masters scholarship for future leaders.', 'abroad', 'scholarship'],
  ['SCHOLARSHIP', 'Fulbright-Nehru (USIEF)', 'https://www.usief.org.in', 'Prestigious US masters/research scholarships.', 'abroad', 'scholarship'],
  ['SCHOLARSHIP', 'Commonwealth Scholarships', 'https://cscuk.fcdo.gov.uk', 'Funded UK study for students from Commonwealth countries.', 'abroad', 'scholarship'],
  ['SCHOLARSHIP', 'Erasmus+ / Erasmus Mundus', 'https://erasmus-plus.ec.europa.eu', 'Funded joint masters across European universities.', 'abroad', 'scholarship'],
  ['SCHOLARSHIP', 'DAAD (Germany, all streams)', 'https://www.daad.in', 'Scholarships and funded programs to study/research in Germany.', 'abroad', 'scholarship'],
];

const SRC = 'opportunity-playbook';

async function main() {
  await prisma.opportunity.deleteMany({ where: { sourceSystem: SRC } });
  let created = 0;
  for (const [type, title, url, description, ...tags] of P) {
    await prisma.opportunity.create({
      data: {
        type,
        title,
        description,
        applyUrl: url,
        tags: ['opportunity-playbook', ...tags],
        isRemote: true,
        approvalStatus: 'APPROVED',
        isActive: true,
        sourceSystem: SRC,
      },
    });
    created++;
  }
  const byType = {};
  for (const [t] of P) byType[t] = (byType[t] || 0) + 1;
  console.log(JSON.stringify({ created, byType, totalActiveOpportunities: await prisma.opportunity.count({ where: { isActive: true } }) }, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
