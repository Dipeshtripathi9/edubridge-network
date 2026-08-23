'use client';

// Animated hero showcase, cycling through five scenes (pan-India reach,
// real-world projects, expert mentorship, resume guidance, verifiable
// credentials). Self-contained HTML/CSS/JS in an isolated iframe (same
// reasoning as HomeCareerBridge): its own fonts/animations can't collide
// with the app. The frame's own background is transparent so it merges
// seamlessly into the hero's green — there is no separate "device mockup"
// card, only the individual floating scene cards.
const SRC = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:100%; height:100%; background:transparent; font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
  #outer { width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; }
  #frame { position:relative; width:100%; max-width:1200px; aspect-ratio:1200/800; overflow:hidden; }
  #stage-inner { position:absolute; top:0; left:0; width:1200px; height:800px; transform-origin:top left; background:#2e4f30; opacity:1; transition:opacity .25s ease; }
  #stage-inner.fading { opacity:0; }
  .stage { position:relative; width:1200px; height:800px; background:#2e4f30; overflow:hidden; }

  /* ---- shared component styles ---- */
  .accent { position:absolute; border-radius:4px; opacity:0; animation: floatIn 3.2s ease-in-out infinite; }
  .accent.teal { background:#5fb397; }
  .accent.orange { background:#f5a742; }
  @keyframes floatIn {
    0% { opacity:0; transform: translateY(10px) scale(.6); }
    15% { opacity:1; transform: translateY(0) scale(1); }
    85% { opacity:1; }
    100% { opacity:0; transform: translateY(-8px) scale(.8); }
  }

  .card {
    position:absolute; left:50%; top:44%; transform:translate(-50%,-50%) translateY(24px) scale(.94);
    width:560px; background:#ececec; border-radius:26px; padding:28px;
    opacity:0; box-shadow: 0 30px 60px rgba(0,0,0,0.18);
    animation: cardIn 0.7s cubic-bezier(.2,.8,.2,1) forwards;
  }
  @keyframes cardIn { to { opacity:1; transform:translate(-50%,-50%) translateY(0) scale(1); } }
  .card-title { font-size:22px; font-weight:700; color:#9aa0a0; margin-bottom:18px; letter-spacing:.2px; }

  .row {
    display:flex; align-items:center; gap:16px; background:#fff; border-radius:16px; padding:16px 18px;
    margin-bottom:14px; opacity:0; transform:translateX(-16px);
    animation: rowIn 0.55s cubic-bezier(.2,.8,.2,1) forwards;
  }
  @keyframes rowIn { to { opacity:1; transform:translateX(0); } }

  .thumb { width:56px; height:56px; border-radius:12px; flex-shrink:0; }
  .row-title { font-size:19px; font-weight:700; color:#1f2d28; }
  .row-sub { display:flex; align-items:center; gap:8px; margin-top:8px; }
  .dot { width:12px; height:12px; border-radius:50%; }
  .bar { height:8px; border-radius:4px; background:#e2e2e2; flex:1; overflow:hidden; }
  .bar-fill { height:100%; border-radius:4px; width:0%; }

  .badge-pop { margin-left:auto; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; opacity:0; transform:scale(.3); }
  @keyframes badgePop { 0%{opacity:0; transform:scale(.3);} 60%{opacity:1; transform:scale(1.18);} 100%{opacity:1; transform:scale(1);} }

  .bottom-pill {
    position:absolute; left:64px; bottom:56px; display:flex; align-items:center; gap:14px;
    background:#fff; border-radius:40px; padding:16px 30px 16px 16px; opacity:0;
    transform:translateY(14px);
    animation: pillIn 0.6s cubic-bezier(.2,.8,.2,1) forwards;
    box-shadow: 0 16px 34px rgba(0,0,0,.22);
  }
  @keyframes pillIn { to { opacity:1; transform:translateY(0); } }
  .pill-icon { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; flex-shrink:0; }
  .pill-text { font-size:23px; font-weight:800; color:#173a24; white-space:nowrap; }

  .check-badge { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#e7f5ec; }
  .check-badge svg { width:24px; height:24px; }

  /* ---- scene 1: Virtual & Pan India ---- */
  .globe-wrap { position:relative; width:100%; height:300px; display:flex; align-items:center; justify-content:center; }
  .globe { position:relative; width:170px; height:170px; }
  .globe-circle {
    width:170px; height:170px; border-radius:50%;
    background: radial-gradient(circle at 35% 30%, #2f8c4c, #1e6f31 65%);
    box-shadow: 0 10px 24px rgba(0,0,0,.18);
    position:relative; overflow:hidden;
    opacity:0; transform:scale(.5);
    animation: globeIn .6s cubic-bezier(.2,.8,.2,1) .15s forwards;
  }
  @keyframes globeIn { to { opacity:1; transform:scale(1); } }
  .globe-circle svg { position:absolute; inset:0; width:100%; height:100%; }
  .globe-meridian { fill:none; stroke:rgba(255,255,255,.45); stroke-width:1.6; }
  .globe-emoji { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:64px; opacity:0; animation: fadeSimple .5s ease .5s forwards; }
  @keyframes fadeSimple { to { opacity:1; } }
  .pulse-ring { position:absolute; inset:0; border-radius:50%; border:3px solid #5fb397; opacity:0; animation: ringPulse 2.6s ease-out .9s infinite; }
  @keyframes ringPulse { 0%{opacity:.7; transform:scale(1);} 100%{opacity:0; transform:scale(1.55);} }
  .city { position:absolute; display:flex; align-items:center; gap:8px; background:#fff; border-radius:20px; padding:9px 16px 9px 12px;
    box-shadow:0 8px 16px rgba(0,0,0,.12); opacity:0; transform:scale(.5); }
  .city-dot { width:10px; height:10px; border-radius:50%; background:#f5a742; flex-shrink:0; }
  .city-name { font-size:15px; font-weight:800; color:#1f2d28; white-space:nowrap; }
  @keyframes cityPop { 0%{opacity:0; transform:scale(.4);} 65%{opacity:1; transform:scale(1.12);} 100%{opacity:1; transform:scale(1);} }
  @keyframes linkIn { to { opacity:1; } }
  .coverage-chip { display:flex; align-items:center; gap:8px; justify-content:center; margin-top:18px; padding:10px 16px; background:#e7f5ec; border-radius:14px; opacity:0; transform:translateY(10px); }
  .coverage-chip span { font-size:13px; font-weight:700; color:#1e6f31; }
  .c-delhi   { left:38px;  top:6px; }
  .c-mumbai  { left:-10px; top:150px; }
  .c-bglr    { left:60px;  top:250px; }
  .c-chennai { left:230px; top:230px; }
  .c-kolkata { left:280px; top:70px; }

  /* ---- scene 2: Real-World Projects ---- */
  .code-thumb { background:#173a24; display:flex; flex-direction:column; justify-content:center; gap:5px; padding:0 10px; }
  .code-thumb i { display:block; height:5px; border-radius:3px; background:#5fb397; }
  .code-thumb i:nth-child(2){ background:#f5a742; width:60%; }
  .code-thumb i:nth-child(3){ width:80%; }
  .bar-fill.p1 { animation: fillBar 1s ease .55s forwards; background:#5fb397; }
  .bar-fill.p2 { animation: fillBar 1s ease 1.25s forwards; background:#f5a742; }
  .bar-fill.p3 { animation: fillBar 1s ease 1.95s forwards; background:#4d9de0; }
  @keyframes fillBar { to { width:100%; } }
  .badge-pop.b1 { animation: badgePop .45s cubic-bezier(.2,.8,.2,1) 1.5s forwards; }
  .badge-pop.b2 { animation: badgePop .45s cubic-bezier(.2,.8,.2,1) 2.2s forwards; }
  .badge-pop.b3 { animation: badgePop .45s cubic-bezier(.2,.8,.2,1) 2.9s forwards; }
  .row1 { animation-delay:.1s; } .row2 { animation-delay:.35s; } .row3 { animation-delay:.6s; }

  /* ---- scene 3: Expert Mentorship ---- */
  .mentor-head { display:flex; align-items:center; gap:16px; margin-bottom:20px; opacity:0; transform:translateY(-10px);
    animation: rowIn .5s cubic-bezier(.2,.8,.2,1) .15s forwards; }
  .avatar { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,#4d9de0,#2c6ea6); display:flex; align-items:center; justify-content:center; font-size:30px; position:relative; flex-shrink:0; }
  .live-dot { position:absolute; right:-2px; bottom:-2px; width:18px; height:18px; border-radius:50%; background:#e05252; border:3px solid #ececec; }
  .mentor-name { font-size:19px; font-weight:800; color:#1f2d28; }
  .mentor-role { font-size:14px; color:#6c7873; font-weight:600; margin-top:2px; }
  .live-tag { margin-left:auto; background:#e05252; color:#fff; font-size:12px; font-weight:800; padding:6px 12px; border-radius:20px; letter-spacing:.5px; opacity:0;
    animation: livePulse 1.4s ease 1s infinite; }
  @keyframes livePulse { 0%,100%{opacity:.85; transform:scale(1);} 50%{opacity:1; transform:scale(1.06);} }
  .chat { background:#fff; border-radius:18px; padding:18px; }
  .bubble { max-width:78%; padding:12px 16px; border-radius:16px; font-size:15px; font-weight:600; margin-bottom:12px; opacity:0; transform:translateY(8px) scale(.9);
    animation: bubbleIn .45s cubic-bezier(.2,.8,.2,1) forwards; }
  @keyframes bubbleIn { to { opacity:1; transform:translateY(0) scale(1); } }
  .bubble.mentor { background:#eef2f1; color:#1f2d28; border-bottom-left-radius:4px; }
  .bubble.me { background:#1e6f31; color:#fff; margin-left:auto; border-bottom-right-radius:4px; }
  .dots-typing { display:inline-flex; gap:4px; background:#eef2f1; padding:14px 18px; border-radius:16px; border-bottom-left-radius:4px; opacity:0;
    animation: bubbleIn .4s ease forwards; }
  .dots-typing span { width:7px; height:7px; border-radius:50%; background:#9aa0a0; animation: typingDot 1s infinite ease-in-out; }
  .dots-typing span:nth-child(2){ animation-delay:.15s; }
  .dots-typing span:nth-child(3){ animation-delay:.3s; }
  @keyframes typingDot { 0%,60%,100%{ transform:translateY(0); opacity:.5;} 30%{ transform:translateY(-4px); opacity:1;} }

  /* ---- scene 4: Resume Guidance ---- */
  .resume-wrap { display:flex; gap:22px; }
  .resume-doc { flex:1; background:#fff; border-radius:16px; padding:20px; }
  .doc-name { height:16px; width:64%; border-radius:4px; background:#1f2d28; margin-bottom:8px; }
  .doc-role { height:9px; width:42%; border-radius:4px; background:#c8cdcb; margin-bottom:18px; }
  .doc-section { font-size:12px; font-weight:800; color:#9aa0a0; letter-spacing:.5px; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .doc-line { height:8px; border-radius:4px; background:#e6e6e6; margin-bottom:7px; width:0%; animation: lineFill .5s ease forwards; }
  @keyframes lineFill { to { width: var(--w); } }
  .sec-check { width:15px; height:15px; border-radius:50%; background:#e7f5ec; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(.3); flex-shrink:0; }
  .sec-check svg { width:9px; height:9px; }
  @keyframes checkPop { 0%{opacity:0; transform:scale(.3);} 60%{opacity:1; transform:scale(1.25);} 100%{opacity:1; transform:scale(1);} }
  .score-panel { width:170px; background:#fff; border-radius:16px; padding:20px 12px; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transform:translateX(14px);
    animation: rowIn .5s cubic-bezier(.2,.8,.2,1) 2.1s forwards; }
  .ring-wrap { position:relative; width:110px; height:110px; }
  .ring-wrap svg { width:100%; height:100%; transform:rotate(-90deg); }
  .ring-bg { fill:none; stroke:#e6e6e6; stroke-width:10; }
  .ring-fg { fill:none; stroke:#5fb397; stroke-width:10; stroke-linecap:round; stroke-dasharray:295; stroke-dashoffset:295; animation: ringFill 1.3s ease 2.4s forwards; }
  @keyframes ringFill { to { stroke-dashoffset:38; } }
  .ring-label { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:#1f2d28; }
  .score-text { margin-top:12px; font-size:14px; font-weight:800; color:#6c7873; text-align:center; }

  /* ---- scene 5: Verifiable Credentials ---- */
  .cert { background:#fff; border-radius:18px; padding:26px; position:relative; overflow:hidden; }
  .cert-ribbon { position:absolute; top:-4px; right:24px; width:46px; height:70px; background:#f5a742; border-radius:0 0 6px 6px; opacity:0; transform:translateY(-14px);
    animation: rowIn .5s cubic-bezier(.2,.8,.2,1) .15s forwards; }
  .cert-ribbon::after { content:""; position:absolute; bottom:-14px; left:0; border-left:23px solid transparent; border-right:23px solid transparent; border-top:14px solid #c9791f; }
  .cert-top { display:flex; align-items:center; gap:16px; opacity:0; transform:translateY(-8px); animation: rowIn .5s cubic-bezier(.2,.8,.2,1) .25s forwards; }
  .trophy-circle { width:60px; height:60px; border-radius:50%; background:#fff4e2; display:flex; align-items:center; justify-content:center; font-size:30px; flex-shrink:0; }
  .cert-org { font-size:13px; font-weight:800; color:#9aa0a0; letter-spacing:.4px; }
  .cert-title { font-size:21px; font-weight:800; color:#1f2d28; margin-top:2px; }
  .cert-name { margin-top:22px; font-size:15px; color:#6c7873; font-weight:600; opacity:0; animation: rowIn .5s ease .9s forwards; }
  .cert-name b { color:#1f2d28; font-size:19px; }
  .cert-bottom { display:flex; align-items:center; justify-content:space-between; margin-top:24px; padding-top:20px; border-top:2px dashed #e6e6e6; opacity:0;
    animation: rowIn .5s ease 1.3s forwards; }
  .qr { width:64px; height:64px; border-radius:8px; background:
    repeating-linear-gradient(0deg,#1f2d28 0 6px, transparent 6px 12px),
    repeating-linear-gradient(90deg,#1f2d28 0 6px, transparent 6px 12px);
    background-blend-mode:multiply; background-color:#fff; position:relative; }
  .qr::after { content:""; position:absolute; inset:6px; border:6px solid #1f2d28; border-radius:3px; background:#fff; }
  .verify-stamp { display:flex; align-items:center; gap:10px; background:#e7f5ec; padding:10px 18px; border-radius:30px; opacity:0; transform:scale(.6);
    animation: stampPop .5s cubic-bezier(.34,1.56,.64,1) 1.9s forwards; }
  @keyframes stampPop { to { opacity:1; transform:scale(1); } }
  .verify-stamp .check-circle { width:22px; height:22px; border-radius:50%; background:#1e6f31; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .verify-stamp .check-circle svg { width:13px; height:13px; }
  .verify-stamp span { font-weight:800; color:#1e6f31; font-size:15px; }

  /* ---- controls ---- */
  #dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:8px; z-index:5; }
  #dots div { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.35); cursor:pointer; transition:background .2s; }
  #dots div.active { background:#fff; }
</style>
</head>
<body>
<div id="outer">
  <div id="frame">
    <div id="stage-inner"><div class="stage" id="stageContent"></div></div>
    <div id="dots"></div>
  </div>
</div>

<script>
const scenes = [
{
  name: "Virtual & Pan India", duration: 5200, html: \`
  <div class="accent teal" style="width:20px;height:20px; left:400px; top:70px; animation-delay:.1s;"></div>
  <div class="accent orange" style="width:14px;height:14px; left:860px; top:110px; animation-delay:.6s;"></div>
  <div class="accent teal" style="width:12px;height:12px; left:920px; top:640px; animation-delay:1.1s;"></div>
  <div class="accent orange" style="width:18px;height:18px; left:250px; top:660px; animation-delay:1.6s;"></div>
  <div class="accent teal" style="width:10px;height:10px; left:760px; top:560px; animation-delay:2.1s;"></div>
  <div class="card" style="width:620px; padding-bottom:36px;">
    <div class="card-title">Live Network</div>
    <div class="globe-wrap">
      <div style="position:relative; width:340px; height:300px;">
        <div class="globe" style="position:absolute; left:85px; top:60px;">
          <div class="globe-circle">
            <svg viewBox="0 0 170 170">
              <ellipse class="globe-meridian" cx="85" cy="85" rx="70" ry="70"/>
              <ellipse class="globe-meridian" cx="85" cy="85" rx="30" ry="70"/>
              <line class="globe-meridian" x1="15" y1="85" x2="155" y2="85"/>
            </svg>
            <div class="globe-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="position:static; width:44px; height:44px;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
          </div>
          <div class="pulse-ring"></div>
        </div>
        <svg style="position:absolute; inset:0; width:100%; height:100%; overflow:visible;">
          <line x1="170" y1="145" x2="95" y2="35"  stroke="#bcd9c6" stroke-width="2.5" stroke-dasharray="5,5" style="opacity:0; animation: linkIn .4s ease .9s forwards;"/>
          <line x1="170" y1="145" x2="40" y2="175" stroke="#bcd9c6" stroke-width="2.5" stroke-dasharray="5,5" style="opacity:0; animation: linkIn .4s ease 1.15s forwards;"/>
          <line x1="170" y1="145" x2="105" y2="278" stroke="#bcd9c6" stroke-width="2.5" stroke-dasharray="5,5" style="opacity:0; animation: linkIn .4s ease 1.4s forwards;"/>
          <line x1="170" y1="145" x2="270" y2="252" stroke="#bcd9c6" stroke-width="2.5" stroke-dasharray="5,5" style="opacity:0; animation: linkIn .4s ease 1.65s forwards;"/>
          <line x1="170" y1="145" x2="315" y2="95"  stroke="#bcd9c6" stroke-width="2.5" stroke-dasharray="5,5" style="opacity:0; animation: linkIn .4s ease 1.9s forwards;"/>
        </svg>
        <div class="city c-delhi"   style="animation: cityPop .5s cubic-bezier(.2,.8,.2,1) .9s forwards;"><span class="city-dot"></span><span class="city-name">Delhi</span></div>
        <div class="city c-mumbai"  style="animation: cityPop .5s cubic-bezier(.2,.8,.2,1) 1.15s forwards;"><span class="city-dot"></span><span class="city-name">Mumbai</span></div>
        <div class="city c-bglr"    style="animation: cityPop .5s cubic-bezier(.2,.8,.2,1) 1.4s forwards;"><span class="city-dot"></span><span class="city-name">Bengaluru</span></div>
        <div class="city c-chennai" style="animation: cityPop .5s cubic-bezier(.2,.8,.2,1) 1.65s forwards;"><span class="city-dot"></span><span class="city-name">Chennai</span></div>
        <div class="city c-kolkata" style="animation: cityPop .5s cubic-bezier(.2,.8,.2,1) 1.9s forwards;"><span class="city-dot"></span><span class="city-name">Kolkata</span></div>
      </div>
    </div>
    <div class="coverage-chip" style="animation: rowIn .5s cubic-bezier(.2,.8,.2,1) 2.2s forwards;">
      <svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;flex-shrink:0;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>All 28 states &middot; 500+ cities covered across India</span>
    </div>
  </div>
  <div class="bottom-pill" style="animation-delay:2.5s;">
    <div class="pill-icon" style="background:#e7f5ec;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
    <div class="pill-text">Virtual &amp; Pan India</div>
  </div>\` },

{
  name: "Real-World Projects", duration: 4800, html: \`
  <div class="accent teal" style="width:16px;height:16px; left:940px; top:90px; animation-delay:.2s;"></div>
  <div class="accent orange" style="width:12px;height:12px; left:280px; top:70px; animation-delay:.8s;"></div>
  <div class="accent teal" style="width:10px;height:10px; left:180px; top:640px; animation-delay:1.3s;"></div>
  <div class="accent orange" style="width:18px;height:18px; left:970px; top:600px; animation-delay:1.8s;"></div>
  <div class="card" style="width:600px;">
    <div class="card-title">My Projects</div>
    <div class="row row1">
      <div class="thumb code-thumb"><i></i><i></i><i></i></div>
      <div style="flex:1;">
        <div class="row-title">E-commerce Website</div>
        <div class="row-sub"><div class="dot" style="background:#5fb397;"></div><div class="bar"><div class="bar-fill p1"></div></div></div>
      </div>
      <div class="badge-pop b1"><div class="check-badge"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div></div>
    </div>
    <div class="row row2">
      <div class="thumb code-thumb"><i></i><i></i><i></i></div>
      <div style="flex:1;">
        <div class="row-title">Data Analysis Dashboard</div>
        <div class="row-sub"><div class="dot" style="background:#f5a742;"></div><div class="bar"><div class="bar-fill p2"></div></div></div>
      </div>
      <div class="badge-pop b2"><div class="check-badge"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div></div>
    </div>
    <div class="row row3" style="margin-bottom:0;">
      <div class="thumb code-thumb"><i></i><i></i><i></i></div>
      <div style="flex:1;">
        <div class="row-title">Mobile App UI Kit</div>
        <div class="row-sub"><div class="dot" style="background:#4d9de0;"></div><div class="bar"><div class="bar-fill p3"></div></div></div>
      </div>
      <div class="badge-pop b3"><div class="check-badge"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div></div>
    </div>
  </div>
  <div class="bottom-pill" style="animation-delay:3.15s;">
    <div class="pill-icon" style="background:#e7f5ec;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
    <div class="pill-text">Real-World Projects</div>
  </div>\` },

{
  name: "Expert Mentorship", duration: 4400, html: \`
  <div class="accent teal" style="width:14px;height:14px; left:250px; top:100px; animation-delay:.3s;"></div>
  <div class="accent orange" style="width:18px;height:18px; left:960px; top:130px; animation-delay:.9s;"></div>
  <div class="accent teal" style="width:10px;height:10px; left:940px; top:640px; animation-delay:1.5s;"></div>
  <div class="accent orange" style="width:12px;height:12px; left:220px; top:660px; animation-delay:2s;"></div>
  <div class="card" style="width:560px;">
    <div class="mentor-head">
      <div class="avatar"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:30px;height:30px;"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg><div class="live-dot"></div></div>
      <div>
        <div class="mentor-name">Rohan Mehta</div>
        <div class="mentor-role">Senior Product Engineer &middot; Mentor</div>
      </div>
      <div class="live-tag">&#9679; LIVE</div>
    </div>
    <div class="chat">
      <div class="bubble mentor" style="animation-delay:.7s;">Great progress on your last module!</div>
      <div class="bubble me" style="animation-delay:1.4s;">Thank you! Can we review my project?</div>
      <div class="dots-typing" style="animation-delay:2.0s;"><span></span><span></span><span></span></div>
    </div>
  </div>
  <div class="bottom-pill" style="animation-delay:2.9s;">
    <div class="pill-icon" style="background:#e7f5ec;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg></div>
    <div class="pill-text">Expert Mentorship</div>
  </div>\` },

{
  name: "Resume Guidance", duration: 5000, html: \`
  <div class="accent teal" style="width:16px;height:16px; left:270px; top:90px; animation-delay:.2s;"></div>
  <div class="accent orange" style="width:12px;height:12px; left:950px; top:110px; animation-delay:.8s;"></div>
  <div class="accent teal" style="width:10px;height:10px; left:930px; top:650px; animation-delay:1.4s;"></div>
  <div class="accent orange" style="width:16px;height:16px; left:230px; top:660px; animation-delay:2s;"></div>
  <div class="card" style="width:640px;">
    <div class="card-title">Resume Builder</div>
    <div class="resume-wrap">
      <div class="resume-doc">
        <div class="doc-name"></div>
        <div class="doc-role"></div>
        <div class="doc-section"><div class="sec-check" style="animation: checkPop .4s ease .5s forwards;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div>SUMMARY</div>
        <div class="doc-line" style="--w:92%; animation-delay:.55s;"></div>
        <div class="doc-line" style="--w:70%; animation-delay:.7s; margin-bottom:16px;"></div>
        <div class="doc-section"><div class="sec-check" style="animation: checkPop .4s ease 1.1s forwards;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div>EXPERIENCE</div>
        <div class="doc-line" style="--w:88%; animation-delay:1.15s;"></div>
        <div class="doc-line" style="--w:80%; animation-delay:1.3s;"></div>
        <div class="doc-line" style="--w:60%; animation-delay:1.45s; margin-bottom:16px;"></div>
        <div class="doc-section"><div class="sec-check" style="animation: checkPop .4s ease 1.75s forwards;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div>SKILLS</div>
        <div class="doc-line" style="--w:50%; animation-delay:1.8s;"></div>
      </div>
      <div class="score-panel">
        <div class="ring-wrap">
          <svg viewBox="0 0 110 110">
            <circle class="ring-bg" cx="55" cy="55" r="47"/>
            <circle class="ring-fg" cx="55" cy="55" r="47"/>
          </svg>
          <div class="ring-label">92</div>
        </div>
        <div class="score-text">Resume<br/>Score</div>
      </div>
    </div>
  </div>
  <div class="bottom-pill" style="animation-delay:3.15s;">
    <div class="pill-icon" style="background:#e7f5ec;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg></div>
    <div class="pill-text">Resume Guidance</div>
  </div>\` },

{
  name: "Verifiable Credentials", duration: 4600, html: \`
  <div class="accent teal" style="width:16px;height:16px; left:280px; top:100px; animation-delay:.3s;"></div>
  <div class="accent orange" style="width:12px;height:12px; left:940px; top:90px; animation-delay:.9s;"></div>
  <div class="accent teal" style="width:10px;height:10px; left:950px; top:650px; animation-delay:1.5s;"></div>
  <div class="accent orange" style="width:18px;height:18px; left:240px; top:660px; animation-delay:2.1s;"></div>
  <div class="card" style="width:540px;">
    <div class="cert">
      <div class="cert-ribbon"></div>
      <div class="cert-top">
        <div class="trophy-circle"><svg viewBox="0 0 24 24" fill="none" stroke="#c9791f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a2 2 0 0 0 0 4h3"/><path d="M17 5h3a2 2 0 0 1 0 4h-3"/></svg></div>
        <div>
          <div class="cert-org">CERTIFICATE OF COMPLETION</div>
          <div class="cert-title">Full-Stack Development</div>
        </div>
      </div>
      <div class="cert-name">Awarded to <b>Ananya Sharma</b></div>
      <div class="cert-bottom">
        <div class="qr"></div>
        <div class="verify-stamp">
          <div class="check-circle"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,13 9,18 20,6"/></svg></div>
          <span>Blockchain Verified</span>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom-pill" style="animation-delay:2.7s;">
    <div class="pill-icon" style="background:#e7f5ec;"><svg viewBox="0 0 24 24" fill="none" stroke="#1e6f31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a2 2 0 0 0 0 4h3"/><path d="M17 5h3a2 2 0 0 1 0 4h-3"/></svg></div>
    <div class="pill-text">Verifiable Credentials</div>
  </div>\` }
];

const stageInner = document.getElementById('stage-inner');
const stageContent = document.getElementById('stageContent');
const dotsWrap = document.getElementById('dots');
let idx = 0, timer = null;

scenes.forEach((s, i) => {
  const d = document.createElement('div');
  d.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(d);
});

function render(i) {
  stageContent.innerHTML = scenes[i].html;
  [...dotsWrap.children].forEach((d, j) => d.classList.toggle('active', j === i));
}

function next() {
  stageInner.classList.add('fading');
  setTimeout(() => {
    idx = (idx + 1) % scenes.length;
    render(idx);
    stageInner.classList.remove('fading');
    timer = setTimeout(next, scenes[idx].duration);
  }, 250);
}

function goTo(i) {
  clearTimeout(timer);
  stageInner.classList.add('fading');
  setTimeout(() => {
    idx = i;
    render(idx);
    stageInner.classList.remove('fading');
    timer = setTimeout(next, scenes[idx].duration);
  }, 250);
}

function fitStage() {
  const frame = document.getElementById('frame');
  const scale = frame.clientWidth / 1200;
  stageInner.style.transform = \`scale(\${scale})\`;
}
window.addEventListener('resize', fitStage);
fitStage();

render(0);
timer = setTimeout(next, scenes[0].duration);
</script>
</body>
</html>
`;

export function OpportunityShortlistDemo() {
  return (
    <iframe
      title="EduBridge program highlights: pan-India reach, real-world projects, mentorship, resume guidance, and verifiable credentials"
      srcDoc={SRC}
      loading="lazy"
      scrolling="no"
      className="mx-auto block w-full max-w-[1400px] aspect-[3/2] border-0 bg-transparent"
    />
  );
}
