'use client';

import { useEffect, useRef, useState } from 'react';

// "Work on our in-house projects" — isolated iframe widget (same pattern as
// InternshipBrowseByField/InternshipLaunchCarousel/InternshipBlogTeaser).
// Fully static/self-contained by design — its "Join track" modal is a
// standalone visual piece, not wired into the real internship apply/enroll
// flow that already exists elsewhere on the site.
const SRC = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Work on our in-house projects</title>
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
    grid-template-columns:1.1fr 0.9fr;
    gap:24px;
    align-items:stretch;
  }
  .feature-card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:16px;
    padding:36px;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
  }
  .project-list{
    list-style:none;
    margin:0 0 28px;
    padding:0;
    display:flex;
    flex-direction:column;
    gap:18px;
  }
  .project-list li{
    display:flex;
    align-items:flex-start;
    gap:14px;
    font-family:Arial, Helvetica, sans-serif;
  }
  .dot{
    flex:none;
    width:8px;
    height:8px;
    border-radius:50%;
    background:var(--terracotta);
    margin-top:7px;
  }
  .project-list .p-title{
    font-family:Georgia, serif;
    font-weight:700;
    font-size:15.5px;
    color:var(--green-deep);
    margin:0 0 3px;
  }
  .project-list .p-desc{
    font-size:13.5px;
    color:var(--text-body);
    line-height:1.55;
    margin:0;
  }
  .cta-link{
    font-family:Arial, Helvetica, sans-serif;
    font-size:14px;
    font-weight:700;
    color:var(--terracotta);
    text-decoration:none;
  }
  .side-card{
    background:var(--green-deep);
    color:#F3EFE3;
    border-radius:16px;
    overflow:hidden;
    display:flex;
    flex-direction:column;
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
  .flow-strip{
    background:rgba(255,255,255,0.08);
    border:1px solid rgba(255,255,255,0.14);
    color:#F3EFE3;
    border-radius:8px;
    padding:10px 14px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    font-family:Arial, Helvetica, sans-serif;
    font-size:12.5px;
    font-weight:700;
    margin-bottom:20px;
  }
  .flow-strip .tag{
    font-size:10px;
    font-weight:700;
    letter-spacing:0.05em;
    background:var(--terracotta);
    color:#fff;
    padding:3px 8px;
    border-radius:20px;
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
    margin:0 0 20px;
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
  }
  .apply-btn:hover{background:var(--terracotta-dark);}
  .overlay{
    display:none;
    position:fixed;
    inset:0;
    background:rgba(30,30,26,0.45);
    align-items:center;
    justify-content:center;
    z-index:100;
    padding:24px;
  }
  .overlay.open{display:flex;}
  .modal{
    background:var(--cream);
    border-radius:20px;
    max-width:680px;
    width:100%;
    padding:44px 44px 40px;
    position:relative;
    max-height:88vh;
    overflow-y:auto;
  }
  .modal-close{
    position:absolute;
    top:20px;
    right:20px;
    width:32px;
    height:32px;
    border-radius:50%;
    background:var(--card);
    border:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-family:Arial, Helvetica, sans-serif;
    color:var(--green-deep);
  }
  .step-dots{
    display:flex;
    gap:8px;
    margin-bottom:18px;
  }
  .step-dots span{
    width:22px;
    height:4px;
    border-radius:4px;
    background:var(--border);
  }
  .step-dots span.active{background:var(--green-deep);}
  .step-label{
    font-family:Arial, Helvetica, sans-serif;
    font-size:11px;
    font-weight:700;
    letter-spacing:0.1em;
    color:var(--terracotta-dark);
    margin-bottom:10px;
  }
  .modal h3{
    font-size:27px;
    line-height:1.3;
    text-align:center;
    margin:0 0 14px;
  }
  .modal .modal-sub{
    font-family:Arial, Helvetica, sans-serif;
    font-size:14.5px;
    line-height:1.7;
    color:var(--text-body);
    text-align:center;
    max-width:480px;
    margin:0 auto 28px;
  }
  .track-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
    margin-bottom:28px;
  }
  .track-opt{
    font-family:Arial, Helvetica, sans-serif;
    font-size:14.5px;
    font-weight:700;
    color:var(--green-deep);
    background:var(--card);
    border:1px solid var(--border);
    border-radius:10px;
    padding:18px 16px;
    text-align:center;
    cursor:pointer;
  }
  .track-opt.selected{
    background:var(--green-soft);
    border-color:var(--green-mid);
  }
  .modal-actions{
    display:flex;
    justify-content:flex-end;
  }
  .modal-actions .btn-cta{
    flex:none;
    font-family:Arial, Helvetica, sans-serif;
    font-size:14px;
    font-weight:700;
    background:var(--terracotta);
    color:#fff;
    border:none;
    padding:13px 26px;
    border-radius:8px;
    cursor:pointer;
  }
  .modal-actions .btn-cta:hover{background:var(--terracotta-dark);}
  .back-link{
    font-family:Arial, Helvetica, sans-serif;
    font-size:13.5px;
    color:var(--green-mid);
    cursor:pointer;
    display:inline-block;
    margin-bottom:18px;
    border:none;
    background:none;
    padding:0;
  }
  .plan-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:16px;
  }
  .plan-card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:24px 22px;
    display:flex;
    flex-direction:column;
    position:relative;
  }
  .plan-card.recommended{
    border:2px solid var(--terracotta);
  }
  .plan-recommended-badge{
    position:absolute;
    top:-13px;
    left:22px;
    background:var(--terracotta);
    color:#fff;
    font-family:Arial, Helvetica, sans-serif;
    font-size:10.5px;
    font-weight:700;
    letter-spacing:0.06em;
    padding:5px 11px;
    border-radius:20px;
  }
  .plan-kicker{
    font-family:Arial, Helvetica, sans-serif;
    font-size:10.5px;
    font-weight:700;
    letter-spacing:0.08em;
    color:var(--text-body);
    margin-bottom:8px;
  }
  .plan-card h4{
    font-size:19px;
    margin:0 0 10px;
    font-family:Georgia, serif;
  }
  .plan-price{
    font-family:Georgia, serif;
    font-size:24px;
    font-weight:700;
    color:var(--green-deep);
    margin-bottom:16px;
  }
  .plan-features{
    list-style:none;
    margin:0 0 20px;
    padding:0;
    display:flex;
    flex-direction:column;
    gap:10px;
    flex:1;
  }
  .plan-features li{
    display:flex;
    align-items:flex-start;
    gap:8px;
    font-family:Arial, Helvetica, sans-serif;
    font-size:13px;
    line-height:1.5;
    color:var(--text-body);
  }
  .plan-features li.no{
    color:#B7ACA0;
  }
  .plan-features .yes{color:var(--green-mid);flex:none;}
  .plan-features .cross{color:#C7BCB0;flex:none;}
  .plan-btn{
    font-family:Arial, Helvetica, sans-serif;
    font-size:13.5px;
    font-weight:700;
    padding:12px;
    border-radius:8px;
    text-align:center;
    cursor:pointer;
  }
  .plan-btn.free{
    background:transparent;
    border:1px solid var(--green-deep);
    color:var(--green-deep);
  }
  .plan-btn.paid{
    background:var(--terracotta);
    border:1px solid var(--terracotta);
    color:#fff;
  }
  @media (max-width:820px){
    .header-row{flex-direction:column;align-items:flex-start;}
    .grid{grid-template-columns:1fr;}
    .side-card{order:1;}
    .feature-card{order:2;}
    h2{font-size:30px;}
    .track-grid,.plan-grid{grid-template-columns:1fr;}
    .modal{padding:32px 24px 28px;}
  }
</style>
</head>
<body>

<div class="wrap">
  <div class="header-row">
    <div>
      <span class="eyebrow">In-house projects</span>
      <h2>Skip the search. Build with our team instead.</h2>
    </div>
    <p class="subcopy">
      No applications to send, no companies to research. Pick a project we're
      already running, join the team, and start shipping — with mentors
      checking your work every step of the way.
    </p>
  </div>

  <div class="grid">
    <div class="feature-card">
      <ul class="project-list">
        <li>
          <span class="dot"></span>
          <div>
            <p class="p-title">Platform engineering</p>
            <p class="p-desc">Help build new features for the opportunities platform itself — real code, real users, real code review.</p>
          </div>
        </li>
        <li>
          <span class="dot"></span>
          <div>
            <p class="p-title">Content and research</p>
            <p class="p-desc">Investigate and write up emerging career paths, verify listings, and shape what students see first.</p>
          </div>
        </li>
        <li>
          <span class="dot"></span>
          <div>
            <p class="p-title">Growth and design</p>
            <p class="p-desc">Run campaigns, design landing pages, and test what actually gets students to apply.</p>
          </div>
        </li>
      </ul>
      <a class="cta-link" href="#">&gt; See open in-house roles</a>
    </div>

    <div class="side-card">
      <div class="side-card-top">
        <span class="badge-online">ONLINE</span>
        <h3>Web dev track 2026</h3>
        <div class="track-title-row">
          <h4>Web Development Career Track</h4>
          <span class="badge-new">New</span>
        </div>
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
        <div class="flow-strip">
          <span>Task &rarr; Resource &rarr; Assignment</span>
          <span class="tag">GUIDED</span>
        </div>
      </div>
      <div class="side-card-bottom">
        <div class="price-row">
          <span class="price">&#8377;2,999</span>
          <span class="strike">&#8377;6,999</span>
        </div>
        <p class="price-sub">One-time · covers the full 4-month track</p>
        <div class="btn-row">
          <div class="btn">Explore</div>
          <button type="button" class="apply-btn" onclick="openModal()">Join track</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="overlay" id="overlay">
  <div class="modal">
    <button type="button" class="modal-close" aria-label="Close" onclick="closeModal()">&#10005;</button>

    <div id="step1">
      <div class="step-dots"><span class="active"></span><span></span></div>
      <div class="step-label">STEP 1 OF 2</div>
      <h3>Which track do you want to build in?</h3>
      <p class="modal-sub">Every track follows the same model — learn, build, collaborate, launch — on our own live products.</p>
      <div class="track-grid" id="trackGrid">
        <button type="button" class="track-opt" data-track="Frontend Development">Frontend development</button>
        <button type="button" class="track-opt" data-track="Backend Development">Backend development</button>
        <button type="button" class="track-opt selected" data-track="Full-Stack Development">Full-stack development</button>
        <button type="button" class="track-opt" data-track="UI/UX Design">UI/UX design</button>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-cta" onclick="goToStep2()">Continue &rarr;</button>
      </div>
    </div>

    <div id="step2" style="display:none;">
      <button type="button" class="back-link" onclick="goToStep1()">&larr; Back to track</button>
      <h3>How do you want to join?</h3>
      <p class="modal-sub">Same tasks, same curated resources, same live project — pick whether you want mentor-backed review and a verified certificate.</p>
      <div class="plan-grid">
        <div class="plan-card">
          <div class="plan-kicker">NON-CERTIFICATION</div>
          <h4>Learn &amp; build</h4>
          <div class="plan-price">Free</div>
          <ul class="plan-features">
            <li><span class="yes">&#10003;</span>Full task &rarr; resource &rarr; assignment schedule</li>
            <li><span class="yes">&#10003;</span>Curated docs, guides and videos</li>
            <li><span class="yes">&#10003;</span>Git, GitHub and team workflow practice</li>
            <li><span class="yes">&#10003;</span>Contribute to a real product</li>
            <li class="no"><span class="cross">&#10005;</span>No dedicated mentor or code reviews</li>
            <li class="no"><span class="cross">&#10005;</span>No certificate or letter of recommendation</li>
          </ul>
          <div class="plan-btn free">Join free</div>
        </div>
        <div class="plan-card recommended">
          <div class="plan-recommended-badge">RECOMMENDED</div>
          <div class="plan-kicker">CERTIFICATION · VIRTUAL INTERNSHIP</div>
          <h4>Learn, build &amp; get certified</h4>
          <div class="plan-price">&#8377;2,999</div>
          <ul class="plan-features">
            <li><span class="yes">&#10003;</span>Everything in non-certification</li>
            <li><span class="yes">&#10003;</span>Dedicated mentor and weekly reviews</li>
            <li><span class="yes">&#10003;</span>Code reviews and live sessions</li>
            <li><span class="yes">&#10003;</span>Real feature development and evaluation</li>
            <li><span class="yes">&#10003;</span>Internship completion certificate</li>
            <li><span class="yes">&#10003;</span>Letter of recommendation for top performers</li>
          </ul>
          <div class="plan-btn paid">Join with certificate</div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  function openModal(){document.getElementById('overlay').classList.add('open');}
  function closeModal(){document.getElementById('overlay').classList.remove('open');}
  function goToStep2(){
    document.getElementById('step1').style.display='none';
    document.getElementById('step2').style.display='block';
  }
  function goToStep1(){
    document.getElementById('step2').style.display='none';
    document.getElementById('step1').style.display='block';
  }
  document.querySelectorAll('.track-opt').forEach(function(el){
    el.addEventListener('click', function(){
      document.querySelectorAll('.track-opt').forEach(function(o){o.classList.remove('selected');});
      el.classList.add('selected');
    });
  });
  document.getElementById('overlay').addEventListener('click', function(e){
    if(e.target === this) closeModal();
  });

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
    <section id="career-programs" aria-label="Work on our in-house projects">
      <iframe
        ref={ref}
        title="Work on our in-house projects"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="block w-full border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
