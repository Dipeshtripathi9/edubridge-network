'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { isSafeHttpUrl } from '@/lib/utils';
import { useApplyTrackB } from '@/hooks/use-internship-applications';

export function ApplyForm() {
  const router = useRouter();
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  const apply = useApplyTrackB();

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills((cur) => [...cur, s]);
    setSkillInput('');
  };

  const onSubmit = () => {
    if (skills.length === 0) {
      toast.error('Add at least one skill');
      return;
    }
    if (portfolioUrl.trim() && !isSafeHttpUrl(portfolioUrl.trim())) {
      toast.error('Portfolio link must be a valid https:// URL');
      return;
    }
    apply.mutate(
      { skills, portfolioUrl: portfolioUrl.trim() || undefined, bio: bio.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Application submitted — we’ll review it soon');
          router.push('/internship/dashboard');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Your skills</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. React, Figma, Copywriting"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary"
                >
                  {s}
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => setSkills((cur) => cur.filter((x) => x !== s))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Portfolio link (optional)</p>
          <Input
            placeholder="https://your-portfolio.com"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Tell us about yourself (optional)</p>
          <Textarea
            placeholder="What have you built? What kind of work are you looking for?"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <Button disabled={apply.isPending} onClick={onSubmit} className="w-full">
          Submit application <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
