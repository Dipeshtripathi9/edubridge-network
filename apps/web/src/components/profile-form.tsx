'use client';

import { useEffect, useRef, useState } from 'react';
import { useProfileProgress } from '@/stores/profile-progress.store';

// The 4-step EduBridge Profile form, embedded in an isolated iframe (its own
// fonts/CSS/JS). Each completed step posts its % to the parent so the progress
// bar + drawer line advance (25 · 50 · 75 · 100). String.raw keeps the regex
// backslashes in the script intact.
const SRC = String.raw`<!doctype html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
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
  <section class="scr on" id="s1">
    <div class="step-k">Step 1 of 4</div>
    <h1>Welcome to EduBridge</h1>
    <p class="sub">Complete your <i>EduBridge Profile</i> to connect with colleges and match with scholarships.</p>
    <div class="flab">Name</div>
    <div class="fbox"><label>First</label><input type="text" id="fn" autocomplete="given-name"></div>
    <div class="fbox"><label>Last</label><input type="text" id="ln" autocomplete="family-name"></div>
    <div class="flab">Birthdate</div>
    <div class="fbox"><input type="text" id="dob" placeholder="DD/MM/YYYY" inputmode="numeric"><div class="hint">DD/MM/YYYY</div></div>
    <div class="qcard" id="q1a">
      <div class="qhead"><b>What brings you here?</b></div>
      <button class="qopt" data-v="college">I'm looking for a college</button>
      <button class="qopt" data-v="parent">I'm researching for my child</button>
      <button class="qopt" data-v="other">Other</button>
    </div>
    <div class="qcard" id="q1b" style="display:none">
      <div class="qhead"><b>Where are you currently studying?</b><button class="back" id="q1back">Back</button></div>
      <button class="qopt" data-v="class12">I'm in Class 11–12</button>
      <button class="qopt" data-v="passed">I've passed Class 12</button>
      <button class="qopt" data-v="incollege">I'm in college</button>
      <button class="qopt" data-v="other">Other</button>
    </div>
    <p class="err" id="err1"></p>
  </section>
  <section class="scr" id="s2">
    <div class="step-k">Step 2 of 4</div>
    <h1>Where can we reach you?</h1>
    <p class="sub">Your counselor call and scholarship matches land here.</p>
    <div class="fbox"><label>Email</label><input type="email" id="em" autocomplete="email"></div>
    <div class="fbox"><label>City</label><input type="text" id="city" autocomplete="address-level2"></div>
    <div class="fbox sel"><label>State</label>
      <select id="state"><option value="">Select</option><option>Uttar Pradesh</option><option>Delhi</option><option>Haryana</option><option>Rajasthan</option><option>Uttarakhand</option><option>Bihar</option><option>Madhya Pradesh</option><option>Punjab</option><option>Other</option></select>
    </div>
    <div class="fbox"><label>PIN code</label><input type="text" id="pin" inputmode="numeric" maxlength="6"></div>
    <div class="fbox"><label>Phone</label><input type="tel" id="ph" inputmode="numeric" maxlength="10"><div class="hint">10-digit WhatsApp number</div></div>
    <label class="consent"><input type="checkbox" id="c2"><span>By checking this box, I verify the number above is my WhatsApp number. I consent to receive my matches and <b>one counselor call</b> from EduBridge Network. No marketing spam — reply STOP anytime.</span></label>
    <button class="cta" data-next="3">Continue</button>
    <p class="err" id="err2"></p>
  </section>
  <section class="scr" id="s3">
    <div class="step-k">Step 3 of 4</div>
    <h1>Personalize your recommendations</h1>
    <p class="sub">We use your <i>EduBridge Profile</i> to match you with best-fit colleges and scholarships.</p>
    <div class="stat"><b>All</b><span>verified matches, checked by a human counselor — never a guess.</span></div>
    <div class="flab">Add courses you're interested in</div>
    <div id="crsBoxes"></div>
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
    <div class="step-k">Step 4 of 4</div>
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
    <button class="cta" id="finish">Create my profile</button>
    <p class="err" id="err4"></p>
  </section>
  <section class="scr" id="s5">
    <div class="sentbox">
      <span class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span>
      <h2>Profile created!</h2>
      <p id="sentTxt"></p>
      <span class="seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>All matches verified by a human counselor</span>
    </div>
  </section>
</div>
<script>
(function(){
  var COURSES=['B.Tech CSE','B.Tech (AI & ML)','B.Tech ECE','B.Tech Mechanical','BBA','B.Com (Hons)','BCA','BA LLB','B.Des','B.Sc Nursing','B.Pharm','BJMC','B.Arch','BHM'];
  var CITIES=['Greater Noida','Noida','Ghaziabad','Gurugram','Faridabad','Delhi','Sonipat','Meerut'];
  var MB2=2*1024*1024;
  var P={purpose:null,studying:null,courses:[],cities:[]};
  var files={};
  var customCount=0;
  function postPct(p){try{parent.postMessage({eduPct:p},'*');}catch(e){}}
  function postH(){try{parent.postMessage({eduHeight:Math.ceil(document.body.scrollHeight)+8},'*');}catch(e){}}
  function esc(s){return s.replace(/</g,'&lt;');}
  function go(n){
    document.querySelectorAll('.scr').forEach(function(s){s.classList.remove('on');});
    document.getElementById('s'+n).classList.add('on');
    window.scrollTo({top:0});
    postH();
  }
  function err(n,m){var e=document.getElementById('err'+n);if(!m){e.classList.remove('show');return false;}e.textContent=m;e.classList.add('show');postH();return true;}
  document.querySelectorAll('#q1a .qopt').forEach(function(b){b.addEventListener('click',function(){P.purpose=b.getAttribute('data-v');document.getElementById('q1a').style.display='none';document.getElementById('q1b').style.display='';postH();});});
  document.getElementById('q1back').addEventListener('click',function(){document.getElementById('q1b').style.display='none';document.getElementById('q1a').style.display='';postH();});
  var dobEl=document.getElementById('dob');
  dobEl.addEventListener('input',function(){var v=dobEl.value.replace(/\D/g,'').slice(0,8);if(v.length>4)dobEl.value=v.slice(0,2)+'/'+v.slice(2,4)+'/'+v.slice(4);else if(v.length>2)dobEl.value=v.slice(0,2)+'/'+v.slice(2);else dobEl.value=v;});
  document.querySelectorAll('#q1b .qopt').forEach(function(b){b.addEventListener('click',function(){
    var fn=document.getElementById('fn').value.trim();var ln=document.getElementById('ln').value.trim();var dob=document.getElementById('dob').value.trim();
    if(!fn||!ln){err(1,'Please add your first and last name above.');return;}
    if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)){err(1,'Birthdate format: DD/MM/YYYY');return;}
    err(1);P.firstName=fn;P.lastName=ln;P.dob=dob;P.studying=b.getAttribute('data-v');
    postPct(25);go(2);
  });});
  function makeTABox(container,list,labelTxt,arr){
    var wrap=document.createElement('div');wrap.className='fbox ta';
    wrap.innerHTML='<label>'+labelTxt+'</label><input type="text" autocomplete="off"><button class="clear" aria-label="Clear"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="ta-drop"></div>';
    var inp=wrap.querySelector('input');var drop=wrap.querySelector('.ta-drop');
    function set(v){inp.value=v;inp.readOnly=true;wrap.classList.add('filled');drop.classList.remove('open');if(arr.indexOf(v)===-1)arr.push(v);}
    function render(){var t=inp.value.trim(),tl=t.toLowerCase();drop.innerHTML='';var opts=list.filter(function(o){return tl!==''&&o.toLowerCase().indexOf(tl)>-1;}).slice(0,7);opts.forEach(function(o){var i=o.toLowerCase().indexOf(tl);var b=document.createElement('button');b.innerHTML='<span class="tn">'+esc(o.slice(0,i))+'<b>'+esc(o.slice(i,i+t.length))+'</b>'+esc(o.slice(i+t.length))+'</span>';b.addEventListener('mousedown',function(e){e.preventDefault();set(o);});drop.appendChild(b);});if(t.length>2&&!opts.some(function(o){return o.toLowerCase()===tl;})){var cb=document.createElement('button');cb.innerHTML='<span class="tn">Use "<b>'+esc(t)+'</b>"</span>';cb.addEventListener('mousedown',function(e){e.preventDefault();set(t);});drop.appendChild(cb);}drop.classList.toggle('open',document.activeElement===inp&&drop.children.length>0);}
    inp.addEventListener('input',render);inp.addEventListener('focus',render);inp.addEventListener('blur',function(){setTimeout(function(){drop.classList.remove('open');},120);});
    wrap.querySelector('.clear').addEventListener('click',function(){var idx=arr.indexOf(inp.value);if(idx>-1)arr.splice(idx,1);inp.readOnly=false;inp.value='';wrap.classList.remove('filled');inp.focus();});
    container.appendChild(wrap);
  }
  var crsBoxes=document.getElementById('crsBoxes');
  makeTABox(crsBoxes,COURSES,'Enter a course',P.courses);makeTABox(crsBoxes,COURSES,'Enter a course',P.courses);
  document.getElementById('addCrs').addEventListener('click',function(){if(crsBoxes.children.length<5){makeTABox(crsBoxes,COURSES,'Enter a course',P.courses);postH();}});
  var ctyBoxes=document.getElementById('ctyBoxes');
  makeTABox(ctyBoxes,CITIES,'Enter a city',P.cities);makeTABox(ctyBoxes,CITIES,'Enter a city',P.cities);
  function wireUpload(inpId,boxId,txtId,subId,clrId,key){
    var inp=document.getElementById(inpId);var box=document.getElementById(boxId);var txt=document.getElementById(txtId);var sub=document.getElementById(subId);var clr=document.getElementById(clrId);var defTxt=txt.textContent,defSub=sub.textContent;
    inp.addEventListener('change',function(){var f=inp.files[0];if(!f)return;if(f.type!=='application/pdf'){err(4,'PDF only, please.');inp.value='';return;}if(f.size>MB2){err(4,'That PDF is '+(f.size/1048576).toFixed(1)+' MB — limit is 2 MB.');inp.value='';return;}err(4);files[key]=f;box.classList.add('done');txt.textContent=f.name;sub.textContent=(f.size/1048576).toFixed(1)+' MB · tap ✕ to change';});
    clr.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();inp.value='';files[key]=null;box.classList.remove('done');txt.textContent=defTxt;sub.textContent=defSub;});
  }
  wireUpload('fMark','upMark','upMarkTxt','upMarkSub','upMarkClr','mark');
  wireUpload('f_jee','up_jee','up_jeeTxt','up_jeeSub','up_jeeClr','jee');
  wireUpload('f_neet','up_neet','up_neetTxt','up_neetSub','up_neetClr','neet');
  wireUpload('f_cuet','up_cuet','up_cuetTxt','up_cuetSub','up_cuetClr','cuet');
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
    if(n===3){var em=document.getElementById('em').value.trim();var city=document.getElementById('city').value.trim();var st=document.getElementById('state').value;var pin=document.getElementById('pin').value.trim();var ph=document.getElementById('ph').value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))return void err(2,'Please enter a valid email.');
      if(!city)return void err(2,'Please add your city.');
      if(!st)return void err(2,'Please select your state.');
      if(!/^\d{6}$/.test(pin))return void err(2,'PIN code is 6 digits.');
      if(!/^[6-9]\d{9}$/.test(ph))return void err(2,'Enter a valid 10-digit number.');
      if(!document.getElementById('c2').checked)return void err(2,'Please tick the consent box.');
      err(2);P.email=em;P.city=city;P.state=st;P.pin=pin;P.phone=ph;postPct(50);}
    if(n===4){if(!P.courses.length)return void err(3,'Add at least one course you\'re interested in.');if(!document.getElementById('budget').value)return void err(3,'Please select your budget.');err(3);P.mode=document.getElementById('mode').value;P.degree=document.getElementById('degree').value;P.hostel=document.getElementById('hostel').value;P.budget=document.getElementById('budget').value;postPct(75);}
    go(n);
  });});
  document.getElementById('finish').addEventListener('click',function(){
    var board=document.getElementById('board').value;var stream=document.getElementById('stream').value;var py=document.getElementById('passYear').value.trim();var p12=document.getElementById('p12').value.trim();var p10=document.getElementById('p10').value.trim();
    if(!board)return void err(4,'Please select your board.');
    if(!stream)return void err(4,'Please select your stream.');
    if(!/^\d{4}$/.test(py))return void err(4,'Passing year looks off — e.g. 2026.');
    if(!p12||!p10)return void err(4,'Please add your Class 12 and Class 10 percentages.');
    if(!files.mark)return void err(4,'Please upload your marksheet PDF (max 2 MB) — it\'s required.');
    err(4);P.board=board;P.stream=stream;P.passYear=py;P.p12=p12;P.p10=p10;P.marksheet=files.mark.name;P.exams=[];
    [['jee','JEE Main'],['neet','NEET'],['cuet','CUET']].forEach(function(x){var sc=document.getElementById('sc_'+x[0]).value.trim();if(sc||files[x[0]])P.exams.push({name:x[1],score:sc||null,file:files[x[0]]?files[x[0]].name:null});});
    for(var i=1;i<=customCount;i++){var k='cx'+i;var enEl=document.getElementById('en_'+k);if(!enEl)continue;var en=enEl.value.trim();var sc2=document.getElementById('sc_'+k).value.trim();if(en||sc2||files[k])P.exams.push({name:en||'Other exam',score:sc2||null,file:files[k]?files[k].name:null});}
    P.submittedAt=new Date().toISOString();
    document.getElementById('sentTxt').textContent='Welcome aboard, '+P.firstName+'! Your EduBridge Profile is ready. A counselor will review it and call '+P.phone.replace(/(\d{2})\d{6}(\d{2})/,'$1******$2')+' with your matches — then everything lands on WhatsApp & email. Free, always.';
    postPct(100);go(5);
  });
  window.addEventListener('load',postH);
  if(window.ResizeObserver){new ResizeObserver(postH).observe(document.body);}else{setTimeout(postH,400);}
})();
</script>
</body></html>`;

export function ProfileForm() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(620);
  const setPct = useProfileProgress((s) => s.setPct);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (typeof e.data?.eduHeight === 'number') setHeight(Math.max(300, e.data.eduHeight));
      if (typeof e.data?.eduPct === 'number') setPct(e.data.eduPct);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [setPct]);

  return (
    <iframe
      ref={ref}
      title="Complete your EduBridge Profile"
      srcDoc={SRC}
      scrolling="no"
      className="block w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
}
