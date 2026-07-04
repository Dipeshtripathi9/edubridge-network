'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ABOUT = `# About EduBridge Network

**EduBridge Network** is India's student-first education and career platform, built to help students make informed decisions from college admission to career success.

Every year, millions of students struggle to find reliable information about colleges, scholarships, internships, hackathons, research opportunities, placements, and career pathways. Most valuable information is scattered across WhatsApp groups, Telegram channels, websites, and social media, making it difficult for students to discover and trust.

EduBridge Network brings everything together on one verified platform.

Our mission is to empower every student with equal access to opportunities, authentic college insights, and a supportive community that helps them grow academically and professionally.

### What We Offer

* 🎓 Scholarships from government, private organizations, and global institutions
* 💼 Internships from leading companies, startups, and government organizations
* 🏆 Hackathons, competitions, and coding challenges
* 🔬 Research internships and innovation programs
* 🚀 Startup grants, incubation programs, and entrepreneurship opportunities
* 📜 Free certifications and skill development programs
* 🌍 Fellowships, study abroad opportunities, and exchange programs
* 🏫 College communities with verified students and alumni
* ⭐ Honest college reviews, placements, campus life, and academic insights
* ❓ Student discussions, Q&A, and peer support
* 🤖 AI-powered recommendations based on each student's profile, interests, and goals

### Our Vision

To become India's most trusted student network where every learner can discover opportunities, build meaningful connections, and achieve their academic and career aspirations—regardless of their background or college.

### Our Mission

To organize educational opportunities and student knowledge into one accessible, verified, and community-driven platform that helps students learn, connect, and succeed.

### Why EduBridge Network?

We believe that talent exists everywhere, but opportunities do not.

EduBridge Network bridges that gap by making verified opportunities, trusted college information, and valuable student experiences accessible to everyone.

Whether you're preparing for college, searching for scholarships, looking for internships, building your skills, or planning your career, EduBridge Network is designed to support you at every step of your journey.

**From Choosing Your Future to Building Your Career.**

---

# Our Team

EduBridge Network is built by a passionate team of students, developers, designers, researchers, and community leaders who understand the challenges students face because we've experienced them ourselves.

Our team is united by one goal:

**To make quality education, opportunities, and career guidance accessible to every student.**

### Our Team Includes

* 👨‍💻 Software Engineers building a secure, scalable, and AI-powered platform
* 🎨 UI/UX Designers creating an intuitive student experience
* 🤖 AI & Data Specialists developing personalized recommendations
* 📚 Content & Research Team verifying scholarships, internships, competitions, and educational resources
* 🏫 Campus Ambassadors representing colleges across India
* 🛡️ Community Moderators ensuring respectful, safe, and authentic discussions
* 📈 Marketing & Partnerships Team collaborating with universities, organizations, startups, and employers
* 💬 Student Support Team helping users discover the right opportunities

We believe the strongest ideas come from students themselves. That's why we work closely with campus communities, alumni, and educators to continuously improve the platform.

As EduBridge Network grows, our goal is to build India's largest verified student community, connecting millions of learners with the opportunities that can shape their future.

Together, we're building the bridge between education and opportunity.
`;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{ABOUT}</ReactMarkdown>
      </article>
    </div>
  );
}
