'use client';

import { useEffect, useRef, useState } from 'react';

// Direct Admission Desk — a compact problem→solution band for the homepage,
// embedded in an isolated iframe (like HomeExplainer) so its CSS/JS can't collide
// with the app. Body + card are transparent, so the site's ivory paper shows
// through and the handwritten "Apply" button reads as sitting on the page
// background. The iframe reports its own height (auto-resize) and the Apply
// button posts a message that opens the College Fit Quiz in the parent.
const SRC = `<!doctype html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@500;600;700&family=Caveat:wght@700&display=swap" rel="stylesheet">
<style>
:root{--paper:#F6F4EE;--white:#FFFFFF;--hill:#EDE8DA;--ink:#1A1433;--ink-2:#575170;--ink-3:#8B86A0;--line:#E6E1D3;--violet:#5A31F4;--violet-soft:#EFEAFF;--marigold:#F2A31B;--marigold-soft:#FDF1DA;--green:#0E8A5C;--font-display:"Bricolage Grotesque",system-ui,sans-serif;--font-body:"Hanken Grotesk",system-ui,sans-serif;--font-hand:"Caveat",cursive;--font-mono:ui-monospace,"SF Mono",Menlo,monospace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent}
body{font-family:var(--font-body);color:var(--ink);padding:2px;overflow:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none;cursor:pointer}
svg{display:block}
:focus-visible{outline:3px solid var(--violet);outline-offset:4px;border-radius:10px}

.desk{
  max-width:980px;width:100%;margin:0 auto;
  background:transparent;border:1px solid var(--line);border-radius:24px;
  border-left:5px solid var(--marigold);
  padding:26px 28px;
  display:grid;grid-template-columns:1fr auto;gap:26px;align-items:center;
}
@media(max-width:720px){.desk{grid-template-columns:1fr;padding:22px 20px}}
.desk .k{font-family:var(--font-mono);font-size:10.5px;letter-spacing:2.8px;text-transform:uppercase;color:var(--violet)}
.desk h2{font-family:var(--font-display);font-weight:800;font-size:clamp(21px,3.4vw,27px);letter-spacing:-.02em;line-height:1.15;margin:8px 0}
.desk h2 .u{position:relative;display:inline-block;white-space:nowrap}
.desk .arc{position:absolute;left:0;right:0;bottom:-4px;height:7px;width:100%;color:var(--marigold)}
.desk p{font-size:14px;color:var(--ink-2);font-weight:500;max-width:520px}
.desk p b{color:var(--ink)}
.cats{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}
.cats span{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:var(--ink-2);background:var(--white);border:1px solid var(--line);border-radius:999px;padding:6px 12px}
.cats span i{width:5px;height:5px;border-radius:50%;background:var(--marigold);flex:none}
.trustline{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:11.5px;font-weight:700;color:var(--ink-3)}
.trustline b{display:inline-flex;align-items:center;gap:5px;color:var(--green)}
.trustline svg{width:12px;height:12px}

.applybtn{position:relative;text-align:center;padding:6px 18px 14px;justify-self:center}
.aword{display:block;font-family:var(--font-hand);font-weight:700;font-size:clamp(52px,7vw,64px);line-height:.95;color:var(--ink);transform:rotate(-3deg);transition:color .18s ease,transform .18s ease}
.applybtn:hover .aword{color:var(--violet);transform:rotate(-3deg) scale(1.04)}
.swash{width:100%;max-width:190px;height:26px;margin:-4px auto 0;overflow:visible}
.swash path{fill:none;stroke:var(--marigold);stroke-width:5;stroke-linecap:round;stroke-dasharray:240;stroke-dashoffset:0}
.applybtn:hover .swash path{animation:swashdraw .6s ease}
@keyframes swashdraw{from{stroke-dashoffset:240}to{stroke-dashoffset:0}}
.asub{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-family:var(--font-mono);font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:var(--ink-2);font-weight:700}
.asub svg{width:13px;height:13px;transition:transform .18s ease}
.applybtn:hover .asub svg{transform:translateX(4px)}
@media(prefers-reduced-motion:reduce){.applybtn:hover .swash path{animation:none}.applybtn:hover .aword{transform:rotate(-3deg)}}
</style></head>
<body>
<section class="desk">
  <div>
    <span class="k">Direct Admission Desk</span>
    <h2>Don't pay just <span class="u">to ask.
      <svg class="arc" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none"/></svg></span>
    </h2>
    <p>Application forms charge you for <b>answers.</b> Fill one free form — a college counselor calls you with the real details, for any college:</p>
    <div class="cats">
      <span><i></i>Scholarships &amp; aid</span>
      <span><i></i>Complete fee structure</span>
      <span><i></i>Seats, deadlines &amp; documents</span>
      <span><i></i>Loans &amp; EMI</span>
      <span><i></i>Policies &amp; special cases</span>
    </div>
    <div class="trustline">
      <b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>No charges, ever</b>
      <span>Verified answers, not brochure claims</span>
      <span>One call — no spam</span>
    </div>
  </div>
  <a class="applybtn" href="#" id="applyBtn" aria-label="Apply — free, takes 2 minutes">
    <span class="aword">Apply</span>
    <svg class="swash" viewBox="0 0 200 26" preserveAspectRatio="none" aria-hidden="true"><path d="M6 20 C 50 26, 130 22, 194 6"/></svg>
    <span class="asub">free · 2 minutes
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </span>
  </a>
</section>
<script>
(function(){
  function post(){try{parent.postMessage({dadHeight:Math.ceil(document.querySelector('.desk').getBoundingClientRect().height)+8},'*');}catch(e){}}
  window.addEventListener('load',post);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(post);
  if(window.ResizeObserver){new ResizeObserver(post).observe(document.body);}else{setTimeout(post,400);}
  var b=document.getElementById('applyBtn');
  if(b)b.addEventListener('click',function(e){e.preventDefault();try{parent.postMessage({dadApply:true},'*');}catch(e){}});
})();
</script>
</body></html>`;

export function HomeAdmissionDesk({ onApply }: { onApply?: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(280);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.dadHeight === 'number') setHeight(Math.max(140, e.data.dadHeight));
      if (e.data?.dadApply) onApply?.();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onApply]);

  return (
    <section aria-label="Direct Admission Desk" className="-mx-1 sm:mx-0">
      <iframe
        ref={ref}
        title="Direct Admission Desk — fill one free form, a counselor calls you"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="mx-auto block w-full max-w-[1000px] border-0 bg-transparent"
        style={{ height }}
      />
    </section>
  );
}
