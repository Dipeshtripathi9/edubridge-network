'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useMe } from '@/hooks/use-profile';
import { useCreateBlogPost, type BlogCategory } from '@/hooks/use-blog';
import { CATEGORY_META } from '../category-meta';
import styles from '../blog.module.css';

const CATEGORIES: BlogCategory[] = ['CAREER', 'COLLEGE', 'JOB'];

export default function WriteBlogPage() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: me, isLoading: meLoading } = useMe();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<BlogCategory>('CAREER');
  const [submitted, setSubmitted] = useState(false);
  const create = useCreateBlogPost();

  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.ceil(words / 200));

  if (!loggedIn) {
    return (
      <div className={styles.wrap}>
        <div className={styles.gateCard}>
          <b>Sign in to write a blog</b>
          <p>Only ID-verified students can publish on the EduBridge blog.</p>
          <div className={styles.gateActions}>
            <Link href="/login" className={styles.btnGhost}>
              Sign in
            </Link>
            <Link href="/signup" className={styles.btn}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (meLoading) return null;

  if (me?.profile?.collegeVerification !== 'VERIFIED') {
    return (
      <div className={styles.wrap}>
        <div className={styles.gateCard}>
          <b>Verify your college first</b>
          <p>
            Only ID-verified students can publish on the EduBridge blog — verify your college in your profile to
            unlock writing.
          </p>
          <div className={styles.gateActions}>
            <Link href="/verify" className={styles.btn}>
              Verify now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.wrap}>
        <div className={styles.successCard}>
          <b>Submitted for review</b>
          <p>
            Posts are reviewed for ID-verified authorship before they go live on the blogs page. We&rsquo;ll let you
            know once it&rsquo;s published.
          </p>
          <Link href="/blog" className={styles.btn}>
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  const authorName = me?.profile?.fullName ?? 'You';
  const categoryMeta = CATEGORY_META[category];

  const onPublish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Add a title and your story before publishing.');
      return;
    }
    create.mutate(
      { title: title.trim(), body: body.trim(), category },
      {
        onSuccess: () => setSubmitted(true),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.editorGrid}>
        <div>
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a title that tells the truth"
          />
          <div className={styles.byline}>By {authorName}</div>

          <div className={styles.categoryTabs}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.catTab} ${c === category ? styles.catTabActive : ''}`}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_META[c].label}
              </button>
            ))}
          </div>

          <textarea
            className={styles.storyInput}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start writing. What happened, what you'd tell your past self, what actually surprised you — the more specific, the more useful this is to someone else."
          />

          <div className={styles.editorFooter}>
            <span className={styles.metaStats}>
              {words} word{words === 1 ? '' : 's'} · {minutes} min read
            </span>
            <button type="button" className={styles.btnPrimary} onClick={onPublish} disabled={create.isPending}>
              {create.isPending ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>

        <aside className={styles.previewCol}>
          <span className={styles.previewEyebrow}>As it will appear</span>
          <div className={styles.previewCard}>
            <span className={`${styles.tag} ${styles[categoryMeta.tagClass]}`}>{categoryMeta.label}</span>
            <p className={styles.previewTitle}>{title.trim() || 'Give it a title that tells the truth'}</p>
            <div className={styles.meta}>
              {authorName} · {minutes} min
            </div>
          </div>
          <p className={styles.previewNote}>
            Posts are reviewed for ID-verified authorship before they go live on the blogs page.
          </p>
        </aside>
      </div>
    </div>
  );
}
