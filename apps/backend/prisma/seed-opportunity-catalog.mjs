// Curated opportunity catalog — globally visible (no community scoping).
// Replaces the previous 'opportunity-playbook' batch. Idempotent.
//   node prisma/seed-opportunity-catalog.mjs   (loads DATABASE_URL from root .env)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// [bucket, type, title, eligibility, rewards, url]
const DATA = [
  // 🎓 Scholarships
  ['SCH', 'SCHOLARSHIP', 'National Scholarship Portal (NSP)', 'Indian citizen enrolled in a recognized institution; eligibility depends on the scheme (Merit, SC/ST/OBC, Minority, EWS, etc.)', 'Tuition fee support, maintenance allowance, annual scholarship (₹10,000–₹75,000+ depending on scheme)', 'https://scholarships.gov.in'],
  ['SCH', 'SCHOLARSHIP', 'AICTE Student Development Schemes', 'Students in AICTE-approved institutions; separate schemes for girls, differently-abled, wards of martyrs, etc.', '₹30,000–₹50,000 per year depending on the scheme', 'https://www.aicte.gov.in/schemes/students-development-schemes'],
  ['SCH', 'SCHOLARSHIP', 'Reliance Foundation Undergraduate Scholarship', 'First-year undergraduate students with academic merit and family income within the prescribed limit', 'Up to ₹2,00,000 over the degree, plus mentorship and networking', 'https://scholarships.reliancefoundation.org'],
  ['SCH', 'SCHOLARSHIP', 'Buddy4Study Scholarships', 'Eligibility varies by scholarship (school, UG, PG, merit, income, gender, etc.)', '₹10,000–₹2,00,000+ depending on the scholarship', 'https://www.buddy4study.com'],
  ['SCH', 'SCHOLARSHIP', 'Foundation For Excellence (FFE)', 'Engineering, Medical and Law students from low-income families with good academics', 'Tuition support up to ₹50,000+ per year', 'https://ffe.org'],
  ['SCH', 'SCHOLARSHIP', 'HDFC Bank Parivartan Scholarship', 'Indian students with good academics and annual family income within specified limits', '₹15,000–₹75,000', 'https://www.hdfcbank.com/personal/about-us/csr/parivartan-scholarship'],
  ['SCH', 'SCHOLARSHIP', 'ONGC Scholarship', 'Engineering, MBBS, MBA and Geology students meeting eligibility criteria', '₹48,000 per year', 'https://ongcindia.com'],
  ['SCH', 'SCHOLARSHIP', 'Sitaram Jindal Scholarship', 'Merit-based with income criteria', '₹500–₹3,200 per month depending on course', 'https://www.sitaramjindalfoundation.org'],
  ['SCH', 'SCHOLARSHIP', 'Amazon Future Engineer Scholarship', 'First-year female Computer Science / IT students', 'Scholarship, mentorship and internship opportunities', 'https://www.amazonfutureengineer.in'],

  // 💼 Internships
  ['INT', 'INTERNSHIP', 'AICTE Internship Portal', 'Students from AICTE-approved colleges', 'Paid & unpaid internships, certificates, PPO opportunities', 'https://internship.aicte-india.org'],
  ['INT', 'INTERNSHIP', 'Prime Minister Internship Scheme', 'Indian youth aged 21–24 meeting scheme requirements', 'Monthly stipend, one-time grant, industry experience', 'https://pminternship.mca.gov.in'],
  ['INT', 'INTERNSHIP', 'ISRO Internship', 'UG/PG engineering and science students with required academic performance', 'Internship certificate, research experience', 'https://www.isro.gov.in/InternshipAndProjects.html'],
  ['INT', 'INTERNSHIP', 'DRDO Internship', 'Engineering and science students nominated through institutions (varies by lab)', 'Internship certificate and defence research exposure', 'https://www.drdo.gov.in'],
  ['INT', 'INTERNSHIP', 'C-DAC Internship', 'Engineering, MCA and related students', 'Industry experience and internship certificate', 'https://careers.cdac.in'],
  ['INT', 'INTERNSHIP', 'NITI Aayog Internship', 'Undergraduate, postgraduate and research students', 'Government policy exposure and certificate', 'https://www.niti.gov.in/internship'],
  ['INT', 'INTERNSHIP', 'RBI Internship', 'Economics, Finance, MBA, Statistics and related disciplines', 'Monthly stipend (scheme dependent), RBI experience', 'https://opportunities.rbi.org.in'],
  ['INT', 'INTERNSHIP', 'SEBI Internship', 'Finance, Law, Economics, Management and related fields', 'Stipend, certificate and market-regulator exposure', 'https://www.sebi.gov.in'],
  ['INT', 'INTERNSHIP', 'UIDAI Internship', 'Engineering, Management, Law and related students', 'Certificate and government project experience', 'https://uidai.gov.in'],

  // 🔬 Research Internships
  ['RES', 'RESEARCH', 'IIT Kanpur SURGE', '2nd/3rd year UG students with strong CGPA', 'Stipend, IIT mentorship and certificate', 'https://surge.iitk.ac.in'],
  ['RES', 'RESEARCH', 'IIT Gandhinagar SRIP', 'Engineering and science students', 'Stipend, hostel and certificate', 'https://iitgn.ac.in/srip'],
  ['RES', 'RESEARCH', 'IIT Roorkee SPARK', 'UG students from recognized institutions', 'Stipend, research experience and certificate', 'https://spark.iitr.ac.in'],
  ['RES', 'RESEARCH', 'IAS Summer Research Fellowship', 'Science and engineering students', 'Fellowship, travel support and research opportunity', 'https://www.ias.ac.in'],
  ['RES', 'RESEARCH', 'IISER Summer Internship', 'Science students', 'Research mentorship and certificate', 'https://www.iiseradmission.in'],

  // 🏆 Hackathons & Competitions
  ['HACK', 'COMPETITION', 'Smart India Hackathon', 'Students from AICTE-approved institutions', 'Cash prizes up to ₹1 lakh+, internship and placement opportunities', 'https://sih.gov.in'],
  ['HACK', 'COMPETITION', 'TCS CodeVita', 'Undergraduate and postgraduate students', 'Cash prizes, interviews and job opportunities', 'https://www.tcscodevita.com'],
  ['HACK', 'COMPETITION', 'Flipkart GRiD', 'Engineering students', 'Cash prizes, internships and PPOs', 'https://unstop.com'],
  ['HACK', 'COMPETITION', 'Amazon HackOn', 'Engineering students', 'Interviews, internships and cash prizes', 'https://www.amazon.science'],
  ['HACK', 'COMPETITION', 'Google Solution Challenge', 'Google Developer Student Clubs members', 'Mentorship, Google recognition and global showcase', 'https://developers.google.com/community/gdsc-solution-challenge'],
  ['HACK', 'COMPETITION', 'ICPC', 'University teams', 'International recognition and career opportunities', 'https://icpc.global'],
  ['HACK', 'COMPETITION', 'Microsoft Imagine Cup', 'Student innovators worldwide', 'Cash prizes, Azure credits and mentorship', 'https://imaginecup.microsoft.com'],
  ['HACK', 'COMPETITION', 'KPIT Sparkle', 'Engineering students', 'Cash prizes, internships and incubation support', 'https://sparkle.kpit.com'],

  // 📜 Free Certifications
  ['CERT', 'CERTIFICATION', 'NPTEL', 'Anyone', 'Free learning, optional verified certificate', 'https://nptel.ac.in'],
  ['CERT', 'CERTIFICATION', 'SWAYAM', 'Anyone', 'Government-recognized certificates and academic credits', 'https://swayam.gov.in'],
  ['CERT', 'CERTIFICATION', 'Microsoft Learn', 'Anyone', 'Free learning paths and badges', 'https://learn.microsoft.com/training'],
  ['CERT', 'CERTIFICATION', 'AWS Educate', 'Students', 'AWS cloud learning, badges and career resources', 'https://aws.amazon.com/education/awseducate'],
  ['CERT', 'CERTIFICATION', 'Oracle Academy', 'Students', 'Oracle technology courses and certificates', 'https://academy.oracle.com'],
  ['CERT', 'CERTIFICATION', 'Cisco Networking Academy', 'Students', 'Networking and cybersecurity certifications', 'https://www.netacad.com'],
  ['CERT', 'CERTIFICATION', 'GitHub Student Developer Pack', 'Verified students', 'Free developer tools worth thousands of dollars', 'https://education.github.com/pack'],
  ['CERT', 'CERTIFICATION', 'IBM SkillsBuild', 'Anyone', 'Digital badges and professional certificates', 'https://skillsbuild.org'],

  // 🚀 Startup & Innovation
  ['STARTUP', 'COMPETITION', 'Startup India', 'Indian startups meeting DPIIT criteria', 'Seed funding access, tax benefits, mentorship and networking', 'https://www.startupindia.gov.in'],
  ['STARTUP', 'COMPETITION', 'Atal Innovation Mission', 'Students, innovators and startups', 'Grants, incubation and mentorship', 'https://aim.gov.in'],
  ['STARTUP', 'COMPETITION', 'MeitY Startup Hub', 'Tech startups', 'Mentorship, networking and government support', 'https://www.meitystartuphub.in'],
  ['STARTUP', 'COMPETITION', 'BIRAC BIG', 'Biotechnology startups', 'Grant funding up to ₹50 lakh (subject to current scheme)', 'https://birac.nic.in'],
  ['STARTUP', 'COMPETITION', 'IIT Bombay E-Cell', 'Students and entrepreneurs', 'Competitions, mentoring, investor access and networking', 'https://www.ecell.in'],

  // 🤝 Fellowships
  ['FELLOW', 'FELLOWSHIP', 'Teach For India Fellowship', 'Graduates from any discipline', 'Leadership development, stipend and teaching experience', 'https://www.teachforindia.org/fellowship'],
  ['FELLOW', 'FELLOWSHIP', 'Gandhi Fellowship', 'Graduates', 'Monthly stipend, leadership training and rural development experience', 'https://www.gandhifellowship.org'],
  ['FELLOW', 'FELLOWSHIP', 'SBI Youth for India', 'Indian graduates', 'Monthly stipend, accommodation, insurance and rural development projects', 'https://www.youthforindia.org'],
  ['FELLOW', 'FELLOWSHIP', 'LAMP Fellowship', 'Graduates with strong policy interest', 'Monthly stipend, work with Members of Parliament and policy experience', 'https://prsindia.org'],
  ['FELLOW', 'FELLOWSHIP', 'Young India Fellowship', 'Graduates from any discipline', 'Liberal-arts education, scholarships available and global networking', 'https://www.ashoka.edu.in/yif'],
];

const SRC = 'opportunity-playbook';

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
  });

  // replace the batch
  await prisma.opportunity.deleteMany({ where: { sourceSystem: SRC } });

  let created = 0;
  const byBucket = {};
  for (const [bucket, type, title, eligibility, rewards, url] of DATA) {
    await prisma.opportunity.create({
      data: {
        type,
        title,
        description: rewards,
        eligibility,
        stipend: rewards,
        applyUrl: url,
        createdById: admin?.id ?? null,
        approvalStatus: 'APPROVED',
        isActive: true,
        isRemote: true,
        tags: ['opportunity-playbook', bucket.toLowerCase()],
        sourceSystem: SRC,
      },
    });
    created++;
    byBucket[bucket] = (byBucket[bucket] || 0) + 1;
  }

  console.log(JSON.stringify({ created, byBucket }, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
