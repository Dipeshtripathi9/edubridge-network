'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Code2,
  GraduationCap,
  Megaphone,
  MoreHorizontal,
  Palette,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSubmitAgencyLead } from '@/hooks/use-agency';

const SERVICES = [
  { icon: Palette, name: 'Website Design' },
  { icon: Code2, name: 'Web Development' },
  { icon: Smartphone, name: 'Mobile App Development' },
  { icon: Sparkles, name: 'UI/UX Design' },
  { icon: Search, name: 'SEO' },
  { icon: Search, name: 'AI SEO (AEO/GEO)' },
  { icon: Megaphone, name: 'Google Ads' },
  { icon: Megaphone, name: 'Social Media Marketing' },
  { icon: Sparkles, name: 'Branding' },
  { icon: Megaphone, name: 'Content Marketing' },
  { icon: Code2, name: 'CRM Development' },
  { icon: MoreHorizontal, name: 'Other Services' },
];

const WHY = [
  'Experienced Team',
  'Custom Solutions',
  'Affordable Pricing',
  'Fast Delivery',
  'SEO Optimized',
  'Ongoing Support',
];

const PROCESS = ['Discovery Call', 'Planning', 'Design', 'Development', 'Testing', 'Launch', 'Growth & Support'];

const INDUSTRIES = ['Education', 'Healthcare', 'Real Estate', 'E-commerce', 'Finance', 'Restaurants', 'SaaS', 'Startups'];

const PRICING = [
  { tier: 'Starter', desc: 'Landing page + basic SEO', features: ['1–3 pages', 'Responsive design', 'Contact form', 'Basic SEO'] },
  { tier: 'Business', desc: 'Full website + marketing', features: ['Up to 10 pages', 'CMS / blog', 'On-page SEO', '1 month support'] },
  { tier: 'Enterprise', desc: 'Web + app + growth', features: ['Web + mobile app', 'CRM integration', 'Ads + social', 'Ongoing growth'] },
  { tier: 'Custom Quote', desc: 'Tell us what you need', features: ['Tailored scope', 'Dedicated team', 'Flexible pricing', 'Priority support'] },
];

const FAQ = [
  { q: 'How long does a website take?', a: 'A starter site ships in ~1 week; full business sites in 2–4 weeks depending on scope.' },
  { q: 'Do you provide ongoing support?', a: 'Yes — every plan includes support, and Business/Enterprise include growth & maintenance.' },
  { q: 'Can you handle SEO and ads too?', a: 'Absolutely — SEO, AI SEO (AEO/GEO), Google Ads and social media marketing are all in-house.' },
  { q: 'How do we start?', a: 'Send a proposal request below with the services you want — we’ll reply with a plan and quote.' },
];

const ROLES = ['Web Developer', 'Mobile App Developer', 'UI/UX Designer', 'SEO Specialist', 'Digital Marketer', 'Content Writer'];

const NAV = ['Proposal', 'Services', 'Process', 'Pricing', 'Careers', 'FAQ'];

// Shared name/email/phone row used by every form.
function Contact({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Phone / WhatsApp (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
    </div>
  );
}

function useLead(reset: () => void) {
  const submit = useSubmitAgencyLead();
  const send = (payload: Parameters<typeof submit.mutate>[0]) => {
    if (!payload.name?.trim() || !payload.email?.trim()) {
      toast.error('Please add your name and email');
      return;
    }
    submit.mutate(payload, {
      onSuccess: () => {
        toast.success('Sent! Our team will reach out soon.');
        reset();
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };
  return { send, pending: submit.isPending };
}

function ProposalForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const { send, pending } = useLead(() => {
    setName('');
    setEmail('');
    setPhone('');
    setServices([]);
    setMessage('');
  });
  const toggle = (s: string) =>
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <Card className="border-primary/30 shadow-sm">
      <CardContent className="space-y-3 p-6">
        <p className="text-sm font-medium">Select the services you want</p>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <button
              key={s.name}
              onClick={() => toggle(s.name)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                services.includes(s.name)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-accent',
              )}
            >
              {services.includes(s.name) && <Check className="mr-1 inline h-3 w-3" />}
              {s.name}
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Tell us your requirements — what are you building?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Contact name={name} setName={setName} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />
        <Button
          disabled={pending}
          onClick={() =>
            send({
              kind: 'PROPOSAL',
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim() || undefined,
              services,
              message: message.trim() || undefined,
            })
          }
        >
          Get free proposal <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function CareerForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [projectUrl, setProjectUrl] = useState('');
  const [message, setMessage] = useState('');
  const { send, pending } = useLead(() => {
    setName('');
    setEmail('');
    setPhone('');
    setProjectUrl('');
    setMessage('');
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <p className="text-sm font-medium">Apply for a role</p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Input
          placeholder="Link to your older project / portfolio (https://)"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
        />
        <Textarea placeholder="Anything else about you (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Contact name={name} setName={setName} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />
        <Button
          disabled={pending}
          onClick={() =>
            send({
              kind: 'CAREER',
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim() || undefined,
              role,
              projectUrl: projectUrl.trim() || undefined,
              message: message.trim() || undefined,
            })
          }
        >
          Submit application <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Talking points for the promo-video brief — what an influencer should showcase.
const INFLUENCER_BRIEF = [
  {
    icon: GraduationCap,
    title: 'College Insights',
    desc: 'Honest reviews & complete insights from verified students — academics, faculty, placements, internships, campus life, hostels, fees & ROI — plus unlimited 1:1 calls with verified EduBridge Experts for admissions, course/branch selection, scholarships, entrance exams & career planning.',
  },
  {
    icon: Users,
    title: 'Communities',
    desc: 'Connect with verified students across colleges — ask questions, share experiences, learn from seniors and collaborate on projects.',
  },
  {
    icon: Share2,
    title: 'Network',
    desc: 'Build connections with students, alumni, mentors, recruiters & industry professionals to discover opportunities and accelerate your career.',
  },
  {
    icon: Target,
    title: 'Opportunities',
    desc: 'Internships, scholarships, hackathons, competitions, campus-ambassador programs, events & certifications tailored to your goals.',
  },
] as const;

function InfluencerForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [video1, setVideo1] = useState('');
  const [video2, setVideo2] = useState('');
  const [message, setMessage] = useState('');
  const { send, pending } = useLead(() => {
    setName('');
    setEmail('');
    setPhone('');
    setVideo1('');
    setVideo2('');
    setMessage('');
  });

  return (
    <Card className="border-accent/40 bg-accent/5">
      <CardContent className="space-y-3 p-6">
        <p className="text-sm text-muted-foreground">
          Upload 2 sample promotional videos made from the brief above. We post them online — if they
          perform, you become a <strong>top influencer</strong> and earn collab charges from our customers.
        </p>
        <Input placeholder="Sample video 1 link (YouTube/Drive/Instagram)" value={video1} onChange={(e) => setVideo1(e.target.value)} />
        <Input placeholder="Sample video 2 link" value={video2} onChange={(e) => setVideo2(e.target.value)} />
        <Textarea placeholder="Your handles & reach (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Contact name={name} setName={setName} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />
        <Button
          disabled={pending}
          onClick={() =>
            send({
              kind: 'INFLUENCER',
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim() || undefined,
              videoUrls: [video1, video2].map((v) => v.trim()).filter(Boolean),
              message: message.trim() || undefined,
            })
          }
        >
          Apply as influencer <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Agency99xPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-background to-accent/20">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">EduBridge Network</p>
              <p className="text-xs font-semibold text-primary">99x Developers · Studio</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-foreground">
                {n}
              </a>
            ))}
          </nav>
          <Button asChild size="sm">
            <a href="#proposal">Get Proposal</a>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 [&_section[id]]:scroll-mt-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-14 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> The product studio that built EduBridge Network
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            We design, build & grow your <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">business online</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            <strong className="text-foreground">99x Developers</strong> is the in-house studio of EduBridge Network —
            we built this very platform, and we ship conversion-focused websites, apps, SEO and ads for businesses
            every week.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href="#proposal">Get Free Proposal</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#proposal">Book a Call</a>
            </Button>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: '50+', l: 'Projects shipped' },
              { n: '1', l: 'Platform we built — EduBridge' },
              { n: '11', l: 'Services in-house' },
              { n: '100%', l: 'Custom-built' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold text-primary">{s.n}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Built EduBridge — proof / part of the network */}
        <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </span>
          <div>
            <p className="font-semibold">Part of EduBridge Network</p>
            <p className="text-sm text-muted-foreground">
              The platform you’re on was designed & engineered by 99x Developers. We’re EduBridge Network’s product
              studio — and we’re actively building websites, apps & growth systems for many businesses. Yours could
              be next.
            </p>
          </div>
        </section>

        {/* Request a proposal — primary CTA, front & center */}
        <section id="proposal" className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold">Request a proposal</h2>
            <p className="text-muted-foreground">
              Pick the services you want and tell us what you’re building — we’ll reply with a plan & quote.
            </p>
          </div>
          <ProposalForm />
        </section>

        {/* Services */}
        <section id="services" className="space-y-4">
          <h2 className="text-2xl font-bold">Our Services</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Card key={s.name}>
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{s.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Us */}
        <section id="why-us" className="space-y-4">
          <h2 className="text-2xl font-bold">Why Choose Us</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <div key={w} className="flex items-center gap-2 rounded-lg border border-border p-3">
                <Check className="h-4 w-4 text-primary" /> <span className="text-sm font-medium">{w}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section id="process" className="space-y-4">
          <h2 className="text-2xl font-bold">Our Process</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Card key={p}>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-primary">Step {i + 1}</p>
                  <p className="font-medium">{p}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Industries We Serve</h2>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((i) => (
              <span key={i} className="rounded-full border border-border px-3 py-1 text-sm">
                {i}
              </span>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="space-y-4">
          <h2 className="text-2xl font-bold">Pricing</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING.map((p) => (
              <Card key={p.tier} className={cn(p.tier === 'Business' && 'border-primary/50')}>
                <CardContent className="space-y-2 p-4">
                  <p className="font-semibold">{p.tier}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                  <ul className="space-y-1 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a href="#proposal">Choose</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-4">
          <h2 className="text-2xl font-bold">FAQ</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FAQ.map((f) => (
              <Card key={f.q}>
                <CardContent className="space-y-1 p-4">
                  <p className="font-medium">{f.q}</p>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Careers */}
        <section id="careers" className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold">Join our team</h2>
            <p className="text-muted-foreground">Apply for a role and share an older project — we review every portfolio.</p>
          </div>
          <CareerForm />
        </section>

        {/* Influencer program — promote EduBridge Network */}
        <section id="influencer" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Become a top influencer</h2>
            <p className="text-muted-foreground">
              Make 2 promotional videos for <strong>EduBridge Network</strong> from the brief below.
              Perform well → become a top influencer &amp; earn collab charges from our customers.
            </p>
          </div>

          {/* The brief / script */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-sm">
                  <Video className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Your brief — promote EduBridge Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Your future, EduBridge Network. Create a <strong>30–90 second</strong> promotional
                    video showing how EduBridge Network helps students. Explain why every student should
                    join and how it can change their academic &amp; career journey.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {INFLUENCER_BRIEF.map((b) => (
                  <div key={b.title} className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="flex items-center gap-2 font-medium">
                      <b.icon className="h-4 w-4 text-primary" /> {b.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Cover all four in your own style. This helps us evaluate your{' '}
                <strong>creativity, communication, storytelling &amp; marketing skills</strong> — we
                can&apos;t wait to see your unique perspective!
              </p>
            </CardContent>
          </Card>

          <InfluencerForm />
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <p className="font-semibold text-foreground">EduBridge Network · 99x Developers</p>
          </div>
          <p className="mt-1">Web design · development · digital marketing — the in-house studio of EduBridge Network.</p>
          <p className="mt-2">
            <Link href="/" className="text-primary hover:underline">
              ← Back to EduBridge Network
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
