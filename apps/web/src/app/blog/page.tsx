import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORY_META, type BlogCategory } from './category-meta';
import styles from './blog.module.css';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Student Blogs — EduBridge Network',
  description:
    'Honest, first-hand posts from ID-verified EduBridge students on internships, college choices, and career decisions.',
};

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readMinutes: number;
  author: { profile: { fullName: string } | null } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getPosts(): Promise<BlogPostSummary[]> {
  try {
    const res = await fetch(`${API_URL}/blog?limit=20`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <div className={styles.wrap}>
      <header className={styles.listHead}>
        <span className={styles.eyebrow}>From the community</span>
        <h1>Real advice, from students who&rsquo;ve walked the path.</h1>
        <p>
          Written only by ID-verified students — honest, first-hand takes on internships, college choices, and what
          actually shapes a career.
        </p>
        <Link href="/blog/write" className={styles.btn}>
          Write a blog →
        </Link>
      </header>

      <div className={styles.postGrid}>
        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet — be the first to write one.</p>
        ) : (
          posts.map((post) => {
            const meta = CATEGORY_META[post.category];
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className={styles.postCard}>
                <span className={`${styles.tag} ${styles[meta.tagClass]}`}>{meta.label}</span>
                <h2>{post.title}</h2>
                <p>{post.excerpt}…</p>
                <div className={styles.meta}>
                  {post.author?.profile?.fullName ?? 'EduBridge student'} · {post.readMinutes} min read
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
