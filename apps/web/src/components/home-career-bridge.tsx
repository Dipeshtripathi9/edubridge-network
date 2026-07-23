'use client';

import { useEffect, useRef, useState } from 'react';

// "A career bridge, not a cliff edge" — community + product-tour section,
// embedded in an isolated iframe (like HomeAdmissionDesk) so its CSS/JS
// can't collide with the app. Reports its own height via postMessage so
// the iframe never clips or over-reserves space.
const SRC = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EduBridge — A Career Bridge</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>

  :root{
    --ink:      #12213B;
    --parchment:#F7F3EC;
    --panel:    #FFFFFF;
    --amber:    #E8A23D;
    --amber-deep:#C97F1F;
    --teal:     #2F7A72;
    --coral:    #E1654B;
    --line:     rgba(18,33,59,0.14);
    --muted:    #5C6478;

    --display: 'Fraunces', serif;
    --body:    'Inter', -apple-system, sans-serif;
    --mono:    'JetBrains Mono', monospace;
  }

  *{ box-sizing:border-box; }

  body{
    margin:0;
    background:var(--parchment);
    font-family:var(--body);
    color:var(--ink);
    -webkit-font-smoothing:antialiased;
  }

  .section{
    position:relative;
    max-width:1180px;
    margin:0 auto;
    padding:104px 32px 96px;
    overflow:hidden;
  }

  /* texture: faint dot grid, quiet */
  .section::before{
    content:"";
    position:absolute;
    inset:0;
    background-image: radial-gradient(var(--line) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse 60% 50% at 50% 20%, black, transparent 75%);
    pointer-events:none;
  }

  /* ---------- header ---------- */
  .comm-header{
    position:relative;
    text-align:center;
    max-width:640px;
    margin:0 auto 88px;
  }

  .eyebrow{
    display:inline-flex;
    align-items:center;
    gap:8px;
    font-family:var(--mono);
    font-size:12px;
    letter-spacing:.14em;
    text-transform:uppercase;
    color:var(--amber-deep);
    background:rgba(232,162,61,0.12);
    border:1px solid rgba(232,162,61,0.35);
    padding:6px 14px;
    border-radius:100px;
    margin-bottom:22px;
  }
  .eyebrow svg{ width:12px; height:12px; }

  .comm-header h2{
    font-family:var(--display);
    font-weight:600;
    font-size:clamp(2.4rem, 5vw, 3.6rem);
    line-height:1.05;
    letter-spacing:-0.01em;
    margin:0 0 20px;
  }
  .comm-header h2 em{
    font-style:italic;
    font-weight:500;
    color:var(--teal);
  }

  .comm-header p{
    font-size:17px;
    line-height:1.6;
    color:var(--muted);
    margin:0;
  }
  .comm-header p strong{ color:var(--ink); font-weight:600; }

  /* ---------- stage: phone + floating student badges ---------- */
  .stage{
    position:relative;
    height:620px;
    display:flex;
    align-items:flex-end;
    justify-content:center;
    margin-bottom:12px;
  }

  .bridge-svg{
    position:absolute;
    top:0;
    left:50%;
    transform:translateX(-50%);
    width:100%;
    max-width:920px;
    height:100%;
    z-index:1;
    pointer-events:none;
  }

  .phone{
    position:relative;
    z-index:3;
    width:250px;
    height:508px;
    background:var(--ink);
    border-radius:38px;
    padding:10px;
    box-shadow:
      0 30px 60px -20px rgba(18,33,59,0.35),
      0 0 0 1px rgba(18,33,59,0.06);
    transform: rotate(-4deg);
    animation: phone-drift 9s ease-in-out infinite;
  }

  @keyframes phone-drift{
    0%,100%{ transform: rotate(-4deg) translateY(0); }
    50%{ transform: rotate(-2.6deg) translateY(-6px); }
  }

  .phone::after{
    content:"";
    position:absolute;
    top:24px; left:50%;
    transform:translateX(-50%);
    width:66px; height:6px;
    background:rgba(255,255,255,0.18);
    border-radius:4px;
  }

  .phone-screen{
    width:100%;
    height:100%;
    background:linear-gradient(180deg,#17294a, #12213B 40%);
    border-radius:28px;
    overflow:hidden;
    display:flex;
    flex-direction:column;
    position:relative;
  }

  .app-topbar{
    display:flex;
    align-items:center;
    padding:16px 14px 12px;
    color:#fff;
    border-bottom:1px solid rgba(255,255,255,0.08);
  }
  .app-nav-ic{
    width:20px; height:20px; flex:0 0 auto;
    display:flex; align-items:center; justify-content:center;
    color:#fff; opacity:0.9;
  }
  .app-nav-ic svg{ width:15px; height:15px; }
  .app-brand{
    flex:1;
    display:flex;
    flex-direction:column;
    align-items:center;
    line-height:1;
  }
  .app-brand-row{ display:flex; align-items:center; gap:5px; }
  .app-brand-mark{
    width:16px; height:16px; border-radius:50%;
    background:#4F46E5;
    display:flex; align-items:center; justify-content:center;
    flex:0 0 auto;
  }
  .app-brand-mark svg{ width:9px; height:9px; }
  .app-brand-name{
    font-family:var(--body); font-weight:800; font-size:11px;
    letter-spacing:.02em; text-transform:uppercase; color:#fff;
  }
  .app-brand-sub{
    font-family:var(--body); font-weight:600; font-size:6.5px;
    letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,0.55);
    margin-top:2px;
  }
  .app-nav-icons{ display:flex; align-items:center; gap:9px; flex:0 0 auto; }
  .app-nav-icons svg{ width:14px; height:14px; color:#fff; opacity:0.9; }

  .app-feature{ flex:1; display:flex; flex-direction:column; padding:2px 14px 20px; min-height:0; }
  .app-photo{
    position:relative;
    border-radius:14px; overflow:hidden; height:148px; flex:0 0 auto; margin-bottom:12px;
    border:1px solid rgba(255,255,255,0.14);
    box-shadow:0 10px 20px -8px rgba(0,0,0,0.4);
  }
  .app-photo img{ width:100%; height:100%; object-fit:cover; display:block; }
  .app-photo::after{
    content:"";
    position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(23,41,74,0) 65%, rgba(18,33,59,0.5) 100%);
  }
  .app-feature-text{
    font-family:var(--body); font-size:11.3px; line-height:1.5;
    color:#E3E8F2; margin:0 0 14px;
  }
  .app-feature-actions{ display:flex; flex-direction:column; gap:8px; margin-top:auto; }
  .app-btn{
    font-family:var(--body); font-weight:700; font-size:11.5px;
    padding:9px 12px; border-radius:9px; border:none; cursor:default;
  }
  .app-btn.dark{ background:var(--ink); color:#fff; }
  .app-btn.ghost{ background:#F1F3EC; color:var(--ink); }
  .app-btn.amber{ background:var(--amber); color:#3A2600; }
  .app-btn.full{
    width:100%; border-radius:100px; padding:11px 14px;
    display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .app-btn.full svg{ width:12px; height:12px; flex:0 0 auto; }

  /* ---------- floating student badges: avatar + bold pill ---------- */
  .bubble{
    position:absolute;
    z-index:4;
    display:flex;
    align-items:center;
    gap:10px;
    animation: float 11s ease-in-out infinite;
  }
  .bubble .avatar{
    width:56px; height:56px;
    border-radius:100%;
    flex:none;
    overflow:hidden;
    background:var(--panel);
    border:3px solid transparent;
    box-shadow:0 10px 22px -8px rgba(18,33,59,0.35), 0 0 0 4px var(--parchment);
  }
  .bubble .avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
  .bubble .tag-label{
    display:inline-flex;
    align-items:center;
    font-family:var(--body);
    font-weight:800;
    font-size:12px;
    letter-spacing:.01em;
    white-space:nowrap;
    color:#fff;
    padding:9px 16px;
    border-radius:100px;
    box-shadow:0 8px 18px -6px rgba(18,33,59,0.35);
  }

  .b1{ top:4%;  left:0%;  animation-duration:10.5s; }
  .b1 .avatar{ border-color:var(--coral); }
  .b1 .tag-label{ background:var(--coral); }

  .b2{ top:28%; left:1%; animation-delay:.6s; animation-duration:12.5s; }
  .b2 .avatar{ border-color:var(--teal); }
  .b2 .tag-label{ background:var(--teal); }

  .b3{ bottom:16%; left:2%; animation-delay:1.2s; animation-duration:9.5s; }
  .b3 .avatar{ border-color:var(--ink); }
  .b3 .tag-label{ background:var(--ink); }

  .b4{ top:0%; right:2%; animation-delay:.3s; flex-direction:row-reverse; animation-duration:13s; }
  .b4 .avatar{ border-color:var(--amber-deep); }
  .b4 .tag-label{ background:var(--amber-deep); }

  .b5{ top:32%; right:1%; animation-delay:.9s; flex-direction:row-reverse; animation-duration:10s; }
  .b5 .avatar{ border-color:#7A5FB0; }
  .b5 .tag-label{ background:#7A5FB0; }

  /* Slow, organic multi-axis drift (not just up/down) so each badge feels
     like it's gently floating in its own orbit, rather than bouncing in sync. */
  @keyframes float{
    0%,100%{ transform:translate(0,0); }
    22%{ transform:translate(7px,-11px); }
    48%{ transform:translate(-6px,-17px); }
    74%{ transform:translate(-10px,-5px); }
  }

  /* ---------- cta row ---------- */
  .cta-row{
    text-align:center;
    margin: 16px 0 100px;
  }
  .cta-row h3{
    font-family:var(--display);
    font-weight:600;
    font-size:clamp(1.7rem,3vw,2.2rem);
    margin:0 0 14px;
  }
  .cta-row p{
    max-width:520px;
    margin:0 auto 30px;
    color:var(--muted);
    font-size:16px;
    line-height:1.6;
  }
  .btn-primary{
    display:inline-flex;
    align-items:center;
    gap:8px;
    font-family:var(--body);
    font-weight:600;
    font-size:14.5px;
    color:#fff;
    background:var(--ink);
    border:none;
    padding:15px 26px;
    border-radius:100px;
    cursor:pointer;
    transition:transform .18s ease, box-shadow .18s ease;
    box-shadow:0 12px 24px -10px rgba(18,33,59,0.4);
  }
  .btn-primary:hover{ transform:translateY(-2px); }
  .btn-primary svg{ width:14px; height:14px; }

  /* ---------- reels row : animated product-demo screens ---------- */
  .reels{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:22px;
    max-width:800px;
    margin:0 auto 96px;
  }
  .reel{
    position:relative;
    aspect-ratio:9/16;
    border-radius:24px;
    overflow:hidden;
    box-shadow:0 20px 40px -16px rgba(18,33,59,0.3);
    background:var(--ink);
  }
  .reel .notch{
    position:absolute; top:9px; left:50%; transform:translateX(-50%);
    width:40px; height:5px; border-radius:4px; background:rgba(255,255,255,0.28);
    z-index:5;
  }
  .reel .caption{
    position:absolute; left:12px; right:12px; bottom:10px;
    color:#fff; font-family:var(--body); font-size:11.5px; font-weight:600;
    z-index:5;
    text-shadow:0 2px 8px rgba(0,0,0,0.35);
  }

  /* mini phone "screen" that plays a looping storyboard */
  .demo-screen{
    position:absolute;
    inset:0;
    padding-top:22px;
  }
  .demo-frame{
    position:absolute;
    inset:22px 0 0 0;
    padding:10px 10px 40px;
    opacity:0;
    transform:translateY(6px);
    transition:opacity .45s ease, transform .45s ease;
  }
  .demo-frame.active{ opacity:1; transform:translateY(0); }

  /* r1 — choose your college */
  .r1{ background:#F1F3EC; }
  .r1 .notch{ background:rgba(18,33,59,0.2); }
  .r2{ background:linear-gradient(180deg,#3a2410,var(--ink) 55%); }
  .r3{ background:linear-gradient(180deg,#1c2f4a,var(--ink) 55%); }

  .d-card{
    background:#fff;
    border-radius:12px;
    padding:9px 10px 10px;
    box-shadow:0 8px 18px -8px rgba(0,0,0,0.35);
  }
  .d-search{
    display:flex; align-items:center; gap:6px;
    background:#fff; border-radius:100px;
    padding:7px 9px; margin-bottom:8px;
  }
  .d-search svg{ width:10px; height:10px; flex:0 0 auto; }
  .d-search .txt{
    font-family:var(--mono); font-size:8.5px; color:var(--ink);
    white-space:nowrap; overflow:hidden; border-right:1px solid var(--ink);
    animation: typecaret 1s steps(1) infinite;
  }
  @keyframes typecaret{ 50%{ border-color:transparent; } }

  .d-chips{ display:flex; gap:5px; margin-bottom:9px; }
  .d-chip{
    font-family:var(--body); font-size:8px; font-weight:600;
    padding:4px 8px; border-radius:100px;
    background:rgba(255,255,255,0.14); color:#fff;
  }
  .d-chip.on{ background:var(--teal); color:#fff; }

  .d-row{ display:flex; gap:8px; align-items:center; }
  .d-dial{ position:relative; width:34px; height:34px; flex:0 0 auto; }
  .d-dial svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .d-dial .trk{ fill:none; stroke:#EDEBE4; stroke-width:4; }
  .d-dial .fil{ fill:none; stroke:var(--teal); stroke-width:4; stroke-linecap:round;
    stroke-dasharray:88; stroke-dashoffset:88; transition:stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1); }
  .d-dial.go .fil{ stroke-dashoffset:8; }
  .d-dial .num{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    font-family:var(--mono); font-size:7.5px; font-weight:600; color:var(--ink); }
  .d-name{ font-family:var(--display); font-weight:600; font-size:10.5px; color:var(--ink); margin:0 0 2px; line-height:1.2; }
  .d-loc{ font-family:var(--body); font-size:8px; color:var(--muted); margin:0 0 5px; }
  .d-tags{ display:flex; gap:4px; }
  .d-tag{ font-size:7px; font-weight:700; padding:2px 6px; border-radius:5px; background:rgba(47,122,114,0.12); color:var(--teal); }
  .d-tag.v{ background:#EAF1FB; color:#2857A6; }

  /* r2 — scholarship */
  .d-banner{
    background:linear-gradient(135deg,#1c3a52,var(--ink));
    border-radius:12px; padding:10px; display:flex; gap:8px; align-items:center; margin-bottom:9px;
  }
  .d-banner .ic{ width:22px;height:22px;border-radius:6px;background:var(--amber); flex:0 0 auto;
    display:flex;align-items:center;justify-content:center; }
  .d-banner .ic svg{ width:11px; height:11px; }
  .d-banner .tt{ font-family:var(--display); font-weight:600; font-size:8.5px; color:#fff; margin:0 0 1px; }
  .d-banner .dd{ font-family:var(--body); font-size:6.8px; color:#C9D4E0; line-height:1.3; }
  .d-amt{ display:flex; align-items:center; gap:6px; background:rgba(47,122,114,0.1); border-radius:8px; padding:6px 8px; margin-bottom:8px; }
  .d-amt .n{ font-family:var(--mono); font-weight:600; font-size:11px; color:var(--teal); }
  .d-amt .l{ font-family:var(--body); font-size:6.8px; color:#3d7a68; }
  .d-verified{ display:inline-flex; align-items:center; gap:3px; font-size:7px; font-weight:700; color:#2857A6; background:#EAF1FB; padding:2px 6px; border-radius:5px; margin-bottom:8px; }
  .d-apply{
    display:inline-flex; align-items:center; justify-content:center; gap:4px;
    width:100%; background:var(--amber); color:#3A2600; font-family:var(--body);
    font-size:9px; font-weight:700; padding:7px 0; border-radius:8px;
  }
  .d-apply.pulse{ animation: pulse 1.1s ease; }
  @keyframes pulse{ 0%{ box-shadow:0 0 0 0 rgba(232,162,61,0.55);} 70%{ box-shadow:0 0 0 8px rgba(232,162,61,0);} 100%{ box-shadow:0 0 0 0 rgba(232,162,61,0);} }

  /* r3 — internships */
  .d-upload{ text-align:center; padding:14px 8px; }
  .d-upload .ic{ width:26px;height:26px;border-radius:8px;background:var(--amber); margin:0 auto 8px; display:flex; align-items:center; justify-content:center; }
  .d-upload .ic svg{ width:13px; height:13px; }
  .d-upload .t{ font-family:var(--body); font-weight:700; font-size:9px; color:var(--ink); margin:0 0 3px; }
  .d-upload .d{ font-family:var(--body); font-size:7px; color:var(--muted); line-height:1.35; margin:0 0 10px; }
  .d-track{ height:4px; background:#E3E0D6; border-radius:100px; overflow:hidden; }
  .d-fill{ height:100%; width:0%; background:var(--teal); border-radius:100px; transition:width 1.4s cubic-bezier(.4,0,.2,1); }
  .d-fill.go{ width:100%; }
  .d-ptxt{ font-family:var(--mono); font-size:6.8px; color:var(--muted); margin-top:6px; }

  .d-icard-top{ display:flex; gap:7px; align-items:flex-start; margin-bottom:6px; }
  .d-co{ width:20px;height:20px;border-radius:6px; background:var(--teal); flex:0 0 auto;
    display:flex;align-items:center;justify-content:center; font-family:var(--display); font-weight:600; color:#fff; font-size:9px; }
  .d-role{ font-family:var(--display); font-weight:600; font-size:9.5px; color:var(--ink); margin:0; line-height:1.2; }
  .d-cox{ font-family:var(--body); font-size:7.5px; color:var(--muted); margin:0; }
  .d-paytag{ font-size:6.5px; font-weight:700; padding:2px 6px; border-radius:5px; background:rgba(47,122,114,0.12); color:var(--teal); text-transform:uppercase; margin-right:4px; }
  .d-real{ display:flex; align-items:center; gap:3px; font-size:6.8px; font-weight:600; color:var(--amber-deep); margin:6px 0; }
  .d-real svg{ width:8px; height:8px; }

  /* ---------- Reel 1: full mini-app recreation ---------- */
  .mini-app{
    position:absolute; inset:0;
    padding-top:20px;
    display:flex; flex-direction:column;
    color:var(--ink);
  }
  .mini-status{
    flex:0 0 auto;
    display:flex; justify-content:space-between; align-items:center;
    padding:2px 12px 4px;
    font-family:var(--body); font-weight:700; font-size:8px; color:var(--ink);
  }
  .mini-viewport{ position:relative; flex:1; overflow:hidden; }
  .mview{
    position:absolute; inset:0;
    overflow:hidden;
    padding:0 11px 8px;
    opacity:0;
    pointer-events:none;
    transition:opacity .3s ease;
  }
  .mview.active{ opacity:1; pointer-events:auto; }

  .mini-topbar{ display:flex; align-items:center; gap:5px; padding:3px 0 7px; }
  .mini-mark{ width:13px; height:13px; border-radius:4px; background:var(--ink); position:relative; flex:0 0 auto; }
  .mini-mark::before{ content:""; position:absolute; inset:3px; border-radius:2px; background:var(--amber); }
  .mini-brand{ font-family:var(--display); font-weight:600; font-size:9.5px; }
  .mini-brand b{ color:var(--teal); font-weight:600; }

  .mini-eyebrow{ font-family:var(--body); font-size:6px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin:0 0 3px; }
  .mini-head{ font-family:var(--display); font-weight:600; font-size:9.5px; line-height:1.25; margin:0 0 7px; }

  .mini-search{
    display:flex; align-items:center; gap:5px;
    background:#fff; border:1px solid var(--line); border-radius:9px;
    padding:6px 8px; margin-bottom:7px;
  }
  .mini-search svg{ width:9px; height:9px; flex:0 0 auto; }
  .mini-search-txt{
    font-family:var(--body); font-size:7px; color:var(--ink);
    border-right:1px solid var(--ink); white-space:nowrap; overflow:hidden;
    animation:typecaret 1s steps(1) infinite;
  }

  .mini-chips{ display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }
  .mchip{
    flex:0 0 auto; font-family:var(--body); font-size:6.3px; font-weight:600;
    padding:4px 7px; border-radius:100px; border:1px solid var(--line);
    background:#fff; color:var(--muted); white-space:nowrap;
    transition:background .25s ease, color .25s ease, border-color .25s ease;
  }
  .mchip.active{ background:var(--ink); color:#fff; border-color:var(--ink); }

  .mini-list{
    display:flex; flex-direction:column; gap:7px;
    -webkit-mask-image:linear-gradient(to bottom, black 82%, transparent 100%);
    mask-image:linear-gradient(to bottom, black 82%, transparent 100%);
  }
  .mcard{
    background:#fff; border:1px solid var(--line); border-radius:11px; padding:8px;
    display:flex; gap:7px;
  }
  .m-dial{ position:relative; width:26px; height:26px; flex:0 0 auto; }
  .m-dial svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .m-dial .trk{ fill:none; stroke:#EDEBE4; stroke-width:3.5; }
  .m-dial .fil{ fill:none; stroke:var(--teal); stroke-width:3.5; stroke-linecap:round; }
  .m-dial .num{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:5.6px; font-weight:600; }
  .m-main{ flex:1; min-width:0; }
  .m-name{ font-family:var(--display); font-weight:600; font-size:7.6px; line-height:1.2; margin:0 0 1px; }
  .m-loc{ font-family:var(--body); font-size:6.2px; color:var(--muted); margin:0 0 4px; }
  .m-tags{ display:flex; gap:3px; margin-bottom:5px; }
  .m-tag{ font-size:5.4px; font-weight:700; padding:2px 5px; border-radius:4px; background:rgba(47,122,114,0.12); color:var(--teal); }
  .m-tag.v{ background:#EAF1FB; color:#2857A6; }
  .m-actions{ display:flex; gap:4px; }
  .m-btn{
    font-family:var(--body); font-size:5.8px; font-weight:700;
    padding:3.5px 6px; border-radius:6px; border:none; cursor:default;
    transition:background .25s ease, color .25s ease;
  }
  .m-btn-dark{ background:var(--ink); color:#fff; }
  .m-btn-dark.done{ background:var(--teal); }
  .m-btn-ghost{ background:#F1F3EC; color:var(--ink); border:1px solid var(--line); }
  .m-btn-amber{ background:var(--amber); color:#3A2600; }

  /* shortlist view */
  .m-banner{
    display:flex; gap:7px; align-items:center;
    background:linear-gradient(135deg,#1c3a52,var(--ink)); border-radius:11px; padding:9px; margin:6px 0 8px;
  }
  .m-banner .ic{ width:19px;height:19px;border-radius:6px;background:var(--amber); flex:0 0 auto; display:flex; align-items:center; justify-content:center; }
  .m-banner .ic svg{ width:9px; height:9px; }
  .m-banner .t{ font-family:var(--display); font-weight:600; font-size:7px; color:#fff; margin:0 0 1px; }
  .m-banner .d{ font-family:var(--body); font-size:5.6px; color:#C9D4E0; line-height:1.35; }

  .m-sccard{ background:#fff; border:1px solid var(--line); border-radius:11px; padding:8px; margin-bottom:7px; }
  .m-sccard .top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1px; }
  .m-sccard .name{ font-family:var(--display); font-weight:600; font-size:7.6px; margin:0; }
  .m-sccard .loc{ font-family:var(--body); font-size:6px; color:var(--muted); margin:0 0 5px; }
  .m-sccard .sch{
    font-family:var(--mono); font-size:6px; color:var(--teal); background:rgba(47,122,114,0.1);
    border-radius:6px; padding:5px 7px; margin-bottom:6px;
  }
  .m-dial-sm{ position:relative; width:22px; height:22px; }
  .m-dial-sm svg{ width:100%; height:100%; transform:rotate(-90deg); }

  /* guide overlay */
  .moverlay{
    position:absolute; inset:0;
    background:#F1F3EC;
    padding:0 11px 8px;
    transform:translateX(100%);
    transition:transform .4s cubic-bezier(.4,0,.2,1);
    overflow:hidden;
    z-index:6;
  }
  .moverlay.open{ transform:translateX(0); }
  .mov-header{ display:flex; align-items:center; gap:7px; padding:5px 0 8px; }
  .mov-back{ width:16px; height:16px; border-radius:5px; background:#fff; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
  .mov-back svg{ width:8px; height:8px; }
  .mov-college{ font-family:var(--body); font-size:5.6px; font-weight:600; color:var(--muted); margin:0; }
  .mov-title{ font-family:var(--display); font-weight:600; font-size:8.5px; margin:0; }
  .mov-hero{ display:flex; gap:8px; align-items:center; background:#fff; border:1px solid var(--line); border-radius:11px; padding:9px; margin-bottom:7px; }
  .mov-avatar{ width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,var(--teal),#1c5a4c); color:#fff; font-family:var(--display); font-weight:600; font-size:9px; display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
  .mov-name{ font-family:var(--display); font-weight:600; font-size:7.6px; margin:0 0 1px; }
  .mov-role{ font-family:var(--body); font-size:5.8px; color:var(--muted); margin:0 0 2px; }
  .mov-stat{ font-family:var(--body); font-size:5.6px; color:var(--teal); font-weight:700; margin:0; }
  .mov-ask{ display:flex; align-items:center; gap:5px; background:#fff; border:1px solid var(--line); border-radius:9px; padding:6px 8px; margin-bottom:7px; }
  .mov-ask span{ font-family:var(--body); font-size:6px; color:var(--muted); }
  .mov-tabs{ display:flex; gap:4px; background:#E7EBE1; border-radius:8px; padding:2.5px; margin-bottom:7px; }
  .mov-tabs button{ flex:1; border:none; background:transparent; padding:4.5px 0; font-family:var(--body); font-size:6px; font-weight:700; color:var(--muted); border-radius:6px; }
  .mov-tabs button.active{ background:#fff; color:var(--ink); }
  .mov-block{ background:#fff; border:1px solid var(--line); border-radius:11px; padding:8px; margin-bottom:6px; }
  .mov-block .t{ font-family:var(--body); font-weight:700; font-size:6.6px; margin:0 0 2px; }
  .mov-block .d{ font-family:var(--body); font-size:5.8px; color:var(--muted); line-height:1.4; margin:0 0 3px; }
  .mov-block .m{ font-family:var(--body); font-size:5.4px; color:var(--muted); margin:0; }

  .mini-tabbar{
    flex:0 0 auto; display:flex; border-top:1px solid var(--line); background:#fff; padding:6px 6px 8px;
  }
  .mtab{
    flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;
    border:none; background:transparent; color:#A6AF9E;
  }
  .mtab svg{ width:11px; height:11px; }
  .mtab span{ font-family:var(--body); font-size:5.6px; font-weight:700; }
  .mtab.active{ color:var(--ink); }

  .r1-cursor{
    position:absolute; width:14px; height:14px; left:0; top:0;
    border-radius:50% 50% 50% 3px;
    background:rgba(18,33,59,0.9);
    border:1.5px solid #fff;
    box-shadow:0 3px 8px rgba(0,0,0,0.35);
    z-index:20; opacity:0; pointer-events:none;
    transition:left .55s cubic-bezier(.4,0,.2,1), top .55s cubic-bezier(.4,0,.2,1), opacity .25s ease;
  }
  .r1-cursor.tap{ animation:r1tap .35s ease; }
  @keyframes r1tap{
    0%{ box-shadow:0 3px 8px rgba(0,0,0,0.35); }
    50%{ box-shadow:0 0 0 7px rgba(232,162,61,0.4), 0 3px 8px rgba(0,0,0,0.35); }
    100%{ box-shadow:0 3px 8px rgba(0,0,0,0.35); }
  }

  .r3-frames{ position:relative; height:300px; }
  .r3-frame{
    position:absolute; inset:0;
    opacity:0; transform:translateY(6px);
    transition:opacity .45s ease, transform .45s ease;
    pointer-events:none;
  }
  .r3-frame.active{ opacity:1; transform:translateY(0); pointer-events:auto; }

  /* ---------- behind the scenes ---------- */
  .behind{
    text-align:center;
    position:relative;
  }
  .behind h3{
    font-family:var(--display);
    font-weight:600;
    font-size:clamp(1.7rem,3vw,2.2rem);
    margin:0 0 14px;
  }
  .behind p{
    max-width:460px;
    margin:0 auto 30px;
    color:var(--muted);
    font-size:16px;
    line-height:1.6;
  }
  .social-row{
    display:flex;
    gap:14px;
    justify-content:center;
    flex-wrap:wrap;
  }
  .btn-social{
    display:inline-flex;
    align-items:center;
    gap:9px;
    font-family:var(--body);
    font-weight:600;
    font-size:14px;
    padding:13px 22px;
    border-radius:100px;
    border:1.5px solid var(--ink);
    color:var(--ink);
    background:transparent;
    cursor:pointer;
    transition:background .18s ease, color .18s ease;
  }
  .btn-social:hover{ background:var(--ink); color:#fff; }
  .btn-social svg{ width:16px; height:16px; }

  /* ---------- responsive ---------- */
  @media (max-width: 860px){
    .section{ padding:80px 20px 72px; }
    .stage{ height:auto; padding:40px 0 20px; }
    .phone{ margin:0 auto; }
    .bubble{ display:none; }
    .bridge-svg{ display:none; }
    .chip-strip{ display:flex; }

    /* Three 9:16 reels side by side is only legible above ~860px — below
       that, three simultaneous columns crush the mini-app content into
       ~170px, which clips and overlaps text (e.g. card headers colliding).
       Switch to one full-size reel at a time, swipeable, same fixed-canvas
       + transform-scale technique the desktop enlargement uses. */
    .reels{
      display:flex;
      grid-template-columns:none;
      gap:16px;
      max-width:100%;
      margin:0 0 72px;
      padding:0 4vw 6px;
      overflow-x:auto;
      scroll-snap-type:x mandatory;
      -webkit-overflow-scrolling:touch;
      scrollbar-width:none;
    }
    .reels::-webkit-scrollbar{ display:none; }
    .reel{ flex:0 0 auto; width:280px; scroll-snap-align:center; }
    .mini-app{
      position:absolute; top:0; left:0;
      width:252px; height:448px;
      transform:scale(1.111);
      transform-origin:top left;
    }
    .reel .notch{ top:10px; width:44px; height:6px; }
    .r1-cursor{ width:16px; height:16px; }
  }

  /* Wider desktop viewports: let the reels use the full section width
     instead of an extra 800px cap, and scale up the mini-app content
     (designed at a fixed 252x448 canvas) to match via transform so
     none of its many fixed-px rules need touching. */
  @media (min-width: 861px){
    .reels{ max-width:1180px; gap:28px; }
    .mini-app{
      position:absolute; inset:auto; top:0; left:0;
      width:252px; height:448px;
      transform:scale(1.49);
      transform-origin:top left;
    }
    .reel .notch{ top:13px; width:60px; height:7px; border-radius:6px; }
    .r1-cursor{ width:21px; height:21px; border-width:2px; }
  }

  .chip-strip{
    display:none;
    flex-wrap:wrap;
    justify-content:center;
    gap:10px;
    max-width:520px;
    margin:36px auto 0;
  }
  .chip{
    display:inline-flex;
    align-items:center;
    gap:7px;
    font-family:var(--mono);
    font-size:11px;
    letter-spacing:.03em;
    text-transform:uppercase;
    padding:8px 13px;
    border-radius:100px;
    color:#fff;
  }
  .chip .dot{ width:20px;height:20px;border-radius:100%; flex:none; overflow:hidden; background:rgba(255,255,255,0.25); }
  .chip .dot img{ width:100%; height:100%; object-fit:cover; display:block; }

  @media (prefers-reduced-motion: reduce){
    .bubble, .phone{ animation:none; }
    .reel, .btn-primary{ transition:none; }
  }
</style>
</head>
<body>

<section class="section">

  <div class="comm-header">
    <span class="eyebrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M4 6h16M4 18h10"/></svg>
      A growing community of students
    </span>
    <h2>A career bridge,<br><em>not a cliff edge.</em></h2>
    <p>Your next step shouldn't feel like a leap of faith. Cross with a community of students who've stood exactly where you're standing.</p>
  </div>

  <div class="stage">
    <svg class="bridge-svg" viewBox="0 0 920 640" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <path d="M 40 90 C 260 10, 660 10, 880 90" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-dasharray="1 10" stroke-linecap="round"/>
      <line x1="60"  y1="80"  x2="60"  y2="150" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="1 6"/>
      <line x1="110" y1="42"  x2="110" y2="230" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="1 6"/>
      <line x1="850" y1="80"  x2="850" y2="150" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="1 6"/>
      <line x1="795" y1="35"  x2="795" y2="245" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="1 6"/>
      <line x1="460" y1="14"  x2="460" y2="120" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="1 6" opacity="0.5"/>
    </svg>

    <div class="bubble b1" aria-hidden="true">
      <span class="avatar"><img src="/community-avatar-1.png" alt="" /></span>
      <span class="tag-label">College Match</span>
    </div>
    <div class="bubble b2" aria-hidden="true">
      <span class="avatar"><img src="/community-avatar-2.png" alt="" /></span>
      <span class="tag-label">Expert Guide</span>
    </div>
    <div class="bubble b3" aria-hidden="true">
      <span class="avatar"><img src="/community-avatar-3.png" alt="" /></span>
      <span class="tag-label">Community &amp; Blogs</span>
    </div>
    <div class="bubble b4" aria-hidden="true">
      <span class="avatar"><img src="/community-avatar-4.png" alt="" /></span>
      <span class="tag-label">Scholarships</span>
    </div>
    <div class="bubble b5" aria-hidden="true">
      <span class="avatar"><img src="/community-avatar-5.png" alt="" /></span>
      <span class="tag-label">Internships</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="app-topbar">
          <span class="app-nav-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </span>
          <span class="app-brand">
            <span class="app-brand-row">
              <span class="app-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
              </span>
              <span class="app-brand-name">EduBridge</span>
            </span>
            <span class="app-brand-sub">Network</span>
          </span>
          <span class="app-nav-icons" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
          </span>
        </div>
        <div class="app-feature">
          <div class="app-photo"><img src="/career-guide-photo.png" alt="Student exploring college options on EduBridge Network" /></div>
          <p class="app-feature-text">Find colleges that fit you, discover scholarships from colleges, government and private organizations, connect with verified students, and build your career through real internships, live projects, and expert guidance.</p>
          <div class="app-feature-actions">
            <button class="app-btn amber full">
              Find colleges that fit
              <svg viewBox="0 0 24 24" fill="none" stroke="#3A2600" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <button class="app-btn ghost full">Discover scholarships</button>
          </div>
        </div>
      </div>
    </div>

    <div class="chip-strip">
      <span class="chip" style="background:var(--coral)"><span class="dot"><img src="/community-avatar-1.png" alt="" /></span>College Match</span>
      <span class="chip" style="background:var(--teal)"><span class="dot"><img src="/community-avatar-2.png" alt="" /></span>Expert Guide</span>
      <span class="chip" style="background:var(--ink)"><span class="dot"><img src="/community-avatar-3.png" alt="" /></span>Community &amp; Blogs</span>
      <span class="chip" style="background:var(--amber-deep)"><span class="dot"><img src="/community-avatar-4.png" alt="" /></span>Scholarships</span>
      <span class="chip" style="background:#7A5FB0"><span class="dot"><img src="/community-avatar-5.png" alt="" /></span>Internships</span>
    </div>
  </div>

  <div class="cta-row">
    <h3>Match, shortlist, apply — all in one place</h3>
    <p>Find colleges that actually fit you, scholarships matched to your profile, and internships that build your resume — then apply direct once you're ready.</p>
    <button class="btn-primary">
      Start matching now
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>
  </div>

  <div class="reels">

    <!-- Reel 1 — the real discover → shortlist → expert-guide flow -->
    <div class="reel r1">
      <div class="notch"></div>
      <div class="mini-app" id="r1app">
        <div class="mini-status"><span></span><span>●●●</span></div>

        <div class="mini-viewport">
          <div class="mview active" id="r1-discover">
            <div class="mini-topbar">
              <span class="mini-mark"></span>
              <span class="mini-brand">edu<b>bridge</b></span>
            </div>
            <p class="mini-eyebrow">Find your fit</p>
            <p class="mini-head">Search colleges that actually fit you</p>
            <div class="mini-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="#12213B" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              <span class="mini-search-txt" id="r1SearchTxt"></span>
            </div>
            <div class="mini-chips">
              <span class="mchip active" data-c="all">All matches</span>
              <span class="mchip" data-c="eng">Engineering</span>
              <span class="mchip" data-c="des">Design</span>
              <span class="mchip" data-c="biz">Business</span>
            </div>
            <div class="mini-list">
              <div class="mcard">
                <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="4"/></svg><span class="num">94%</span></div>
                <div class="m-main">
                  <p class="m-name">Meridian Institute of Technology</p>
                  <p class="m-loc">Pune, Maharashtra</p>
                  <div class="m-tags"><span class="m-tag">Engineering</span><span class="m-tag v">Verified</span></div>
                  <div class="m-actions">
                    <button class="m-btn m-btn-dark" id="mc1-short">+ Shortlist</button>
                    <button class="m-btn m-btn-ghost" id="mc1-guide">Ask Expert Guide</button>
                  </div>
                </div>
              </div>
              <div class="mcard">
                <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="6.3"/></svg><span class="num">91%</span></div>
                <div class="m-main">
                  <p class="m-name">Kessler Institute of Design</p>
                  <p class="m-loc">Jaipur, Rajasthan</p>
                  <div class="m-tags"><span class="m-tag">Design</span><span class="m-tag v">Verified</span></div>
                  <div class="m-actions">
                    <button class="m-btn m-btn-dark" id="mc2-short">+ Shortlist</button>
                    <button class="m-btn m-btn-ghost">Ask Expert Guide</button>
                  </div>
                </div>
              </div>
              <div class="mcard">
                <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="7.6"/></svg><span class="num">89%</span></div>
                <div class="m-main">
                  <p class="m-name">Sundale University</p>
                  <p class="m-loc">Ahmedabad, Gujarat</p>
                  <div class="m-tags"><span class="m-tag">Business</span><span class="m-tag v">Verified</span></div>
                  <div class="m-actions">
                    <button class="m-btn m-btn-dark">+ Shortlist</button>
                    <button class="m-btn m-btn-ghost">Ask Expert Guide</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mview" id="r1-shortlist">
            <div class="mini-topbar">
              <span class="mini-mark"></span>
              <span class="mini-brand">Your <b>shortlist</b></span>
            </div>
            <div class="m-banner">
              <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#3A2600" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M6 10v6c0 1.5 2.7 3 6 3s6-1.5 6-3v-6"/></svg></div>
              <div>
                <p class="t">EduBridge Network scholarships</p>
                <p class="d">Matched to your shortlist automatically</p>
              </div>
            </div>
            <div class="m-sccard">
              <div class="top">
                <div><p class="name">Meridian Institute of Technology</p><p class="loc">Pune, Maharashtra</p></div>
                <div class="m-dial-sm"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11" fill="none" stroke="#EDEBE4" stroke-width="3.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="69" stroke-dashoffset="4"/></svg></div>
              </div>
              <div class="sch">+ Up to ₹1.8L / year — merit + need based</div>
              <div class="m-actions">
                <button class="m-btn m-btn-amber">Direct Apply</button>
                <button class="m-btn m-btn-ghost">Ask Expert Guide</button>
                <button class="m-btn m-btn-ghost">Remove</button>
              </div>
            </div>
            <div class="m-sccard">
              <div class="top">
                <div><p class="name">Kessler Institute of Design</p><p class="loc">Jaipur, Rajasthan</p></div>
                <div class="m-dial-sm"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11" fill="none" stroke="#EDEBE4" stroke-width="3.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="69" stroke-dashoffset="6.3"/></svg></div>
              </div>
              <div class="sch">+ Up to ₹90K / year — portfolio based</div>
              <div class="m-actions">
                <button class="m-btn m-btn-amber">Direct Apply</button>
                <button class="m-btn m-btn-ghost">Ask Expert Guide</button>
                <button class="m-btn m-btn-ghost">Remove</button>
              </div>
            </div>
          </div>

          <div class="moverlay" id="r1-guide">
            <div class="mov-header">
              <span class="mov-back"><svg viewBox="0 0 24 24" fill="none" stroke="#12213B" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></span>
              <div>
                <p class="mov-college">Meridian Institute of Technology</p>
                <p class="mov-title">Expert Guide</p>
              </div>
            </div>
            <div class="mov-hero">
              <div class="mov-avatar">RS</div>
              <div>
                <p class="mov-name">Rhea Sen</p>
                <p class="mov-role">Alumna, CS '21 · Guide since 2023</p>
                <p class="mov-stat">482 questions answered</p>
              </div>
            </div>
            <div class="mov-ask">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9AA598" stroke-width="1.8" width="9" height="9"><path d="M4 4h16v12H8l-4 4V4z"/></svg>
              <span>Ask Rhea about admissions, fees, life…</span>
            </div>
            <div class="mov-tabs"><button class="active">Community</button><button>Blogs</button></div>
            <div class="mov-block">
              <p class="t">Meridian CS Aspirants</p>
              <p class="d">2,300+ students preparing together — mock interviews every Sunday.</p>
              <p class="m">Active · 340 online now</p>
            </div>
            <div class="mov-block">
              <p class="t">Meridian Alumni Circle</p>
              <p class="d">Graduates share placement journeys and referral opportunities.</p>
              <p class="m">1,120 members</p>
            </div>
          </div>
        </div>

        <div class="mini-tabbar">
          <button class="mtab active" id="r1tab-discover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
            <span>Discover</span>
          </button>
          <button class="mtab" id="r1tab-shortlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4.5L6 21V3z"/></svg>
            <span>Shortlist</span>
          </button>
        </div>
      </div>
      <div class="r1-cursor" id="r1cursor"></div>
    </div>

    <!-- Reel 2 — full scholarship discovery → detail → apply flow -->
    <div class="reel r2" style="background:#F1F3EC;">
      <div class="notch" style="background:rgba(18,33,59,0.2);"></div>
      <div class="mini-app" id="r2app">
        <div class="mini-status"><span></span><span>●●●</span></div>

        <div class="mini-viewport">
          <div class="mview active" id="r2-discover">
            <div class="mini-topbar">
              <span class="mini-mark"></span>
              <span class="mini-brand">edu<b>bridge</b></span>
            </div>
            <p class="mini-eyebrow">Fund your future</p>
            <p class="mini-head">Scholarships matched to your profile</p>
            <div class="mini-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="#12213B" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              <span class="mini-search-txt" id="r2SearchTxt"></span>
            </div>
            <div class="mini-chips">
              <span class="mchip active" data-c="all">All matches</span>
              <span class="mchip" data-c="merit">Merit</span>
              <span class="mchip" data-c="need">Need-based</span>
              <span class="mchip" data-c="women">Women in STEM</span>
            </div>
            <div class="mini-list">
              <div class="mcard">
                <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="4"/></svg><span class="num">94%</span></div>
                <div class="m-main">
                  <p class="m-name">STEM Excellence Scholarship</p>
                  <p class="m-loc">EduBridge Network · ₹1.8L / year</p>
                  <div class="m-tags"><span class="m-tag">Merit + Need</span><span class="m-tag" style="background:rgba(232,162,61,0.16); color:var(--amber-deep);">Due Aug 30</span></div>
                  <div class="m-actions">
                    <button class="m-btn m-btn-dark" id="s1-save">+ Shortlist</button>
                    <button class="m-btn m-btn-ghost" id="s1-view">View details</button>
                  </div>
                </div>
              </div>
              <div class="mcard">
                <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="6.3"/></svg><span class="num">91%</span></div>
                <div class="m-main">
                  <p class="m-name">First-Gen Scholar Grant</p>
                  <p class="m-loc">Sundale Trust · ₹90K / year</p>
                  <div class="m-tags"><span class="m-tag">Need-based</span><span class="m-tag" style="background:rgba(232,162,61,0.16); color:var(--amber-deep);">Due Sep 15</span></div>
                  <div class="m-actions">
                    <button class="m-btn m-btn-dark" id="s2-save">+ Shortlist</button>
                    <button class="m-btn m-btn-ghost">View details</button>
                  </div>
                </div>
              </div>
              <div class="mcard">
                <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="8"/></svg><span class="num">88%</span></div>
                <div class="m-main">
                  <p class="m-name">Women in Tech Award</p>
                  <p class="m-loc">Kessler Foundation · ₹1.2L / year</p>
                  <div class="m-tags"><span class="m-tag">Merit-based</span><span class="m-tag" style="background:rgba(232,162,61,0.16); color:var(--amber-deep);">Due Oct 5</span></div>
                  <div class="m-actions">
                    <button class="m-btn m-btn-dark">+ Shortlist</button>
                    <button class="m-btn m-btn-ghost">View details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mview" id="r2-saved">
            <div class="mini-topbar">
              <span class="mini-mark"></span>
              <span class="mini-brand">Your <b>shortlist</b></span>
            </div>
            <div class="m-banner">
              <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#3A2600" stroke-width="1.8"><path d="M12 2v20M2 12h20"/></svg></div>
              <div>
                <p class="t">₹2.7L in matched value</p>
                <p class="d">Across your saved scholarships this year</p>
              </div>
            </div>
            <div class="m-sccard">
              <div class="top">
                <div><p class="name">STEM Excellence Scholarship</p><p class="loc">EduBridge Network</p></div>
                <div class="m-dial-sm"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11" fill="none" stroke="#EDEBE4" stroke-width="3.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="69" stroke-dashoffset="4"/></svg></div>
              </div>
              <div class="sch">₹1.8L / year — merit + need based</div>
              <div class="m-actions">
                <button class="m-btn" style="background:var(--teal); color:#fff;">✓ Applied</button>
                <button class="m-btn m-btn-ghost">Remove</button>
              </div>
            </div>
            <div class="m-sccard">
              <div class="top">
                <div><p class="name">First-Gen Scholar Grant</p><p class="loc">Sundale Trust</p></div>
                <div class="m-dial-sm"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11" fill="none" stroke="#EDEBE4" stroke-width="3.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="69" stroke-dashoffset="6.3"/></svg></div>
              </div>
              <div class="sch">₹90K / year — need based</div>
              <div class="m-actions">
                <button class="m-btn m-btn-amber">Direct Apply</button>
                <button class="m-btn m-btn-ghost">Remove</button>
              </div>
            </div>
          </div>

          <div class="moverlay" id="r2-detail">
            <div class="mov-header">
              <span class="mov-back"><svg viewBox="0 0 24 24" fill="none" stroke="#12213B" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></span>
              <div>
                <p class="mov-college">EduBridge Network</p>
                <p class="mov-title">Scholarship details</p>
              </div>
            </div>
            <div class="mov-hero">
              <div class="mov-avatar" style="background:var(--amber); color:#3A2600;">₹</div>
              <div>
                <p class="mov-name">STEM Excellence Scholarship</p>
                <p class="mov-role">₹1.8L / year · renewable for 4 years</p>
                <p class="mov-stat">94% match for your profile</p>
              </div>
            </div>
            <div class="mov-block">
              <p class="t">Eligibility</p>
              <p class="d">Enrolled in an engineering or CS program · family income under ₹8L/year · minimum GPA 3.2</p>
            </div>
            <div class="mov-block">
              <p class="t">Deadline</p>
              <p class="d">Applications close <strong>Aug 30, 2026</strong> — 12 days left</p>
            </div>
            <div class="d-apply" id="r2ApplyBtn" style="margin-top:2px;">Apply Now</div>
          </div>
        </div>

        <div class="mini-tabbar">
          <button class="mtab active" id="r2tab-discover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
            <span>Discover</span>
          </button>
          <button class="mtab" id="r2tab-saved">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4.5L6 21V3z"/></svg>
            <span>Shortlist</span>
          </button>
        </div>
      </div>
      <div class="r1-cursor" id="r2cursor"></div>
    </div>

    <!-- Reel 3 — full resume-upload → matched internships → shortlist flow -->
    <div class="reel r3" style="background:#F1F3EC;">
      <div class="notch" style="background:rgba(18,33,59,0.2);"></div>
      <div class="mini-app" id="r3app">
        <div class="mini-status"><span></span><span>●●●</span></div>

        <div class="mini-viewport">
          <div class="mview active" id="r3-main">
            <div class="mini-topbar">
              <span class="mini-mark"></span>
              <span class="mini-brand">edu<b>bridge</b></span>
            </div>
            <p class="mini-eyebrow">Upskill · paid · unpaid · learning phase</p>
            <p class="mini-head">Internships that build your resume</p>

            <div class="r3-frames">
              <div class="r3-frame active" id="r3-upload">
                <div class="d-upload" style="padding-top:26px;">
                  <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#3A2600" stroke-width="2"><path d="M12 16V4M12 4l-4 4M12 4l4 4"/><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg></div>
                  <p class="t">Upload your resume</p>
                  <p class="d">We review it and shortlist the internships that actually fit your skills and goals.</p>
                  <div class="d-track"><div class="d-fill" id="fill3"></div></div>
                  <p class="d-ptxt" id="ptxt3">Reviewing your resume…</p>
                </div>
              </div>

              <div class="r3-frame" id="r3-list">
                <div class="mini-chips">
                  <span class="mchip active" data-c="all">All matches</span>
                  <span class="mchip" data-c="paid">Paid</span>
                  <span class="mchip" data-c="unpaid">Unpaid</span>
                  <span class="mchip" data-c="learn">Learning phase</span>
                </div>
                <div class="mini-list">
                  <div class="mcard">
                    <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="6"/></svg><span class="num">92%</span></div>
                    <div class="m-main">
                      <p class="m-name">Frontend Engineering Intern</p>
                      <p class="m-loc">Loom Analytics</p>
                      <div class="m-tags"><span class="m-tag">Paid</span><span class="m-tag v" style="background:rgba(232,162,61,0.16); color:var(--amber-deep);">Real project</span></div>
                      <div class="m-actions">
                        <button class="m-btn m-btn-dark" id="i1-save">+ Shortlist</button>
                        <button class="m-btn m-btn-ghost" id="i1-view">View details</button>
                      </div>
                    </div>
                  </div>
                  <div class="mcard">
                    <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="10"/></svg><span class="num">85%</span></div>
                    <div class="m-main">
                      <p class="m-name">Field Research Intern</p>
                      <p class="m-loc">Verdant Labs</p>
                      <div class="m-tags"><span class="m-tag" style="background:#F1EEE4; color:#8a7a4a;">Unpaid</span><span class="m-tag v" style="background:rgba(232,162,61,0.16); color:var(--amber-deep);">Real project</span></div>
                      <div class="m-actions">
                        <button class="m-btn m-btn-dark" id="i2-save">+ Shortlist</button>
                        <button class="m-btn m-btn-ghost">View details</button>
                      </div>
                    </div>
                  </div>
                  <div class="mcard">
                    <div class="m-dial"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11"/><circle class="fil" cx="14" cy="14" r="11" stroke-dasharray="69" stroke-dashoffset="18"/></svg><span class="num">74%</span></div>
                    <div class="m-main">
                      <p class="m-name">Content Strategy Trainee</p>
                      <p class="m-loc">Fieldnote Media</p>
                      <div class="m-tags"><span class="m-tag" style="background:#EFEAF7; color:#6a4fa0;">Learning phase</span></div>
                      <div class="m-actions">
                        <button class="m-btn m-btn-dark">+ Shortlist</button>
                        <button class="m-btn m-btn-ghost">View details</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mview" id="r3-shortlist">
            <div class="mini-topbar">
              <span class="mini-mark"></span>
              <span class="mini-brand">Your <b>shortlist</b></span>
            </div>
            <div class="m-banner">
              <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#3A2600" stroke-width="1.8"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></div>
              <div>
                <p class="t">Reviewed &amp; shortlisted for you</p>
                <p class="d">We read your resume and picked the internships that fit best</p>
              </div>
            </div>
            <div class="m-sccard">
              <div class="top">
                <div><p class="name">Frontend Engineering Intern</p><p class="loc">Loom Analytics · Paid</p></div>
                <div class="m-dial-sm"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11" fill="none" stroke="#EDEBE4" stroke-width="3.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="69" stroke-dashoffset="6"/></svg></div>
              </div>
              <div class="sch">Ships a real dashboard feature — boosts your resume</div>
              <div class="m-actions">
                <button class="m-btn" style="background:var(--teal); color:#fff;">✓ Applied</button>
                <button class="m-btn m-btn-ghost">Remove</button>
              </div>
            </div>
            <div class="m-sccard">
              <div class="top">
                <div><p class="name">Field Research Intern</p><p class="loc">Verdant Labs · Unpaid</p></div>
                <div class="m-dial-sm"><svg viewBox="0 0 28 28"><circle class="trk" cx="14" cy="14" r="11" fill="none" stroke="#EDEBE4" stroke-width="3.5"/><circle cx="14" cy="14" r="11" fill="none" stroke="var(--teal)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="69" stroke-dashoffset="10"/></svg></div>
              </div>
              <div class="sch">Co-authors a published field study — boosts your resume</div>
              <div class="m-actions">
                <button class="m-btn m-btn-amber">Apply now</button>
                <button class="m-btn m-btn-ghost">Remove</button>
              </div>
            </div>
          </div>

          <div class="moverlay" id="r3-detail">
            <div class="mov-header">
              <span class="mov-back"><svg viewBox="0 0 24 24" fill="none" stroke="#12213B" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></span>
              <div>
                <p class="mov-college">Loom Analytics</p>
                <p class="mov-title">Internship details</p>
              </div>
            </div>
            <div class="mov-hero">
              <div class="mov-avatar" style="background:var(--teal);">L</div>
              <div>
                <p class="mov-name">Frontend Engineering Intern</p>
                <p class="mov-role">Paid · 12 weeks · remote-friendly</p>
                <p class="mov-stat">92% fit for your resume</p>
              </div>
            </div>
            <div class="mov-block">
              <p class="t">What you'll do</p>
              <p class="d">Ship a real dashboard feature used by 40+ paying clients, working directly with senior engineers on production code.</p>
            </div>
            <div class="mov-block">
              <p class="t">Why it's worth it</p>
              <p class="d">Real, shipped work you can point to — not busywork. It's the kind of project that actually strengthens a resume.</p>
            </div>
            <div class="d-apply" id="r3ApplyBtn" style="margin-top:2px;">Apply Now</div>
          </div>
        </div>

        <div class="mini-tabbar">
          <button class="mtab active" id="r3tab-main">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span>Internships</span>
          </button>
          <button class="mtab" id="r3tab-shortlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4.5L6 21V3z"/></svg>
            <span>Shortlist</span>
          </button>
        </div>
      </div>
      <div class="r1-cursor" id="r3cursor"></div>
    </div>

  </div>

  <div class="behind">

    <h3>See EduBridge in action</h3>
    <p>From your first search to your first offer letter — watch how EduBridge matches you to the right college, the scholarship that fits, and real-project internships that build your resume.</p>
    <div class="social-row">
      <button class="btn-social">
        Explore colleges
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
      <button class="btn-social">
        Browse internships
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </div>
  </div>

</section>

<script>
  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  function setStep(containerId, step){
    document.querySelectorAll('#'+containerId+' .demo-frame').forEach(f=>{
      f.classList.toggle('active', f.dataset.step === String(step));
    });
  }

  /* ---------- Reel 1: full discover → shortlist → guide flow ---------- */
  const r1app = document.getElementById('r1app');
  const r1cursor = document.getElementById('r1cursor');

  function r1ShowView(id){
    document.querySelectorAll('#r1app .mview').forEach(v=>v.classList.toggle('active', v.id===id));
    document.getElementById('r1tab-discover').classList.toggle('active', id==='r1-discover');
    document.getElementById('r1tab-shortlist').classList.toggle('active', id==='r1-shortlist');
  }
  async function r1MoveTo(el){
    if(!el) return;
    const cr = r1app.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    r1cursor.style.opacity = 1;
    r1cursor.style.left = (r.left + r.width/2 - cr.left - r1cursor.offsetWidth/2) + 'px';
    r1cursor.style.top  = (r.top + r.height/2 - cr.top - r1cursor.offsetHeight/2) + 'px';
    await sleep(560);
  }
  async function r1Tap(el){
    await r1MoveTo(el);
    r1cursor.classList.add('tap');
    await sleep(260);
    r1cursor.classList.remove('tap');
    await sleep(240);
  }
  async function r1Type(el, text){
    el.textContent = '';
    for(const ch of text){ el.textContent += ch; await sleep(58); }
    await sleep(450);
  }

  async function demo1(){
    const searchTxt   = document.getElementById('r1SearchTxt');
    const shortBtn1   = document.getElementById('mc1-short');
    const shortBtn2   = document.getElementById('mc2-short');
    const guideBtn1   = document.getElementById('mc1-guide');
    const tabDiscover = document.getElementById('r1tab-discover');
    const tabShortlist= document.getElementById('r1tab-shortlist');
    const guidePanel  = document.getElementById('r1-guide');
    const backBtn     = guidePanel.querySelector('.mov-back');
    const chipDesign  = document.querySelector('.mchip[data-c="des"]');
    const chipAll     = document.querySelector('.mchip[data-c="all"]');

    while(true){
      r1ShowView('r1-discover');
      guidePanel.classList.remove('open');
      searchTxt.textContent = '';
      shortBtn1.textContent = '+ Shortlist'; shortBtn1.classList.remove('done');
      shortBtn2.textContent = '+ Shortlist'; shortBtn2.classList.remove('done');
      chipDesign.classList.remove('active'); chipAll.classList.add('active');
      r1cursor.style.opacity = 0;
      await sleep(900);

      await r1Tap(document.querySelector('#r1-discover .mini-search'));
      await r1Type(searchTxt, 'design colleges under 3L fees');
      await sleep(500);

      await r1Tap(chipDesign);
      chipAll.classList.remove('active'); chipDesign.classList.add('active');
      await sleep(500);
      await r1Tap(chipAll);
      chipDesign.classList.remove('active'); chipAll.classList.add('active');
      await sleep(300);

      await r1Tap(shortBtn1);
      shortBtn1.textContent = '✓ Shortlisted'; shortBtn1.classList.add('done');
      await sleep(300);
      await r1Tap(shortBtn2);
      shortBtn2.textContent = '✓ Shortlisted'; shortBtn2.classList.add('done');
      await sleep(500);

      await r1Tap(guideBtn1);
      guidePanel.classList.add('open');
      await sleep(1900);
      await r1Tap(backBtn);
      guidePanel.classList.remove('open');
      await sleep(400);

      await r1Tap(tabShortlist);
      r1ShowView('r1-shortlist');
      await sleep(2100);

      await r1Tap(tabDiscover);
      r1ShowView('r1-discover');
      await sleep(1200);
    }
  }

  /* ---------- Reel 2: full scholarship discover → detail → apply flow ---------- */
  const r2app = document.getElementById('r2app');
  const r2cursor = document.getElementById('r2cursor');

  function r2ShowView(id){
    document.querySelectorAll('#r2app .mview').forEach(v=>v.classList.toggle('active', v.id===id));
    document.getElementById('r2tab-discover').classList.toggle('active', id==='r2-discover');
    document.getElementById('r2tab-saved').classList.toggle('active', id==='r2-saved');
  }
  async function r2MoveTo(el){
    if(!el) return;
    const cr = r2app.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    r2cursor.style.opacity = 1;
    r2cursor.style.left = (r.left + r.width/2 - cr.left - r2cursor.offsetWidth/2) + 'px';
    r2cursor.style.top  = (r.top + r.height/2 - cr.top - r2cursor.offsetHeight/2) + 'px';
    await sleep(560);
  }
  async function r2Tap(el){
    await r2MoveTo(el);
    r2cursor.classList.add('tap');
    await sleep(260);
    r2cursor.classList.remove('tap');
    await sleep(240);
  }
  async function r2Type(el, text){
    el.textContent = '';
    for(const ch of text){ el.textContent += ch; await sleep(58); }
    await sleep(450);
  }

  async function demo2(){
    const searchTxt    = document.getElementById('r2SearchTxt');
    const save1        = document.getElementById('s1-save');
    const save2        = document.getElementById('s2-save');
    const view1        = document.getElementById('s1-view');
    const tabDiscover  = document.getElementById('r2tab-discover');
    const tabSaved     = document.getElementById('r2tab-saved');
    const detailPanel  = document.getElementById('r2-detail');
    const backBtn      = detailPanel.querySelector('.mov-back');
    const applyBtn     = document.getElementById('r2ApplyBtn');
    const chipMerit    = r2app.querySelector('.mchip[data-c="merit"]');
    const chipAll      = r2app.querySelector('.mchip[data-c="all"]');

    while(true){
      r2ShowView('r2-discover');
      detailPanel.classList.remove('open');
      searchTxt.textContent = '';
      save1.textContent = '+ Shortlist'; save1.classList.remove('done');
      save2.textContent = '+ Shortlist'; save2.classList.remove('done');
      applyBtn.textContent = 'Apply Now'; applyBtn.classList.remove('pulse');
      chipMerit.classList.remove('active'); chipAll.classList.add('active');
      r2cursor.style.opacity = 0;
      await sleep(900);

      await r2Tap(document.querySelector('#r2-discover .mini-search'));
      await r2Type(searchTxt, 'engineering scholarships');
      await sleep(500);

      await r2Tap(chipMerit);
      chipAll.classList.remove('active'); chipMerit.classList.add('active');
      await sleep(500);
      await r2Tap(chipAll);
      chipMerit.classList.remove('active'); chipAll.classList.add('active');
      await sleep(300);

      await r2Tap(save1);
      save1.textContent = '✓ Shortlisted'; save1.classList.add('done');
      await sleep(400);

      await r2Tap(view1);
      detailPanel.classList.add('open');
      await sleep(1700);
      await r2Tap(applyBtn);
      applyBtn.classList.add('pulse');
      await sleep(500);
      applyBtn.textContent = '✓ Applied';
      await sleep(1000);
      await r2Tap(backBtn);
      detailPanel.classList.remove('open');
      await sleep(400);

      await r2Tap(save2);
      save2.textContent = '✓ Shortlisted'; save2.classList.add('done');
      await sleep(500);

      await r2Tap(tabSaved);
      r2ShowView('r2-saved');
      await sleep(2200);

      await r2Tap(tabDiscover);
      r2ShowView('r2-discover');
      await sleep(1200);
    }
  }

  /* ---------- Reel 3: resume upload → matched internships → shortlist flow ---------- */
  const r3app = document.getElementById('r3app');
  const r3cursor = document.getElementById('r3cursor');

  function r3ShowView(id){
    document.querySelectorAll('#r3app .mview').forEach(v=>v.classList.toggle('active', v.id===id));
    document.getElementById('r3tab-main').classList.toggle('active', id==='r3-main');
    document.getElementById('r3tab-shortlist').classList.toggle('active', id==='r3-shortlist');
  }
  function r3ShowFrame(id){
    document.querySelectorAll('#r3app .r3-frame').forEach(f=>f.classList.toggle('active', f.id===id));
  }
  async function r3MoveTo(el){
    if(!el) return;
    const cr = r3app.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    r3cursor.style.opacity = 1;
    r3cursor.style.left = (r.left + r.width/2 - cr.left - r3cursor.offsetWidth/2) + 'px';
    r3cursor.style.top  = (r.top + r.height/2 - cr.top - r3cursor.offsetHeight/2) + 'px';
    await sleep(560);
  }
  async function r3Tap(el){
    await r3MoveTo(el);
    r3cursor.classList.add('tap');
    await sleep(260);
    r3cursor.classList.remove('tap');
    await sleep(240);
  }

  async function demo3(){
    const fill        = document.getElementById('fill3');
    const ptxt        = document.getElementById('ptxt3');
    const save1       = document.getElementById('i1-save');
    const save2       = document.getElementById('i2-save');
    const view1       = document.getElementById('i1-view');
    const tabMain     = document.getElementById('r3tab-main');
    const tabShortlist= document.getElementById('r3tab-shortlist');
    const detailPanel = document.getElementById('r3-detail');
    const backBtn     = detailPanel.querySelector('.mov-back');
    const applyBtn    = document.getElementById('r3ApplyBtn');
    const chipPaid    = r3app.querySelector('.mchip[data-c="paid"]');
    const chipAll     = r3app.querySelector('.mchip[data-c="all"]');

    while(true){
      r3ShowView('r3-main');
      r3ShowFrame('r3-upload');
      detailPanel.classList.remove('open');
      fill.classList.remove('go');
      ptxt.textContent = 'Reviewing your resume…';
      save1.textContent = '+ Shortlist'; save1.classList.remove('done');
      save2.textContent = '+ Shortlist'; save2.classList.remove('done');
      applyBtn.textContent = 'Apply Now'; applyBtn.classList.remove('pulse');
      chipPaid.classList.remove('active'); chipAll.classList.add('active');
      r3cursor.style.opacity = 0;
      await sleep(900);

      fill.classList.add('go');
      await sleep(1500);
      ptxt.textContent = 'Matched 3 internships to your resume';
      await sleep(900);
      r3ShowFrame('r3-list');
      await sleep(700);

      await r3Tap(chipPaid);
      chipAll.classList.remove('active'); chipPaid.classList.add('active');
      await sleep(600);
      await r3Tap(chipAll);
      chipPaid.classList.remove('active'); chipAll.classList.add('active');
      await sleep(300);

      await r3Tap(save1);
      save1.textContent = '✓ Shortlisted'; save1.classList.add('done');
      await sleep(400);

      await r3Tap(view1);
      detailPanel.classList.add('open');
      await sleep(1700);
      await r3Tap(applyBtn);
      applyBtn.classList.add('pulse');
      await sleep(500);
      applyBtn.textContent = '✓ Applied';
      await sleep(1000);
      await r3Tap(backBtn);
      detailPanel.classList.remove('open');
      await sleep(400);

      await r3Tap(save2);
      save2.textContent = '✓ Shortlisted'; save2.classList.add('done');
      await sleep(500);

      await r3Tap(tabShortlist);
      r3ShowView('r3-shortlist');
      await sleep(2200);

      await r3Tap(tabMain);
      r3ShowView('r3-main');
      await sleep(1200);
    }
  }

  demo1();
  demo2();
  demo3();
</script>

<script>
(function(){
  function post(){try{parent.postMessage({bridgeHeight:Math.ceil(document.body.scrollHeight)+4},'*');}catch(e){}}
  window.addEventListener('load',post);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(post);
  if(window.ResizeObserver){new ResizeObserver(post).observe(document.body);}else{setInterval(post,1000);}
})();
</script>

</body>
</html>`;

export function HomeCareerBridge() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.bridgeHeight === 'number') setHeight(Math.max(400, e.data.bridgeHeight));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <section aria-label="A career bridge, not a cliff edge" className="-mx-1 sm:mx-0">
      <iframe
        ref={ref}
        title="A career bridge, not a cliff edge — EduBridge community and product tour"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="mx-auto block w-full max-w-[1200px] border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
