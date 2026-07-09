'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import { PLAYBOOK } from './playbook';

export default function OpportunityPlaybookPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/opportunities"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Opportunities
      </Link>
      <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {PLAYBOOK}
        </ReactMarkdown>
      </article>
    </div>
  );
}
