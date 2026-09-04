'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileProgress } from '@/stores/profile-progress.store';
import { useMyProfileLead, useUpsertProfileStep } from '@/hooks/use-profile-leads';
import { useMe, useVerifyGoogle } from '@/hooks/use-profile';
import { GoogleVerifyButton } from '@/components/social-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { COURSE_TAXONOMY } from '@/lib/course-taxonomy';

// The 2-step EduBridge Profile form, embedded in an isolated iframe (its own
// fonts/CSS/JS). Name/mobile/gender/state are already collected at signup —
// this only covers what signup doesn't: course/city preferences and academic
// details for college + scholarship matching. Each completed step posts its
// % to the parent so the progress bar + drawer line advance (50 · 90 · 100).
// Internally still tagged eduStep 3/4 (matching the ProfileLead.step3/step4
// database columns) even though only two steps are shown — renumbering the
// columns themselves isn't worth a migration for a cosmetic step count.
// String.raw keeps the regex backslashes in the script intact.
const SRC = String.raw`<!doctype html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@font-face { font-family:'Bricolage Grotesque'; font-style:normal; font-weight:700; font-display:swap; src:url(/fonts/bricolage-grotesque-variable.woff2) format('woff2'); }
@font-face { font-family:'Bricolage Grotesque'; font-style:normal; font-weight:800; font-display:swap; src:url(/fonts/bricolage-grotesque-variable.woff2) format('woff2'); }
@font-face { font-family:'Hanken Grotesk'; font-style:normal; font-weight:400; font-display:swap; src:url(/fonts/hanken-grotesk-variable.woff2) format('woff2'); }
@font-face { font-family:'Hanken Grotesk'; font-style:normal; font-weight:500; font-display:swap; src:url(/fonts/hanken-grotesk-variable.woff2) format('woff2'); }
@font-face { font-family:'Hanken Grotesk'; font-style:normal; font-weight:600; font-display:swap; src:url(/fonts/hanken-grotesk-variable.woff2) format('woff2'); }
@font-face { font-family:'Hanken Grotesk'; font-style:normal; font-weight:700; font-display:swap; src:url(/fonts/hanken-grotesk-variable.woff2) format('woff2'); }
:root{--paper:#F1EDE4;--white:#FFFFFF;--hill:#E6E1D5;--ink:#1A1433;--ink-2:#575170;--ink-3:#8B86A0;--bord:#C9C2B4;--line:#E6E1D3;--violet:#5A31F4;--violet-dark:#4A26D6;--violet-soft:#EFEAFF;--marigold:#F2A31B;--green:#0E8A5C;--green-soft:#E4F4EC;--font-display:"Bricolage Grotesque",system-ui,sans-serif;--font-body:"Hanken Grotesk",system-ui,sans-serif;--font-mono:ui-monospace,"SF Mono",Menlo,monospace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent}
body{font-family:var(--font-body);color:var(--ink);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
svg{display:block}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
input,select{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--violet);outline-offset:2px;border-radius:6px}
.wrap{max-width:560px;margin:0 auto;padding:6px 4px 30px}
.scr{display:none}
.scr.on{display:block;animation:in .25s ease}
@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.step-k{font-family:var(--font-mono);font-size:12px;letter-spacing:2.6px;text-transform:uppercase;color:var(--ink-2);font-weight:600}
h1{font-family:var(--font-display);font-weight:800;font-size:clamp(27px,6.2vw,34px);letter-spacing:-.02em;line-height:1.12;margin:10px 0 12px}
.sub{font-size:16px;color:var(--ink-2);margin-bottom:22px}
.sub i{font-style:italic;color:var(--ink)}
.stat{display:flex;align-items:center;gap:16px;background:var(--violet-soft);border-radius:6px;padding:14px 16px;margin-bottom:22px}
.stat b{font-family:var(--font-display);font-size:24px;font-weight:800}
.stat span{font-size:14.5px;color:var(--ink-2);font-weight:600}
.flab{font-size:16.5px;font-weight:700;margin:18px 0 8px}
.flab small{display:block;font-size:13px;color:var(--ink-2);font-weight:500}
.fbox{position:relative;margin-bottom:12px}
.fbox > label{position:absolute;top:-8px;left:12px;z-index:2;background:var(--paper);padding:0 6px;font-size:12.5px;font-weight:600;color:var(--ink-2)}
.fbox input,.fbox select{width:100%;background:var(--white);border:1.5px solid var(--bord);border-radius:8px;padding:15px 14px;font-size:16.5px;font-weight:500;outline:none;appearance:none;-webkit-appearance:none}
.fbox input:focus,.fbox select:focus{border-color:var(--violet)}
.fbox .hint{font-size:12.5px;color:var(--ink-2);margin-top:5px;font-weight:500}
.fbox.sel::after{content:"";position:absolute;right:16px;top:50%;width:9px;height:9px;border-right:2.4px solid var(--ink);border-bottom:2.4px solid var(--ink);transform:translateY(-70%) rotate(45deg);pointer-events:none}
.qcard{background:var(--white);border:1px solid var(--line);border-radius:8px;padding:16px;margin-top:18px}
.qcard .qhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.qcard .qhead b{font-size:16.5px;font-weight:700}
.qcard .back{font-size:14px;font-weight:600;color:var(--ink-2)}
.qopt{display:block;width:100%;text-align:center;background:var(--hill);border-radius:8px;font-size:16px;font-weight:700;padding:15px 14px;margin-bottom:10px;transition:background .12s ease}
.qopt:hover{background:#DCD6C7}
.qopt:last-child{margin-bottom:0}
.qopt.picked{background:var(--violet-soft);color:var(--violet);box-shadow:inset 0 0 0 1.5px var(--violet)}
.ns-done{margin-top:8px;font-size:14.5px;font-weight:600;color:var(--green)}
.ta{position:relative}
.ta-drop{position:absolute;top:calc(100% + 2px);left:0;right:0;z-index:40;background:var(--white);border:1px solid var(--bord);border-radius:8px;box-shadow:0 12px 28px -12px rgba(26,20,51,.25);overflow:hidden;display:none;max-height:260px;overflow-y:auto}
.ta-drop.open{display:block}
.ta-drop button{display:block;width:100%;text-align:left;padding:12px 14px;border-bottom:1px solid var(--line)}
.ta-drop button:last-child{border-bottom:none}
.ta-drop button:hover{background:var(--violet-soft)}
.ta-drop .tn{font-size:16px;font-weight:500}
.ta-drop .tn b{font-weight:800}
.fbox.filled .clear{display:flex}
.fbox .clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:26px;height:26px;display:none;align-items:center;justify-content:center;color:var(--ink-2)}
.fbox .clear svg{width:14px;height:14px}
.addmore{display:block;width:100%;text-align:center;background:var(--hill);border-radius:8px;border:1px solid var(--bord);font-size:15.5px;font-weight:700;text-decoration:underline;color:var(--ink);padding:14px;margin-top:2px}
.crs-card{position:relative;border:1px solid var(--bord);border-radius:8px;background:#FAF8F2;padding:14px 14px 12px;margin-bottom:12px}
.crs-card .rm{position:absolute;top:12px;right:12px;font-size:12.5px;font-weight:700;color:#B4470B;text-decoration:underline;background:none;border:none;cursor:pointer;padding:0}
.crs-row{display:grid;grid-template-columns:1fr;gap:8px;margin-top:6px}
.crs-field{position:relative;min-width:0}
.crs-trig{width:100%;min-width:0;text-align:left;font:inherit;font-size:14.5px;padding:13px 12px;background:var(--white);border:1.5px solid var(--bord);border-radius:8px;color:var(--ink);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:6px}
.crs-trig .ph{color:var(--ink-2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crs-trig .ch{font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crs-trig:disabled{cursor:not-allowed;color:var(--ink-3)}
.crs-trig.open{border-color:var(--violet)}
.crs-chev{font-size:10px;color:var(--ink-2);flex-shrink:0}
.crs-panel{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--white);border:1.5px solid var(--bord);border-radius:8px;box-shadow:0 12px 28px -12px rgba(26,20,51,.25);z-index:30;overflow:hidden;display:none}
.crs-panel.show{display:block}
.crs-panel-head{display:none;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line);font-weight:700;font-size:14px}
.crs-panel-close{font-size:22px;line-height:1;background:none;border:none;color:var(--ink-2);cursor:pointer;padding:2px 6px}
.crs-search{padding:8px;border-bottom:1px solid var(--line)}
.crs-search input{width:100%;font:inherit;font-size:14px;padding:9px 11px;border:1.5px solid var(--bord);border-radius:7px;outline:none}
.crs-search input:focus{border-color:var(--violet)}
.crs-list{max-height:220px;overflow-y:auto}
.crs-opt{padding:11px 14px;font-size:14.5px;cursor:pointer;border-bottom:1px solid var(--line)}
.crs-opt:last-child{border-bottom:none}
.crs-opt:hover{background:var(--violet-soft)}
.crs-empty{padding:12px 14px;font-size:13.5px;color:var(--ink-2);font-style:italic}
@media(max-width:680px){
  .crs-panel{position:fixed;top:0;left:0;right:0;bottom:0;border-radius:0;border:none;box-shadow:none;z-index:1000;display:none;flex-direction:column}
  .crs-panel.show{display:flex}
  .crs-panel-head{display:flex}
  .crs-search{padding:16px}
  .crs-search input{font-size:16px;padding:13px 14px}
  .crs-list{flex:1 1 auto;max-height:none}
  .crs-opt{font-size:16px;padding:16px 16px}
}
.up{display:flex;align-items:center;gap:11px;border:1.6px dashed var(--bord);border-radius:8px;background:var(--white);padding:12px 14px;cursor:pointer;transition:border-color .15s ease;margin-bottom:12px}
.up:hover{border-color:var(--violet)}
.up .uic{width:34px;height:34px;border-radius:8px;flex:none;background:var(--violet-soft);color:var(--violet);display:flex;align-items:center;justify-content:center}
.up .uic svg{width:16px;height:16px}
.up div{flex:1;min-width:0}
.up b{display:block;font-size:14px;font-weight:800}
.up small{font-size:12px;color:var(--ink-3);font-weight:600}
.up input[type=file]{display:none}
.up.done{border-style:solid;border-color:var(--green);background:var(--green-soft)}
.up.done .uic{background:var(--white);color:var(--green)}
.up .clr{width:22px;height:22px;border-radius:50%;flex:none;display:none;background:var(--white);color:var(--ink-2);border:1px solid var(--line);align-items:center;justify-content:center}
.up.done .clr{display:flex}
.up .clr svg{width:10px;height:10px}
.exblk{border:1px solid var(--bord);border-radius:8px;background:#FAF8F2;padding:14px;margin-bottom:12px}
.exblk .exhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.exblk .exhead b{font-family:var(--font-display);font-size:15px;font-weight:800}
.exblk .exhead .rmex{font-size:13px;font-weight:700;color:#B4470B;text-decoration:underline}
.exblk .fbox input{background:var(--white)}
.exblk .up{background:var(--white);margin-bottom:0}
.consent{display:flex;gap:12px;align-items:flex-start;margin:18px 0;font-size:14.5px;font-weight:500}
.consent input{width:20px;height:20px;margin-top:2px;accent-color:var(--violet);flex:none}
.consent b{font-weight:700}
.cta{display:block;width:100%;text-align:center;background:var(--violet);color:#fff;border-radius:999px;font-size:19px;font-weight:800;padding:17px;margin-top:22px;transition:background .15s ease}
.cta:hover{background:var(--violet-dark)}
.skip{display:block;width:100%;text-align:center;background:none;color:var(--ink-2);font-size:14.5px;font-weight:700;text-decoration:underline;padding:14px;margin-top:8px}
.skip:hover{color:var(--ink)}
.err{display:none;margin-top:12px;text-align:center;font-size:13.5px;font-weight:700;color:#B4470B}
.err.show{display:block}
.sentbox{text-align:center;padding:44px 0}
.sentbox .ok{width:64px;height:64px;border-radius:50%;margin:0 auto 16px;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center}
.sentbox .ok svg{width:28px;height:28px}
.sentbox h2{font-family:var(--font-display);font-weight:800;font-size:27px;letter-spacing:-.3px;margin-bottom:10px}
.sentbox p{font-size:15px;color:var(--ink-2);max-width:400px;margin:0 auto 14px}
.sentbox .seal{display:inline-flex;align-items:center;gap:8px;background:var(--green-soft);color:var(--green);border-radius:999px;font-size:12.5px;font-weight:800;padding:9px 16px}
.sentbox .seal svg{width:14px;height:14px}
</style></head>
<body>
<div class="wrap">
  <section class="scr on" id="s3">
    <div class="step-k">Step 1 of 2</div>
    <h1>Personalize your recommendations</h1>
    <p class="sub">We use your <i>EduBridge Profile</i> to match you with best-fit colleges and scholarships.</p>
    <div class="flab">Add courses you're interested in</div>
    <div id="crsCards"></div>
    <button class="addmore" id="addCrs">Add another course</button>
    <div class="flab" style="margin-top:22px">Add cities you're interested in <small>By default, we'll search across Delhi NCR.</small></div>
    <div id="ctyBoxes"></div>
    <div class="flab" style="margin-top:22px">Campus or online learning?</div>
    <div class="fbox sel"><select id="mode"><option>Campus</option><option>Online</option><option>Either</option></select></div>
    <div class="flab">Intended degree type</div>
    <div class="fbox sel"><select id="degree"><option>Bachelor's (3–4 year)</option><option>Diploma</option><option>Master's</option><option>Other</option></select></div>
    <div class="flab">Hostel needed?</div>
    <div class="fbox sel"><select id="hostel"><option>Yes — hostel</option><option>Day scholar</option><option>Not sure yet</option></select></div>
    <div class="flab">Yearly tuition budget</div>
    <div class="fbox sel"><select id="budget"><option value="">Select</option><option>Under ₹2 L</option><option>₹2–4 L</option><option>₹4–6 L</option><option>₹6 L+</option></select></div>
    <button class="cta" data-next="4">Continue</button>
    <p class="err" id="err3"></p>
  </section>
  <section class="scr" id="s4">
    <div class="step-k">Step 2 of 2</div>
    <h1>Get matched with participating colleges</h1>
    <p class="sub">Colleges offer seats and scholarships based on your academic info.</p>
    <div class="flab">School board (Class 12)</div>
    <div class="fbox sel"><select id="board"><option value="">Select board</option><option>CBSE</option><option>ICSE / ISC</option><option>UP Board</option><option>Other state board</option><option>NIOS / Open</option></select></div>
    <div class="flab">Stream</div>
    <div class="fbox sel"><select id="stream"><option value="">Select stream</option><option>PCM</option><option>PCB</option><option>PCMB</option><option>Commerce (with Maths)</option><option>Commerce (without Maths)</option><option>Arts / Humanities</option><option>Vocational</option><option>Other</option></select></div>
    <div class="flab">Class 12 passing year</div>
    <div class="fbox"><input type="text" id="passYear" inputmode="numeric" maxlength="4" placeholder="e.g. 2026"></div>
    <div class="flab">Class 12 percentage <small>out of 100 · actual or expected</small></div>
    <div class="fbox"><input type="text" id="p12" inputmode="decimal" placeholder="e.g. 91"></div>
    <div class="flab">Class 10 percentage</div>
    <div class="fbox"><input type="text" id="p10" inputmode="decimal" placeholder="e.g. 88"></div>
    <div class="flab">Marksheet <small>latest — Class 12 or Class 10 · PDF, max 2 MB · required</small></div>
    <label class="up" id="upMark">
      <span class="uic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg></span>
      <div><b id="upMarkTxt">Upload marksheet</b><small id="upMarkSub">PDF · max 2 MB</small></div>
      <span class="clr" id="upMarkClr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span>
      <input type="file" id="fMark" accept="application/pdf">
    </label>
    <div class="flab" style="margin-top:24px">Entrance exams <small>optional — add score + scorecard PDF (max 2 MB) if you have them</small></div>
    <div class="exblk">
      <div class="exhead"><b>JEE Main</b></div>
      <div class="fbox"><label>Percentile</label><input type="text" id="sc_jee" inputmode="decimal"></div>
      <label class="up" id="up_jee"><span class="uic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg></span><div><b id="up_jeeTxt">Upload scorecard</b><small id="up_jeeSub">PDF · max 2 MB · optional</small></div><span class="clr" id="up_jeeClr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span><input type="file" id="f_jee" accept="application/pdf"></label>
    </div>
    <div class="exblk">
      <div class="exhead"><b>NEET</b></div>
      <div class="fbox"><label>Score</label><input type="text" id="sc_neet" inputmode="decimal"></div>
      <label class="up" id="up_neet"><span class="uic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg></span><div><b id="up_neetTxt">Upload scorecard</b><small id="up_neetSub">PDF · max 2 MB · optional</small></div><span class="clr" id="up_neetClr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span><input type="file" id="f_neet" accept="application/pdf"></label>
    </div>
    <div class="exblk">
      <div class="exhead"><b>CUET</b></div>
      <div class="fbox"><label>Percentile / score</label><input type="text" id="sc_cuet"></div>
      <label class="up" id="up_cuet"><span class="uic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg></span><div><b id="up_cuetTxt">Upload scorecard</b><small id="up_cuetSub">PDF · max 2 MB · optional</small></div><span class="clr" id="up_cuetClr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span><input type="file" id="f_cuet" accept="application/pdf"></label>
    </div>
    <div id="customExams"></div>
    <button class="addmore" id="addExam">+ Add exam</button>
    <label class="consent"><input type="checkbox" id="c2"><span>By checking this box, I consent to receive my matches and <b>one counselor call</b> from EduBridge Network on my registered number. No marketing spam — reply STOP anytime.</span></label>
    <button class="cta" id="finish">Create my profile</button>
    <button type="button" class="skip" id="skipStep2">Skip — I don't need a scholarship match right now</button>
    <p class="err" id="err4"></p>
  </section>
  <section class="scr" id="s5">
    <div class="sentbox">
      <span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span>
      <h2 id="sentH2">Profile created!</h2>
      <p id="sentTxt"></p>
      <span class="seal" id="sentSeal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>All matches verified by a human counselor</span>
    </div>
    <div class="qcard" id="nsMenu">
      <div class="qhead"><b>While you wait — a few quick things</b></div>
      <button class="qopt" data-ns="nsQuiz">Take the 30-second college quiz</button>
      <button class="qopt" data-ns="nsCompare">Compare colleges by what matters to you</button>
      <button class="qopt" data-ns="nsApply">Apply directly to your shortlist</button>
    </div>
    <div class="qcard" id="nsQuiz" style="display:none">
      <div class="qhead"><b>What matters most to you?</b><button class="back" data-back="nsQuiz">Back</button></div>
      <button class="qopt" data-v="placements">Placements & career outcomes</button>
      <button class="qopt" data-v="fees">Fees & scholarships</button>
      <button class="qopt" data-v="location">Location & campus life</button>
      <button class="qopt" data-v="faculty">Faculty & curriculum</button>
      <p class="ns-done" id="nsQuizDone" style="display:none"></p>
    </div>
    <div class="qcard" id="nsCompare" style="display:none">
      <div class="qhead"><b>Compare colleges by…</b><button class="back" data-back="nsCompare">Back</button></div>
      <div id="nsCompareChips"></div>
      <button class="cta" id="nsCompareSave" style="margin-top:14px">Save</button>
    </div>
    <div class="qcard" id="nsApply" style="display:none">
      <div class="qhead"><b>Apply directly once matched?</b><button class="back" data-back="nsApply">Back</button></div>
      <button class="qopt" data-v="yes">Yes — apply for me</button>
      <button class="qopt" data-v="no">No — I'll decide after the call</button>
      <p class="ns-done" id="nsApplyDone" style="display:none"></p>
    </div>
  </section>
</div>
<script>
(function(){
  var COURSE_TAXONOMY=${JSON.stringify(COURSE_TAXONOMY)};
  var COURSE_FIELDS=Object.keys(COURSE_TAXONOMY);
  var CITIES=['Greater Noida','Noida','Ghaziabad','Gurugram','Faridabad','Delhi','Sonipat','Meerut'];
  var MB2=2*1024*1024;
  var PREFILL=__PREFILL_JSON__;
  var SELF=__SELF_JSON__;
  var prefillHadMarksheet=!!(PREFILL&&PREFILL.step4&&PREFILL.step4.marksheet);
  var P={courses:[],cities:[]};
  var files={};
  function selfContact(){return {eduName:(SELF&&SELF.name)||'',eduPhone:(SELF&&SELF.phone)||'',eduEmail:(SELF&&SELF.email)||''};}
  function applyPrefill(){
    if(!PREFILL)return;
    if(PREFILL.step3){
      if(PREFILL.step3.mode)document.getElementById('mode').value=PREFILL.step3.mode;
      if(PREFILL.step3.degree)document.getElementById('degree').value=PREFILL.step3.degree;
      if(PREFILL.step3.hostel)document.getElementById('hostel').value=PREFILL.step3.hostel;
      if(PREFILL.step3.budget)document.getElementById('budget').value=PREFILL.step3.budget;
    }
    if(PREFILL.step4){
      document.getElementById('board').value=PREFILL.step4.board||'';
      document.getElementById('stream').value=PREFILL.step4.stream||'';
      document.getElementById('passYear').value=PREFILL.step4.passYear||'';
      document.getElementById('p12').value=PREFILL.step4.p12||'';
      document.getElementById('p10').value=PREFILL.step4.p10||'';
      if(prefillHadMarksheet){
        document.getElementById('upMark').classList.add('done');
        document.getElementById('upMarkTxt').textContent=PREFILL.step4.marksheet;
        document.getElementById('upMarkSub').textContent='Previously uploaded · tap to replace';
      }
      if(Array.isArray(PREFILL.step4.exams)){
        PREFILL.step4.exams.forEach(function(x){
          if(x.name==='JEE Main')document.getElementById('sc_jee').value=x.score||'';
          else if(x.name==='NEET')document.getElementById('sc_neet').value=x.score||'';
          else if(x.name==='CUET')document.getElementById('sc_cuet').value=x.score||'';
        });
      }
    }
  }
  var customCount=0;
  function postPct(p){try{parent.postMessage({eduPct:p},'*');}catch(e){}}
  function postStep(step,pct,data,contact){try{parent.postMessage(Object.assign({eduStep:step,eduPct:pct,eduData:data},contact||{}),'*');}catch(e){}}
  function postH(){try{parent.postMessage({eduHeight:Math.ceil(document.body.scrollHeight)+8},'*');}catch(e){}}
  function esc(s){return s.replace(/</g,'&lt;');}
  function go(n){
    document.querySelectorAll('.scr').forEach(function(s){s.classList.remove('on');});
    document.getElementById('s'+n).classList.add('on');
    window.scrollTo({top:0});
    postH();
  }
  function err(n,m){var e=document.getElementById('err'+n);if(!m){e.classList.remove('show');return false;}e.textContent=m;e.classList.add('show');postH();return true;}
  function makeTABox(container,list,labelTxt,arr,initialValue){
    var wrap=document.createElement('div');wrap.className='fbox ta';
    wrap.innerHTML='<label>'+labelTxt+'</label><input type="text" autocomplete="off"><button class="clear" aria-label="Clear"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="ta-drop"></div>';
    var inp=wrap.querySelector('input');var drop=wrap.querySelector('.ta-drop');
    function set(v){inp.value=v;inp.readOnly=true;wrap.classList.add('filled');drop.classList.remove('open');if(arr.indexOf(v)===-1)arr.push(v);}
    function render(){var t=inp.value.trim(),tl=t.toLowerCase();drop.innerHTML='';var opts=list.filter(function(o){return tl!==''&&o.toLowerCase().indexOf(tl)>-1;}).slice(0,7);opts.forEach(function(o){var i=o.toLowerCase().indexOf(tl);var b=document.createElement('button');b.innerHTML='<span class="tn">'+esc(o.slice(0,i))+'<b>'+esc(o.slice(i,i+t.length))+'</b>'+esc(o.slice(i+t.length))+'</span>';b.addEventListener('mousedown',function(e){e.preventDefault();set(o);});drop.appendChild(b);});if(t.length>2&&!opts.some(function(o){return o.toLowerCase()===tl;})){var cb=document.createElement('button');cb.innerHTML='<span class="tn">Use "<b>'+esc(t)+'</b>"</span>';cb.addEventListener('mousedown',function(e){e.preventDefault();set(t);});drop.appendChild(cb);}drop.classList.toggle('open',document.activeElement===inp&&drop.children.length>0);}
    inp.addEventListener('input',render);inp.addEventListener('focus',render);inp.addEventListener('blur',function(){setTimeout(function(){drop.classList.remove('open');},120);});
    wrap.querySelector('.clear').addEventListener('click',function(){var idx=arr.indexOf(inp.value);if(idx>-1)arr.splice(idx,1);inp.readOnly=false;inp.value='';wrap.classList.remove('filled');inp.focus();});
    container.appendChild(wrap);
    if(initialValue)set(initialValue);
  }
  function renderOpts(container2,items,onPick){
    container2.innerHTML='';
    if(items.length===0){container2.innerHTML='<div class="crs-empty">No matches</div>';return;}
    items.forEach(function(item){var d=document.createElement('div');d.className='crs-opt';d.textContent=item;d.addEventListener('mousedown',function(e){e.preventDefault();onPick(item);});container2.appendChild(d);});
  }
  function makeCourseCard(container,courseObj,initial){
    var card=document.createElement('div');card.className='crs-card';
    card.innerHTML='<button class="rm" type="button">Remove</button><div class="crs-row">'+
      '<div class="crs-field"><button class="crs-trig" type="button"><span class="ph">Select field</span><span class="crs-chev">▾</span></button>'+
        '<div class="crs-panel"><div class="crs-panel-head"><span>Field</span><button class="crs-panel-close" type="button">×</button></div><div class="crs-search"><input type="text" placeholder="Search field..."></div><div class="crs-list"></div></div></div>'+
      '<div class="crs-field"><button class="crs-trig" type="button" disabled><span class="ph">Select field first</span><span class="crs-chev">▾</span></button>'+
        '<div class="crs-panel"><div class="crs-panel-head"><span>Degree</span><button class="crs-panel-close" type="button">×</button></div><div class="crs-search"><input type="text" placeholder="Search degree..."></div><div class="crs-list"></div></div></div>'+
      '<div class="crs-field"><button class="crs-trig" type="button" disabled><span class="ph">Select degree first</span><span class="crs-chev">▾</span></button>'+
        '<div class="crs-panel"><div class="crs-panel-head"><span>Specialization</span><button class="crs-panel-close" type="button">×</button></div><div class="crs-search"><input type="text" placeholder="Search specialization..."></div><div class="crs-list"></div></div></div>'+
      '</div>';
    container.appendChild(card);

    var groups=card.querySelectorAll('.crs-field');
    var trigField=groups[0].querySelector('.crs-trig'),panelField=groups[0].querySelector('.crs-panel'),listField=groups[0].querySelector('.crs-list'),searchField=groups[0].querySelector('.crs-search input');
    var trigDegree=groups[1].querySelector('.crs-trig'),panelDegree=groups[1].querySelector('.crs-panel'),listDegree=groups[1].querySelector('.crs-list'),searchDegree=groups[1].querySelector('.crs-search input');
    var trigSpec=groups[2].querySelector('.crs-trig'),panelSpec=groups[2].querySelector('.crs-panel'),listSpec=groups[2].querySelector('.crs-list'),searchSpec=groups[2].querySelector('.crs-search input');

    function closeAll(){[panelField,panelDegree,panelSpec].forEach(function(p){p.classList.remove('show');});[trigField,trigDegree,trigSpec].forEach(function(t){t.classList.remove('open');});}
    function openPanel(trig,panel,fillFn,searchInp){var willOpen=!panel.classList.contains('show');closeAllPanelsGlobal();if(willOpen){panel.classList.add('show');trig.classList.add('open');searchInp.value='';fillFn();searchInp.focus();}}

    function fillFieldList(){renderOpts(listField,COURSE_FIELDS,pickField);}
    function fillDegreeList(){if(!courseObj.field)return;renderOpts(listDegree,Object.keys(COURSE_TAXONOMY[courseObj.field]),pickDegree);}
    function fillSpecList(){if(!courseObj.field||!courseObj.degree)return;renderOpts(listSpec,COURSE_TAXONOMY[courseObj.field][courseObj.degree],pickSpec);}

    function pickField(f){
      courseObj.field=f;courseObj.degree=null;courseObj.specialization=null;
      trigField.innerHTML='<span class="ch">'+esc(f)+'</span><span class="crs-chev">▾</span>';
      trigDegree.disabled=false;trigDegree.innerHTML='<span class="ph">Select degree</span><span class="crs-chev">▾</span>';
      trigSpec.disabled=true;trigSpec.innerHTML='<span class="ph">Select degree first</span><span class="crs-chev">▾</span>';
      closeAll();postH();
    }
    function pickDegree(d){
      courseObj.degree=d;courseObj.specialization=null;
      trigDegree.innerHTML='<span class="ch">'+esc(d)+'</span><span class="crs-chev">▾</span>';
      var specs=COURSE_TAXONOMY[courseObj.field][d];
      if(specs.length===0){trigSpec.disabled=true;trigSpec.innerHTML='<span class="ph">Not applicable</span><span class="crs-chev">▾</span>';}
      else{trigSpec.disabled=false;trigSpec.innerHTML='<span class="ph">Select specialization</span><span class="crs-chev">▾</span>';}
      closeAll();postH();
    }
    function pickSpec(s){
      courseObj.specialization=s;
      trigSpec.innerHTML='<span class="ch">'+esc(s)+'</span><span class="crs-chev">▾</span>';
      closeAll();postH();
    }

    trigField.addEventListener('click',function(e){e.stopPropagation();openPanel(trigField,panelField,fillFieldList,searchField);});
    trigDegree.addEventListener('click',function(e){e.stopPropagation();if(trigDegree.disabled)return;openPanel(trigDegree,panelDegree,fillDegreeList,searchDegree);});
    trigSpec.addEventListener('click',function(e){e.stopPropagation();if(trigSpec.disabled)return;openPanel(trigSpec,panelSpec,fillSpecList,searchSpec);});

    searchField.addEventListener('input',function(){var q=searchField.value.toLowerCase();renderOpts(listField,COURSE_FIELDS.filter(function(f){return f.toLowerCase().indexOf(q)>-1;}),pickField);});
    searchDegree.addEventListener('input',function(){if(!courseObj.field)return;var q=searchDegree.value.toLowerCase();renderOpts(listDegree,Object.keys(COURSE_TAXONOMY[courseObj.field]).filter(function(d){return d.toLowerCase().indexOf(q)>-1;}),pickDegree);});
    searchSpec.addEventListener('input',function(){if(!courseObj.field||!courseObj.degree)return;var q=searchSpec.value.toLowerCase();renderOpts(listSpec,COURSE_TAXONOMY[courseObj.field][courseObj.degree].filter(function(s){return s.toLowerCase().indexOf(q)>-1;}),pickSpec);});

    card.querySelectorAll('.crs-panel-close').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();closeAll();});});
    card.querySelector('.rm').addEventListener('click',function(){
      var idx=P.courses.indexOf(courseObj);if(idx>-1)P.courses.splice(idx,1);
      card.remove();postH();
    });
    if(initial&&initial.field&&COURSE_TAXONOMY[initial.field]){
      pickField(initial.field);
      if(initial.degree&&COURSE_TAXONOMY[initial.field][initial.degree]){
        pickDegree(initial.degree);
        if(initial.specialization&&COURSE_TAXONOMY[initial.field][initial.degree].indexOf(initial.specialization)>-1){
          pickSpec(initial.specialization);
        }
      }
    }
  }
  function closeAllPanelsGlobal(){
    document.querySelectorAll('.crs-panel.show').forEach(function(p){p.classList.remove('show');});
    document.querySelectorAll('.crs-trig.open').forEach(function(t){t.classList.remove('open');});
  }
  document.addEventListener('click',function(e){if(!e.target.closest('.crs-field'))closeAllPanelsGlobal();});
  var crsCards=document.getElementById('crsCards');
  function addCourseCard(pre){
    if(P.courses.length>=5)return;
    var obj={field:null,degree:null,specialization:null};
    P.courses.push(obj);
    makeCourseCard(crsCards,obj,pre);
  }
  var preCourses=(PREFILL&&PREFILL.step3&&Array.isArray(PREFILL.step3.courses)&&PREFILL.step3.courses.length)?PREFILL.step3.courses:null;
  if(preCourses){preCourses.slice(0,5).forEach(function(c){addCourseCard(c);});}
  else{addCourseCard();addCourseCard();}
  document.getElementById('addCrs').addEventListener('click',function(){if(crsCards.children.length<5){addCourseCard();postH();}});
  var ctyBoxes=document.getElementById('ctyBoxes');
  var preCities=(PREFILL&&PREFILL.step3&&Array.isArray(PREFILL.step3.cities))?PREFILL.step3.cities:[];
  makeTABox(ctyBoxes,CITIES,'Enter a city',P.cities,preCities[0]);
  makeTABox(ctyBoxes,CITIES,'Enter a city',P.cities,preCities[1]);
  function wireUpload(inpId,boxId,txtId,subId,clrId,key){
    var inp=document.getElementById(inpId);var box=document.getElementById(boxId);var txt=document.getElementById(txtId);var sub=document.getElementById(subId);var clr=document.getElementById(clrId);var defTxt=txt.textContent,defSub=sub.textContent;
    inp.addEventListener('change',function(){var f=inp.files[0];if(!f)return;if(f.type!=='application/pdf'){err(4,'PDF only, please.');inp.value='';return;}if(f.size>MB2){err(4,'That PDF is '+(f.size/1048576).toFixed(1)+' MB — limit is 2 MB.');inp.value='';return;}err(4);files[key]=f;box.classList.add('done');txt.textContent=f.name;sub.textContent=(f.size/1048576).toFixed(1)+' MB · tap ✕ to change';});
    clr.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();inp.value='';files[key]=null;box.classList.remove('done');txt.textContent=defTxt;sub.textContent=defSub;});
  }
  wireUpload('fMark','upMark','upMarkTxt','upMarkSub','upMarkClr','mark');
  wireUpload('f_jee','up_jee','up_jeeTxt','up_jeeSub','up_jeeClr','jee');
  wireUpload('f_neet','up_neet','up_neetTxt','up_neetSub','up_neetClr','neet');
  wireUpload('f_cuet','up_cuet','up_cuetTxt','up_cuetSub','up_cuetClr','cuet');
  applyPrefill();
  document.getElementById('addExam').addEventListener('click',function(){
    if(customCount>=4)return;customCount++;var k='cx'+customCount;var d=document.createElement('div');d.className='exblk';
    d.innerHTML='<div class="exhead"><b>Other exam</b><button class="rmex" type="button">Remove</button></div><div class="fbox"><label>Exam name</label><input type="text" id="en_'+k+'" placeholder="e.g. VITEEE, IPU CET, Bennett SAT"></div><div class="fbox"><label>Score / percentile</label><input type="text" id="sc_'+k+'"></div><label class="up" id="up_'+k+'"><span class="uic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg></span><div><b id="up_'+k+'Txt">Upload scorecard</b><small id="up_'+k+'Sub">PDF · max 2 MB · optional</small></div><span class="clr" id="up_'+k+'Clr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></span><input type="file" id="f_'+k+'" accept="application/pdf"></label>';
    document.getElementById('customExams').appendChild(d);
    wireUpload('f_'+k,'up_'+k,'up_'+k+'Txt','up_'+k+'Sub','up_'+k+'Clr',k);
    d.querySelector('.rmex').addEventListener('click',function(){files[k]=null;d.remove();postH();});
    postH();
  });
  document.querySelectorAll('.cta[data-next]').forEach(function(b){b.addEventListener('click',function(){
    var n=parseInt(b.getAttribute('data-next'),10);
    if(n===4){var validCourses=P.courses.filter(function(c){return c.field&&c.degree;});if(!validCourses.length)return void err(3,'Add at least one course you\'re interested in.');if(!document.getElementById('budget').value)return void err(3,'Please select your budget.');err(3);P.mode=document.getElementById('mode').value;P.degree=document.getElementById('degree').value;P.hostel=document.getElementById('hostel').value;P.budget=document.getElementById('budget').value;postStep(3,50,{courses:validCourses,cities:P.cities,mode:P.mode,degree:P.degree,hostel:P.hostel,budget:P.budget},selfContact());}
    go(n);
  });});
  document.getElementById('finish').addEventListener('click',function(){
    var board=document.getElementById('board').value;var stream=document.getElementById('stream').value;var py=document.getElementById('passYear').value.trim();var p12=document.getElementById('p12').value.trim();var p10=document.getElementById('p10').value.trim();
    if(!board)return void err(4,'Please select your board.');
    if(!stream)return void err(4,'Please select your stream.');
    if(!/^\d{4}$/.test(py))return void err(4,'Passing year looks off — e.g. 2026.');
    if(!p12||!p10)return void err(4,'Please add your Class 12 and Class 10 percentages.');
    if(!files.mark&&!prefillHadMarksheet)return void err(4,'Please upload your marksheet PDF (max 2 MB) — it\'s required.');
    if(!document.getElementById('c2').checked)return void err(4,'Please tick the consent box.');
    err(4);var marksheet=files.mark?files.mark.name:(PREFILL&&PREFILL.step4&&PREFILL.step4.marksheet)||null;var exams=[];
    [['jee','JEE Main'],['neet','NEET'],['cuet','CUET']].forEach(function(x){var sc=document.getElementById('sc_'+x[0]).value.trim();if(sc||files[x[0]])exams.push({name:x[1],score:sc||null,file:files[x[0]]?files[x[0]].name:null});});
    for(var i=1;i<=customCount;i++){var k='cx'+i;var enEl=document.getElementById('en_'+k);if(!enEl)continue;var en=enEl.value.trim();var sc2=document.getElementById('sc_'+k).value.trim();if(en||sc2||files[k])exams.push({name:en||'Other exam',score:sc2||null,file:files[k]?files[k].name:null});}
    document.getElementById('sentH2').textContent='Profile created!';
    document.getElementById('sentSeal').style.display='';
    document.getElementById('sentTxt').textContent='Welcome aboard'+(SELF&&SELF.name?(', '+SELF.name.split(' ')[0]):'')+'! Your EduBridge Profile is ready. A counselor will review it and reach out on your registered number with your matches — everything also lands on WhatsApp & email. Free, always.';
    postStep(4,90,{board:board,stream:stream,passYear:py,p12:p12,p10:p10,marksheet:marksheet,exams:exams},selfContact());
    try{parent.postMessage({eduAwaitingVerification:true},'*');}catch(e){}
  });
  document.getElementById('skipStep2').addEventListener('click',function(){
    document.getElementById('sentH2').textContent="No problem!";
    document.getElementById('sentSeal').style.display='none';
    document.getElementById('sentTxt').textContent='You can add your academic details anytime from your profile to unlock scholarship matches. In the meantime, take a look at what you can do next.';
    go(5);
  });
  window.addEventListener('message',function(e){if(e.data&&e.data.eduProceed)go(e.data.eduProceed);});
  var NS={};
  function postNext(){postStep(5,100,NS,{});}
  function nsShow(id){document.getElementById('nsMenu').style.display='none';document.getElementById(id).style.display='';postH();}
  function nsBack(id){document.getElementById(id).style.display='none';document.getElementById('nsMenu').style.display='';postH();}
  document.querySelectorAll('#nsMenu .qopt').forEach(function(b){b.addEventListener('click',function(){nsShow(b.getAttribute('data-ns'));});});
  document.querySelectorAll('.qcard .back[data-back]').forEach(function(b){b.addEventListener('click',function(){nsBack(b.getAttribute('data-back'));});});
  document.querySelectorAll('#nsQuiz .qopt').forEach(function(b){b.addEventListener('click',function(){
    NS.quiz=b.getAttribute('data-v');
    document.querySelectorAll('#nsQuiz .qopt').forEach(function(x){x.style.display='none';});
    var d=document.getElementById('nsQuizDone');d.textContent="Got it — we'll prioritize colleges that lead on that.";d.style.display='block';
    postNext();postH();
  });});
  var NS_COMPARE=['Fees','Placements','Hostel & safety','Faculty','Location','Rankings'];
  var compareChips=document.getElementById('nsCompareChips');
  NS_COMPARE.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='qopt';b.textContent=c;b.addEventListener('click',function(){b.classList.toggle('picked');});compareChips.appendChild(b);});
  document.getElementById('nsCompareSave').addEventListener('click',function(){
    NS.comparePriorities=Array.prototype.slice.call(compareChips.querySelectorAll('.qopt.picked')).map(function(b){return b.textContent;});
    postNext();nsBack('nsCompare');
  });
  document.querySelectorAll('#nsApply .qopt').forEach(function(b){b.addEventListener('click',function(){
    NS.directApply=b.getAttribute('data-v')==='yes';
    document.querySelectorAll('#nsApply .qopt').forEach(function(x){x.style.display='none';});
    var d=document.getElementById('nsApplyDone');d.textContent=NS.directApply?"Great — we'll submit applications on your behalf once matches are ready.":"No problem — you can decide after your counselor call.";d.style.display='block';
    postNext();postH();
  });});
  window.addEventListener('load',postH);
  if(window.ResizeObserver){new ResizeObserver(postH).observe(document.body);}else{setTimeout(postH,400);}
})();
</script>
</body></html>`;

export function ProfileForm() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(620);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const setPct = useProfileProgress((s) => s.setPct);
  const upsert = useUpsertProfileStep();
  const verifyGoogle = useVerifyGoogle();
  const { data: myLead, isLoading: leadLoading } = useMyProfileLead();
  const { data: me } = useMe();

  // Server is the source of truth for progress — sync the store from it (e.g.
  // after a counselor deletes the lead, this drops back to a fresh 0%).
  useEffect(() => {
    if (typeof myLead?.completionPct === 'number') setPct(myLead.completionPct);
  }, [myLead?.completionPct, setPct]);

  // Editing an already-started profile: bake the saved step data into the
  // iframe's initial script as PREFILL, so re-opening this form shows what
  // was entered before instead of starting blank every time. Computed once
  // the lead has loaded — the iframe isn't mounted until then (below), so
  // there's no race between this and the srcDoc that's actually rendered.
  //
  // SELF carries name/phone/email already collected at signup — this wizard
  // no longer asks for them (steps 1-2 of the old 4-step version were
  // removed as redundant with signup), but the counselor-facing lead record
  // still needs contact info, and the success message still wants a name.
  const srcDoc = useMemo(() => {
    const hasAny = myLead && (myLead.step3 || myLead.step4);
    const prefill = hasAny ? { step3: myLead!.step3, step4: myLead!.step4 } : null;
    const self = { name: me?.profile?.fullName ?? null, phone: me?.phone ?? null, email: me?.email ?? null };
    return SRC.replace('__PREFILL_JSON__', prefill ? JSON.stringify(prefill) : 'null').replace(
      '__SELF_JSON__',
      JSON.stringify(self),
    );
  }, [myLead, me]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.eduHeight === 'number') setHeight(Math.max(300, e.data.eduHeight));
      if (typeof e.data?.eduPct === 'number') setPct(e.data.eduPct);
      if (e.data?.eduAwaitingVerification) setAwaitingVerification(true);
      if (typeof e.data?.eduStep === 'number' && e.data.eduData) {
        upsert.mutate({
          step: e.data.eduStep,
          completionPct: e.data.eduPct ?? e.data.eduStep * 25,
          data: e.data.eduData,
          name: e.data.eduName || undefined,
          phone: e.data.eduPhone || undefined,
          email: e.data.eduEmail || undefined,
        });
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [setPct, upsert]);

  const onGoogleVerified = (credential: string) => {
    verifyGoogle.mutate(credential, {
      onSuccess: () => {
        setPct(100);
        setAwaitingVerification(false);
        ref.current?.contentWindow?.postMessage({ eduProceed: 5 }, '*');
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  if (leadLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="relative">
      <iframe
        ref={ref}
        title="Complete your EduBridge Profile"
        srcDoc={srcDoc}
        scrolling="no"
        className="block w-full border-0 bg-transparent"
        style={{ height }}
      />
      {awaitingVerification && (
        <div className="absolute inset-0 flex items-start justify-center bg-background/95 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">One last step</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verify with Google to finish creating your EduBridge Profile.
              </p>
            </div>
            <GoogleVerifyButton onVerified={onGoogleVerified} />
            {verifyGoogle.isPending && <p className="text-xs text-muted-foreground">Verifying…</p>}
          </div>
        </div>
      )}
    </div>
  );
}
