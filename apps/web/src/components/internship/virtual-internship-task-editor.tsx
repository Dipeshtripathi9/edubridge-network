'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Layers, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterChips } from '@/components/ui/filter-chips';
import {
  useAdminUpsertVirtualInternshipTask,
  useVirtualInternshipTasks,
  type VirtualInternshipTask,
  type VirtualInternshipTrack,
} from '@/hooks/use-virtual-internship';

const TRACKS: { value: VirtualInternshipTrack; label: string }[] = [
  { value: 'FOUR_WEEK', label: '4-Week Track' },
  { value: 'FOUR_MONTH', label: '4-Month Track' },
];

interface TaskDraft {
  title: string;
  objective: string;
  deliverable: string;
  steps: string;
  hours: string;
}

function draftFromTask(task: VirtualInternshipTask | undefined, weekNum: number): TaskDraft {
  return {
    title: task?.title ?? `Week ${weekNum}`,
    objective: task?.objective ?? '',
    deliverable: task?.deliverable ?? '',
    steps: task?.steps?.join('\n') ?? '',
    hours: task?.hours ?? '',
  };
}

function WeekEditor({
  track,
  monthNum,
  weekNum,
  task,
  monthTitle,
  monthDesc,
}: {
  track: VirtualInternshipTrack;
  monthNum: number | null;
  weekNum: number;
  task: VirtualInternshipTask | undefined;
  monthTitle?: string;
  monthDesc?: string;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => draftFromTask(task, weekNum));
  const upsert = useAdminUpsertVirtualInternshipTask();

  const onSave = () => {
    if (!draft.title.trim() || !draft.objective.trim() || !draft.deliverable.trim() || !draft.hours.trim()) {
      toast.error('Fill in the title, objective, deliverable and effort estimate');
      return;
    }
    const steps = draft.steps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!steps.length) {
      toast.error('Add at least one key step');
      return;
    }
    upsert.mutate(
      {
        track,
        monthNum: monthNum ?? undefined,
        weekNum,
        monthTitle: monthTitle?.trim() || undefined,
        monthDesc: monthDesc?.trim() || undefined,
        title: draft.title.trim(),
        objective: draft.objective.trim(),
        deliverable: draft.deliverable.trim(),
        steps,
        hours: draft.hours.trim(),
      },
      {
        onSuccess: () => toast.success(`Week ${weekNum} saved`),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-accent text-xs font-bold">
          W{weekNum}
        </span>
        <Input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Task title"
          className="min-w-[160px] flex-1 font-semibold"
        />
        <Input
          value={draft.hours}
          onChange={(e) => setDraft((d) => ({ ...d, hours: e.target.value }))}
          placeholder="8–10 hours"
          className="w-32"
        />
      </div>
      <Textarea
        value={draft.objective}
        onChange={(e) => setDraft((d) => ({ ...d, objective: e.target.value }))}
        placeholder="Task objective"
        rows={2}
      />
      <Textarea
        value={draft.deliverable}
        onChange={(e) => setDraft((d) => ({ ...d, deliverable: e.target.value }))}
        placeholder="Expected deliverable"
        rows={2}
      />
      <Textarea
        value={draft.steps}
        onChange={(e) => setDraft((d) => ({ ...d, steps: e.target.value }))}
        placeholder="Key steps — one per line"
        rows={4}
      />
      <div className="flex justify-end">
        <Button size="sm" disabled={upsert.isPending} onClick={onSave}>
          <Save className="h-3.5 w-3.5" /> Save week {weekNum}
        </Button>
      </div>
    </div>
  );
}

function MonthGroup({ track, monthNum, tasks }: { track: VirtualInternshipTrack; monthNum: number; tasks: VirtualInternshipTask[] }) {
  const firstTask = tasks[0];
  const [monthTitle, setMonthTitle] = useState(firstTask?.monthTitle ?? '');
  const [monthDesc, setMonthDesc] = useState(firstTask?.monthDesc ?? '');

  useEffect(() => {
    setMonthTitle(firstTask?.monthTitle ?? '');
    setMonthDesc(firstTask?.monthDesc ?? '');
  }, [firstTask?.monthTitle, firstTask?.monthDesc]);

  const byWeek = new Map(tasks.map((t) => [t.weekNum, t]));

  return (
    <div className="space-y-3 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-green text-sm font-bold text-white">
          M{monthNum}
        </span>
        <Input
          value={monthTitle}
          onChange={(e) => setMonthTitle(e.target.value)}
          placeholder={`Month ${monthNum} title`}
          className="flex-1 font-semibold"
        />
      </div>
      <Input value={monthDesc} onChange={(e) => setMonthDesc(e.target.value)} placeholder="Short blurb shown above this month" />
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((weekNum) => (
          <WeekEditor
            key={weekNum}
            track={track}
            monthNum={monthNum}
            weekNum={weekNum}
            task={byWeek.get(weekNum)}
            monthTitle={monthTitle}
            monthDesc={monthDesc}
          />
        ))}
      </div>
    </div>
  );
}

export function VirtualInternshipTaskEditor() {
  const [track, setTrack] = useState<VirtualInternshipTrack>('FOUR_WEEK');
  const { data: tasks, isLoading } = useVirtualInternshipTasks(track);
  const isMonthTrack = track === 'FOUR_MONTH';

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-accent text-primary">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold">Curriculum content</p>
            <p className="text-xs text-muted-foreground">
              Edit the objective, deliverable, key steps and effort shown to students for each week.
            </p>
          </div>
        </div>

        <FilterChips options={TRACKS} value={track} onChange={setTrack} />

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isMonthTrack ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((monthNum) => (
              <MonthGroup key={monthNum} track={track} monthNum={monthNum} tasks={(tasks ?? []).filter((t) => t.monthNum === monthNum)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((weekNum) => (
              <WeekEditor key={weekNum} track={track} monthNum={null} weekNum={weekNum} task={(tasks ?? []).find((t) => t.weekNum === weekNum)} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
