'use client';

import { useState } from 'react';
import { MotionProvider, m } from '@/components/motion';
import { Award, CalendarClock, GraduationCap, IndianRupee, Repeat, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateJourney, useEligibilityCheck, type EligibleMatch } from '@/hooks/use-transfer';

function MatchCard({ match }: { match: EligibleMatch }) {
  const createJourney = useCreateJourney();
  const { college, requirement, cgpaHeadroom } = match;
  return (
    <MotionProvider>
      <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{college.name}</h3>
              <p className="text-sm text-muted-foreground">
                {[college.city, college.state].filter(Boolean).join(', ')}
              </p>
            </div>
            {college.nirfRank && <Badge variant="secondary">NIRF #{college.nirfRank}</Badge>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat icon={GraduationCap} label="Min CGPA" value={requirement.minCgpa ?? 'Any'} />
            <Stat
              icon={Repeat}
              label="Credit transfer"
              value={requirement.creditTransfer ? 'Yes' : 'No'}
            />
            <Stat
              icon={CalendarClock}
              label="Deadline"
              value={requirement.deadline ? new Date(requirement.deadline).toLocaleDateString() : '—'}
            />
            <Stat
              icon={IndianRupee}
              label="Fee"
              value={requirement.feeAmount ? `₹${(requirement.feeAmount / 100000).toFixed(1)}L` : '—'}
            />
          </div>

          {cgpaHeadroom != null && cgpaHeadroom >= 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <Award className="h-3.5 w-3.5" />
              You exceed the CGPA cutoff by {cgpaHeadroom.toFixed(2)} points
            </p>
          )}
          {requirement.notes && (
            <p className="mt-2 text-xs text-muted-foreground">{requirement.notes}</p>
          )}

          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={createJourney.isPending}
              onClick={() =>
                createJourney.mutate(
                  { toCollegeId: college.id, branch: requirement.branch ?? undefined },
                  { onSuccess: () => toast.success(`Tracking transfer to ${college.name}`) },
                )
              }
            >
              Track this transfer
            </Button>
          </div>
        </CardContent>
      </Card>
      </m.div>
    </MotionProvider>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function EligibilityChecker() {
  const check = useEligibilityCheck();
  const [cgpa, setCgpa] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [branch, setBranch] = useState('');
  const [creditOnly, setCreditOnly] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgpa || !currentYear || !branch) {
      toast.error('Fill in CGPA, year and branch');
      return;
    }
    check.mutate({
      cgpa: Number(cgpa),
      currentYear: Number(currentYear),
      branch,
      creditTransferOnly: creditOnly,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find colleges you can transfer to</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your details — we match you against real transfer requirements.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4">
            <Input
              type="number"
              step="0.01"
              placeholder="CGPA"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Current year"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
            />
            <Input
              placeholder="Branch (e.g. CSE)"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
            <Button type="submit" disabled={check.isPending}>
              <Search className="h-4 w-4" />
              {check.isPending ? 'Checking…' : 'Check'}
            </Button>
            <label className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={creditOnly}
                onChange={(e) => setCreditOnly(e.target.checked)}
              />
              Only show colleges offering credit transfer
            </label>
          </form>
        </CardContent>
      </Card>

      {check.data && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {check.data.eligibleCount} eligible {check.data.eligibleCount === 1 ? 'college' : 'colleges'} found
          </p>
          {check.data.matches.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No matches yet. Try a different branch, or check back as we ingest more college data.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {check.data.matches.map((m) => (
                <MatchCard key={m.requirement.id} match={m} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
