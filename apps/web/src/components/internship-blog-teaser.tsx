'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

// "From the community" blog teaser — isolated iframe widget (same pattern as
// InternshipBrowseByField/InternshipLaunchCarousel). Unlike its static
// siblings, this one fetches real published posts so the teaser stays in
// sync with what's actually live on /blog. The "Write Blog" button can't
// just be a normal <a> inside the iframe (it would navigate the iframe, not
// the app), so it posts a nav message the wrapper turns into a router.push.
interface TeaserPost {
  slug: string;
  title: string;
  category: 'CAREER' | 'COLLEGE' | 'JOB';
  readMinutes: number;
  author: { profile: { fullName: string } | null } | null;
}

const CATEGORY_TAG: Record<TeaserPost['category'], { label: string; cls: string }> = {
  CAREER: { label: 'Career', cls: 'tag-career' },
  COLLEGE: { label: 'College', cls: 'tag-college' },
  JOB: { label: 'Job', cls: 'tag-job' },
};

const AVATAR_COLORS = ['#2E5240', '#3A5A8C', '#8C3A78'];

const FALLBACK_POSTS: TeaserPost[] = [
  {
    slug: 'what-my-first-freelance-gig-taught-me',
    title: 'What my first freelance gig taught me',
    category: 'CAREER',
    readMinutes: 4,
    author: { profile: { fullName: 'Aditi R.' } },
  },
  {
    slug: 'i-almost-picked-my-college-for-the-wrong-reason',
    title: 'I almost picked my college for the wrong reason',
    category: 'COLLEGE',
    readMinutes: 6,
    author: { profile: { fullName: 'Rohan K.' } },
  },
  {
    slug: 'what-a-startup-internship-actually-looks-like',
    title: 'What a startup internship actually looks like',
    category: 'JOB',
    readMinutes: 5,
    author: { profile: { fullName: 'Priya M.' } },
  },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function postRowHTML(post: TeaserPost, color: string) {
  const tag = CATEGORY_TAG[post.category];
  const name = post.author?.profile?.fullName ?? 'EduBridge student';
  return `
      <div class="mini-post">
        <div class="mini-avatar" style="background:${color};">${escapeHtml(initials(name))}</div>
        <div class="mini-text">
          <p class="mini-title">${escapeHtml(post.title)}</p>
          <p class="mini-sub">${escapeHtml(name)} · ${post.readMinutes} min</p>
        </div>
        <span class="mini-tag ${tag.cls}">${tag.label}</span>
      </div>`;
}

function buildSrc(posts: TeaserPost[]) {
  const rows = posts
    .slice(0, 3)
    .map((p, i) => postRowHTML(p, AVATAR_COLORS[i % AVATAR_COLORS.length]))
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EduBridge — From the community</title>
<style>
  :root{
    --cream:#F3EFE3;
    --card-bg:#F0EDE4;
    --card-white:#FFFFFF;
    --text-dark:#1C1C1A;
    --text-body:#6B6C63;
    --pill-bg:#DCEDE2;
    --pill-text:#2E6B4F;
    --accent-circle:#173F33;
    --border:#E4DFD0;
  }
  *{box-sizing:border-box;}
  html,body{background:transparent;}
  body{
    margin:0;
    font-family:Arial, Helvetica, sans-serif;
    color:var(--text-dark);
    padding:0.5rem 0 1.5rem;
  }
  .card{
    background:var(--card-bg);
    border-radius:20px;
    padding:36px;
    display:grid;
    grid-template-columns:1.1fr 0.9fr;
    gap:32px;
    align-items:center;
  }
  .card-left .pill{
    display:inline-block;
    font-size:11px;
    font-weight:800;
    letter-spacing:0.08em;
    color:var(--pill-text);
    background:var(--pill-bg);
    padding:5px 12px;
    border-radius:20px;
    margin-bottom:18px;
  }
  .card-left h3{
    font-size:28px;
    line-height:1.28;
    font-weight:800;
    margin:0 0 16px;
    max-width:380px;
  }
  .card-left p{
    font-size:14.5px;
    line-height:1.7;
    color:var(--text-body);
    margin:0 0 34px;
    max-width:380px;
  }
  .learn-more{
    display:inline-flex;
    align-items:center;
    gap:12px;
    font-size:14px;
    font-weight:800;
    color:var(--text-dark);
    background:none;
    border:none;
    font-family:inherit;
    text-decoration:none;
    cursor:pointer;
    padding:0;
  }
  .learn-more .circle{
    width:34px;
    height:34px;
    border-radius:50%;
    background:var(--accent-circle);
    display:flex;
    align-items:center;
    justify-content:center;
    flex:none;
  }
  .learn-more .circle svg{width:16px;height:16px;}
  .learn-more:hover .circle{background:#0F2A22;}
  .preview{
    background:var(--card-white);
    border-radius:14px;
    padding:20px 22px;
    box-shadow:0 14px 30px rgba(0,0,0,0.06);
  }
  .preview-label{
    font-size:11px;
    font-weight:800;
    letter-spacing:0.06em;
    color:#9C9A8E;
    text-transform:uppercase;
    margin-bottom:14px;
  }
  .mini-post{
    display:flex;
    align-items:center;
    gap:12px;
    padding:10px 0;
    border-bottom:1px solid var(--border);
  }
  .mini-post:last-child{border-bottom:none;}
  .mini-avatar{
    width:30px;
    height:30px;
    border-radius:50%;
    flex:none;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:11px;
    font-weight:800;
    color:#fff;
  }
  .mini-text{flex:1;min-width:0;}
  .mini-title{font-size:12.5px;font-weight:700;color:var(--text-dark);margin:0;line-height:1.3;}
  .mini-sub{font-size:11px;color:var(--text-body);margin:2px 0 0;}
  .mini-tag{
    font-size:9.5px;
    font-weight:800;
    letter-spacing:0.04em;
    text-transform:uppercase;
    padding:4px 9px;
    border-radius:20px;
    flex:none;
  }
  .tag-career{background:#FBEAD9;color:#A85F35;}
  .tag-college{background:#E3EBF5;color:#3A5A8C;}
  .tag-job{background:var(--pill-bg);color:var(--pill-text);}
  @media (max-width:820px){
    .card{grid-template-columns:1fr;}
    .card-left h3{max-width:100%;}
    .card-left p{max-width:100%;}
  }
</style>
</head>
<body>
<div class="card">
  <div class="card-left">
    <span class="pill">From the community</span>
    <h3>Real advice, from students who&rsquo;ve walked the path.</h3>
    <p>Written only by ID-verified students — honest, first-hand takes on internships, college choices, and what actually shapes a career.</p>
    <button type="button" class="learn-more" id="writeBtn">
      Write Blog
      <span class="circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="#F3EFE3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
    </button>
  </div>
  <div class="preview">
    <div class="preview-label">Recent blogs</div>${rows}
  </div>
</div>

<script>
  document.getElementById('writeBtn').addEventListener('click', function () {
    try { parent.postMessage({ blogTeaserNav: '/blog/write' }, '*'); } catch (e) {}
  });

  (function(){
    function post(){ try{ parent.postMessage({ blogTeaserHeight: Math.ceil(document.body.getBoundingClientRect().height) + 12 }, '*'); }catch(e){} }
    window.addEventListener('load', post);
    window.addEventListener('resize', post);
    window.addEventListener('orientationchange', post);
    setTimeout(post, 300);
    setTimeout(post, 900);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(post);
      ro.observe(document.body);
    } else {
      setTimeout(post, 400);
    }
  })();
</script>
</body>
</html>`;
}

export function InternshipBlogTeaser() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(360);
  const [posts, setPosts] = useState<TeaserPost[]>(FALLBACK_POSTS);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/blog?limit=3`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const data = json?.data as TeaserPost[] | undefined;
        if (data && data.length > 0) setPosts(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.blogTeaserHeight === 'number') setHeight(Math.max(240, e.data.blogTeaserHeight));
      if (typeof e.data?.blogTeaserNav === 'string') router.push(e.data.blogTeaserNav);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [router]);

  const src = useMemo(() => buildSrc(posts), [posts]);

  return (
    <section aria-label="From the community — student blogs">
      <iframe
        ref={ref}
        title="From the community — student blogs"
        srcDoc={src}
        loading="lazy"
        scrolling="no"
        className="block w-full border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
