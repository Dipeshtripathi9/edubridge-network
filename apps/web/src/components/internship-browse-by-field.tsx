'use client';

import { useEffect, useRef, useState } from 'react';

// "Browse by Field" category slider — isolated iframe widget (same pattern as
// HomeAdmissionDesk/HomeCareerBridge) so its own fonts/CSS/JS stay decoupled
// from the app. Reports its rendered height back so the iframe never clips
// or shows a scrollbar.
const SRC = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EduBridge — Browse by Field</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --green:#2E4F30;
    --cream:#F7F2E6;
    --icon-bg:#F1E9DA;
    --card:#FFFFFF;
    --ink:#1B2A1D;
    --ink-soft:#51604F;
    --blue:#8C9FE0;
    --orange:#E8A23C;
  }
  *{ box-sizing:border-box; margin:0; padding:0; }
  button:focus-visible, a:focus-visible{ outline:2px solid #22301F; outline-offset:2px; }
  html,body{ background:transparent; }
  body{
    font-family:'Space Grotesk', sans-serif;
    padding:0.75rem 0 1.6rem;
    min-height:auto;
  }
  @media (max-width:720px){ body{ padding:0.6rem 0 1.2rem; } }
  .shell-outer{ position:relative; }
  .wrap{ max-width:1180px; margin:0 auto; }

  .cat-slider{
    overflow-x:auto;
    overflow-y:hidden;
    scroll-snap-type:x proximity;
    scroll-behavior:smooth;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
    -ms-overflow-style:none;
    border:none;
    outline:none;
    /* Soft fade at the trailing edge hints there's more to scroll to,
       instead of a hard clip. */
    mask-image: linear-gradient(to right, black calc(100% - 36px), transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black calc(100% - 36px), transparent 100%);
  }
  .cat-slider::-webkit-scrollbar{ display:none; height:0; }

  .cat-track{ display:flex; gap:1.4rem; width:max-content; padding:0.4rem 0.2rem; }

  .cat-card{
    display:flex; align-items:flex-start; gap:1.1rem; background:var(--card); border:1.5px solid var(--green);
    border-radius:16px; padding:1.5rem; width:min(86vw,340px); flex-shrink:0;
    scroll-snap-align:start;
    overflow:hidden;
    text-decoration:none; color:inherit; cursor:pointer;
    transition:transform .18s ease, box-shadow .18s ease;
  }
  .cat-card:hover{ transform:translateY(-2px); box-shadow:0 10px 26px rgba(0,0,0,0.1); }
  .cat-icon{
    width:64px; height:64px; border-radius:12px; background:var(--icon-bg);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; position:relative;
  }
  .cat-icon svg{ width:38px; height:38px; overflow:visible; }
  .cat-body{ min-width:0; }
  .cat-body h4{ font-family:'Fraunces',serif; font-weight:600; font-size:1.05rem; color:var(--ink); margin-bottom:0.4rem; }
  .cat-body p{
    font-size:0.83rem; color:var(--ink-soft); line-height:1.55;
    word-wrap:break-word; overflow-wrap:break-word;
  }

  .nav-btn{
    position:absolute; top:50%; transform:translateY(-50%);
    width:42px; height:42px; border-radius:50%;
    background:var(--card); border:1.5px solid var(--green);
    box-shadow:0 8px 20px rgba(0,0,0,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; z-index:2;
    transition:background .18s ease, transform .18s ease, box-shadow .18s ease;
  }
  .nav-btn:hover{ background:var(--green); box-shadow:0 10px 26px rgba(0,0,0,0.16); }
  .nav-btn:hover svg{ stroke:#fff; }
  .nav-btn:active{ transform:translateY(-50%) scale(0.94); }
  .nav-btn.prev{ left:8px; }
  .nav-btn.next{ right:8px; }
  .nav-btn svg{ width:18px; height:18px; }

  @media (max-width:720px){
    .nav-btn{ width:34px; height:34px; }
    .nav-btn.prev{ left:4px; }
    .nav-btn.next{ right:4px; }
    .nav-btn svg{ width:15px; height:15px; }
  }
</style>
</head>
<body>

<div class="shell-outer">
  <button type="button" class="nav-btn prev" id="prevBtn" aria-label="Scroll left">
    <svg viewBox="0 0 24 24" fill="none" stroke="#22301F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
  </button>
  <div class="wrap">
    <div class="cat-slider">
      <div class="cat-track" id="track">
        <!-- cards injected here by script below -->
      </div>
    </div>
  </div>
  <button type="button" class="nav-btn next" id="nextBtn" aria-label="Scroll right">
    <svg viewBox="0 0 24 24" fill="none" stroke="#22301F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
  </button>
</div>

<script>
  var INK = "#22301F";

  function icon(paths){ return paths.join(''); }

  var categories = [
    {
      name: "Technology",
      bg: "#E4EAF8",
      desc: "Discover software development, AI, data science, cybersecurity, cloud, DevOps, UI/UX, and mobile development opportunities tailored to your technical skills.",
      icon: icon([
        '<path d="M4 5.5c8-.7 16-.7 24 0" stroke="' + INK + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
        '<rect x="6" y="6.5" width="20" height="14" rx="1.6" fill="none" stroke="' + INK + '" stroke-width="1.4"/>',
        '<rect x="12" y="10" width="8" height="7" fill="var(--blue)" stroke="' + INK + '" stroke-width="1.2"/>',
        '<path d="M3 22.5c8.5 1 16.5 1 26 0" stroke="' + INK + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
        '<path d="M13 24.5h6" stroke="' + INK + '" stroke-width="1.3" stroke-linecap="round"/>',
        '<path d="M2 1.5l1.4 1.4M2 2.9L3.4 1.5" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>',
        '<path d="M28 26l1.4 1.4M28 27.4L29.4 26" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>'
      ])
    },
    {
      name: "Business",
      bg: "#F5E9D6",
      desc: "Explore internships and projects in marketing, finance, HR, sales, operations, and business analytics to gain practical business experience.",
      icon: icon([
        '<path d="M5 27V13.5" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>',
        '<path d="M13 27V8" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>',
        '<path d="M21 27v-11" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>',
        '<path d="M2 27h27" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>',
        '<rect x="10" y="8" width="6" height="19" fill="var(--orange)" opacity="0.55" stroke="none"/>',
        '<path d="M4 13.5L13 7l8 5 8-7" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        '<path d="M24 5h5v5" stroke="' + INK + '" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        '<path d="M2 1.5l1.4 1.4M2 2.9L3.4 1.5" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>',
        '<path d="M28 3l1.4 1.4M28 4.4L29.4 3" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>'
      ])
    },
    {
      name: "Healthcare",
      bg: "#E3F0EC",
      desc: "Build hands-on experience through clinical, laboratory, radiology, physiotherapy, pharmacy, and hospital administration opportunities.",
      icon: icon([
        '<path d="M8 4v9a7 7 0 0 0 14 0V4" stroke="' + INK + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
        '<path d="M8 4H5.5M14 4h-2.5" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>',
        '<circle cx="24" cy="21" r="5.5" fill="var(--blue)" opacity="0.55" stroke="' + INK + '" stroke-width="1.5"/>',
        '<path d="M24 18.5v5M21.5 21h5" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>',
        '<path d="M2 6l1.4 1.4M2 7.4L3.4 6" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>',
        '<path d="M27 1.5l1.4 1.4M27 2.9L28.4 1.5" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>'
      ])
    },
    {
      name: "Creative",
      bg: "#F6E5EC",
      desc: "Grow your creative portfolio with opportunities in graphic design, video editing, content writing, social media, branding, and digital media.",
      icon: icon([
        '<path d="M16 4C8.8 4 3 9.6 3 16.4c0 5.4 4 8 8 8 1.3 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.3-.3-.35-.5-.75-.5-1.2 0-1 .8-1.7 1.8-1.7h3.4c5 0 9.8-3.4 9.8-9C27 8 22.2 4 16 4Z" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>',
        '<circle cx="9" cy="13.5" r="1.5" fill="var(--orange)" stroke="none"/>',
        '<circle cx="12.5" cy="9" r="1.5" fill="var(--blue)" stroke="none"/>',
        '<circle cx="18.5" cy="8.5" r="1.5" fill="#8FBF9B" stroke="none"/>',
        '<circle cx="22.5" cy="12" r="1.5" fill="#D98BAE" stroke="none"/>',
        '<path d="M2 25l1.4 1.4M2 26.4L3.4 25" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>',
        '<path d="M28 4l1.4 1.4M28 5.4L29.4 4" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>'
      ])
    },
    {
      name: "General",
      desc: "Expand your experience through campus ambassador programs, research, startup internships, volunteering, and remote opportunities across diverse industries.",
      icon: icon([
        '<circle cx="15" cy="12" r="9.5" fill="none" stroke="' + INK + '" stroke-width="1.5"/>',
        '<ellipse cx="15" cy="12" rx="4" ry="9.5" fill="none" stroke="' + INK + '" stroke-width="1.2"/>',
        '<path d="M5.5 12h19" stroke="' + INK + '" stroke-width="1.2"/>',
        '<path d="M7.3 6.5h15.4M7.3 17.5h15.4" stroke="' + INK + '" stroke-width="1.1"/>',
        '<circle cx="15" cy="12" r="9.5" fill="var(--blue)" opacity="0.18" stroke="none"/>',
        '<circle cx="6" cy="26" r="2.4" fill="none" stroke="' + INK + '" stroke-width="1.3"/>',
        '<circle cx="14" cy="27.2" r="2.4" fill="var(--orange)" opacity="0.6" stroke="' + INK + '" stroke-width="1.3"/>',
        '<circle cx="22" cy="26" r="2.4" fill="none" stroke="' + INK + '" stroke-width="1.3"/>',
        '<path d="M28 1.5l1.4 1.4M28 2.9L29.4 1.5" stroke="' + INK + '" stroke-width="1.1" stroke-linecap="round"/>'
      ])
    }
  ];

  function cardHTML(c){
    var href = '/opportunities?tab=all&category=' + encodeURIComponent(c.name);
    return '<a class="cat-card" href="' + href + '" target="_parent" aria-label="Browse ' + c.name + ' opportunities">' +
      '<div class="cat-icon" style="background:' + (c.bg || 'var(--icon-bg)') + '">' +
        '<svg viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg">' + c.icon + '</svg>' +
      '</div>' +
      '<div class="cat-body"><h4>' + c.name + '</h4><p>' + c.desc + '</p></div>' +
    '</a>';
  }

  var track = document.getElementById('track');
  track.innerHTML = categories.map(cardHTML).join('');

  var slider = document.querySelector('.cat-slider');
  var step = 360;
  document.getElementById('prevBtn').addEventListener('click', function () {
    slider.scrollBy({ left: -step, behavior: 'smooth' });
  });
  document.getElementById('nextBtn').addEventListener('click', function () {
    slider.scrollBy({ left: step, behavior: 'smooth' });
  });

  (function(){
    function post(){ try{ parent.postMessage({ bbfHeight: Math.ceil(document.body.getBoundingClientRect().height) + 12 }, '*'); }catch(e){} }
    window.addEventListener('load', post);
    window.addEventListener('resize', post);
    window.addEventListener('orientationchange', post);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(post);
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

export function InternshipBrowseByField() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(340);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.bbfHeight === 'number') setHeight(Math.max(180, e.data.bbfHeight));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <section id="opportunities" aria-label="Browse opportunities by field">
      <iframe
        ref={ref}
        title="Browse opportunities by field"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="block w-full border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
