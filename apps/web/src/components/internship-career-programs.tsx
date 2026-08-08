'use client';

import { useEffect, useRef, useState } from 'react';

// "Choose your track" — isolated iframe widget (same pattern as
// InternshipBrowseByField/InternshipLaunchCarousel/InternshipBlogTeaser).
// Static/self-contained by design — the two prices below are a point-in-time
// mirror of the real, GST-inclusive pricing served by
// GET /virtual-internship/pricing; every button here links out (target=_top,
// since this renders inside an iframe) to the real /virtual-internship page
// and its enroll flow rather than duplicating that logic here.
const SRC = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Choose your Virtual Internship track</title>
<style>
  :root{
    --cream:#F3EFE3;
    --card:#FFFFFF;
    --green-deep:#1E3A2E;
    --green-mid:#2E5240;
    --green-soft:#E7EEE7;
    --text-body:#5B5C54;
    --terracotta:#C97A4A;
    --terracotta-dark:#A85F35;
    --border:#E4DFD0;
  }
  *{box-sizing:border-box;}
  button{ font:inherit; margin:0; }
  button:focus-visible, a:focus-visible{ outline:2px solid var(--terracotta); outline-offset:2px; }
  html,body{background:transparent;}
  body{
    margin:0;
    font-family:Georgia, 'Times New Roman', serif;
    color:var(--green-deep);
  }
  .wrap{max-width:1100px;margin:0 auto;padding:0.5rem 0 2rem;}
  .eyebrow{
    display:inline-block;
    font-family:Arial, Helvetica, sans-serif;
    font-size:12px;
    font-weight:700;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:var(--green-mid);
    background:#E7EEE7;
    padding:5px 12px;
    border-radius:20px;
    margin-bottom:22px;
  }
  .header-row{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap:40px;
    margin-bottom:56px;
  }
  h2{
    font-size:38px;
    line-height:1.2;
    font-weight:700;
    margin:0 0 16px;
    max-width:520px;
  }
  .subcopy{
    font-family:Arial, Helvetica, sans-serif;
    font-size:15px;
    line-height:1.7;
    color:var(--text-body);
    max-width:340px;
    margin:0;
  }
  .grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:24px;
    align-items:stretch;
  }
  .side-card{
    background:var(--green-deep);
    color:#F3EFE3;
    border-radius:16px;
    overflow:hidden;
    display:flex;
    flex-direction:column;
  }
  .side-card.alt{
    background:var(--green-mid);
  }
  .track-tagline{
    font-family:Arial, Helvetica, sans-serif;
    font-size:13px;
    line-height:1.6;
    color:#CBD8CE;
    margin:0 0 16px;
  }
  .feature-list{
    list-style:none;
    margin:0 0 4px;
    padding:0;
    display:flex;
    flex-direction:column;
    gap:9px;
  }
  .feature-list li{
    display:flex;
    align-items:flex-start;
    gap:8px;
    font-family:Arial, Helvetica, sans-serif;
    font-size:13px;
    color:#E8EDE9;
  }
  .feature-list .check{
    color:#fff;
    flex:none;
  }
  .side-card-top{
    padding:32px 32px 0;
  }
  .badge-online{
    display:inline-block;
    font-family:Arial, Helvetica, sans-serif;
    font-size:11px;
    font-weight:700;
    letter-spacing:0.08em;
    color:var(--green-deep);
    background:#F3EFE3;
    padding:6px 12px;
    border-radius:6px;
    margin-bottom:16px;
  }
  .side-card h3{
    font-size:21px;
    line-height:1.35;
    margin:0 0 16px;
    color:#F3EFE3;
    font-family:Georgia, serif;
  }
  .track-title-row{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:10px;
    margin-bottom:14px;
  }
  .track-title-row h4{
    font-size:16.5px;
    line-height:1.35;
    margin:0;
    color:#F3EFE3;
    font-family:Georgia, serif;
    max-width:220px;
  }
  .badge-new{
    flex:none;
    font-family:Arial, Helvetica, sans-serif;
    font-size:10.5px;
    font-weight:700;
    color:var(--terracotta-dark);
    background:#F6E3D1;
    padding:5px 10px;
    border-radius:20px;
  }
  .meta-row{
    display:flex;
    flex-direction:column;
    gap:8px;
    margin-bottom:18px;
  }
  .meta-item{
    display:flex;
    align-items:center;
    gap:8px;
    font-family:Arial, Helvetica, sans-serif;
    font-size:13px;
    color:#CBD8CE;
  }
  .meta-item .ico{
    width:16px;
    height:16px;
    flex:none;
  }
  .side-card-bottom{
    margin-top:auto;
    padding:0 32px 32px;
  }
  .price-row{
    display:flex;
    align-items:baseline;
    gap:9px;
    margin-bottom:2px;
  }
  .price-row .price{
    font-family:Georgia, serif;
    font-size:26px;
    font-weight:700;
    color:#F3EFE3;
  }
  .price-row .strike{
    font-size:14px;
    color:#8FA391;
    text-decoration:line-through;
  }
  .price-sub{
    font-family:Arial, Helvetica, sans-serif;
    font-size:12px;
    color:#A9BBAC;
    margin:0 0 14px;
  }
  .gst-pill{
    display:inline-block;
    font-family:Arial, Helvetica, sans-serif;
    font-size:11.5px;
    font-weight:700;
    color:var(--green-deep);
    background:#F3EFE3;
    padding:5px 12px;
    border-radius:20px;
    margin-bottom:20px;
  }
  .btn-row{
    display:flex;
    gap:10px;
  }
  .btn{
    flex:1;
    font-family:Arial, Helvetica, sans-serif;
    font-size:13.5px;
    font-weight:700;
    padding:12px 16px;
    border-radius:8px;
    text-align:center;
    cursor:pointer;
    border:1px solid rgba(255,255,255,0.35);
    background:transparent;
    color:#F3EFE3;
    text-decoration:none;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }
  .btn:hover{background:rgba(255,255,255,0.08);}
  .apply-btn{
    flex:1;
    font-family:Arial, Helvetica, sans-serif;
    font-size:13.5px;
    font-weight:700;
    background:var(--terracotta);
    color:#FFFFFF;
    border:none;
    padding:12px 16px;
    border-radius:8px;
    cursor:pointer;
    text-align:center;
    text-decoration:none;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }
  .apply-btn:hover{background:var(--terracotta-dark);}
  @media (max-width:820px){
    .header-row{flex-direction:column;align-items:flex-start;}
    .grid{grid-template-columns:1fr;}
    h2{font-size:30px;}
  }
</style>
</head>
<body>

<div class="wrap">
  <div class="header-row">
    <div>
      <span class="eyebrow">Virtual Internship</span>
      <h2>Choose your track</h2>
    </div>
    <p class="subcopy">
      Skip the idea-hunting. Get matched to a real, running project, ship it
      with mentor review, and walk away with a certificate and a signed
      letter of recommendation.
    </p>
  </div>

  <div class="grid">
    <div class="side-card">
      <div class="side-card-top">
        <span class="badge-online">ONLINE</span>
        <h3>4-Month Track</h3>
        <div class="track-title-row">
          <h4>Web Development + DevOps</h4>
          <span class="badge-new">New</span>
        </div>
        <p class="track-tagline">3 minor projects and 1 major project, every month, with 1:1 mentorship throughout.</p>
        <div class="meta-row">
          <div class="meta-item">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Verified students only
          </div>
          <div class="meta-item">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            4-month guided track
          </div>
        </div>
        <ul class="feature-list">
          <li><span class="check">&#10003;</span>Letter of recommendation</li>
          <li><span class="check">&#10003;</span>Job referral, if a suitable match is found</li>
        </ul>
      </div>
      <div class="side-card-bottom">
        <div class="price-row">
          <span class="price">&#8377;9,310</span>
          <span class="strike">&#8377;12,999</span>
        </div>
        <p class="price-sub">Save &#8377;3,689 · one-time, GST included</p>
        <span class="gst-pill">&#10003; Includes 18% GST</span>
        <div class="btn-row">
          <a class="btn" href="/virtual-internship" target="_top">Explore</a>
          <a class="apply-btn" href="/virtual-internship/enroll?track=FOUR_MONTH" target="_top">Join track</a>
        </div>
      </div>
    </div>

    <div class="side-card alt">
      <div class="side-card-top">
        <span class="badge-online">ONLINE</span>
        <h3>4-Week Track</h3>
        <div class="track-title-row">
          <h4>Web Development</h4>
          <span class="badge-new">Fast track</span>
        </div>
        <p class="track-tagline">The fast-track version — same outcome, same certificate, a quarter of the time.</p>
        <div class="meta-row">
          <div class="meta-item">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Verified students only
          </div>
          <div class="meta-item">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            4-week guided track
          </div>
        </div>
        <ul class="feature-list">
          <li><span class="check">&#10003;</span>Letter of recommendation</li>
          <li><span class="check">&#10003;</span>Virtual internship certificate</li>
        </ul>
      </div>
      <div class="side-card-bottom">
        <div class="price-row">
          <span class="price">&#8377;3,292</span>
          <span class="strike">&#8377;4,999</span>
        </div>
        <p class="price-sub">Save &#8377;1,707 · one-time, GST included</p>
        <span class="gst-pill">&#10003; Includes 18% GST</span>
        <div class="btn-row">
          <a class="btn" href="/virtual-internship" target="_top">Explore</a>
          <a class="apply-btn" href="/virtual-internship/enroll?track=FOUR_WEEK" target="_top">Join track</a>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  (function(){
    function post(){ try{ parent.postMessage({ careerProgramsHeight: Math.ceil(document.body.getBoundingClientRect().height) + 12 }, '*'); }catch(e){} }
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

export function InternshipCareerPrograms() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(640);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.careerProgramsHeight === 'number') setHeight(Math.max(320, e.data.careerProgramsHeight));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <section id="career-programs" aria-label="Choose your Virtual Internship track">
      <iframe
        ref={ref}
        title="Choose your Virtual Internship track"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="block w-full border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
