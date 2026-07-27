'use client';

// Animated "search → shortlist → apply" walkthrough for the internship hero.
// Self-contained HTML/CSS/JS in an isolated iframe (same reasoning as
// HomeCareerBridge/HomeAdmissionDesk): its own fonts/animations can't
// collide with the app. Unlike those components, this mockup sizes itself
// entirely from vw/vh of its own iframe viewport down to a fixed 16:9
// mockup, so a simple aspect-ratio wrapper is enough — no postMessage
// height reporting needed.
const SRC = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EduBridge — Find Your Perfect Opportunity</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:      #12213B;
    --parchment:#F7F3EC;
    --panel:    #FFFFFF;
    --amber:    #E8A23D;
    --amber-deep:#C97F1F;
    --teal:     #2F7A72;
    --teal-soft:#E4F0EC;
    --line:     rgba(18,33,59,0.14);
    --muted:    #5C6478;
    --display: 'Fraunces', serif;
    --body:    'Inter', -apple-system, sans-serif;
    --mono:    'JetBrains Mono', monospace;
  }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ height:100%; }
  body{
    background:#EFEAE0;
    font-family:var(--body);
    display:flex; align-items:center; justify-content:center;
    min-height:100vh; padding:16px; overflow-x:hidden;
  }

  .frame{
    /* same mockup at every size — width formula subtracts the body's own
       padding so the frame can never exceed the visible area and get clipped */
    width:min(calc(100vw - 32px), calc(90vh * 16 / 9));
    aspect-ratio:1280/720;
    position:relative; overflow:hidden;
    border-radius:14px;
    box-shadow:0 16px 32px -18px rgba(18,33,59,0.32);
    background:var(--parchment);
  }
  /* tablets */
  @media (min-width:641px){
    body{ padding:24px; }
    .frame{
      width:min(calc(100vw - 48px), 860px, calc(85vh * 16 / 9));
      border-radius:20px;
      box-shadow:0 26px 52px -22px rgba(18,33,59,0.34);
    }
  }
  /* laptops and up */
  @media (min-width:1024px){
    body{ padding:32px; }
    .frame{
      width:min(calc(100vw - 64px), 1080px, calc(82vh * 16 / 9));
      border-radius:22px;
      box-shadow:0 30px 60px -24px rgba(18,33,59,0.35);
    }
  }
  .stage{
    position:absolute; top:0; left:0;
    width:1280px; height:720px;
    transform:scale(var(--frame-scale, 1));
    transform-origin:top left;
  }
  .stage::before{
    content:"";
    position:absolute; inset:0;
    background-image: radial-gradient(rgba(18,33,59,0.06) 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse 65% 60% at 45% 35%, black, transparent 75%);
  }

  /* ---------- scene management ---------- */
  .scene{
    position:absolute; inset:0;
    opacity:0; pointer-events:none;
    transition:opacity .4s ease;
  }
  .scene.active{ opacity:1; pointer-events:auto; }

  /* ================= SCENE 1: FILTERS ================= */
  .card{
    position:absolute;
    background:var(--panel);
    border:1px solid var(--line);
    border-radius:20px;
    padding:26px 30px;
    box-shadow:0 24px 48px -24px rgba(18,33,59,0.22);
    opacity:0;
    transform:translateY(16px);
    transition:opacity .5s ease, transform .5s ease;
  }
  .card.show{ opacity:1; transform:translateY(0); }

  .label{
    font-family:var(--mono); font-size:12px; font-weight:500; letter-spacing:.08em;
    text-transform:uppercase; color:var(--teal); margin-bottom:14px;
  }

  .c-search{ top:60px; left:100px; width:460px; }
  .search-box{
    display:flex; align-items:center; gap:10px;
    background:var(--parchment); border:1px solid var(--line); border-radius:14px;
    padding:16px 18px;
  }
  .search-box .txt{
    flex:1; font-family:var(--body); font-weight:600; font-size:16px; color:var(--ink);
    white-space:nowrap; overflow:hidden;
  }
  .search-box .txt.typing{ border-right:2px solid var(--ink); animation:caret 0.9s steps(1) infinite; }
  @keyframes caret{ 50%{ border-color:transparent; } }
  .search-box svg{ flex:0 0 auto; color:var(--teal); }

  .c-opps{ top:230px; left:430px; width:480px; }
  .pill-row{ display:flex; gap:12px; flex-wrap:wrap; }
  .pill{
    font-family:var(--body); font-weight:600; font-size:14.5px;
    padding:12px 22px; border-radius:100px;
    background:var(--parchment); border:1.5px solid var(--line); color:var(--muted);
    transition:background .3s ease, color .3s ease, border-color .3s ease, transform .2s ease;
  }
  .pill.active{ background:var(--teal); border-color:var(--teal); color:#fff; transform:scale(1.03); }

  .c-comp{ top:410px; left:150px; width:440px; }

  .start-wrap{
    position:absolute; top:452px; left:630px;
    opacity:0; transform:translateY(10px);
    transition:opacity .5s ease, transform .5s ease;
  }
  .start-wrap.show{ opacity:1; transform:translateY(0); }
  .start-btn{
    display:inline-flex; align-items:center; justify-content:center;
    font-family:var(--body); font-weight:700; font-size:17px; color:#1E3A2F;
    background:#9DC7AE;
    padding:18px 34px; border-radius:14px;
    box-shadow:0 8px 18px -8px rgba(18,33,59,0.25);
  }
  .start-btn.pulse{ animation:pulse .5s ease; }
  @keyframes pulse{
    0%{ box-shadow:0 0 0 0 rgba(157,199,174,0.7), 0 8px 18px -8px rgba(18,33,59,0.25); }
    70%{ box-shadow:0 0 0 14px rgba(157,199,174,0), 0 8px 18px -8px rgba(18,33,59,0.25); }
    100%{ box-shadow:0 0 0 0 rgba(157,199,174,0), 0 8px 18px -8px rgba(18,33,59,0.25); }
  }

  .cable{ position:absolute; inset:0; z-index:0; pointer-events:none; }

  /* ================= SCENE 2: SEARCH RESULTS ================= */
  .panel{
    position:absolute; top:56px; left:150px; width:980px;
  }
  .panel-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
  .panel h1{ font-family:var(--display); font-weight:600; font-size:30px; color:var(--ink); }
  .yourlist-chip{
    display:inline-flex; align-items:center; gap:8px;
    font-family:var(--body); font-weight:700; font-size:14px; color:var(--ink);
    background:var(--panel); border:1px solid var(--line); border-radius:100px;
    padding:10px 18px;
  }
  .yourlist-chip svg{ width:15px; height:15px; }

  .rcard{
    display:flex; align-items:center; gap:20px;
    background:var(--panel); border:1px solid var(--line); border-radius:18px;
    padding:20px 22px; margin-bottom:16px;
    box-shadow:0 16px 32px -22px rgba(18,33,59,0.18);
    opacity:0; transform:translateY(10px);
    transition:opacity .45s ease, transform .45s ease;
  }
  .rcard.show{ opacity:1; transform:translateY(0); }
  .rcard-top{ display:flex; align-items:center; gap:20px; flex:1; min-width:0; }
  .rcard-actions{ display:flex; align-items:center; gap:10px; flex:0 0 auto; }
  .dial{ position:relative; width:64px; height:64px; flex:0 0 auto; }
  .dial svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .dial .trk{ fill:none; stroke:#EDEBE4; stroke-width:6; }
  .dial .fil{ fill:none; stroke:var(--teal); stroke-width:6; stroke-linecap:round; }
  .dial .num{
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    font-family:var(--mono); font-size:14px; font-weight:600; color:var(--ink);
  }
  .rmain{ flex:1; min-width:0; }
  .rmain h3{ font-family:var(--display); font-weight:600; font-size:19px; color:var(--ink); margin-bottom:2px; }
  .rmain .co{ font-family:var(--body); font-size:14px; color:var(--muted); margin-bottom:10px; }
  .rtags{ display:flex; gap:8px; }
  .rtags span{ font-family:var(--body); font-weight:700; font-size:12px; padding:5px 13px; border-radius:100px; }
  .rtags .paid{ background:rgba(47,122,114,0.12); color:var(--teal); }
  .rtags .real{ background:rgba(232,162,61,0.16); color:var(--amber-deep); }
  .rtags .freelance{ background:#EFEAF7; color:#6a4fa0; }

  .shortlist-btn{
    flex:0 0 auto;
    font-family:var(--body); font-weight:700; font-size:14px;
    padding:12px 20px; border-radius:100px;
    background:var(--ink); color:#fff;
    display:inline-flex; align-items:center; gap:6px;
    transition:background .3s ease, color .3s ease;
  }
  .shortlist-btn.done{ background:var(--teal); }
  .shortlist-btn svg{ width:13px; height:13px; }

  .viewdetail-btn{
    flex:0 0 auto;
    font-family:var(--body); font-weight:700; font-size:14px;
    padding:12px 18px; border-radius:100px;
    background:var(--parchment); color:var(--ink); border:1px solid var(--line);
    display:inline-flex; align-items:center; gap:6px;
  }
  .viewdetail-btn svg{ width:11px; height:11px; }

  /* ================= SCENE: INTERNSHIP DETAILS (matches reference exactly) ================= */
  .det-header{
    position:absolute; top:56px; left:150px;
    display:flex; align-items:center; gap:16px;
  }
  .det-back{
    width:42px; height:42px; border-radius:12px;
    background:var(--panel); border:1px solid var(--line);
    display:flex; align-items:center; justify-content:center; flex:0 0 auto;
  }
  .det-back svg{ width:18px; height:18px; }
  .det-header .co{ font-family:var(--body); font-size:13px; color:var(--muted); margin-bottom:2px; }
  .det-header h1{ font-family:var(--display); font-weight:600; font-size:24px; color:var(--ink); }

  .det-body{ position:absolute; top:130px; left:150px; width:700px; }
  .det-card{
    background:var(--panel); border:1px solid var(--line); border-radius:16px;
    padding:20px 22px; margin-bottom:14px;
    box-shadow:0 14px 28px -20px rgba(18,33,59,0.16);
  }
  .det-hero{ display:flex; align-items:center; gap:16px; }
  .det-hero .mark{
    width:56px; height:56px; border-radius:50%; background:var(--teal);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--display); font-weight:600; color:#fff; font-size:22px; flex:0 0 auto;
  }
  .det-hero h3{ font-family:var(--display); font-weight:600; font-size:20px; color:var(--ink); margin-bottom:3px; }
  .det-hero .meta{ font-family:var(--body); font-size:13.5px; color:var(--muted); margin-bottom:5px; }
  .det-hero .fit{ font-family:var(--body); font-weight:700; font-size:14px; color:var(--teal); }

  .det-card h4{ font-family:var(--display); font-weight:600; font-size:16px; color:var(--ink); margin-bottom:8px; }
  .det-card p{ font-family:var(--body); font-size:14.5px; color:var(--muted); line-height:1.55; }

  .det-apply{
    display:flex; align-items:center; justify-content:center;
    font-family:var(--body); font-weight:700; font-size:17px; color:#3A2600;
    background:var(--amber); padding:18px 0; border-radius:14px;
  }

  /* ---- white loading transition between scenes ---- */
  #scene-loading{ background:#FDFCFA; display:flex; align-items:center; justify-content:center; }
  .load-dots{ display:flex; gap:10px; }
  .load-dots span{
    width:12px; height:12px; border-radius:50%; background:var(--teal);
    animation:loadbounce 1s ease-in-out infinite;
  }
  .load-dots span:nth-child(2){ animation-delay:.15s; }
  .load-dots span:nth-child(3){ animation-delay:.3s; }
  @keyframes loadbounce{
    0%,100%{ transform:translateY(0); opacity:.5; }
    50%{ transform:translateY(-10px); opacity:1; }
  }

  /* ================= SCENE 4 HEADING: "Your Shortlist" ================= */
  .yl-head{
    position:absolute; top:60px; left:150px;
    display:flex; align-items:center; gap:12px;
    opacity:0; transform:translateY(8px);
    transition:opacity .5s ease, transform .5s ease;
  }
  .yl-head.show{ opacity:1; transform:translateY(0); }
  .yl-head h1{ font-family:var(--display); font-weight:600; font-size:28px; color:var(--ink); }
  .yl-head svg{ width:22px; height:22px; fill:var(--teal); stroke:var(--teal); }

  /* ================= SCENE 4: YOUR SHORTLIST DASHBOARD ================= */
  .yld-list{ position:absolute; top:150px; left:150px; width:640px; }

  .sl-card{
    background:var(--panel); border:1px solid var(--line); border-radius:16px;
    padding:20px 22px; margin-bottom:16px;
    box-shadow:0 16px 32px -22px rgba(18,33,59,0.18);
    opacity:0; transform:translateY(10px);
    transition:opacity .45s ease, transform .45s ease;
  }
  .sl-card.show{ opacity:1; transform:translateY(0); }

  .sl-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:14px; }
  .sl-top h3{ font-family:var(--display); font-weight:600; font-size:18px; color:var(--ink); margin-bottom:3px; }
  .sl-top .co{ font-family:var(--body); font-size:13.5px; color:var(--muted); }

  .sl-dial{ position:relative; width:48px; height:48px; flex:0 0 auto; }
  .sl-dial svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .sl-dial .trk{ fill:none; stroke:#EDEBE4; stroke-width:5; }
  .sl-dial .fil{ fill:none; stroke:var(--teal); stroke-width:5; stroke-linecap:round; }

  .sl-insight{
    display:block;
    font-family:var(--mono); font-size:12.5px; color:var(--teal);
    background:var(--teal-soft);
    border-radius:10px; padding:12px 14px; margin:14px 0;
  }

  .sl-actions{ display:flex; gap:10px; }
  .sl-btn{
    font-family:var(--body); font-weight:700; font-size:14px;
    padding:11px 18px; border-radius:100px;
    display:inline-flex; align-items:center; gap:7px;
    transition:background .3s ease, color .3s ease;
  }
  .sl-btn svg{ width:12px; height:12px; }
  .sl-btn.applied{ background:var(--teal); color:#fff; }
  .sl-btn.apply-now{ background:var(--amber); color:#3A2600; }
  .sl-btn.remove{ background:var(--parchment); color:var(--ink); border:1px solid var(--line); }

  /* ---------- shared: fake cursor ---------- */
  .cursor{
    position:absolute; width:20px; height:20px; left:0; top:0;
    border-radius:50% 50% 50% 4px;
    background:rgba(18,33,59,0.9);
    border:2px solid #fff;
    box-shadow:0 4px 12px rgba(0,0,0,0.35);
    z-index:50; opacity:0; pointer-events:none;
    transition:left .55s cubic-bezier(.4,0,.2,1), top .55s cubic-bezier(.4,0,.2,1), opacity .25s ease;
  }
  .cursor.tap{ animation:tap .35s ease; }
  @keyframes tap{
    0%{ box-shadow:0 4px 12px rgba(0,0,0,0.35); }
    50%{ box-shadow:0 0 0 10px rgba(47,122,114,0.35), 0 4px 12px rgba(0,0,0,0.35); }
    100%{ box-shadow:0 4px 12px rgba(0,0,0,0.35); }
  }
</style>
</head>
<body>

<div class="frame" id="frame">
<div class="stage">

  <!-- ============ SCENE 1: FILTERS ============ -->
  <div class="scene active" id="scene-filters">
    <svg class="cable" viewBox="0 0 1280 720">
      <path d="M 60 40 C 400 -10, 900 -10, 1220 40" fill="none" stroke="var(--amber-deep)" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round" opacity="0.5"/>
    </svg>

    <div class="card c-search" id="cardSearch">
      <div class="label">Find your fit</div>
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
        <span class="txt" id="searchTxt"></span>
      </div>
    </div>

    <div class="card c-opps" id="cardOpps">
      <div class="label">Choose the opportunities you're interested in</div>
      <div class="pill-row">
        <span class="pill" id="pillIntern">Internship</span>
        <span class="pill" id="pillBlog">Blogging</span>
        <span class="pill" id="pillOthers">Others</span>
      </div>
    </div>

    <div class="card c-comp" id="cardComp">
      <div class="label">What is your compensation preference?</div>
      <div class="pill-row">
        <span class="pill" id="pillPaid">Paid Only</span>
        <span class="pill" id="pillUnpaid">Unpaid Only</span>
        <span class="pill" id="pillBoth">Both</span>
      </div>
    </div>

    <div class="start-wrap" id="startWrap">
      <div class="start-btn" id="startBtn">Start Searching</div>
    </div>
  </div>

  <!-- ============ LOADING TRANSITION ============ -->
  <div class="scene" id="scene-loading">
    <div class="load-dots"><span></span><span></span><span></span></div>
  </div>

  <!-- ============ SCENE 2: SEARCH RESULTS ============ -->
  <div class="scene" id="scene-results">
    <div class="panel">
      <div class="panel-head">
        <h1>Search Results</h1>
      </div>

      <div class="rcard" id="rcard1">
        <div class="rcard-top">
          <div class="dial"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="14.6"/></svg><span class="num">92%</span></div>
          <div class="rmain">
            <h3>Frontend Engineering Intern</h3>
            <div class="co">Loom Analytics</div>
            <div class="rtags"><span class="paid">Paid</span><span class="real">Real project</span></div>
          </div>
        </div>
        <div class="rcard-actions">
          <div class="shortlist-btn" id="btn1">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span id="btn1txt">Shortlist</span>
          </div>
          <div class="viewdetail-btn" id="viewDetailBtn1">
            View Detail
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <div class="rcard" id="cardMicrosoft">
        <div class="rcard-top">
          <div class="dial"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="21.9"/></svg><span class="num">88%</span></div>
          <div class="rmain">
            <h3>Full Stack Developer Intern</h3>
            <div class="co">Microsoft</div>
            <div class="rtags"><span class="paid">Paid</span><span class="real">Real project</span></div>
          </div>
        </div>
        <div class="rcard-actions">
          <div class="shortlist-btn" id="btn2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span id="btn2txt">Shortlist</span>
          </div>
          <div class="viewdetail-btn" id="viewDetailBtn2">
            View Detail
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <div class="rcard" id="rcard3">
        <div class="rcard-top">
          <div class="dial"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="43.7"/></svg><span class="num">76%</span></div>
          <div class="rmain">
            <h3>Build a Website for a US Retail Shop</h3>
            <div class="co">Fiverr &middot; US client</div>
            <div class="rtags"><span class="paid">Paid</span><span class="freelance">Freelance</span></div>
          </div>
        </div>
        <div class="rcard-actions">
          <div class="shortlist-btn" id="btn3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span id="btn3txt">Shortlist</span>
          </div>
          <div class="viewdetail-btn" id="viewDetailBtn3">
            View Detail
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ SCENE: INTERNSHIP DETAILS ============ -->
  <div class="scene" id="scene-detail">
    <div class="det-header">
      <div class="det-back" id="detBack"><svg viewBox="0 0 24 24" fill="none" stroke="#12213B" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></div>
      <div>
        <div class="co" id="detCo">Loom Analytics</div>
        <h1>Internship details</h1>
      </div>
    </div>

    <div class="det-body">
      <div class="det-card">
        <div class="det-hero">
          <div class="mark" id="detMark">L</div>
          <div>
            <h3 id="detTitle">Frontend Engineering Intern</h3>
            <div class="meta" id="detMeta">Paid &middot; 12 weeks &middot; remote-friendly</div>
            <div class="fit" id="detFit">92% fit for your resume</div>
          </div>
        </div>
      </div>

      <div class="det-card">
        <h4>What you'll do</h4>
        <p id="detWhat">Ship a real dashboard feature used by 40+ paying clients, working directly with senior engineers on production code.</p>
      </div>

      <div class="det-card">
        <h4>Why it's worth it</h4>
        <p id="detWhy">Real, shipped work you can point to &mdash; not busywork. It's the kind of project that actually strengthens a resume.</p>
      </div>

      <div class="det-apply" id="detApplyBtn">Apply Now</div>
    </div>
  </div>

  <!-- ============ SCENE 4: YOUR SHORTLIST DASHBOARD ============ -->
  <div class="scene" id="scene-dashboard">
    <div class="yl-head" id="ylHead">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
      <h1>Your Shortlist</h1>
    </div>

    <div class="yld-list">
      <div class="sl-card" id="slCard1">
        <div class="sl-top">
          <div><h3>Frontend Engineering Intern</h3><div class="co">Loom Analytics &middot; Paid</div></div>
          <div class="sl-dial"><svg viewBox="0 0 48 48"><circle class="trk" cx="24" cy="24" r="20"/><circle class="fil" cx="24" cy="24" r="20" stroke-dasharray="125.6" stroke-dashoffset="10.0"/></svg></div>
        </div>
        <div class="sl-insight">Ships a real dashboard feature &mdash; boosts your resume</div>
        <div class="sl-actions">
          <span class="sl-btn applied"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l4 4 10-10"/></svg>Applied</span>
          <span class="sl-btn remove">Remove</span>
        </div>
      </div>

      <div class="sl-card" id="slCard2">
        <div class="sl-top">
          <div><h3>Full Stack Developer Intern</h3><div class="co">Microsoft &middot; Paid</div></div>
          <div class="sl-dial"><svg viewBox="0 0 48 48"><circle class="trk" cx="24" cy="24" r="20"/><circle class="fil" cx="24" cy="24" r="20" stroke-dasharray="125.6" stroke-dashoffset="15.1"/></svg></div>
        </div>
        <div class="sl-insight">Builds an internal dev tool &mdash; real production code</div>
        <div class="sl-actions">
          <span class="sl-btn apply-now">Apply now</span>
          <span class="sl-btn remove">Remove</span>
        </div>
      </div>
    </div>
  </div>

  <div class="cursor" id="cursor"></div>
</div>
</div>

<script>
  function fitFrame(){
    const frame = document.getElementById('frame');
    const scale = frame.getBoundingClientRect().width / 1280;
    document.documentElement.style.setProperty('--frame-scale', scale.toFixed(4));
  }
  fitFrame();
  window.addEventListener('resize', fitFrame);
  window.addEventListener('orientationchange', fitFrame);

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  const stage = document.querySelector('.stage');
  const cursor = document.getElementById('cursor');

  function showScene(id){
    document.querySelectorAll('.scene').forEach(s=>s.classList.toggle('active', s.id===id));
  }

  async function moveTo(el){
    if(!el) return;
    const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--frame-scale')) || 1;
    const sr = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = (r.left + r.width/2 - sr.left) / scale - 10;
    const y = (r.top + r.height/2 - sr.top) / scale - 10;
    cursor.style.opacity = 1;
    cursor.style.left = x + 'px';
    cursor.style.top  = y + 'px';
    await sleep(550);
  }
  async function tap(el){
    await moveTo(el);
    cursor.classList.add('tap');
    await sleep(270);
    cursor.classList.remove('tap');
    await sleep(230);
  }
  async function typeText(el, text){
    el.classList.add('typing');
    el.textContent = '';
    for(const ch of text){ el.textContent += ch; await sleep(36); }
    await sleep(450);
    el.classList.remove('typing');
  }

  function setShortlisted(btn, txt, on){
    btn.classList.toggle('done', on);
    txt.textContent = on ? 'Shortlisted' : 'Shortlist';
    btn.querySelector('svg').innerHTML = on
      ? '<path d="M5 12l4 4 10-10"/>'
      : '<path d="M12 5v14M5 12h14"/>';
  }

  const OPPS = {
    1: { co:'Loom Analytics', mark:'L', markBg:'var(--teal)', title:'Frontend Engineering Intern',
         meta:'Paid &middot; 12 weeks &middot; remote-friendly', fit:'92% fit for your resume',
         what:"Ship a real dashboard feature used by 40+ paying clients, working directly with senior engineers on production code.",
         why:"Real, shipped work you can point to &mdash; not busywork. It's the kind of project that actually strengthens a resume." },
    2: { co:'Microsoft', mark:'M', markBg:'#3A6EA5', title:'Full Stack Developer Intern',
         meta:'Paid &middot; 12 weeks &middot; hybrid', fit:'88% fit for your resume',
         what:"Build features for an internal developer tool used across multiple product teams, paired with a senior mentor.",
         why:"A Microsoft-scale codebase on your resume, with real code review from engineers who ship to production." },
    3: { co:'Fiverr &middot; US client', mark:'F', markBg:'#6a4fa0', title:'Build a Website for a US Retail Shop',
         meta:'Paid &middot; freelance &middot; fixed-scope', fit:'76% fit for your resume',
         what:"Design and build a small e-commerce site for a US-based retail shop, from mockup to launch.",
         why:"A live client project you can link to directly, plus a real testimonial once it ships." }
  };

  function openDetail(id){
    const d = OPPS[id];
    document.getElementById('detCo').innerHTML = d.co;
    document.getElementById('detTitle').textContent = d.title;
    document.getElementById('detMeta').innerHTML = d.meta;
    document.getElementById('detFit').textContent = d.fit;
    document.getElementById('detWhat').textContent = d.what;
    document.getElementById('detWhy').innerHTML = d.why;
    const mark = document.getElementById('detMark');
    mark.textContent = d.mark;
    mark.style.background = d.markBg;
  }

  async function run(){
    const searchTxt = document.getElementById('searchTxt');
    const btn1 = document.getElementById('btn1'), txt1 = document.getElementById('btn1txt');
    const btn2 = document.getElementById('btn2'), txt2 = document.getElementById('btn2txt');

    while(true){
      // ---- reset everything ----
      showScene('scene-filters');
      document.getElementById('cardSearch').classList.remove('show');
      document.getElementById('cardOpps').classList.remove('show');
      document.getElementById('cardComp').classList.remove('show');
      document.getElementById('startWrap').classList.remove('show');
      document.getElementById('startBtn').classList.remove('pulse');
      searchTxt.textContent = '';
      document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
      document.getElementById('rcard1').classList.remove('show');
      document.getElementById('cardMicrosoft').classList.remove('show');
      document.getElementById('rcard3').classList.remove('show');
      setShortlisted(btn1, txt1, false);
      setShortlisted(btn2, txt2, false);
      document.getElementById('ylHead').classList.remove('show');
      document.getElementById('slCard1').classList.remove('show');
      document.getElementById('slCard2').classList.remove('show');
      cursor.style.opacity = 0;
      await sleep(900);

      // ---- SCENE 1: filters ----
      document.getElementById('cardSearch').classList.add('show');
      await sleep(500);
      await typeText(searchTxt, "What's the perfect opportunity for me?");
      await sleep(450);

      document.getElementById('cardOpps').classList.add('show');
      await sleep(550);
      await tap(document.getElementById('pillIntern'));
      document.getElementById('pillIntern').classList.add('active');
      await sleep(600);

      document.getElementById('cardComp').classList.add('show');
      await sleep(550);
      await tap(document.getElementById('pillBoth'));
      document.getElementById('pillBoth').classList.add('active');
      await sleep(600);

      document.getElementById('startWrap').classList.add('show');
      await sleep(600);
      const startBtn = document.getElementById('startBtn');
      await tap(startBtn);
      startBtn.classList.add('pulse');
      await sleep(500);

      // ---- WHITE LOADING TRANSITION ----
      cursor.style.opacity = 0;
      showScene('scene-loading');
      await sleep(1100);

      // ---- SCENE 2: search results, cards reveal one by one ----
      showScene('scene-results');
      await sleep(150);
      document.getElementById('rcard1').classList.add('show');
      await sleep(400);
      document.getElementById('cardMicrosoft').classList.add('show');
      await sleep(400);
      document.getElementById('rcard3').classList.add('show');
      await sleep(700);

      // ---- View details on the Paid card only ----
      await tap(document.getElementById('viewDetailBtn1'));
      openDetail(1);
      cursor.style.opacity = 0;
      showScene('scene-detail');
      await sleep(1600);
      await tap(document.getElementById('detBack'));
      cursor.style.opacity = 0;
      showScene('scene-results');
      await sleep(500);

      // ---- Shortlist it, then straight to Your Shortlist ----
      await tap(btn1);
      setShortlisted(btn1, txt1, true);
      await sleep(500);
      await tap(btn2);
      setShortlisted(btn2, txt2, true);
      await sleep(700);

      // ---- SCENE: your shortlist dashboard (connects straight from part 3) ----
      cursor.style.opacity = 0;
      showScene('scene-dashboard');
      await sleep(150);
      document.getElementById('ylHead').classList.add('show');
      await sleep(300);
      document.getElementById('slCard1').classList.add('show');
      await sleep(200);
      document.getElementById('slCard2').classList.add('show');
      await sleep(2600);
    }
  }
  run();
</script>
</body>
</html>`;

export function InternshipOpportunitiesDemo() {
  return (
    <iframe
      title="Find your perfect opportunity — search, shortlist, and apply walkthrough"
      srcDoc={SRC}
      loading="lazy"
      scrolling="no"
      className="mx-auto block w-full max-w-[1080px] border-0 bg-transparent"
      style={{ aspectRatio: '16 / 9' }}
    />
  );
}
