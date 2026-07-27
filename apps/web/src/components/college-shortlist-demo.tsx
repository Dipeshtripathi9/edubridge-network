'use client';

// Animated "filter → search → shortlist" walkthrough for the college-list
// hero. Self-contained HTML/CSS/JS in an isolated iframe (same reasoning as
// HomeCareerBridge): its own fonts/animations can't collide with the app.
// The frame's own background is transparent so it merges seamlessly into
// the hero's green — there is no separate "device mockup" card, matching
// the reference recording.
const SRC = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EduBridge — Build Your College List</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --green:#2E4F30; --green-deep:#1E3A22; --cream:#F7F2E6; --card:#FFFFFF;
    --orange:#EFA23C; --navy:#28224E; --pink:#F4B7CE; --mint:#CFEAC7; --sky:#C7E1F6;
    --ink:#1B2A1D; --ink-soft:#51604F; --line:rgba(27,42,29,0.14);
    --display:'Fraunces',serif; --body:'Space Grotesk',sans-serif; --mono:'IBM Plex Mono',monospace;
  }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ height:100%; background:transparent; }
  body{
    font-family:var(--body);
    display:flex; align-items:center; justify-content:center;
    min-height:100vh; padding:16px; overflow-x:hidden;
  }

  .frame{
    width:min(calc(100vw - 32px), calc(90vh * 16 / 9));
    aspect-ratio:1280/720;
    position:relative; overflow:hidden;
  }
  @media (min-width:641px){
    body{ padding:24px; }
    .frame{ width:min(calc(100vw - 48px), 860px, calc(85vh * 16 / 9)); }
  }
  @media (min-width:1024px){
    body{ padding:32px; }
    .frame{ width:min(calc(100vw - 64px), 1080px, calc(82vh * 16 / 9)); }
  }
  .stage{
    position:absolute; top:0; left:0;
    width:1280px; height:720px;
    transform:scale(var(--frame-scale, 1));
    transform-origin:top left;
  }

  .scene{ position:absolute; inset:0; opacity:0; pointer-events:none; transition:opacity .4s ease; }
  .scene.active{ opacity:1; pointer-events:auto; }

  /* ================= SCENE 1: FILTERS ================= */
  .card{
    position:absolute;
    background:var(--card); border:1px solid var(--line); border-radius:18px;
    padding:22px 26px;
    box-shadow:0 20px 40px -22px rgba(0,0,0,0.28);
    opacity:0; transform:translateY(16px) scale(0.96);
    transition:opacity .5s ease, transform .5s ease;
  }
  .card.show{ opacity:1; transform:translateY(0) scale(1); }
  .label{
    font-family:var(--mono); font-size:12px; font-weight:600; letter-spacing:.08em;
    text-transform:uppercase; color:var(--ink-soft); margin-bottom:14px;
  }

  .c-loc{ top:64px; left:170px; width:340px; }
  .loc-box{
    display:flex; align-items:center; gap:10px; justify-content:space-between;
    background:var(--cream); border:1px solid var(--line); border-radius:12px;
    padding:14px 16px; font-family:var(--display); font-weight:700; font-size:19px; color:var(--green-deep);
  }
  .loc-box svg{ color:var(--green); flex:0 0 auto; }

  .c-cost{ top:210px; left:590px; width:340px; }
  .cost-val{ font-family:var(--display); font-weight:700; font-size:19px; color:var(--green-deep); margin-bottom:14px; }
  .cost-track{ position:relative; height:8px; border-radius:8px; background:var(--mint); }
  .cost-fill{ position:absolute; inset:0 auto 0 0; width:60%; border-radius:8px; background:var(--green); }
  .cost-thumb{
    position:absolute; top:50%; left:60%; width:18px; height:18px; border-radius:50%;
    background:var(--navy); border:3px solid var(--card); box-shadow:0 2px 6px rgba(0,0,0,0.3);
    transform:translate(-50%,-50%); transition:left .6s cubic-bezier(.4,0,.2,1);
  }

  .c-size{ top:378px; left:220px; width:290px; }
  .size-row{ display:flex; gap:10px; }
  .size-btn{
    flex:1; text-align:center; font-family:var(--body); font-weight:600; font-size:14px;
    padding:12px 0; border-radius:10px; background:var(--sky); color:var(--navy);
    transition:background .3s ease, color .3s ease;
  }
  .size-btn.active{ background:var(--navy); color:var(--cream); }

  .start-wrap{
    position:absolute; top:388px; left:565px;
    opacity:0; transform:translateY(10px);
    transition:opacity .5s ease, transform .5s ease;
  }
  .start-wrap.show{ opacity:1; transform:translateY(0); }
  .start-btn{
    display:inline-flex; align-items:center; justify-content:center;
    font-family:var(--body); font-weight:700; font-size:16px; color:var(--green-deep);
    background:var(--mint); padding:16px 30px; border-radius:12px;
    box-shadow:0 8px 18px -8px rgba(0,0,0,0.25);
  }
  .start-btn.pulse{ animation:pulse .5s ease; }
  @keyframes pulse{
    0%{ box-shadow:0 0 0 0 rgba(207,234,199,0.7), 0 8px 18px -8px rgba(0,0,0,0.25); }
    70%{ box-shadow:0 0 0 14px rgba(207,234,199,0), 0 8px 18px -8px rgba(0,0,0,0.25); }
    100%{ box-shadow:0 0 0 0 rgba(207,234,199,0), 0 8px 18px -8px rgba(0,0,0,0.25); }
  }

  /* ---- loading transition: tinted dots, no white box ---- */
  #scene-loading{ display:flex; align-items:center; justify-content:center; }
  .load-dots{ display:flex; gap:10px; }
  .load-dots span{ width:12px; height:12px; border-radius:50%; background:var(--cream); animation:loadbounce 1s ease-in-out infinite; }
  .load-dots span:nth-child(2){ animation-delay:.15s; }
  .load-dots span:nth-child(3){ animation-delay:.3s; }
  @keyframes loadbounce{ 0%,100%{ transform:translateY(0); opacity:.45; } 50%{ transform:translateY(-10px); opacity:1; } }

  /* ================= SCENE 2: SEARCH RESULTS ================= */
  .panel{
    position:absolute; top:56px; left:190px; width:900px;
    background:var(--cream); border-radius:20px; padding:28px;
    transition:opacity .5s ease, filter .5s ease;
  }
  .panel.dim{ opacity:.5; filter:grayscale(55%); }
  .panel h1{ font-family:var(--display); font-weight:700; font-size:27px; color:var(--green-deep); margin-bottom:20px; }

  .rrow{
    display:flex; align-items:center; gap:16px;
    background:var(--card); border-radius:16px; padding:14px 18px; margin-bottom:14px;
    box-shadow:0 14px 28px -20px rgba(0,0,0,0.18);
    opacity:0; transform:translateY(10px);
    transition:opacity .45s ease, transform .3s ease, box-shadow .3s ease, filter .4s ease;
  }
  .rrow.show{ opacity:1; transform:translateY(0); }
  .rrow.dim{ opacity:.45; filter:grayscale(60%); }
  .rrow.lift{ transform:scale(1.02); box-shadow:0 22px 40px -18px rgba(0,0,0,0.32); z-index:2; }
  .thumb{ width:52px; height:52px; border-radius:10px; overflow:hidden; flex:0 0 auto; }
  .thumb svg{ display:block; width:100%; height:100%; }
  .rrow-main{ flex:1; min-width:0; }
  .rrow-main h3{ font-family:var(--display); font-weight:700; font-size:17px; color:var(--ink); display:inline; }
  .type-dot{ display:inline-block; width:9px; height:9px; border-radius:50%; margin-left:8px; }
  .rrow-bar{ margin-top:9px; height:7px; width:70%; border-radius:6px; background:var(--line); }
  .rrow-bar-sm{ margin-top:6px; height:7px; width:12px; border-radius:6px; background:var(--green); display:inline-block; }
  .rrow-actions{ flex:0 0 auto; display:flex; align-items:center; gap:16px; }

  /* ---- % match dial ---- */
  .dial{ position:relative; width:52px; height:52px; flex:0 0 auto; }
  .dial svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .dial .trk{ fill:none; stroke:var(--mint); stroke-width:6; }
  .dial .fil{ fill:none; stroke:var(--green); stroke-width:6; stroke-linecap:round; transition:stroke-dashoffset 1s ease; }
  .dial .num{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:12.5px; font-weight:600; color:var(--ink); }
  .dial-sm{ width:38px; height:38px; }
  .dial-sm .num{ font-size:10px; }

  .shortlist-btn{
    flex:0 0 auto; display:inline-flex; align-items:center; gap:6px;
    font-family:var(--body); font-weight:700; font-size:13.5px; color:#fff;
    background:var(--ink); border-radius:100px; padding:11px 18px;
    transition:background .3s ease;
  }
  .shortlist-btn svg{ width:12px; height:12px; }
  .shortlist-btn.done{ background:var(--green); }
  .viewdetail-btn{
    flex:0 0 auto; display:inline-flex; align-items:center; gap:6px;
    font-family:var(--body); font-weight:700; font-size:13.5px; color:var(--ink);
    background:var(--sky); border-radius:100px; padding:11px 16px;
  }
  .viewdetail-btn svg{ width:10px; height:10px; }

  /* ---- "Your List" chip: lands from above the top edge ---- */
  .yl-chip{
    position:absolute; top:26px; left:220px;
    display:inline-flex; align-items:center; gap:8px;
    font-family:var(--body); font-weight:700; font-size:15px; color:var(--ink);
    background:var(--cream); border-radius:100px; padding:10px 20px;
    opacity:0; transform:translateY(-70px);
    transition:opacity .55s ease, transform .6s cubic-bezier(.34,1.4,.64,1);
    z-index:5;
  }
  .yl-chip.show{ opacity:1; transform:translateY(0); }
  .yl-chip svg{ width:16px; height:16px; fill:var(--green); }

  /* ================= SCENE 3: YOUR LIST (floats directly on green) ================= */
  .yl-list{ position:absolute; top:96px; left:190px; width:590px; }
  .yl-card{
    background:var(--card); border-radius:16px; padding:16px 18px; margin-bottom:16px;
    box-shadow:0 18px 36px -22px rgba(0,0,0,0.3);
    opacity:0; transform:translateY(14px);
    transition:opacity .45s ease, transform .45s ease;
    display:flex; align-items:center; gap:14px;
  }
  .yl-card.show{ opacity:1; transform:translateY(0); }
  .yl-card-main{ flex:1; min-width:0; }
  .yl-card-main h3{ font-family:var(--display); font-weight:700; font-size:16.5px; color:var(--ink); }
  .add-status-btn{
    flex:0 0 auto; display:inline-flex; align-items:center; gap:6px;
    font-family:var(--body); font-weight:600; font-size:13.5px; color:var(--ink);
    background:var(--sky); border-radius:100px; padding:10px 16px;
  }
  .add-status-btn svg{ width:11px; height:11px; }
  .status-pill{
    flex:0 0 auto; font-family:var(--body); font-weight:700; font-size:12.5px;
    border-radius:100px; padding:8px 14px; white-space:nowrap;
  }
  .status-pill.researching{ background:var(--sky); color:var(--navy); }
  .status-pill.touring{ background:var(--sky); color:var(--navy); }
  .status-pill.applied{ background:var(--mint); color:var(--green-deep); }

  .dropdown{
    position:absolute; top:172px; left:405px; width:220px;
    background:var(--card); border-radius:14px; padding:10px;
    box-shadow:0 20px 40px -18px rgba(0,0,0,0.32);
    opacity:0; transform:translateY(-8px) scale(0.97); pointer-events:none;
    transition:opacity .3s ease, transform .3s ease;
    display:flex; flex-direction:column; gap:6px;
    z-index:6;
  }
  .dropdown.open{ opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }
  .drop-opt{
    text-align:left; font-family:var(--body); font-weight:600; font-size:13px;
    border-radius:100px; padding:9px 14px;
  }
  .drop-opt.researching{ background:var(--sky); color:var(--navy); }
  .drop-opt.touring{ background:var(--sky); color:var(--navy); }
  .drop-opt.started{ background:var(--mint); color:var(--green-deep); }
  .drop-opt.applied{ background:var(--mint); color:var(--green-deep); }
  .drop-opt.accepted{ background:var(--orange); color:var(--ink); }
  .drop-opt.clear{ background:var(--line); color:var(--ink-soft); }

  /* ================= SCENE: COLLEGE DETAILS ================= */
  .det-header{ position:absolute; top:56px; left:190px; display:flex; align-items:center; gap:16px; }
  .det-back{ width:42px; height:42px; border-radius:12px; background:var(--card); display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
  .det-back svg{ width:18px; height:18px; }
  .det-header .co{ font-family:var(--body); font-size:13px; color:var(--cream); opacity:.75; margin-bottom:2px; }
  .det-header h1{ font-family:var(--display); font-weight:700; font-size:24px; color:var(--cream); }

  .det-body{ position:absolute; top:132px; left:190px; width:660px; }
  .det-card{ background:var(--card); border-radius:16px; padding:20px 22px; margin-bottom:14px; box-shadow:0 14px 28px -20px rgba(0,0,0,0.2); }
  .det-hero{ display:flex; align-items:center; gap:16px; }
  .det-hero .thumb{ width:56px; height:56px; }
  .det-hero h3{ font-family:var(--display); font-weight:700; font-size:20px; color:var(--ink); margin-bottom:3px; }
  .det-hero .meta{ font-family:var(--body); font-size:13.5px; color:var(--ink-soft); margin-bottom:5px; }
  .det-hero .fit{ font-family:var(--body); font-weight:700; font-size:14px; color:var(--green); }

  .det-card h4{ font-family:var(--display); font-weight:700; font-size:15.5px; color:var(--ink); margin-bottom:8px; }
  .det-card p{ font-family:var(--body); font-size:14px; color:var(--ink-soft); line-height:1.55; }

  .det-cta{ display:flex; align-items:center; justify-content:center; font-family:var(--body); font-weight:700; font-size:16px; color:var(--green-deep); background:var(--mint); padding:16px 0; border-radius:14px; }

  /* ---------- shared: fake cursor ---------- */
  .cursor{
    position:absolute; width:20px; height:20px; left:0; top:0;
    border-radius:50% 50% 50% 4px;
    background:rgba(27,42,29,0.9); border:2px solid #fff;
    box-shadow:0 4px 12px rgba(0,0,0,0.35);
    z-index:50; opacity:0; pointer-events:none;
    transition:left .55s cubic-bezier(.4,0,.2,1), top .55s cubic-bezier(.4,0,.2,1), opacity .25s ease;
  }
  .cursor.tap{ animation:tap .35s ease; }
  @keyframes tap{
    0%{ box-shadow:0 4px 12px rgba(0,0,0,0.35); }
    50%{ box-shadow:0 0 0 10px rgba(46,79,48,0.35), 0 4px 12px rgba(0,0,0,0.35); }
    100%{ box-shadow:0 4px 12px rgba(0,0,0,0.35); }
  }
</style>
</head>
<body>

<div class="frame" id="frame">
<div class="stage">

  <!-- ============ SCENE 1: FILTERS ============ -->
  <div class="scene active" id="scene-filters">
    <div class="card c-loc" id="cardLoc">
      <div class="label">Location</div>
      <div class="loc-box"><span id="locTxt"></span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
      </div>
    </div>

    <div class="card c-cost" id="cardCost">
      <div class="label">School cost (net price)</div>
      <div class="cost-val">$0 &ndash; $20,000</div>
      <div class="cost-track"><div class="cost-fill"></div><div class="cost-thumb" id="costThumb"></div></div>
    </div>

    <div class="card c-size" id="cardSize">
      <div class="label">School size</div>
      <div class="size-row">
        <span class="size-btn" id="sizeSmall">Small</span>
        <span class="size-btn" id="sizeMedium">Medium</span>
        <span class="size-btn" id="sizeLarge">Large</span>
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
    <div class="panel" id="resultsPanel">
      <h1>Search Results</h1>

      <div class="rrow" id="rowPace">
        <div class="thumb"><svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#C7E1F6"/><path d="M0 42 L18 20 L30 34 L40 22 L56 42 V56 H0 Z" fill="#234B33"/></svg></div>
        <div class="rrow-main"><h3>Pace University</h3><span class="type-dot" style="background:var(--sky)"></span><div class="rrow-bar"></div></div>
        <div class="rrow-actions">
          <div class="dial"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="182.2"/></svg><span class="num">82%</span></div>
          <div class="shortlist-btn" id="btnPace"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg><span id="btnPaceTxt">Shortlist</span></div>
          <div class="viewdetail-btn" id="viewDetailPace">View Detail<svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></div>
        </div>
      </div>

      <div class="rrow" id="rowStony">
        <div class="thumb"><svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#DCD3EE"/><path d="M0 40 L14 26 L26 38 V56 H0 Z" fill="#3E7A4E"/><rect x="30" y="24" width="16" height="16" fill="#C9682F"/><path d="M28 24 L38 15 L48 24 Z" fill="#8A3D1C"/></svg></div>
        <div class="rrow-main"><h3>Stony Brook University</h3><span class="type-dot" style="background:var(--green)"></span><div class="rrow-bar"></div></div>
        <div class="rrow-actions">
          <div class="dial"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="182.2"/></svg><span class="num">90%</span></div>
          <div class="shortlist-btn" id="btnStony"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg><span id="btnStonyTxt">Shortlist</span></div>
          <div class="viewdetail-btn" id="viewDetailStony">View Detail<svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></div>
        </div>
      </div>

      <div class="rrow" id="rowAdelphi">
        <div class="thumb"><svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#F6CFDD"/><circle cx="15" cy="14" r="3.5" fill="#D2482F"/><path d="M0 46 L16 22 L26 40 L34 28 L56 46 V56 H0 Z" fill="#E8A23D"/><path d="M22 46 L34 30 L44 46 Z" fill="#2F7A72"/></svg></div>
        <div class="rrow-main"><h3>Adelphi University</h3><span class="type-dot" style="background:var(--sky)"></span><div class="rrow-bar"></div></div>
        <div class="rrow-actions">
          <div class="dial"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="182.2"/></svg><span class="num">78%</span></div>
          <div class="shortlist-btn" id="btnAdelphi"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg><span id="btnAdelphiTxt">Shortlist</span></div>
          <div class="viewdetail-btn" id="viewDetailAdelphi">View Detail<svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ SCENE: COLLEGE DETAILS ============ -->
  <div class="scene" id="scene-detail">
    <div class="det-header">
      <div class="det-back" id="detBack"><svg viewBox="0 0 24 24" fill="none" stroke="#1B2A1D" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></div>
      <div>
        <div class="co" id="detCo">New York, NY</div>
        <h1 id="detTitle">Pace University</h1>
      </div>
    </div>
    <div class="det-body">
      <div class="det-card">
        <div class="det-hero">
          <div class="thumb" id="detThumb"></div>
          <div>
            <h3 id="detName">Pace University</h3>
            <div class="meta" id="detMeta">Private &middot; ~8,900 undergrads</div>
            <div class="fit" id="detFit">82% fit for your criteria</div>
          </div>
        </div>
      </div>
      <div class="det-card"><h4>Why it fits</h4><p id="detWhy"></p></div>
      <div class="det-card"><h4>What to know</h4><p id="detKnow"></p></div>
      <div class="det-cta" id="detCta">Add to Your List</div>
    </div>
  </div>

  <!-- ============ SCENE 3: YOUR LIST ============ -->
  <div class="scene" id="scene-yourlist">
    <div class="yl-list">
      <div class="yl-card" id="ylStony">
        <div class="thumb"><svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#DCD3EE"/><path d="M0 40 L14 26 L26 38 V56 H0 Z" fill="#3E7A4E"/><rect x="30" y="24" width="16" height="16" fill="#C9682F"/><path d="M28 24 L38 15 L48 24 Z" fill="#8A3D1C"/></svg></div>
        <div class="dial dial-sm"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="18.2"/></svg><span class="num">90%</span></div>
        <div class="yl-card-main"><h3>Stony Brook University</h3><div class="rrow-bar-sm"></div></div>
        <div class="add-status-btn" id="addStatusBtn">Add Status <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg></div>
      </div>
      <div class="yl-card" id="ylPace">
        <div class="thumb"><svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#C7E1F6"/><path d="M0 42 L18 20 L30 34 L40 22 L56 42 V56 H0 Z" fill="#234B33"/></svg></div>
        <div class="dial dial-sm"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="32.8"/></svg><span class="num">82%</span></div>
        <div class="yl-card-main"><h3>Pace University</h3><div class="rrow-bar-sm"></div></div>
        <span class="status-pill researching" id="paceStatus">Researching</span>
      </div>
      <div class="yl-card" id="ylAdelphi">
        <div class="thumb"><svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#F6CFDD"/><circle cx="15" cy="14" r="3.5" fill="#D2482F"/><path d="M0 46 L16 22 L26 40 L34 28 L56 46 V56 H0 Z" fill="#E8A23D"/><path d="M22 46 L34 30 L44 46 Z" fill="#2F7A72"/></svg></div>
        <div class="dial dial-sm"><svg viewBox="0 0 70 70"><circle class="trk" cx="35" cy="35" r="29"/><circle class="fil" cx="35" cy="35" r="29" stroke-dasharray="182.2" stroke-dashoffset="40.1"/></svg><span class="num">78%</span></div>
        <div class="yl-card-main"><h3>Adelphi University</h3><div class="rrow-bar-sm"></div></div>
        <span class="status-pill touring" id="adelphiStatus">Scheduled Tour</span>
      </div>
    </div>

    <div class="dropdown" id="statusDropdown">
      <span class="drop-opt researching">Researching</span>
      <span class="drop-opt touring">Scheduled Tour</span>
      <span class="drop-opt started">Started Application</span>
      <span class="drop-opt applied" id="dropApplied">Applied</span>
      <span class="drop-opt accepted">Accepted</span>
      <span class="drop-opt clear">Clear Status</span>
    </div>
  </div>

  <div class="yl-chip" id="ylChip">
    <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.5 5 6 5c2 0 3.6 1.2 4.5 2.6C11.4 6.2 13 5 15 5c3.5 0 5.4 3.4 4 6.7C19.5 16.4 12 21 12 21z"/></svg>
    Your List
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
    el.textContent = '';
    for(const ch of text){ el.textContent += ch; await sleep(45); }
    await sleep(350);
  }
  function setShortlisted(btn, txt, on){
    btn.classList.toggle('done', on);
    txt.textContent = on ? 'Shortlisted' : 'Shortlist';
    btn.querySelector('svg').innerHTML = on
      ? '<path d="M5 12l4 4 10-10"/>'
      : '<path d="M12 5v14M5 12h14"/>';
  }

  const COLLEGES = {
    pace: { name:'Pace University', thumb:'thumbPace', loc:'New York, NY', meta:'Private &middot; ~8,900 undergrads', fit:'82% fit for your criteria',
      why:'Strong finance and CS programs in the middle of Manhattan, with a net price inside your $20,000 budget.',
      know:'Mid-size classes mean more faculty access than a large state school, but no guaranteed upperclassman housing.' },
    stony: { name:'Stony Brook University', thumb:'thumbStony', loc:'Stony Brook, NY', meta:'Public &middot; ~17,000 undergrads', fit:'90% fit for your criteria',
      why:'A top public research university with strong STEM programs and a net price well under your $20,000 target.',
      know:'Large lecture classes in first-year core courses; research opportunities open up quickly after that.' },
    adelphi: { name:'Adelphi University', thumb:'thumbAdelphi', loc:'Garden City, NY', meta:'Private &middot; ~5,500 undergrads', fit:'78% fit for your criteria',
      why:'Small class sizes and a tight-knit campus about 45 minutes from Manhattan.',
      know:'Net price can run close to your $20,000 ceiling depending on aid — worth a financial aid call before applying.' }
  };
  const THUMB_SVG = {
    thumbPace: '<svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#C7E1F6"/><path d="M0 42 L18 20 L30 34 L40 22 L56 42 V56 H0 Z" fill="#234B33"/></svg>',
    thumbStony: '<svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#DCD3EE"/><path d="M0 40 L14 26 L26 38 V56 H0 Z" fill="#3E7A4E"/><rect x="30" y="24" width="16" height="16" fill="#C9682F"/><path d="M28 24 L38 15 L48 24 Z" fill="#8A3D1C"/></svg>',
    thumbAdelphi: '<svg viewBox="0 0 56 56"><rect width="56" height="56" fill="#F6CFDD"/><circle cx="15" cy="14" r="3.5" fill="#D2482F"/><path d="M0 46 L16 22 L26 40 L34 28 L56 46 V56 H0 Z" fill="#E8A23D"/><path d="M22 46 L34 30 L44 46 Z" fill="#2F7A72"/></svg>'
  };
  function openDetail(key){
    const c = COLLEGES[key];
    document.getElementById('detCo').textContent = c.loc;
    document.getElementById('detTitle').textContent = c.name;
    document.getElementById('detName').textContent = c.name;
    document.getElementById('detMeta').innerHTML = c.meta;
    document.getElementById('detFit').textContent = c.fit;
    document.getElementById('detWhy').textContent = c.why;
    document.getElementById('detKnow').textContent = c.know;
    document.getElementById('detThumb').innerHTML = THUMB_SVG[c.thumb];
  }

  async function run(){
    const btnPace = document.getElementById('btnPace'), txtPace = document.getElementById('btnPaceTxt');
    const btnStony = document.getElementById('btnStony'), txtStony = document.getElementById('btnStonyTxt');
    const resultsPanel = document.getElementById('resultsPanel');
    const rowPace = document.getElementById('rowPace');
    const rowStony = document.getElementById('rowStony');
    const rowAdelphi = document.getElementById('rowAdelphi');
    const ylChip = document.getElementById('ylChip');
    const dropdown = document.getElementById('statusDropdown');

    while(true){
      // ---- reset everything ----
      showScene('scene-filters');
      ['cardLoc','cardCost','cardSize'].forEach(id=>document.getElementById(id).classList.remove('show'));
      document.getElementById('startWrap').classList.remove('show');
      document.getElementById('startBtn').classList.remove('pulse');
      document.getElementById('locTxt').textContent = '';
      document.getElementById('costThumb').style.left = '18%';
      ['sizeSmall','sizeMedium','sizeLarge'].forEach(id=>document.getElementById(id).classList.remove('active'));
      [rowPace,rowStony,rowAdelphi].forEach(r=>{
        r.classList.remove('show','dim','lift');
        r.querySelector('.dial .fil').setAttribute('stroke-dashoffset', '182.2');
      });
      setShortlisted(btnPace, txtPace, false);
      setShortlisted(btnStony, txtStony, false);
      resultsPanel.classList.remove('dim');
      ylChip.classList.remove('show');
      dropdown.classList.remove('open');
      ['ylStony','ylPace','ylAdelphi'].forEach(id=>document.getElementById(id).classList.remove('show'));
      document.getElementById('addStatusBtn').style.display = 'inline-flex';
      const stonyStatusExisting = document.getElementById('stonyStatus');
      if(stonyStatusExisting) stonyStatusExisting.remove();
      cursor.style.opacity = 0;
      await sleep(900);

      // ---- SCENE 1: filters ----
      document.getElementById('cardLoc').classList.add('show');
      await sleep(450);
      await typeText(document.getElementById('locTxt'), 'New York');
      await sleep(350);

      document.getElementById('cardCost').classList.add('show');
      await sleep(500);
      document.getElementById('costThumb').style.left = '60%';
      await sleep(700);

      document.getElementById('cardSize').classList.add('show');
      await sleep(500);
      await tap(document.getElementById('sizeMedium'));
      document.getElementById('sizeMedium').classList.add('active');
      await sleep(600);

      document.getElementById('startWrap').classList.add('show');
      await sleep(550);
      const startBtn = document.getElementById('startBtn');
      await tap(startBtn);
      startBtn.classList.add('pulse');
      await sleep(500);

      // ---- LOADING TRANSITION ----
      cursor.style.opacity = 0;
      showScene('scene-loading');
      await sleep(1000);

      // ---- SCENE 2: search results, rows reveal one by one ----
      showScene('scene-results');
      await sleep(150);
      rowPace.classList.add('show');
      rowPace.querySelector('.dial .fil').setAttribute('stroke-dashoffset', '32.8');
      await sleep(350);
      rowStony.classList.add('show');
      rowStony.querySelector('.dial .fil').setAttribute('stroke-dashoffset', '18.2');
      await sleep(350);
      rowAdelphi.classList.add('show');
      rowAdelphi.querySelector('.dial .fil').setAttribute('stroke-dashoffset', '40.1');
      await sleep(700);

      // ---- view details on Pace ----
      await tap(document.getElementById('viewDetailPace'));
      openDetail('pace');
      cursor.style.opacity = 0;
      showScene('scene-detail');
      await sleep(1700);
      await tap(document.getElementById('detBack'));
      cursor.style.opacity = 0;
      showScene('scene-results');
      await sleep(500);

      // ---- shortlist Pace, then Stony Brook ----
      await tap(btnPace);
      setShortlisted(btnPace, txtPace, true);
      await sleep(500);
      await tap(btnStony);
      setShortlisted(btnStony, txtStony, true);
      await sleep(500);

      // ---- dim the rest, lift the selected row ----
      resultsPanel.classList.add('dim');
      rowPace.classList.add('dim');
      rowAdelphi.classList.add('dim');
      rowStony.classList.add('lift');
      await sleep(450);

      // ---- "Your List" chip lands from above the top edge ----
      cursor.style.opacity = 0;
      ylChip.classList.add('show');
      await sleep(750);

      // ---- swap to the clean "Your List" scene: floats directly on green ----
      showScene('scene-yourlist');
      await sleep(150);
      document.getElementById('ylStony').classList.add('show');
      await sleep(600);

      // ---- open the status dropdown, pick "Applied" ----
      await tap(document.getElementById('addStatusBtn'));
      dropdown.classList.add('open');
      await sleep(700);
      await tap(document.getElementById('dropApplied'));
      dropdown.classList.remove('open');
      document.getElementById('addStatusBtn').style.display = 'none';
      const stonyCard = document.getElementById('ylStony');
      const stonyStatus = document.createElement('span');
      stonyStatus.id = 'stonyStatus';
      stonyStatus.className = 'status-pill applied';
      stonyStatus.textContent = 'Applied';
      stonyCard.appendChild(stonyStatus);
      cursor.style.opacity = 0;
      await sleep(700);

      // ---- Pace and Adelphi join the list ----
      document.getElementById('ylPace').classList.add('show');
      await sleep(450);
      document.getElementById('ylAdelphi').classList.add('show');
      await sleep(2600);
    }
  }
  run();
</script>
</body>
</html>`;

export function CollegeShortlistDemo() {
  return (
    <iframe
      title="Build your college list — filter, search, view details, and shortlist walkthrough"
      srcDoc={SRC}
      loading="lazy"
      scrolling="no"
      className="mx-auto block w-full max-w-[1180px] border-0 bg-transparent"
      style={{ aspectRatio: '16 / 9' }}
    />
  );
}
