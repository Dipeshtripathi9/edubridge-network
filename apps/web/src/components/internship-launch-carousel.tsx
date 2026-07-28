'use client';

import { useEffect, useRef, useState } from 'react';

// "One platform to launch real careers" — isolated iframe widget (same
// pattern as HomeAdmissionDesk/HomeCareerBridge/InternshipBrowseByField).
const SRC = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EduBridge — One platform to launch real careers</title>
<style>
  :root{
    --ink:#14171A;
    --sub:#5B6167;
    --card-a:#F1EFE9;
    --card-b:#F6F5F1;
    --accent:#2FBFA0;
    --accent-dark:#1c8a72;
    --accent-ink:#0E3B33;
    --line:#E6E3DC;
  }
  *{box-sizing:border-box;}
  html,body{background:transparent;}
  body{
    margin:0;
    font-family:"Helvetica Neue",Arial,sans-serif;
    color:var(--ink);
    padding:2.5rem 0 1.5rem;
  }
  .wrap{max-width:1400px;margin:0 auto;position:relative;}
  h1.headline{
    text-align:center;
    font-size:34px;
    font-weight:800;
    letter-spacing:-0.6px;
    margin:0 0 44px;
  }

  .carousel{position:relative;}

  .navbtn{
    position:absolute;
    top:44%;
    transform:translateY(-50%);
    width:44px;height:44px;
    border-radius:50%;
    background:#fff;
    border:1px solid var(--line);
    box-shadow:0 8px 20px rgba(0,0,0,0.08);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
    z-index:5;
    font-size:16px;
    color:var(--ink);
    transition:background .18s ease, transform .18s ease, box-shadow .18s ease;
  }
  .navbtn:hover{background:var(--ink);color:#fff;box-shadow:0 10px 26px rgba(0,0,0,0.18);}
  .navbtn:active{transform:translateY(-50%) scale(0.94);}
  .navbtn.prev{left:-16px;}
  .navbtn.next{right:-16px;}
  .navbtn[disabled]{opacity:.35;pointer-events:none;}

  .track{
    display:flex;
    overflow-x:auto;
    scroll-snap-type:x mandatory;
    scroll-behavior:smooth;
    gap:20px;
    padding:6px 4px 20px;
    scrollbar-width:none;
  }
  .track::-webkit-scrollbar{display:none;}

  .card{
    scroll-snap-align:start;
    flex:0 0 auto;
    width:min(88vw,600px);
    min-height:auto;
    border-radius:22px;
    padding:32px 28px;
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    position:relative;
    overflow:hidden;
    border:1px solid rgba(0,0,0,0.03);
    transition:box-shadow .25s ease, transform .25s ease;
  }
  .card:hover{box-shadow:0 24px 48px rgba(20,23,26,0.10);transform:translateY(-3px);}
  .card:nth-child(odd){background:var(--card-a);}
  .card:nth-child(even){background:var(--card-b);}
  .card > div:first-child{order:1;}

  .num{
    font-size:11.5px;
    font-weight:700;
    letter-spacing:1.6px;
    color:var(--accent-ink);
    background:rgba(47,191,160,0.16);
    display:inline-block;
    padding:5px 11px;
    border-radius:20px;
    margin-bottom:20px;
    width:fit-content;
  }
  .card h2{
    font-size:27px;
    font-weight:800;
    line-height:1.2;
    margin:0 0 14px;
    letter-spacing:-0.4px;
    max-width:100%;
  }
  .card p{
    font-size:15px;
    line-height:1.65;
    color:var(--sub);
    margin:0 0 26px;
    max-width:100%;
  }
  .learn{
    display:inline-flex;
    align-items:center;
    gap:9px;
    font-size:14px;
    font-weight:700;
    color:var(--ink);
    text-decoration:none;
    width:fit-content;
    padding:6px 6px 6px 2px;
    border-radius:24px;
    transition:gap .18s ease;
    order:2;
    margin-bottom:24px;
  }
  .learn:hover{gap:13px;}
  .learn .arrow{
    width:28px;height:28px;
    border-radius:9px;
    background:var(--accent);
    display:flex;align-items:center;justify-content:center;
    color:#fff;
    font-size:14px;
    transition:transform .18s ease, background .18s ease;
  }
  .learn:hover .arrow{background:var(--accent-dark);transform:rotate(-45deg);}

  .mock{
    position:static;
    width:100%;
    max-width:260px;
    margin:4px auto 0;
    order:3;
    transition:transform .3s ease;
  }
  .card:hover .mock{transform:translateY(-2px);}
  .mock-inner{
    background:#fff;
    border-radius:18px;
    box-shadow:0 24px 48px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06);
    padding:16px;
    transform:none;
  }

  .dot-row{
    display:flex;
    justify-content:center;
    gap:8px;
    margin-top:28px;
  }
  .dot{
    width:32px;height:5px;border-radius:3px;background:var(--line);
    border:none;cursor:pointer;padding:0;
    transition:background .25s ease, width .25s ease;
  }
  .dot.active{background:var(--ink);width:44px;}

  .m-title{font-size:10px;font-weight:700;color:#B9B4A8;letter-spacing:.5px;margin-bottom:10px;text-transform:uppercase;}
  .job-row{display:flex;align-items:center;gap:9px;padding:9px 4px;border-bottom:1px solid #F0F0EE;}
  .job-row:last-child{border-bottom:none;}
  .job-tag{width:30px;height:30px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;}
  .job-lines{flex:1;}
  .job-lines .l1{height:8px;width:82%;background:#DEDCD3;border-radius:4px;margin-bottom:6px;}
  .job-lines .l2{height:6px;width:52%;background:#EDEBE4;border-radius:4px;}
  .job-pill{font-size:9px;background:#EAF9F4;color:var(--accent-ink);padding:3px 7px;border-radius:10px;font-weight:800;white-space:nowrap;}

  .search-bar{display:flex;align-items:center;gap:7px;background:#F2F1EC;border-radius:11px;padding:9px 11px;margin-bottom:12px;}
  .search-bar svg{flex-shrink:0;}
  .search-bar span{font-size:10px;color:#9A968B;}
  .filter-chip{display:inline-block;font-size:9.5px;background:#fff;border:1px solid #E3E0D7;border-radius:20px;padding:5px 9px;margin:2px 5px 2px 0;color:#5B5850;font-weight:600;}
  .filter-chip.on{background:var(--ink);border-color:var(--ink);color:#fff;}
  .result-count{font-size:9px;color:#B9B4A8;margin:10px 0 6px;font-weight:600;}

  .blog-avatar{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#2FBFA0,#1c8a72);flex-shrink:0;}
  .blog-name{font-size:10.5px;font-weight:800;}
  .blog-sub{font-size:8.5px;color:#A6A295;}
  .blog-title{font-size:12px;font-weight:800;margin:10px 0 6px;line-height:1.3;}
  .blog-line{height:6px;background:#EFEDE7;border-radius:3px;margin-bottom:6px;}
  .blog-tag{font-size:8.5px;background:#FFF3E6;color:#B35B00;padding:3px 8px;border-radius:8px;display:inline-block;margin-top:8px;font-weight:700;}
  .blog-stats{display:flex;gap:12px;margin-top:10px;}
  .blog-stats span{font-size:8.5px;color:#B9B4A8;display:flex;align-items:center;gap:3px;}

  .chat-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
  .chat-head .av{width:24px;height:24px;border-radius:50%;background:#333;flex-shrink:0;}
  .chat-head .info span{display:block;}
  .chat-head .name{font-size:10px;font-weight:800;}
  .chat-head .status{font-size:8px;color:var(--accent-dark);font-weight:600;}
  .bubble{font-size:9.5px;border-radius:11px;padding:8px 10px;margin-bottom:7px;max-width:87%;line-height:1.45;}
  .bubble.mentor{background:#F0EFEA;border-top-left-radius:2px;}
  .bubble.me{background:var(--accent);color:#fff;margin-left:auto;border-top-right-radius:2px;}
  .task-chip{font-size:8.5px;background:#EAF9F4;color:var(--accent-ink);padding:4px 8px;border-radius:8px;display:inline-block;margin-top:6px;font-weight:800;}

  @media (min-width:760px){
    .card{
      width:min(76vw,600px);
      min-height:430px;
      padding:42px;
      justify-content:space-between;
    }
    .card h2{max-width:78%;}
    .card p{max-width:90%;}
    .learn{order:2;margin-bottom:0;}
    .mock{
      position:absolute;
      right:-8px;
      bottom:-14px;
      width:238px;
      max-width:238px;
      margin:0;
      order:3;
    }
    .card:hover .mock{transform:translateY(-4px);}
    .mock-inner{transform:rotate(-2.5deg);}
  }
  @media (max-width:759px){
    h1.headline{font-size:26px;padding:0 40px;}
    .navbtn{width:36px;height:36px;font-size:14px;}
  }
</style>
</head>
<body>

<div class="wrap">
  <h1 class="headline">One platform to launch real careers</h1>

  <div class="carousel">
    <button class="navbtn prev" id="prevBtn" aria-label="Previous">←</button>
    <button class="navbtn next" id="nextBtn" aria-label="Next">→</button>

    <div class="track" id="track">

      <div class="card">
        <div>
          <span class="num">01 — DISCOVER</span>
          <h2>Curated opportunities,<br>shared by EduBridge</h2>
          <p>Our team actively sources and shares freelance gigs, internships, and career opportunities handpicked for verified students — so you get relevant, credible listings instead of scrolling generic job boards.</p>
        </div>
        <a class="learn" href="#">Learn More <span class="arrow">→</span></a>
        <div class="mock">
          <div class="mock-inner">
            <div class="m-title">New for you</div>
            <div class="job-row">
              <div class="job-tag" style="background:#2FBFA0;">Fg</div>
              <div class="job-lines"><div class="l1"></div><div class="l2"></div></div>
              <div class="job-pill">NEW</div>
            </div>
            <div class="job-row">
              <div class="job-tag" style="background:#2B2B2B;">In</div>
              <div class="job-lines"><div class="l1"></div><div class="l2"></div></div>
              <div class="job-pill">PAID</div>
            </div>
            <div class="job-row">
              <div class="job-tag" style="background:#D9A441;">Mk</div>
              <div class="job-lines"><div class="l1"></div><div class="l2"></div></div>
              <div class="job-pill">REMOTE</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div>
          <span class="num">02 — SEARCH</span>
          <h2>Search and discover<br>work that fits you</h2>
          <p>Filter opportunities by skill, interest, field, or experience level to quickly find work that fits your goals — spend less time sifting, more time applying to what's actually relevant.</p>
        </div>
        <a class="learn" href="#">Learn More <span class="arrow">→</span></a>
        <div class="mock">
          <div class="mock-inner">
            <div class="search-bar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A968B" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>UI/UX internship...</span>
            </div>
            <div>
              <span class="filter-chip on">Design</span>
              <span class="filter-chip">Marketing</span>
              <span class="filter-chip">Remote</span>
              <span class="filter-chip on">Paid</span>
            </div>
            <div class="result-count">14 opportunities match</div>
            <div class="job-row" style="margin-top:2px;">
              <div class="job-tag" style="background:#2B2B2B;">Ds</div>
              <div class="job-lines"><div class="l1"></div><div class="l2"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div>
          <span class="num">03 — LEARN</span>
          <h2>Learn from those<br>who've walked the path</h2>
          <p>Verified students write blogs on internships, freelance work, and career decisions — honest, first-hand insight into what different paths actually look like, not generic advice.</p>
        </div>
        <a class="learn" href="#">Learn More <span class="arrow">→</span></a>
        <div class="mock">
          <div class="mock-inner">
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="blog-avatar"></div>
              <div><div class="blog-name">Aditi R.</div><div class="blog-sub">Verified · 3rd year, DU</div></div>
            </div>
            <div class="blog-title">What my first freelance gig taught me</div>
            <div class="blog-line" style="width:95%"></div>
            <div class="blog-line" style="width:80%"></div>
            <div class="blog-line" style="width:60%"></div>
            <span class="blog-tag">Career Blog</span>
            <div class="blog-stats">
              <span>♥ 128</span>
              <span>💬 24</span>
              <span>3 min read</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div>
          <span class="num">04 — GUIDANCE</span>
          <h2>Guided mentorship<br>on real projects</h2>
          <p>Unsure of your direction? Get paired with real assignments and outsourced project work, backed by mentorship — genuine, practical experience while you gain clarity on what fits you.</p>
        </div>
        <a class="learn" href="#">Learn More <span class="arrow">→</span></a>
        <div class="mock">
          <div class="mock-inner">
            <div class="chat-head">
              <div class="av"></div>
              <div class="info"><span class="name">Rhea K. · Mentor</span><span class="status">● Online now</span></div>
            </div>
            <div class="bubble mentor">Let's start with a small landing page task to build your portfolio.</div>
            <div class="bubble me">Sounds good, when do I start?</div>
            <span class="task-chip">✓ Assignment Assigned</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="dot-row" id="dotRow">
    <button class="dot active" data-i="0" aria-label="Go to slide 1"></button>
    <button class="dot" data-i="1" aria-label="Go to slide 2"></button>
    <button class="dot" data-i="2" aria-label="Go to slide 3"></button>
    <button class="dot" data-i="3" aria-label="Go to slide 4"></button>
  </div>
</div>

<script>
  var track = document.getElementById('track');
  var cards = Array.from(track.children);
  var dots = Array.from(document.querySelectorAll('.dot'));
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');

  function setActive(i){
    dots.forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === cards.length - 1;
  }

  var ticking = false;
  track.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        var trackCenter = track.scrollLeft + track.clientWidth / 2;
        var closest = 0, closestDist = Infinity;
        cards.forEach(function (c, idx) {
          var cCenter = c.offsetLeft + c.offsetWidth / 2;
          var dist = Math.abs(cCenter - trackCenter);
          if (dist < closestDist) { closestDist = dist; closest = idx; }
        });
        setActive(closest);
        ticking = false;
      });
      ticking = true;
    }
  });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var i = parseInt(dot.dataset.i);
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
  });

  function currentIndex(){
    return dots.findIndex(function (d) { return d.classList.contains('active'); });
  }
  prevBtn.addEventListener('click', function () {
    var i = Math.max(0, currentIndex() - 1);
    cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  });
  nextBtn.addEventListener('click', function () {
    var i = Math.min(cards.length - 1, currentIndex() + 1);
    cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  });

  setActive(0);

  (function(){
    function post(){ try{ parent.postMessage({ oplHeight: Math.ceil(document.body.getBoundingClientRect().height) + 12 }, '*'); }catch(e){} }
    window.addEventListener('load', post);
    window.addEventListener('resize', post);
    window.addEventListener('orientationchange', post);
    setTimeout(post, 300);
    setTimeout(post, 900);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(post);
      ro.observe(document.body);
      ro.observe(track);
    } else {
      setTimeout(post, 400);
    }
  })();
</script>

</body>
</html>`;

export function InternshipLaunchCarousel() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(560);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.oplHeight === 'number') setHeight(Math.max(280, e.data.oplHeight));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <section aria-label="One platform to launch real careers">
      <iframe
        ref={ref}
        title="One platform to launch real careers"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="mx-auto block w-full max-w-[1400px] border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
