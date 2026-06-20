'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUploadResource } from '@/hooks/use-resources';

const TYPES = [
  { value: 'NOTES', label: 'Notes' },
  { value: 'PDF', label: 'PDF' },
  { value: 'ROADMAP', label: 'Roadmap' },
  { value: 'PLACEMENT_REPORT', label: 'Placement Report' },
  { value: 'STUDY_MATERIAL', label: 'Study Material' },
];

export function ResourceUpload() {
  const upload = useUploadResource();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('NOTES');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    if (!file || !title.trim()) {
      toast.error('Add a file and a title');
      return;
    }
    upload.mutate(
      {
        file,
        type,
        title,
        description: description || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success('Resource uploaded');
          setOpen(false);
          setTitle('');
          setDescription('');
          setTags('');
          setFile(null);
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Upload resource
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a resource</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                type === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-accent',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={upload.isPending}>
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
