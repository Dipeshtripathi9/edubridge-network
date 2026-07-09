'use client';

// Self-contained animated explainer (Quiz → Expert review → Fit list → Call),
// embedded in an isolated iframe so its CSS/JS can't collide with the app. The
// stage background is the site's ivory paper and the card chrome is removed, so
// it blends into the page rather than reading as a separate boxed component.
const SRC = `<!doctype html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--paper:#F6F4EE;--white:#FFFFFF;--hill:#EDE8DA;--ink:#1A1433;--ink-2:#575170;--ink-3:#8B86A0;--line:#E6E1D3;--violet:#5A31F4;--violet-dark:#4A26D6;--violet-soft:#EFEAFF;--violet-deep:#241263;--marigold:#F2A31B;--marigold-soft:#FDF1DA;--green:#0E8A5C;--green-soft:#E4F4EC;--font-display:"Bricolage Grotesque",system-ui,sans-serif;--font-body:"Hanken Grotesk",system-ui,sans-serif;--font-mono:ui-monospace,"SF Mono",Menlo,monospace}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body);background:var(--paper);color:var(--ink);min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;-webkit-font-smoothing:antialiased}
svg{display:block}
.stage-wrap{width:100%}
.stage{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--paper);container-type:inline-size}
.fx,.pop,.zoom{opacity:0}
.stage.run .fx{animation:fadeUp .6s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:var(--d,0s)}
.stage.run .pop{animation:popIn .45s cubic-bezier(.2,.9,.3,1.35) forwards;animation-delay:var(--d,0s)}
.stage.run .zoom{animation:zoomIn .55s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:var(--d,0s)}
@keyframes fadeUp{from{opacity:0;transform:translateY(2cqi)}to{opacity:1;transform:none}}
@keyframes popIn{from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)}}
@keyframes zoomIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
.phase{opacity:0}
.stage.run .phaseA{animation:phaseIn .6s ease forwards .5s,phaseOut .6s ease forwards 9.2s}
.stage.run .phaseB{animation:phaseIn .6s ease forwards 9.8s,phaseOut .6s ease forwards 16.8s}
.stage.run .phaseC{animation:phaseIn .6s ease forwards 17.4s,phaseOut .6s ease forwards 24s}
.stage.run .phaseD{animation:phaseIn .6s ease forwards 24.6s,phaseOut .6s ease forwards 29.2s}
@keyframes phaseIn{from{opacity:0;transform:translateY(2.2cqi)}to{opacity:1;transform:none}}
@keyframes phaseOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-1.8cqi);visibility:hidden}}
.head{position:absolute;top:2.6cqi;left:4cqi;right:4cqi;display:flex;align-items:center;gap:1.4cqi;z-index:30}
.head svg.mark{width:3.6cqi;height:3.6cqi;flex:none}
.head b{font-family:var(--font-display);font-weight:800;font-size:2.1cqi;letter-spacing:-.02em;white-space:nowrap}
.head span{font-size:1.6cqi;color:var(--ink-2);font-weight:600;border-left:.15cqi solid var(--line);padding-left:1.4cqi}
.head span i{font-style:normal;position:relative;white-space:nowrap}
.head .arc{position:absolute;left:0;right:0;bottom:-.8cqi;height:.9cqi;width:100%;color:var(--marigold)}
.board{position:absolute;top:9.4cqi;left:4cqi;right:4cqi;bottom:8.8cqi;display:grid;grid-template-columns:25cqi 1fr 26cqi;gap:2.6cqi}
.panel{position:relative}
.plabel{font-family:var(--font-mono);font-size:1.2cqi;letter-spacing:.28em;text-transform:uppercase;color:var(--violet);margin-bottom:1.2cqi}
.phone{background:#fff;border:.42cqi solid var(--ink);border-radius:2.8cqi;padding:1.9cqi;width:100%}
.pbar{height:.8cqi;border-radius:99px;background:var(--hill);overflow:hidden;margin-bottom:1.5cqi}
.pbar i{display:block;height:100%;border-radius:99px;background:var(--marigold);width:8%}
.stage.run .pbar i{animation:prog 6s ease forwards 1.2s}
@keyframes prog{0%{width:8%}34%{width:40%}56%{width:40%}90%{width:74%}100%{width:74%}}
.qq{position:relative;height:16.8cqi}
.qblock{position:absolute;inset:0}
.qblock h3{font-family:var(--font-display);font-size:1.75cqi;font-weight:700;margin-bottom:1cqi}
.qopt{border:.17cqi solid var(--line);border-radius:1.3cqi;background:#fff;font-weight:700;font-size:1.38cqi;padding:.95cqi 1.25cqi;margin-bottom:.8cqi;color:var(--ink)}
.q1{opacity:1}
.stage.run .q1{animation:qOut .5s ease forwards 4.6s}
@keyframes qOut{to{opacity:0;transform:translateX(-2.4cqi)}}
.q2{opacity:0;transform:translateX(2.4cqi)}
.stage.run .q2{animation:qIn .5s ease forwards 5s}
@keyframes qIn{to{opacity:1;transform:none}}
.stage.run .q1 .pick{animation:pick .4s ease forwards 3s}
.stage.run .q2 .pick{animation:pick .4s ease forwards 6.6s}
@keyframes pick{to{background:var(--violet);border-color:var(--violet);color:#fff}}
.tap{position:absolute;width:3cqi;height:3cqi;border-radius:50%;border:.34cqi solid var(--violet);opacity:0;pointer-events:none;right:2cqi;top:6.7cqi}
.stage.run .tap.t1{animation:tapfx .7s ease-out 2.8s}
.stage.run .tap.t2{animation:tapfx .7s ease-out 6.4s}
@keyframes tapfx{0%{opacity:0;transform:scale(.4)}30%{opacity:1}100%{opacity:0;transform:scale(1.5)}}
.pdone{display:flex;align-items:center;gap:.9cqi;margin-top:1.3cqi;font-size:1.32cqi;font-weight:800;color:var(--green);opacity:0}
.stage.run .pdone{animation:fadeUp .5s ease forwards 7.8s}
.pdone svg{width:1.6cqi;height:1.6cqi;flex:none}
.review{background:#fff;border:.17cqi solid var(--line);border-radius:2.2cqi;padding:2cqi;box-shadow:0 1cqi 3cqi -1.4cqi rgba(26,20,51,.28)}
.rev-head{display:flex;align-items:center;gap:1.3cqi;margin-bottom:1.5cqi}
.rav{width:4.6cqi;height:4.6cqi;border-radius:50%;flex:none;position:relative;background:var(--violet);color:#fff;font-family:var(--font-display);font-weight:800;font-size:1.7cqi;display:flex;align-items:center;justify-content:center}
.rav .dot{position:absolute;right:-.1cqi;bottom:-.1cqi;width:1.3cqi;height:1.3cqi;border-radius:50%;background:var(--green);border:.28cqi solid #fff}
.rev-head b{display:block;font-family:var(--font-display);font-size:1.75cqi;letter-spacing:-.02em}
.rev-head span{font-size:1.22cqi;color:var(--ink-2);font-weight:600}
.prow{display:flex;align-items:center;gap:1.1cqi;padding:1cqi 1.1cqi;border-radius:1.3cqi;margin-bottom:.7cqi;background:var(--paper)}
.prow .pic{width:2.9cqi;height:2.9cqi;border-radius:.95cqi;flex:none;background:#fff;border:.14cqi solid var(--line);color:var(--ink-2);display:flex;align-items:center;justify-content:center}
.prow .pic svg{width:1.5cqi;height:1.5cqi}
.prow b{flex:1;font-size:1.4cqi;font-weight:800;color:var(--ink)}
.prow small{display:block;font-size:1.03cqi;color:var(--ink-3);font-weight:600}
.pcheck{width:2.2cqi;height:2.2cqi;border-radius:50%;flex:none;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;opacity:0}
.pcheck svg{width:1.15cqi;height:1.15cqi}
.stage.run .pcheck{animation:popIn .45s cubic-bezier(.2,.9,.3,1.4) forwards;animation-delay:var(--d)}
.rev-foot{display:inline-flex;align-items:center;gap:.9cqi;margin-top:1cqi;background:var(--green-soft);color:var(--green);font-weight:800;font-size:1.25cqi;padding:.8cqi 1.5cqi;border-radius:99px;opacity:0}
.stage.run .rev-foot{animation:fadeUp .5s ease forwards 15.2s}
.rev-foot svg{width:1.4cqi;height:1.4cqi;flex:none}
.center h2{font-family:var(--font-display);font-weight:800;font-size:2.5cqi;letter-spacing:-.02em;line-height:1.15;margin-bottom:1.5cqi}
.center h2 b{color:var(--violet)}
.ccard{background:#fff;border:.16cqi solid var(--line);border-radius:1.9cqi;padding:1.6cqi 1.8cqi;margin-bottom:1.2cqi;box-shadow:0 1cqi 3cqi -1.5cqi rgba(26,20,51,.28)}
.ccard.win{border-color:var(--violet);border-width:.26cqi}
.ccard-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.85cqi}
.ccard-top b{font-family:var(--font-display);font-size:1.9cqi;letter-spacing:-.02em}
.ccard-top .rk{font-family:var(--font-mono);font-size:1.02cqi;letter-spacing:.16em;color:var(--violet);background:var(--violet-soft);padding:.45cqi 1.05cqi;border-radius:99px;white-space:nowrap}
.fitline{display:flex;align-items:center;gap:1.2cqi;margin-bottom:1cqi}
.fitline .fb{flex:1;height:.85cqi;border-radius:99px;background:var(--hill);overflow:hidden}
.fitline .fb i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--violet),#8A6BFF)}
.stage.run .fitline .fb i{animation:grow 1s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:var(--d)}
@keyframes grow{to{width:var(--w)}}
.fitline em{font-style:normal;font-family:var(--font-display);font-weight:800;font-size:1.65cqi;white-space:nowrap}
.chips{display:flex;gap:.65cqi;flex-wrap:wrap}
.chips span{font-size:1.1cqi;font-weight:800;padding:.5cqi 1cqi;border-radius:99px;background:var(--paper);border:.13cqi solid var(--line);color:var(--ink-2);white-space:nowrap}
.chips span b{color:var(--ink)}
.call-wrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-46%);width:30cqi;z-index:35}
.call{background:#fff;border:.2cqi solid var(--line);border-radius:2.2cqi;padding:2.2cqi;box-shadow:0 2cqi 5cqi -2cqi rgba(26,20,51,.5);position:relative}
.call-label{position:absolute;top:-2.4cqi;left:.2cqi;font-family:var(--font-mono);font-size:1.1cqi;letter-spacing:.26em;text-transform:uppercase;color:var(--violet)}
.call-top{display:flex;align-items:center;gap:1.1cqi;margin-bottom:1.1cqi}
.cav{width:4cqi;height:4cqi;border-radius:50%;flex:none;position:relative;background:var(--violet);color:#fff;font-family:var(--font-display);font-weight:800;font-size:1.5cqi;display:flex;align-items:center;justify-content:center}
.cav .dot{position:absolute;right:-.1cqi;bottom:-.1cqi;width:1.2cqi;height:1.2cqi;border-radius:50%;background:var(--green);border:.26cqi solid #fff}
.stage.run .cav .dot{animation:pulse 1.6s ease infinite 25.6s}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(14,138,92,.5)}50%{box-shadow:0 0 0 1cqi rgba(14,138,92,0)}}
.call-top b{display:block;font-family:var(--font-display);font-size:1.55cqi;letter-spacing:-.02em}
.call-top span{font-size:1.12cqi;color:var(--ink-2);font-weight:700}
.call-top .on{color:var(--green);font-weight:800}
.wave{display:flex;align-items:flex-end;gap:.45cqi;height:2.1cqi;margin-bottom:1.1cqi}
.wave i{width:.55cqi;border-radius:99px;background:var(--violet);height:30%}
.stage.run .wave i{animation:eq 1s ease-in-out infinite;animation-delay:calc(25.6s + var(--w,0s))}
.wave i:nth-child(1){--w:.0s}.wave i:nth-child(2){--w:.15s}.wave i:nth-child(3){--w:.3s}
.wave i:nth-child(4){--w:.45s}.wave i:nth-child(5){--w:.6s}.wave i:nth-child(6){--w:.75s}
@keyframes eq{0%,100%{height:26%}50%{height:96%}}
.call p{font-size:1.2cqi;color:var(--ink-2);font-weight:600;line-height:1.45}
.call p b{color:var(--ink)}
@media(prefers-reduced-motion:reduce){.stage *,.stage.run *{animation:none!important}.phase,.fx,.pop,.zoom,.pcheck,.rev-foot,.pdone{opacity:1!important}.fitline .fb i{width:var(--w)!important}.pbar i{width:74%!important}.q2{opacity:1!important;transform:none!important}.q1{opacity:0!important}}
</style></head>
<body>
<div class="stage-wrap"><div class="stage run" id="stage">
  <div class="head fx" style="--d:.2s">
    <svg class="mark" viewBox="0 0 44 44" fill="none" aria-hidden="true"><rect width="44" height="44" rx="13" fill="#5A31F4"/><path d="M9 30 C 15 15, 29 15, 35 30" stroke="#F2A31B" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="9" cy="30" r="3.4" fill="#F6F4EE"/><circle cx="35" cy="30" r="3.4" fill="#F6F4EE"/></svg>
    <b>EduBridge Network</b>
    <span>Helping thousands of students find their college — <i>according to their fit.<svg class="arc" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none"/></svg></i></span>
  </div>
  <div class="board">
    <div class="panel phase phaseA">
      <div class="plabel">Step 1 · Answer the quiz</div>
      <div class="phone">
        <div class="pbar"><i></i></div>
        <div class="qq">
          <div class="qblock q1"><h3>Your yearly budget?</h3><div class="qopt">Under ₹2 L</div><div class="qopt pick">₹4 – 6 L</div><div class="qopt">₹6 L +</div></div>
          <div class="qblock q2"><h3>Hostel needed?</h3><div class="qopt">Day scholar</div><div class="qopt pick">Yes — hostel</div><div class="qopt">Not sure yet</div></div>
          <span class="tap t1"></span><span class="tap t2"></span>
        </div>
        <div class="pdone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>Quiz complete — sent for review</div>
      </div>
    </div>
    <div class="panel center phase phaseC">
      <div class="plabel">Step 3 · Your fit list</div>
      <h2>After the review — <b>colleges that fit you.</b></h2>
      <div class="ccard win"><div class="ccard-top"><b>Shiv Nadar University</b><span class="rk">Match #1</span></div><div class="fitline"><div class="fb"><i style="--w:94%;--d:18.4s"></i></div><em>94% fit</em></div><div class="chips"><span class="pop" style="--d:18.6s">Placement <b>94%</b></span><span class="pop" style="--d:18.8s">Hostel <b>4.2★</b></span><span class="pop" style="--d:19s">Food <b>3.9★</b></span><span class="pop" style="--d:19.2s">ROI <b>2.7×</b></span></div></div>
      <div class="ccard zoom" style="--d:19.6s"><div class="ccard-top"><b>Bennett University</b><span class="rk">Match #2</span></div><div class="fitline"><div class="fb"><i style="--w:91%;--d:20.2s"></i></div><em>91% fit</em></div><div class="chips"><span class="pop" style="--d:20.4s">Placement <b>92%</b></span><span class="pop" style="--d:20.6s">Hostel <b>4.0★</b></span><span class="pop" style="--d:20.8s">Food <b>4.1★</b></span><span class="pop" style="--d:21s">ROI <b>1.5×</b></span></div></div>
      <div class="ccard zoom" style="--d:21.4s"><div class="ccard-top"><b>Galgotias University</b><span class="rk">Match #3</span></div><div class="fitline"><div class="fb"><i style="--w:88%;--d:22s"></i></div><em>88% fit</em></div><div class="chips"><span class="pop" style="--d:22.2s">Placement <b>88%</b></span><span class="pop" style="--d:22.4s">Hostel <b>3.8★</b></span><span class="pop" style="--d:22.6s">Food <b>3.7★</b></span><span class="pop" style="--d:22.8s">ROI <b>2.7×</b></span></div></div>
    </div>
    <div class="panel phase phaseB">
      <div class="plabel">Step 2 · Expert review</div>
      <div class="review">
        <div class="rev-head"><span class="rav">AN<span class="dot"></span></span><div><b>Expert review</b><span>on verified student + college data</span></div></div>
        <div class="prow"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg></span><b>Placements<small>packages cross-checked</small></b><span class="pcheck" style="--d:11.2s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span></div>
        <div class="prow"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg></span><b>Hostel<small>rated by residents</small></b><span class="pcheck" style="--d:12.2s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span></div>
        <div class="prow"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7a3 3 0 0 0 6 0V2"/><path d="M6 2v20"/><path d="M18 2c-2 2-3 4.5-3 7 0 2 1 3 3 3v10"/></svg></span><b>Food &amp; mess<small>rated by residents</small></b><span class="pcheck" style="--d:13.2s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span></div>
        <div class="prow" style="margin-bottom:0"><span class="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5A2.6 2.6 0 0 0 9.4 10c0 3 5.2 1 5.2 4a2.6 2.6 0 0 1-2.6 2.5A2.5 2.5 0 0 1 9.5 15"/><path d="M12 6.5v11"/></svg></span><b>Fees &amp; ROI<small>cross-checked</small></b><span class="pcheck" style="--d:14.2s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span></div>
        <span class="rev-foot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>Every parameter verified — no AI guesses</span>
      </div>
    </div>
  </div>
  <div class="call-wrap"><div class="call phase phaseD">
    <span class="call-label">Step 4 · Expert on call</span>
    <div class="call-top"><span class="cav">AN<span class="dot"></span></span><div><b>Ananya Sharma</b><span>8 yrs experience · <span class="on">Online now</span></span></div></div>
    <div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <p><b>Free 5-min call</b> — stuck anywhere? A human expert walks you through it.</p>
  </div></div>
</div></div>
<script>
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var stage=document.getElementById('stage');
  setInterval(function(){stage.classList.remove('run');void stage.offsetWidth;stage.classList.add('run');},30000);
})();
</script>
</body></html>`;

export function HomeExplainer() {
  return (
    <section aria-label="How EduBridge works" className="-mx-1 sm:mx-0">
      <iframe
        title="How EduBridge works — quiz, expert review, fit list, call"
        srcDoc={SRC}
        loading="lazy"
        scrolling="no"
        className="mx-auto block w-full max-w-[1040px] border-0 bg-transparent"
        style={{ aspectRatio: '16 / 9' }}
      />
    </section>
  );
}
