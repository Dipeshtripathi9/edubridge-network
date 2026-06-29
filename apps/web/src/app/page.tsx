import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  LayoutGrid,
  Repeat,
  Rocket,
  Star,
  Target,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const MODULES = [
  { icon: Star, title: 'College Reviews', desc: 'Genuine, verified reviews on placements, hostels & faculty.' },
  { icon: Compass, title: 'College Selection', desc: 'For new students — choose the right college with real insight from verified students.' },
  { icon: LayoutGrid, title: 'Communities', desc: 'College & interest communities — posts, polls, discussions.', href: '/signup' },
  { icon: Rocket, title: 'Startups', desc: 'Student-led startups on the network — launch your venture, join a team, or get services & housing from ours.', href: '/signup' },
  { icon: Target, title: 'Opportunities', desc: 'Internships, scholarships, fellowships & competitions.', href: '/signup' },
  { icon: BookOpen, title: 'Resource Hub', desc: 'Notes, roadmaps & placement reports from peers.', href: '/signup' },
  { icon: Repeat, title: 'Transfer Hub', desc: 'Find eligible colleges, requirements, deadlines & credit transfer.', href: '/signup' },
  { icon: Bell, title: 'Notifications', desc: 'Never miss a deadline, mention or message.', href: '/signup' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">EduBridge Network</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>

      <main className="container">
        <section className="mx-auto max-w-3xl py-20 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Your Future, Our Network
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            The network for students <span className="text-primary">already in college</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Connect with college communities, transfer to better colleges, win scholarships and
            internships, read genuine reviews, and build your reputation.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/login">
                Find My College
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">
                Already In College <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const inner = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
              </>
            );
            return m.href ? (
              <Link
                key={m.title}
                href={m.href}
                className="rounded-lg border border-border bg-card p-6 transition-shadow hover:border-primary/50 hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <div key={m.title} className="rounded-lg border border-border bg-card p-6">
                {inner}
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EduBridge Network · Built for 200,000+ students in India
      </footer>
    </div>
  );
}
