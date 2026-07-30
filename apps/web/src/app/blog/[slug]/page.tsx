import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORY_META, type BlogCategory } from '../category-meta';
import styles from '../blog.module.css';

export const revalidate = 300;

interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  category: BlogCategory;
  readMinutes: number;
  publishedAt: string;
  author: { profile: { fullName: string } | null } | null;
  college: { name: string; slug: string } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — EduBridge Student Blogs`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const meta = CATEGORY_META[post.category];
  const paragraphs = post.body.split(/\n{2,}/);
  const authorName = post.author?.profile?.fullName ?? 'EduBridge student';

  return (
    <article className={`${styles.wrap} ${styles.article}`}>
      <Link href="/blog" className={styles.backLink}>
        ← Back to blogs
      </Link>
      <span className={`${styles.tag} ${styles[meta.tagClass]}`}>{meta.label}</span>
      <h1>{post.title}</h1>
      <div className={styles.meta}>
        {authorName}
        {post.college ? ` · ${post.college.name}` : ''} · {post.readMinutes} min read
      </div>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </article>
  );
}
