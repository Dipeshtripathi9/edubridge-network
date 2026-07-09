'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Home, MapPin, ShieldCheck, Upload, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { RoomQuiz } from '@/components/room-quiz';
import { useSubmitRentalLead } from '@/hooks/use-rentals';
import { cn } from '@/lib/utils';

const PARTICIPANTS = ['Property Owner', 'Broker', 'Student', 'Local Resident'];

const STEPS = [
  { n: '01', title: 'Pick your college', body: 'Search your campus and see every verified room around it, mapped by walking distance.' },
  { n: '02', title: 'Compare like a local', body: 'Real rent breakdowns and reviews from current residents — the good and the annoying, both.' },
  { n: '03', title: 'Move in, sorted', body: 'Book a visit, get a resident’s honest take, and move in — verified before you commit.' },
];

function Roofline({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
      <path d="M6 17 L150 4 L294 17" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ShareProperty() {
  const submit = useSubmitRentalLead();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [participant, setParticipant] = useState(PARTICIPANTS[0]);
  const [driveUrl, setDriveUrl] = useState('');
  const [details, setDetails] = useState('');

  const onSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Please add your name and phone number');
      return;
    }
    submit.mutate(
      { kind: 'PROPERTY', name: name.trim(), phone: phone.trim(), participant, driveUrl: driveUrl.trim() || undefined, details: details.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Shared! We’ll verify it and reach out about your cashback.');
          setName('');
          setPhone('');
          setDriveUrl('');
          setDetails('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const field = 'w-full rounded-2xl border-[1.5px] border-border bg-white px-4 py-3 text-[15px] font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-accent';

  return (
    <div className="rounded-[24px] border border-marigold/30 bg-marigold-soft p-6 sm:p-8">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input className={field} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={field} inputMode="numeric" maxLength={10} placeholder="WhatsApp number *" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
      </div>
      <p className="mb-2 mt-4 text-[13px] font-bold text-muted-foreground">You are a…</p>
      <div className="flex flex-wrap gap-2">
        {PARTICIPANTS.map((p) => (
          <button
            key={p}
            onClick={() => setParticipant(p)}
            className={cn('rounded-full border-[1.5px] px-4 py-2 text-[13.5px] font-bold transition-colors', participant === p ? 'border-primary bg-accent text-primary' : 'border-border bg-white text-muted-foreground hover:border-foreground')}
          >
            {p}
          </button>
        ))}
      </div>
      <input className={cn(field, 'mt-4')} placeholder="Google Drive folder link (photos, rent, contact…) — optional" value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} />
      <textarea className={cn(field, 'mt-2.5 min-h-[96px] rounded-2xl')} placeholder="Or describe the place — rent, amenities, location, owner contact…" value={details} onChange={(e) => setDetails(e.target.value)} />
      <button onClick={onSubmit} disabled={submit.isPending} className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
        <Upload className="h-4 w-4" /> {submit.isPending ? 'Sharing…' : 'Share a property'}
      </button>
      <p className="mt-3 text-[12.5px] font-semibold text-muted-foreground">Cashback is paid once we verify and list the place — the day it goes live.</p>
    </div>
  );
}

export default function EzRentbuddyPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const openQuiz = () => setQuizOpen(true);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ '--primary': '224 55% 31%', '--accent': '221 44% 92%' } as CSSProperties}
    >
      <RoomQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />

      {/* family strip */}
      <div className="bg-foreground px-4 py-2.5 text-center text-[12.5px] font-semibold text-white/80">
        An <b className="text-white">EduBridge Network</b> company — same verified-first rules, now for rooms.{' '}
        <Link href="/home" className="font-bold text-marigold">Know the network →</Link>
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-primary text-white"><Home className="h-[18px] w-[18px]" /></span>
            <span className="font-display text-xl font-extrabold tracking-[-.5px]">ez-<span className="text-primary">rentbuddy</span></span>
          </div>
          <nav className="ml-auto flex items-center gap-2.5">
            <Link href="/home" className="hidden items-center gap-1.5 rounded-full border-[1.5px] border-border bg-white px-4 py-2.5 text-[13.5px] font-bold text-muted-foreground hover:border-foreground hover:text-foreground sm:inline-flex">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-[6px] bg-primary text-[9px] font-black text-primary-foreground">E</span>
              EduBridge <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button onClick={openQuiz} className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90">
              Find a place
            </button>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="px-5 py-16 text-center sm:py-20">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2.6px] text-primary">
          <Home className="h-3.5 w-3.5" /> Verified rooms near NCR colleges
        </span>
        <h1 className="mx-auto mt-4 max-w-[720px] font-display text-[clamp(30px,5.6vw,54px)] font-extrabold leading-[1.08] tracking-[-.03em]">
          Find your accommodation
          <br />
          in{' '}
          <span className="relative inline-block whitespace-nowrap text-primary">
            7 simple taps.<Roofline className="absolute -bottom-2 left-0 h-3 w-full text-marigold" />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-[560px] text-[17.5px] font-medium text-muted-foreground">
          Verified PGs and flats near 70+ NCR colleges — <b className="font-bold text-foreground">real rents, real photos, reviewed by students who actually live there.</b>
        </p>

        {/* single full-width CTA → opens quiz */}
        <button
          onClick={openQuiz}
          className="mx-auto mt-9 flex w-full max-w-[560px] items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-[16px] font-bold text-white shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.55)] transition-colors hover:bg-primary/90"
        >
          Find my place <ArrowRight className="h-[18px] w-[18px]" />
        </button>
      </section>

      {/* how it works */}
      <section className="border-y border-border bg-white px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-.024em]">Sorted in three steps</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="rounded-[24px] border border-border bg-background p-6 shadow-sm">
                <span className={cn('grid h-11 w-11 place-items-center rounded-[14px] font-display text-[15px] font-extrabold', i === 1 ? 'bg-marigold text-foreground' : 'bg-primary text-white')}>{s.n}</span>
                <h3 className="mt-3.5 font-display text-lg font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* origin */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex flex-wrap items-center gap-5 rounded-[24px] border border-border bg-white p-7 shadow-sm">
          <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-[15px] bg-primary text-primary-foreground"><ShieldCheck className="h-6 w-6" /></span>
          <p className="min-w-[260px] flex-1 text-[15px] text-muted-foreground">
            <b className="text-foreground">Born inside EduBridge Network.</b> Pitched by students in Founders Hub, built by 99x Developers — because “college sorted” should include the room too. Same rule here as there: <b className="text-foreground">if it isn’t verified, it isn’t listed.</b>
          </p>
          <Link href="/home" className="inline-flex items-center gap-2 whitespace-nowrap text-[14.5px] font-extrabold text-primary">
            The EduBridge story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* dark CTA */}
      <section className="bg-[#16264f] px-5 py-20 text-center text-white sm:py-24">
        <span className="font-mono text-[11px] uppercase tracking-[3px] text-marigold">EZ-Rentbuddy</span>
        <h2 className="mx-auto mt-4 max-w-[680px] font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.08] tracking-[-.028em]">
          Admission sorted.
          <br />
          Now sort{' '}
          <span className="relative inline-block whitespace-nowrap">
            the room.<Roofline className="absolute -bottom-2 left-0 h-3.5 w-full text-marigold" />
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-[460px] text-[16.5px] text-[#C7D0EC]">Verified rooms, real rents, and a roommate who won’t eat your Maggi. Free to browse.</p>
        <button onClick={openQuiz} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-[15.5px] font-bold text-white transition-colors hover:bg-primary/90">
          Find rooms near my college <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* cashback — share a property (bottom) */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-soft px-3.5 py-1.5 text-[12.5px] font-extrabold text-green">
              <Wallet className="h-3.5 w-3.5" /> Earn ₹500 cashback
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.12] tracking-[-.024em]">
              Know a good room?
              <br />
              <span className="text-primary">Earn ₹500 cashback.</span>
            </h2>
            <p className="mt-4 max-w-[460px] text-[16px] text-muted-foreground">
              Share a PG or flat you know — if our team verifies and lists it, the cashback is yours the day it goes live. Residents can refer their own building too.
            </p>
            <div className="mt-6 flex items-center gap-2.5 text-[13.5px] font-semibold text-muted-foreground">
              <MapPin className="h-4 w-4 flex-none text-primary" /> Any PG, hostel, flat or room near an NCR college counts.
            </div>
          </div>
          <ShareProperty />
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border bg-background px-5 py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-white"><Home className="h-4 w-4" /></span>
            <span className="font-display text-lg font-extrabold tracking-tight">ez-<span className="text-primary">rentbuddy</span></span>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-[14px] font-semibold text-muted-foreground">
            <button onClick={openQuiz} className="hover:text-primary">Find a place</button>
            <Link href="/home" className="hover:text-primary">EduBridge Network</Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 pt-5 text-[13px] font-semibold text-muted-foreground">
          <span>© 2026 EZ-Rentbuddy · An EduBridge Network company</span>
          <span>Student housing near your campus</span>
        </div>
      </footer>
    </div>
  );
}
