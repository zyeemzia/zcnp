/* ZyeemZia certification engine — interactive site. Renders everything from window.TRACK (data/*.js). */
(function () {
  'use strict';
  const { esc, md, plain, prepare, signatureSVG, hash, subnet } = window.ZZ;
  const D = prepare(); const M = D.meta;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const view = $('#view');

  /* ---------------- state ---------------- */
  const KEY = M.storeKey || 'zz-track';
  const defaults = () => ({ theme: 'auto', done: {}, quiz: {}, checks: {}, notes: {}, cells: {}, sc: {}, srs: {}, exam: { v: 2, best: 0, attempts: 0, passed: null, history: [], pbest: 0 }, cap: { deliv: {}, rubric: {}, notes: '' }, name: '', xp: 0, _t: 0 });
  // load saved progress defensively: older or partial saves must never break a page
  const loadState = () => { let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; } return normalize(saved); };
  function normalize(saved) {
    try { saved = JSON.parse(JSON.stringify(saved || {})); } catch (e) { saved = {}; }
    const d = defaults(), s = Object.assign(defaults(), typeof saved === 'object' && !Array.isArray(saved) ? saved : {});
    Object.keys(d).forEach(k => {
      const dv = d[k], v = s[k];
      if (dv && typeof dv === 'object') { if (!v || typeof v !== 'object' || Array.isArray(v)) s[k] = dv; }
      else if (typeof v !== typeof dv) s[k] = dv;
    });
    // exams before version 2 were graded in the browser: they only count as practice now
    const legacy = !(s.exam && s.exam.v === 2);
    s.exam = Object.assign(defaults().exam, s.exam);
    if (legacy) s.exam = Object.assign(defaults().exam, { pbest: typeof s.exam.best === 'number' ? s.exam.best : 0 });
    if (!Array.isArray(s.exam.history)) s.exam.history = [];
    ['best', 'attempts', 'pbest'].forEach(k => { if (typeof s.exam[k] !== 'number') s.exam[k] = 0; });
    const P = s.exam.passed;
    if (P && (typeof P !== 'object' || !P.v || !P.id || !P.name || !P.date)) s.exam.passed = null;
    const U = s.exam.unclaimed;
    if (U && (typeof U !== 'object' || typeof U.attempt !== 'string')) delete s.exam.unclaimed;
    s.cap = Object.assign(defaults().cap, s.cap);
    ['deliv', 'rubric'].forEach(k => { if (!s.cap[k] || typeof s.cap[k] !== 'object') s.cap[k] = {}; });
    if (typeof s.cap.notes !== 'string') s.cap.notes = '';
    return s;
  }
  let S = loadState();
  // optional Google sign-in (per site); the session token lives only in this browser
  const AUTH_KEY = 'zz.auth';
  const readAuth = () => { try { const a = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); return a && /^[0-9a-f]{64}$/.test(a.token) ? a : null; } catch (e) { return null; } };
  let AUTH = readAuth();
  let pushT = 0, lastPull = 0, pulling = false, lastPushed = '';
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = 0; S._t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } scheduleSync(); };
  const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(save, 350); };
  // local calendar date (not UTC), so Dhaka learners get the right day around midnight
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth = () => reduced() ? 'auto' : 'smooth';

  /* ---------------- icons ---------------- */
  const I = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    modules: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    practice: '<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
    exam: '<path d="M9 4h6M12 4v3"/><circle cx="12" cy="14" r="7"/><path d="M12 14l3-2"/>',
    capstone: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M5 10v5c0 1.5 3 3 7 3s7-1.5 7-3v-5"/>',
    cert: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13l-2 8 5.5-3 5.5 3-2-8"/>',
    book: '<path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6zM12 6v14.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', arrowR: '<path d="M9 5l7 7-7 7"/>', arrowL: '<path d="M15 5l-7 7 7 7"/>',
    flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'
  };
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;

  /* ---------------- feedback ---------------- */
  let toastT;
  function toast(msg, ms) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms || 2600); }
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
    const x = c.getContext('2d'); c.width = document.documentElement.clientWidth; c.height = innerHeight;
    const cs = getComputedStyle(document.documentElement); const cols = ['--accent', '--accent-2', '--good', '--warn'].map(v => cs.getPropertyValue(v).trim());
    const ps = Array.from({ length: 130 }, () => ({ x: c.width / 2, y: c.height / 2.5, vx: (Math.random() - .5) * 15, vy: Math.random() * -15 - 4, r: Math.random() * 6 + 3, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6 }));
    let f = 0; (function tick() { x.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.vy += .45; p.x += p.vx; p.y += p.vy; p.a += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); x.restore(); }); if (++f < 110) requestAnimationFrame(tick); else c.remove(); })();
  }

  /* ---------------- progress helpers ---------------- */
  const doneCount = () => D.lessons.filter(l => S.done[l.id]).length;
  const pct = () => D.lessons.length ? Math.round(doneCount() / D.lessons.length * 100) : 0;
  const modProg = m => { const n = m.lessons.length, d = m.lessons.filter(l => S.done[l.id]).length; return { n, d, p: n ? Math.round(d / n * 100) : 0 }; };
  const nextLesson = () => D.lessons.find(l => !S.done[l.id]) || D.lessons[0];
  const capDone = () => { const c = M.capstone || {}; return (c.deliverables || []).every((_, i) => S.cap.deliv[i]); };
  const req = () => ({ lessons: D.lessons.length > 0 && doneCount() === D.lessons.length, exam: !!(S.exam.passed && S.exam.passed.v), capstone: capDone() });
  // a certificate restored from another device by its credential ID does not need this device's lesson history
  const eligible = () => { const r = req(); return r.exam && (r.lessons || !!S.exam.passed.restored); };
  const distinction = () => eligible() && !!S.exam.passed.distinction;

  /* ---------------- chrome ---------------- */
  const NAV = [['home', 'Home', '#home', 'home'], ['modules', 'Modules', '#modules', 'modules'], ['practice', 'Practice', '#practice', 'practice'], ['exam', 'Exam', '#exam', 'exam'], ['capstone', 'Capstone', '#capstone', 'capstone'], ['certificate', 'Certificate', '#certificate', 'cert']];
  const TABS = ['home', 'modules', 'practice', 'exam', 'certificate'];
  function isDark() { return S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); }
  function applyTheme() { const r = document.documentElement; if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme); }
  function renderChrome() {
    const r = location.hash.slice(1).split('/')[0] || 'home';
    const owner = (r === 'module' || r === 'lesson') ? 'modules' : (r === 'cards' || r === 'glossary') ? 'practice' : r;
    const cur = k => k === owner ? 'aria-current="page"' : '';
    $('#mainnav').innerHTML = NAV.map(([k, label, href]) => `<a href="${href}" ${cur(k)}>${label}</a>`).join('') + `<a href="book.html" target="_blank" rel="noopener">${icon('book')}Book</a>`;
    $('#tabbar').innerHTML = NAV.filter(([k]) => TABS.includes(k)).map(([k, label, href, ic]) => `<a href="${href}" ${cur(k)}>${icon(ic)}<span>${label}</span></a>`).join('');
    $('#themeBtn').innerHTML = icon(isDark() ? 'sun' : 'moon');
    const ab = $('#acctBtn'); if (ab) { const u = AUTH && AUTH.user; ab.innerHTML = u ? (u.picture ? `<img src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer">` : `<span class="acct-ini sm">${esc((u.name || u.email || '?').trim().charAt(0).toUpperCase())}</span>`) : icon('user'); ab.setAttribute('aria-label', u ? `Account: ${u.name || u.email || ''}` : 'Sign in'); ab.classList.toggle('on', !!u); }
    $('#progChip').innerHTML = `<i><b style="width:${pct()}%"></b></i>${pct()}%`;
  }

  /* ---------------- home ---------------- */
  function viewHome() {
    const nl = nextLesson(); const r = req(); const started = doneCount() > 0;
    const steps = [
      ['01', 'Learn', `${doneCount()}/${D.lessons.length} lessons`, r.lessons],
      ['02', 'Practise', `${D.terms.length} flashcards · module drills`, S.exam.attempts > 0 || Object.keys(S.srs).length > 10],
      ['03', 'Certify', S.exam.passed ? `Certified with ${S.exam.passed.score}%` : S.exam.best ? `Best official score ${S.exam.best}%` : `Official exam: ${M.examSize} questions, pass ${M.passMark}%`, r.exam],
      ['04', 'Get certificate', eligible() ? (distinction() ? 'Unlocked · with Distinction' : 'Unlocked') : 'Unlocks after lessons + exam', eligible()]
    ];
    const nowIdx = steps.findIndex(s => !s[3]);
    return `
    <section class="hero"><div class="motif"></div>
      <div>
        <div class="eyebrow">${esc(M.brand)} Certification Track · ${esc(M.short)}</div>
        <h1>${esc(M.name)}<span>.</span></h1>
        <div class="tag">${esc(M.tagline)}</div>
        <p class="lead">${md(M.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#lesson/${nl ? nl.id : ''}">${started ? 'Continue learning' : 'Start the track'} ${icon('arrowR')}</a>
          <a class="btn" href="book.html" target="_blank" rel="noopener">${icon('book')} Read the book</a>
        </div>
        <div class="hero-stats"><div><b>${D.modules.length}</b><span>modules</span></div><div><b>${D.lessons.length}</b><span>lessons</span></div><div><b>${M.hours}</b><span>hours</span></div><div><b>${D.exam.length}</b><span>exam bank</span></div></div>
      </div>
      <figure class="hero-sig" style="margin:0">${signatureSVG(D, { link: true, name: M.signature && M.signature.name, done: m => modProg(m).p === 100 })}<figcaption>${esc(M.signature ? M.signature.name : '')}</figcaption></figure>
    </section>

    <h2 class="section-title">Your path to certification <small>${pct()}% complete</small></h2>
    <div class="path">${steps.map(([n, t, s, ok], i) => `<div class="path-step ${ok ? 'done' : ''} ${i === nowIdx ? 'now' : ''}"><span class="n">${ok ? '✓ DONE' : 'STEP ' + n}</span><b>${t}</b><small>${esc(s)}</small></div>`).join('')}</div>

    <h2 class="section-title">${esc(M.signature ? M.signature.name : 'Modules')} <small>${esc(M.signature ? M.signature.caption : '')}</small></h2>
    <div class="mod-grid">${D.modules.map((m, i) => { const p = modProg(m); return `<a class="mod-card" href="#module/${m.id}">
      <div class="mod-top"><span class="mod-num">${String(i + 1).padStart(2, '0')}</span><span class="chip ${p.p === 100 ? 'ok' : 'acc'}">${esc(m.code)}</span></div>
      <h3>${md(m.title)}</h3><p>${md(m.subtitle)}</p><div class="bar"><i style="width:${p.p}%"></i></div><div class="meta"><span>${p.d}/${p.n} lessons</span><span>${p.p}%</span></div></a>`; }).join('')}</div>

    ${bookBanner()}

    <div class="two" style="margin-top:18px">
      <div class="card list-card"><div class="eyebrow">Who it is for</div><ul>${(M.audience || []).map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
      <div class="card list-card"><div class="eyebrow">Skills on your certificate</div><div class="chips">${((M.certificate || {}).skills || []).map(s => `<span class="chip acc">${esc(s)}</span>`).join('')}</div>
        <p class="muted" style="font-size:.9rem">Finish every lesson and pass the ${M.examSize}-question exam with ${M.passMark}% or more to unlock your certificate. Score ${M.distinctionMark}%+ and complete the capstone for <b>Distinction</b>.</p></div>
    </div>
    ${academyHTML()}`;
  }
  // every non-networking track grouped by its path, in a fixed reading order
  function academyGroups(list) {
    const NAMES = { Leadership: 'Leadership & management', AI: 'Artificial intelligence', Cybersecurity: 'Cybersecurity', 'Service Management': 'IT service management', 'IT Operations': 'IT operations & support' };
    const order = Object.keys(NAMES), g = {};
    list.forEach(f => (g[f.path] = g[f.path] || []).push(f));
    return Object.keys(g).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99)).map(p => [NAMES[p] || p, g[p].sort((a, b) => a.tier - b.tier)]);
  }
  function academyHTML() {
    const F = window.ZZ_FAMILY || []; if (!F.length) return '';
    const net = F.filter(f => f.path === 'Networking').sort((a, b) => a.tier - b.tier), other = F.filter(f => f.path !== 'Networking');
    const card = (f, pathName) => {
      const me = f.code === M.code || f.domain === M.domain;
      const inner = `<span class="ac-lv">${pathName ? esc(pathName) + ' · ' : ''}${esc(f.level)}</span><b>${esc(f.code)}</b><span class="ac-n">ZyeemZia™ ${esc(f.name)}</span><small>${esc(f.blurb)}</small>`;
      if (f.soon && !me) return `<div class="ac-card soon" aria-label="${esc(f.code)}, coming soon">${inner}<span class="chip">Coming soon</span></div>`;
      return `<a class="ac-card ${me ? 'me' : ''}" href="${me ? '#home' : 'https://' + f.domain + '/'}" ${me ? '' : 'target="_blank" rel="noopener"'}>${inner}${me ? '<span class="chip acc">You are here</span>' : ''}</a>`;
    };
    const tiers = [1, 2, 3, 4].map(t => net.filter(f => f.tier === t)).filter(x => x.length);
    const groups = academyGroups(other);
    return `<h2 class="section-title">ZyeemZia™ Academy <small>certification paths</small></h2>
      <div class="academy"><div class="ac-path ac-net"><div class="eyebrow">Networking ladder</div><div class="ac-ladder">${tiers.map(g => `<div class="ac-tier">${g.map(f => card(f)).join('')}</div>`).join('<span class="ac-arrow" aria-hidden="true">→</span>')}</div></div>
        <div class="ac-path"><div class="eyebrow">More certification paths</div><div class="ac-grid">${groups.map(([name, list]) => list.map(f => card(f, name)).join('')).join('')}</div></div></div>`;
  }
  function bookBanner() {
    return `<section class="book-banner">
      <a class="bb-cover" href="book.html" target="_blank" rel="noopener" aria-label="Open the ${esc(M.short)} book"><span class="motif"></span><small>${esc(M.brand)}</small><b>${esc(M.short)}</b><span>${esc(M.name)}</span><small>Course book · Workbook · Exam prep</small></a>
      <div class="bb-text"><div class="eyebrow">The ${esc(M.short)} book</div><h2>The whole track as a beautiful book</h2>
        <p class="muted">Every module and lesson, printable templates and worksheets, case studies with model answers, the full ${D.exam.length}-question practice exam with explanations, the glossary, an 8-week study plan and the capstone guide. Read it online or download the PDF.</p>
        <div class="hero-actions" style="margin-top:6px"><a class="btn btn-primary" href="book.html" target="_blank" rel="noopener">${icon('book')} Read online</a><a class="btn" href="${esc(M.pdf)}" download>${icon('download')} Download PDF</a></div></div>
    </section>`;
  }

  /* ---------------- modules ---------------- */
  function viewModules() {
    return `<div class="page-head"><div class="eyebrow">${esc(M.short)} · ${D.modules.length} modules · ${D.lessons.length} lessons</div><h1 class="page-title">${esc(M.signature ? M.signature.name : 'Modules')}</h1><p class="muted">${esc(M.signature ? M.signature.caption : '')}</p></div>
      <div class="lesson-list">${D.modules.map((m, i) => { const p = modProg(m); return `<a class="lesson-row ${p.p === 100 ? 'done' : ''}" href="#module/${m.id}"><span class="ln">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(m.code)} — ${md(m.title)}</b><small>${md(m.subtitle)}</small></span><span class="chip ${p.p === 100 ? 'ok' : ''}">${p.d}/${p.n}</span></a>`; }).join('')}</div>`;
  }
  function viewModule(id) {
    const m = D.modules.find(x => x.id === id); if (!m) return notFound();
    const i = D.modules.indexOf(m);
    return `<div class="crumbs"><a href="#modules">Modules</a> / <span>${esc(m.code)}</span></div>
      <section class="mod-hero"><div class="mod-big">${String(i + 1).padStart(2, '0')}</div><div><div class="eyebrow">Module ${i + 1} · ${esc(m.code)}</div><h1 class="page-title">${md(m.title)}</h1><p class="muted">${md(m.subtitle)}</p>
        <ul class="outcomes">${m.outcomes.map(o => `<li><span>${md(o)}</span></li>`).join('')}</ul></div></section>
      <div class="lesson-list">${m.lessons.map((l, j) => `<a class="lesson-row ${S.done[l.id] ? 'done' : ''}" href="#lesson/${l.id}"><span class="ln">${S.done[l.id] ? '✓' : (i + 1) + '.' + (j + 1)}</span><span><b>${md(l.title)}</b><small>${md(l.subtitle)}</small></span><span class="chip">${l.minutes} min${S.quiz[l.id] != null ? ' · quiz ' + S.quiz[l.id] + '%' : ''}</span></a>`).join('')}</div>`;
  }

  /* ---------------- lesson ---------------- */
  let quizStates = {};
  function viewLesson(id) {
    const l = D.lessons.find(x => x.id === id); if (!l) return notFound();
    const m = l.module, mi = D.modules.indexOf(m); quizStates = {};
    const prev = D.lessons[l.gi - 1], next = D.lessons[l.gi + 1];
    return `<article class="lesson"><div class="crumbs"><a href="#modules">Modules</a> / <a href="#module/${m.id}">${esc(m.code)}</a> / <span>Lesson ${mi + 1}.${l.index + 1}</span></div>
      <header class="lesson-head"><div class="eyebrow">Module ${mi + 1} · ${esc(m.code)} · Lesson ${l.index + 1} of ${m.lessons.length} · ${l.minutes} min</div>
        <h1>${md(l.title)}</h1><p class="muted">${md(l.subtitle)}</p>
        <ul class="objectives">${l.objectives.map(o => `<li>${md(o)}</li>`).join('')}</ul></header>
      <div class="blocks">${l.blocks.map((b, i) => block(b, i, l)).join('')}</div>
      <footer class="lesson-foot">${prev ? `<a class="btn btn-ghost" href="#lesson/${prev.id}">${icon('arrowL')} Previous</a>` : '<span></span>'}
        <span id="completeSlot">${completeHTML(l)}</span>
        ${next ? `<a class="btn" href="#lesson/${next.id}">Next ${icon('arrowR')}</a>` : `<a class="btn" href="#exam">Go to the exam ${icon('arrowR')}</a>`}</footer></article>`;
  }
  const completeHTML = l => S.done[l.id] ? `<span class="done-banner">${icon('check')} Completed</span>` : `<button class="btn btn-primary" type="button" data-complete="${l.id}">${icon('check')} Mark lesson complete</button>`;
  const T = b => b.title ? `<h3 class="blk-title">${md(b.title)}</h3>` : '';
  const KIND = { insight: 'Insight', warning: 'Watch out', example: 'Example', pro: 'Pro tip', definition: 'Definition' };
  /* saved answers, ticks, worksheets and notes are keyed by the block's content, not its position, so adding or moving blocks never mismatches them */
  function bkey(l, i) {
    const id = b => ZZ.hash(b.type + '|' + plain(b.situation || b.prompt || b.title || b.purpose || '')).slice(0, 10);
    const me = id(l.blocks[i]); let n = 0;
    for (let j = 0; j < i; j++) if (l.blocks[j].type === l.blocks[i].type && id(l.blocks[j]) === me) n++;
    return l.id + ':' + me + (n ? '~' + n : '');
  }
  const blockAt = key => { const lid = key.split(':')[0], l = D.lessons.find(x => x.id === lid); const i = l ? l.blocks.findIndex((_, j) => bkey(l, j) === key) : -1; return i < 0 ? null : { l, i }; };
  function block(b, i, l) {
    const key = bkey(l, i);
    if (ZZ.FIG && ZZ.FIG[b.type]) return ZZ.figure(b, T(b));
    switch (b.type) {
      case 'text': return `<p class="b-text">${md(b.text)}</p>`;
      case 'callout': return `<aside class="callout ${esc(b.kind)}"><span class="ct">${KIND[b.kind] || ''}</span>${b.title ? `<b class="h">${md(b.title)}</b>` : ''}<div>${md(b.text)}</div></aside>`;
      case 'keypoints': return `<section class="keypoints">${T(b)}<ul>${b.items.map(x => `<li><span>${md(x)}</span></li>`).join('')}</ul></section>`;
      case 'table': return `<div>${T(b)}<div class="tbl"><table><thead><tr>${b.head.map(h => `<th>${md(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
      case 'steps': return `<div>${T(b)}<ol class="steps">${b.items.map(x => `<li><div><b>${md(x.title)}</b>${md(x.text)}</div></li>`).join('')}</ol></div>`;
      case 'framework': return `<div>${T(b)}<div class="fw">${b.items.map(x => `<div class="fw-card"><span class="lab">${esc(x.label)}</span><b>${md(x.title)}</b><p>${md(x.text)}</p></div>`).join('')}</div></div>`;
      case 'compare': return `<div>${T(b)}<div class="cmp" style="--n:${b.columns.length}">${b.columns.map(c => `<div class="cmp-col"><h4>${md(c.title)}</h4><ul>${c.items.map(x => `<li>${md(x)}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
      case 'flow': return `<div>${T(b)}<div class="flow">${b.items.map((x, k) => `<div class="flow-i"><span class="k">${String(k + 1).padStart(2, '0')}</span><b>${md(x.label)}</b>${x.text ? `<span>${md(x.text)}</span>` : ''}</div>`).join('')}</div></div>`;
      case 'layers': return `<div>${T(b)}<div class="layers">${b.items.map((x, k) => `<div class="layer" style="--d:${Math.round(10 + 30 * (b.items.length - 1 - k) / Math.max(1, b.items.length - 1))}"><b>${md(x.label)}</b><div class="parts">${x.parts.map(p => `<span>${md(p)}</span>`).join('')}</div></div>`).join('')}</div></div>`;
      case 'formula': return `<div>${T(b)}<div class="formula">${b.items.map(x => `<div class="fm"><small>${md(x.name)}</small><code>${esc(plain(x.expr))}</code><p>${md(x.meaning)}</p></div>`).join('')}</div></div>`;
      case 'case': return `<section class="case"><div class="case-h"><span class="chip acc">Case study</span><b>${md(b.title)}</b></div><div class="case-b"><p>${md(b.context)}</p>
        <ol>${b.questions.map(q => `<li>${md(q)}</li>`).join('')}</ol>
        <button class="btn btn-sm" type="button" data-reveal>Show model answer</button><div class="reveal" hidden>${md(b.answer)}</div></div></section>`;
      case 'scenario': {
        const picked = S.sc[key];
        return `<section class="scenario" data-sc="${esc(key)}"><div class="eyebrow">Scenario · decide</div>${T(b)}<p>${md(b.situation)}</p>
          <div class="sc-opts">${b.options.map((o, k) => `<button class="sc-opt ${picked != null ? (o.best ? 'best' : (k === picked ? 'weak' : '')) : ''}" type="button" data-scopt="${k}" ${picked != null ? 'disabled' : ''}><span>${md(o.text)}</span>${picked != null ? `<span class="fb">${o.best ? '✓ Best choice. ' : (k === picked ? '✗ ' : '')}${md(o.feedback)}</span>` : ''}</button>`).join('')}</div>
          ${picked != null ? `<button class="btn btn-sm btn-ghost" type="button" data-screset>Try again</button>` : ''}</section>`;
      }
      case 'checklist': return `<section class="checklist"><h3 class="blk-title">${md(b.title)}</h3>${b.items.map((x, k) => { const ck = key + ':' + k; return `<label class="ck"><input type="checkbox" data-check="${esc(ck)}" ${S.checks[ck] ? 'checked' : ''}><span>${md(x)}</span></label>`; }).join('')}</section>`;
      case 'template': {
        const saved = S.cells[key] || [];
        return `<section class="template" data-tpl="${esc(key)}"><div class="tp-h"><div><span class="chip acc">Template</span> <b>${md(b.title)}</b><div class="muted" style="font-size:.88rem">${md(b.purpose)}</div></div><button class="btn btn-sm" type="button" data-csv>${icon('copy')} Copy as CSV</button></div>
          <div class="tbl"><table><thead><tr>${b.columns.map(c => `<th>${md(c)}</th>`).join('')}</tr></thead><tbody>
          ${(b.example || []).map(r => `<tr class="ex">${r.map(c => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}
          ${Array.from({ length: Math.min(b.rows || 4, 12) }, (_, r) => `<tr>${b.columns.map((_, c) => `<td contenteditable="true" data-cell="${r}:${c}">${esc((saved[r] || [])[c] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
      }
      case 'reflection': return `<section class="reflection"><div class="eyebrow">Reflect</div><p>${md(b.prompt)}</p><textarea data-note="${esc(key)}" placeholder="Your notes stay on this device…">${esc(S.notes[key] || '')}</textarea></section>`;
      case 'terms': return `<div><h3 class="blk-title">Key terms</h3><div class="terms">${b.items.map(x => `<div class="term"><b>${md(x.term)}</b><span>${md(x.def)}</span></div>`).join('')}</div></div>`;
      case 'cli': return `<section class="cli">${T(b)}<div class="cli-win"><div class="cli-bar"><i></i><i></i><i></i><span>${esc(b.device)}</span><button class="btn btn-sm cli-copy" type="button" data-clicopy>${icon('copy')} Copy</button></div>
        <pre class="cli-body">${b.lines.map(l => `<span class="${/^\s*[!#]/.test(l) && !/^\s*#\s*\w+\s*$/.test(l) ? 'c' : /[>#]\s*\S/.test(l.slice(0, 40)) && /^[\w\-.()]+[>#]/.test(l) ? 'p' : ''}">${esc(l)}</span>`).join('\n')}</pre></div>${b.note ? `<p class="cli-note">${md(b.note)}</p>` : ''}</section>`;
      case 'tool': return `<section class="tool-subnet" data-subnet>${T(b) || '<h3 class="blk-title">Subnet calculator</h3>'}${b.prompt ? `<p class="muted">${md(b.prompt)}</p>` : ''}
        <label class="sn-in"><span>IPv4 address / prefix</span><input type="text" value="192.168.10.77/26" data-subnet-in spellcheck="false" autocomplete="off"></label>
        <div class="sn-out">${subnetHTML('192.168.10.77/26')}</div></section>`;
      case 'quiz': { const qid = 'q' + i; quizStates[qid] = { i: 0, picked: null, right: 0, res: [], items: b.items, lesson: l.id }; return `<section class="quiz" id="${qid}">${quizInner(qid)}</section>`; }
      default: return '';
    }
  }

  function subnetHTML(v) {
    const r = subnet(v);
    if (!r) return `<p class="muted">Type an address like <code>10.20.30.40/22</code>.</p>`;
    const rows = [['Network', r.network + '/' + r.prefix], ['Subnet mask', r.mask], ['Wildcard mask', r.wildcard], ['First usable', r.first], ['Last usable', r.last], ['Broadcast', r.broadcast], ['Usable hosts', r.hosts.toLocaleString()], ['Class · scope', `${r.cls} · ${r.private ? 'private (RFC 1918)' : 'public / other'}`], ['Mask in binary', r.binMask]];
    return `<div class="sn-grid">${rows.map(([k, x]) => `<div><small>${k}</small><b>${esc(x)}</b></div>`).join('')}</div>`;
  }

  /* ---------------- quiz (lessons + practice) ---------------- */
  function quizInner(qid) {
    const st = quizStates[qid]; const n = st.items.length;
    const dots = `<div class="dots">${st.items.map((_, k) => `<i class="${st.res[k] === true ? 'ok' : st.res[k] === false ? 'no' : ''} ${k === st.i && st.i < n ? 'cur' : ''}"></i>`).join('')}</div>`;
    if (st.i >= n) {
      const p = Math.round(st.right / n * 100);
      return `<div class="quiz-top"><b>${st.practice ? 'Practice set' : 'Knowledge check'}</b>${dots}</div><div class="q-result"><div class="big-num">${st.right}/${n}</div><div>${p >= 80 ? 'Excellent: you have this.' : p >= 60 ? 'Good. Review the explanations and try again.' : 'Revisit the lesson, then retry.'}</div><button class="btn" type="button" data-qretry="${qid}">Retry</button></div>`;
    }
    const q = st.items[st.i]; const ans = st.picked != null;
    return `<div class="quiz-top"><b>${st.practice ? 'Practice' : 'Knowledge check'} · ${st.i + 1}/${n}</b>${dots}</div>
      <div class="q-text">${md(q.q)}</div>
      <div class="opts">${q.options.map((o, k) => `<button class="opt ${ans ? (k === q.answer ? 'ok' : k === st.picked ? 'no' : '') : ''}" type="button" data-qopt="${qid}:${k}" ${ans ? 'disabled' : ''} ${ans && k === q.answer ? 'aria-label="Correct answer: ' + esc(plain(o)) + '"' : ''}><span class="k">${'ABCD'[k]}</span><span>${md(o)}</span></button>`).join('')}</div>
      ${ans ? `<div class="explain">${md(q.explain)}</div><div class="q-foot"><button class="btn btn-primary" type="button" data-qnext="${qid}">${st.i + 1 < n ? 'Next question' : 'See result'} ${icon('arrowR')}</button></div>` : ''}`;
  }
  function quizPick(qid, k) { const st = quizStates[qid]; if (!st || st.picked != null) return; st.picked = k; const ok = k === st.items[st.i].answer; st.res[st.i] = ok; if (ok) st.right++; const el = $('#' + qid); el.innerHTML = quizInner(qid); const nx = $('[data-qnext]', el); if (nx) nx.focus({ preventScroll: true }); }
  function quizNext(qid) {
    const st = quizStates[qid]; st.i++; st.picked = null;
    if (st.i >= st.items.length && !st.practice) { const p = Math.round(st.right / st.items.length * 100); S.quiz[st.lesson] = Math.max(S.quiz[st.lesson] || 0, p); S.xp += st.right * 5; save(); if (p >= 80) confetti(); }
    const el = $('#' + qid); el.innerHTML = quizInner(qid); const f = $('.opt:not([disabled]), [data-qretry]', el); if (f) f.focus({ preventScroll: true });
  }

  /* ---------------- practice: drills + flashcards + glossary ---------------- */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function viewPractice() {
    return `<div class="page-head"><div class="eyebrow">Practice</div><h1 class="page-title">Practise until it sticks</h1><p class="muted">Short drills from the exam bank with instant explanations, flashcards with spaced repetition, and the full glossary.</p></div>
      <div class="two"><a class="card list-card" href="#cards" style="text-decoration:none;color:inherit"><div class="eyebrow">Flashcards</div><h2>${D.terms.length} key terms</h2><p class="muted">Spaced repetition: cards you know come back later, cards you miss come back sooner.</p></a>
        <a class="card list-card" href="#glossary" style="text-decoration:none;color:inherit"><div class="eyebrow">Glossary</div><h2>A–Z reference</h2><p class="muted">Every term from every module, searchable.</p></a></div>
      <h2 class="section-title">Module drills <small>up to 10 questions · untimed · explanations after each answer</small></h2>
      <div class="mod-grid">${D.modules.map((m, i) => `<button class="mod-card" type="button" data-drill="${m.id}" style="text-align:left;cursor:pointer"><div class="mod-top"><span class="mod-num">${String(i + 1).padStart(2, '0')}</span><span class="chip acc">${esc(m.code)}</span></div><h3>${md(m.title)}</h3><p>${D.exam.filter(q => q.module === m.id).length} questions in bank</p></button>`).join('')}
        <button class="mod-card" type="button" data-drill="all" style="text-align:left;cursor:pointer"><div class="mod-top"><span class="mod-num">∞</span><span class="chip">Mixed</span></div><h3>Mixed drill</h3><p>10 random questions from all modules</p></button></div>
      <div id="drill" style="margin-top:18px"></div>`;
  }
  function startDrill(mod) {
    const pool = D.exam.filter(q => mod === 'all' || q.module === mod);
    if (!pool.length) { toast('No questions for this module yet.'); return; }
    quizStates.drill = { i: 0, picked: null, right: 0, res: [], items: shuffle(pool).slice(0, 10), practice: true };
    $('#drill').innerHTML = `<section class="quiz" id="drill-q"></section>`; quizStates['drill-q'] = quizStates.drill; $('#drill-q').innerHTML = quizInner('drill-q');
    $('#drill').scrollIntoView({ behavior: smooth(), block: 'start' });
  }
  const INTERVALS = [0, 1, 2, 4, 8, 16, 32];
  let fcQueue = [], fcFlip = false;
  const fcStats = () => { const known = D.terms.filter(t => S.srs[t.term] && S.srs[t.term].box >= 4).length; const due = fcQueue.filter(t => S.srs[t.term]).length; return `${known} of ${D.terms.length} mastered · ${due} to review · ${fcQueue.length - due} new`; };
  function viewCards() {
    const now = Date.now(); fcFlip = false;
    fcQueue = D.terms.filter(t => S.srs[t.term] && S.srs[t.term].due <= now).concat(D.terms.filter(t => !S.srs[t.term]).slice(0, 15));
    return `<div class="fc"><div class="page-head"><div class="eyebrow">Flashcards</div><h1 class="page-title">Key terms</h1><p class="muted" id="fcStats" aria-live="polite">${fcStats()}</p></div><div id="fcStage">${fcStage()}</div></div>`;
  }
  function fcStage() {
    const t = fcQueue[0];
    if (!t) return `<div class="empty"><b>All done for now.</b><p>Come back tomorrow for the next review.</p></div>`;
    return `<div class="card3d ${fcFlip ? 'flip' : ''}" id="fcCard" role="button" tabindex="0" aria-pressed="${fcFlip}" aria-label="${esc(plain(t.term))}. ${fcFlip ? esc(plain(t.def)) : 'Press Enter to see the definition'}"><div class="card3d-in"><div class="face"><div><div class="eyebrow">${esc(t.lesson.module.code)}</div><b>${md(t.term)}</b><p class="muted" style="margin-top:10px;font-size:.85rem">Tap to flip</p></div></div><div class="face back"><p>${md(t.def)}</p></div></div></div>
      <div class="fc-actions"><button class="btn" type="button" data-fc="0">Again</button><button class="btn" type="button" data-fc="1">Hard</button><button class="btn btn-primary" type="button" data-fc="2">Easy</button></div>`;
  }
  function fcGrade(g) {
    const t = fcQueue.shift(); if (!t) return; const c = S.srs[t.term] || { box: 0, due: 0 };
    if (g === 0) { c.box = 1; c.due = Date.now() + 60e3; fcQueue.splice(Math.min(3, fcQueue.length), 0, t); }
    else if (g === 1) { c.box = Math.max(1, c.box); c.due = Date.now() + 864e5; }
    else { c.box = Math.min(6, c.box + (c.box === 0 ? 2 : 1)); c.due = Date.now() + INTERVALS[c.box] * 864e5; }
    c.t = Date.now(); S.srs[t.term] = c; fcFlip = false; save(); $('#fcStage').innerHTML = fcStage(); const st = $('#fcStats'); if (st) st.textContent = fcStats();
    const card = $('#fcCard'); if (card) card.focus({ preventScroll: true });
  }
  let glQuery = '';
  function viewGlossary() {
    return `<div class="page-head"><div class="eyebrow">Glossary</div><h1 class="page-title">${D.terms.length} terms, A to Z</h1><input class="search-in" id="glSearch" type="search" placeholder="Filter terms…" value="${esc(glQuery)}" aria-label="Filter glossary"></div><div id="glList">${glossaryList()}</div>`;
  }
  function glossaryList() {
    const q = glQuery.toLowerCase().trim(); const list = D.terms.filter(t => !q || (t._s || (t._s = (t.term + ' ' + plain(t.def)).toLowerCase())).includes(q));
    if (!list.length) return `<div class="empty">No matching terms.</div>`;
    let last = ''; return list.map(t => { const L = t.term[0].toUpperCase(); const h = L !== last ? `<div class="gl-letter">${esc(L)}</div>` : ''; last = L; return `${h}<div class="term"><b>${md(t.term)}</b><span>${md(t.def)}</span> <a href="#lesson/${t.lesson.id}" class="chip" style="text-decoration:none">${esc(t.lesson.module.code)}</a></div>`; }).join('');
  }

  /* ---------------- certification exam ---------------- */
  // a running exam is saved on every change, so refreshes, crashes or a phone discarding the tab never lose it
  const EXKEY = KEY + ':exam';
  /* ---------------- exam ----------------
     official: questions come from a secret bank on the ZyeemZia server, which also runs the clock and grades;
     practice: the public bank, graded here, with full answer review. Only official passes earn a certificate. */
  const SLUG = M.slug || KEY.replace(/\.v\d+$/, '');
  const API = (() => { try { return localStorage.getItem('zz.api') || ''; } catch (e) { return ''; } })() || M.api || 'https://api.zyeemzia.com';
  async function api(path, body, opts) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 25000); let res;
    const headers = {}; if (body) headers['content-type'] = 'application/json'; if (AUTH) headers.authorization = 'Bearer ' + AUTH.token;
    try { res = await fetch(API + path, Object.assign({ method: body ? 'POST' : 'GET', headers }, body ? { body: JSON.stringify(body) } : {}, { signal: ctl.signal }, opts || {})); }
    catch (e) { throw Object.assign(new Error('Could not reach the ZyeemZia exam server. Check your internet connection and try again.'), { offline: true }); }
    finally { clearTimeout(t); }
    let j = {}; try { j = await res.json(); } catch (e) { /* no body */ }
    if (res.status === 401 && AUTH && path !== '/v1/auth/google') signOutLocal('Your sign-in has expired. Please sign in again to keep syncing.');
    if (!res.ok) throw Object.assign(new Error(j.error || 'The ZyeemZia server had a problem. Please try again.'), { status: res.status });
    return j;
  }
  let EX = null, exTimer = 0, syncT = 0, exStarting = false;
  const official = () => !!(EX && EX.mode === 'official');
  const exQ = k => official() ? EX.items[k] : D.exam[EX.qs[k]];
  const onExamPage = () => location.hash.split('/')[0] === '#exam';
  const saveEX = () => { try { if (EX && !EX.done) localStorage.setItem(EXKEY, JSON.stringify({ mode: EX.mode, attempt: EX.attempt, items: EX.items, qs: EX.qs, ans: EX.ans, flags: EX.flags, i: EX.i, end: EX.end })); else localStorage.removeItem(EXKEY); } catch (e) { /* ignore */ } };
  function restoreEX() {
    let r = null; try { r = JSON.parse(localStorage.getItem(EXKEY) || 'null'); } catch (e) { r = null; }
    const isOff = !!(r && r.mode === 'official' && typeof r.attempt === 'string' && Array.isArray(r.items) && r.items.length && r.items.every(q => q && typeof q.q === 'string' && Array.isArray(q.options)));
    const isPrac = !!(r && r.mode !== 'official' && Array.isArray(r.qs) && r.qs.length && r.qs.every(i => D.exam[i]));
    if (!isOff && !isPrac) { try { localStorage.removeItem(EXKEY); } catch (e) { /* ignore */ } return; }
    const n = isOff ? r.items.length : r.qs.length;
    EX = { mode: isOff ? 'official' : 'practice', attempt: isOff ? r.attempt : undefined, items: isOff ? r.items : undefined, qs: isOff ? r.items.map((_, k) => k) : r.qs, ans: r.ans || {}, flags: r.flags || {}, i: Math.min(r.i || 0, n - 1), end: +r.end || Date.now(), done: false };
    if (EX.end <= Date.now()) { examSubmit(true, true); return; }
    exTimer = setInterval(tickExam, 1000);
  }
  function viewExam() {
    if (EX && !EX.done) return examHTML();
    const last = S.exam.history[S.exam.history.length - 1]; const lessonsOk = req().lessons; const P = S.exam.passed;
    const n = Math.min(M.examSize || 40, D.exam.length);
    return `<div class="exam-wrap"><div class="page-head"><div class="eyebrow">${esc(M.short)} certification exam</div><h1 class="page-title">Prove it</h1><p class="muted">The <b>official exam</b> earns your certificate. Its questions come from a secret bank and are graded on the ZyeemZia server, so anyone can verify your credential. The <b>practice exam</b> uses the public question bank and explains every answer.</p></div>
      <div class="rules"><div><b>${M.examSize}</b><span>questions</span></div><div><b>${M.examMinutes}</b><span>minutes</span></div><div><b>${M.passMark}%</b><span>to pass</span></div><div><b>${M.distinctionMark}%</b><span>for distinction</span></div></div>
      <div class="two exam-modes">
        <div class="card list-card"><div class="eyebrow">Official exam · earns the certificate</div><p>${M.examSize} questions from a secret bank, shuffled for every attempt. The clock runs on the server and your answers are saved as you go, so a refresh or a dropped connection will not lose them. Needs an internet connection.</p>
          ${lessonsOk ? '' : `<div class="callout warning"><span class="ct">Locked</span>Finish every lesson to unlock the official exam (${doneCount()}/${D.lessons.length} so far). Meanwhile, take the practice exam.</div>`}
          <div class="hero-actions"><button class="btn btn-primary" type="button" data-exstart="official" ${lessonsOk ? '' : 'disabled'}>${icon('exam')} ${S.exam.attempts ? 'Start a new official attempt' : 'Start the official exam'}</button></div></div>
        <div class="card list-card"><div class="eyebrow">Practice exam · no certificate</div><p>${n} questions from the public ${D.exam.length}-question bank, with the same timer and pass mark. Afterwards, review every answer with its explanation. Works offline.</p>
          <div class="hero-actions"><button class="btn" type="button" data-exstart="practice" ${D.exam.length ? '' : 'disabled'}>Start a practice exam</button><a class="btn" href="#practice">Module drills</a></div></div>
      </div>
      ${S.exam.attempts || P ? `<div class="card list-card"><div class="eyebrow">Your official record</div><p>Attempts: <b>${S.exam.attempts}</b> · Best score: <b>${S.exam.best}%</b>${last ? ` · Last: ${last.score}% on ${esc(last.date)}` : ''}${S.exam.unclaimed ? ` · <a class="chip ok" href="#certificate">Passed: claim your certificate</a>` : P ? ` · <a class="chip ok" href="#certificate">Certified · ${esc(P.id)}</a>` : ''}</p></div>` : ''}</div>`;
  }
  async function examStart(mode) {
    if (mode !== 'official') {
      const n = Math.min(M.examSize || 40, D.exam.length);
      // stratified draw: proportional to each module's share of the bank, topped up from the rest
      const byMod = {}; D.exam.forEach((q, i) => (byMod[q.module] = byMod[q.module] || []).push(i));
      let pick = []; if (M.examWeights) Object.entries(M.examWeights).forEach(([m, k]) => { pick = pick.concat(shuffle(byMod[m] || []).slice(0, k)); }); else Object.values(byMod).forEach(ix => { pick = pick.concat(shuffle(ix).slice(0, Math.round(n * ix.length / D.exam.length))); });
      pick = shuffle(pick).slice(0, n); if (pick.length < n) pick = pick.concat(shuffle(D.exam.map((_, i) => i).filter(i => !pick.includes(i))).slice(0, n - pick.length));
      EX = { mode: 'practice', qs: pick, ans: {}, flags: {}, i: 0, end: Date.now() + (M.examMinutes || 60) * 60e3, done: false };
      beginExam(); return;
    }
    if (exStarting) return;
    if (!req().lessons) { toast('Finish every lesson to unlock the official exam.'); return; }
    exStarting = true; $$('[data-exstart="official"]').forEach(b => { b.disabled = true; b.textContent = 'Preparing your exam…'; });
    try {
      const j = await api('/v1/exam/start', { track: SLUG });
      EX = { mode: 'official', attempt: j.attempt, items: j.questions, qs: j.questions.map((_, k) => k), ans: {}, flags: {}, i: 0, end: Date.now() + (j.ends - j.now), done: false };
      beginExam();
    } catch (e) {
      toast(e.message, 7000); if (onExamPage() && !(EX && !EX.done)) view.innerHTML = EX && EX.result ? examResultHTML() : viewExam();
    } finally { exStarting = false; }
  }
  function beginExam() { saveEX(); clearInterval(exTimer); exTimer = setInterval(tickExam, 1000); if (location.hash !== '#exam') location.hash = '#exam'; else paintExam('.opt'); }
  function tickExam() {
    if (!EX || EX.done) { clearInterval(exTimer); return; }
    const left = Math.max(0, EX.end - Date.now()); const el = $('#exTime');
    if (el) { const m = Math.floor(left / 60e3), s = Math.floor(left / 1000) % 60; el.textContent = `${m}:${String(s).padStart(2, '0')}`; el.classList.toggle('low', left < 5 * 60e3); }
    if (left <= 0) { clearInterval(exTimer); examSubmit(true); }
  }
  const answeredN = () => Object.keys(EX.ans).length;
  function examHTML() {
    const q = exQ(EX.i); const a = EX.ans[EX.i]; const answered = answeredN();
    return `<div class="exam-wrap"><div class="exam-bar" role="status"><span>Question ${EX.i + 1}/${EX.qs.length}</span><span id="exAnswered">${answered} answered</span><span>⏱ <span class="timer" id="exTime" aria-label="Time left">–</span></span></div>
      ${official() && EX.pending ? `<div class="callout warning" role="alert"><span class="ct">Not submitted yet</span>${esc(EX.pending)} Your answers are safe on this device.<div class="hero-actions" style="margin-top:8px"><button class="btn btn-sm btn-primary" type="button" data-exconfirm>Try again</button></div></div>` : ''}
      <section class="quiz" aria-labelledby="exQ"><div class="eyebrow">${official() ? 'Official exam' : 'Practice exam'} · ${esc((D.modules.find(m => m.id === q.module) || {}).code || '')}</div><div class="q-text" id="exQ" tabindex="-1">${md(q.q)}</div>
        <div class="opts" role="group" aria-label="Answer options">${q.options.map((o, k) => `<button class="opt ${a === k ? 'sel' : ''}" type="button" data-exans="${k}" aria-pressed="${a === k}"><span class="k">${'ABCD'[k]}</span><span>${md(o)}</span></button>`).join('')}</div>
        <div class="q-foot" style="justify-content:space-between"><button class="btn btn-sm ${EX.flags[EX.i] ? 'btn-dark' : ''}" type="button" data-exflag aria-pressed="${!!EX.flags[EX.i]}">${icon('flag')} <span>${EX.flags[EX.i] ? 'Flagged' : 'Flag for review'}</span></button>
          <span style="display:flex;gap:8px"><button class="btn" type="button" data-exgo="${EX.i - 1}" ${EX.i ? '' : 'disabled'} aria-label="Previous question">${icon('arrowL')}</button>${EX.i + 1 < EX.qs.length ? `<button class="btn btn-primary" type="button" data-exgo="${EX.i + 1}">Next ${icon('arrowR')}</button>` : `<button class="btn btn-primary" type="button" data-exsubmit>Submit exam</button>`}</span></div></section>
      <div class="card list-card"><div class="eyebrow">Question map · tap to jump</div><div class="qmap">${EX.qs.map((_, k) => qmapBtn(k)).join('')}</div>
        <div id="exConfirm"><button class="btn btn-sm" type="button" data-exsubmit>Submit exam (<span id="exAnswered2">${answered}</span>/${EX.qs.length} answered)</button></div></div></div>`;
  }
  const qmapBtn = k => `<button type="button" data-exgo="${k}" class="${EX.ans[k] != null ? 'ans' : ''} ${EX.flags[k] ? 'flag' : ''} ${k === EX.i ? 'cur' : ''}" aria-label="Question ${k + 1}${EX.ans[k] != null ? ', answered' : ''}${EX.flags[k] ? ', flagged' : ''}" ${k === EX.i ? 'aria-current="step"' : ''}>${k + 1}</button>`;
  // repaint only the exam view (no scroll jump), then put focus where the learner expects it
  function paintExam(focusSel) { view.innerHTML = examHTML(); tickExam(); const f = focusSel && $(focusSel, view); if (f) f.focus({ preventScroll: true }); }
  // official answers are also saved on the server, so time-up grading uses them even if this device goes offline
  const syncSoon = () => { clearTimeout(syncT); syncT = setTimeout(syncEX, 3000); };
  function syncEX(keepalive) { clearTimeout(syncT); if (!official() || EX.done) return; api('/v1/exam/save', { attempt: EX.attempt, answers: EX.ans }, keepalive ? { keepalive: true } : null).catch(() => { /* retried on the next answer and at submit */ }); }
  function examAnswer(k) {
    if (Date.now() > EX.end) { toast('Time is up: submit to see your result.'); return; }
    EX.ans[EX.i] = k; saveEX(); if (official()) syncSoon();
    $$('[data-exans]', view).forEach(b => { const on = +b.dataset.exans === k; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
    const m = $(`.qmap [data-exgo="${EX.i}"]`, view); if (m) m.outerHTML = qmapBtn(EX.i);
    [$('#exAnswered'), $('#exAnswered2')].forEach((el, j) => { if (el) el.textContent = j ? answeredN() : answeredN() + ' answered'; });
  }
  function examFlag() {
    EX.flags[EX.i] = !EX.flags[EX.i]; saveEX();
    const b = $('[data-exflag]', view); if (b) { b.classList.toggle('btn-dark', EX.flags[EX.i]); b.setAttribute('aria-pressed', EX.flags[EX.i]); $('span', b).textContent = EX.flags[EX.i] ? 'Flagged' : 'Flag for review'; }
    const m = $(`.qmap [data-exgo="${EX.i}"]`, view); if (m) m.outerHTML = qmapBtn(EX.i);
  }
  function examGo(i) { EX.i = Math.max(0, Math.min(EX.qs.length - 1, i)); saveEX(); paintExam('#exQ'); const top = $('.exam-wrap'); if (top && top.getBoundingClientRect().top < 0) window.scrollTo({ top: top.offsetTop - 80, behavior: 'auto' }); }
  function examSubmit(timeUp, quiet) {
    if (!EX || EX.done) return;
    if (official()) { officialSubmit(timeUp, quiet); return; }
    clearInterval(exTimer); EX.done = true; saveEX();
    const per = {}; let right = 0;
    EX.qs.forEach((qi, k) => { const q = D.exam[qi]; per[q.module] = per[q.module] || { r: 0, n: 0 }; per[q.module].n++; if (EX.ans[k] === q.answer) { right++; per[q.module].r++; } });
    const score = Math.round(right / EX.qs.length * 100); const pass = score >= M.passMark;
    S.exam.pbest = Math.max(S.exam.pbest || 0, score); S.xp += right * 3; save();
    EX.result = { right, score, pass, per, timeUp };
    showResult(score, pass, timeUp, quiet);
  }
  async function officialSubmit(timeUp, quiet) {
    const ex = EX; if (ex.sending) return; ex.sending = true; clearInterval(exTimer); clearTimeout(syncT);
    $$('[data-exsubmit], [data-exconfirm]').forEach(b => { b.disabled = true; });
    try {
      const r = await api('/v1/exam/submit', { attempt: ex.attempt, answers: ex.ans });
      if (EX !== ex) return;
      ex.done = true; ex.sending = false; ex.pending = ''; saveEX();
      const date = r.date || today();
      S.exam.attempts++; S.exam.best = Math.max(S.exam.best, r.score); S.exam.history.push({ date, score: r.score });
      if (r.pass && (!S.exam.passed || r.score > S.exam.passed.score)) S.exam.unclaimed = { attempt: ex.attempt, score: r.score, date };
      S.xp += r.right * 3; save();
      ex.result = { right: r.right, score: r.score, pass: r.pass, per: r.per || {}, marks: r.marks || [], timeUp: timeUp || r.late };
      showResult(r.score, r.pass, timeUp, quiet);
    } catch (e) {
      ex.sending = false; if (EX !== ex) return;
      if (e.status === 404) { EX = null; saveEX(); toast('This exam attempt is no longer on the server. Please start a new attempt.', 7000); if (onExamPage()) view.innerHTML = viewExam(); return; }
      ex.pending = e.message;
      if (ex.end > Date.now()) exTimer = setInterval(tickExam, 1000);
      if (onExamPage()) paintExam(); else toast(e.message, 7000);
    }
  }
  function showResult(score, pass, timeUp, quiet) {
    if (onExamPage()) { if (pass) confetti(); view.innerHTML = examResultHTML(); renderChrome(); window.scrollTo({ top: 0, behavior: 'auto' }); const h = $('.verdict .big-num'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    else { EX.unseen = true; renderChrome(); if (!quiet || timeUp) toast(`Time is up: your ${official() ? 'official' : 'practice'} exam was submitted (${score}%). Open Exam to see your result.`, 6000); }
  }
  const claimHTML = () => { const P = S.exam.passed, U = S.exam.unclaimed; return `<section class="card list-card claim" id="claimBox"><div class="eyebrow">${P ? 'New best score' : 'Claim your certificate'}</div><p>${P ? `You scored ${U.score}%, higher than your current certificate (${P.score}%). Issue a new certificate with this score? Your current one stays valid. ` : ''}Type your full name exactly as it should appear. <b>Check the spelling: the name cannot be changed once the certificate is issued.</b></p>
    <form class="search-page" id="claimForm"><input class="search-in" id="claimName" name="name" maxlength="80" autocomplete="name" value="${esc((P && P.name) || S.name || '')}" placeholder="Your full name" aria-label="Your full name" required><button class="btn btn-primary" type="submit">${icon('cert')} Issue my certificate</button></form></section>`; };
  function examResultHTML() {
    const r = EX.result; const off = official(); const P = S.exam.passed;
    const claimable = off && r.pass && S.exam.unclaimed && S.exam.unclaimed.attempt === EX.attempt;
    const note = off ? (r.pass ? (claimable ? 'Claim your certificate below.' : P ? `Your certificate ${esc(P.id)} stays valid.` : '') : `You need ${M.passMark}%. Review the weaker modules below and try again.`)
      : (r.pass ? 'Well done. Practice results do not count: take the official exam to earn your certificate.' : `You need ${M.passMark}%. Review the answers below, then try again.`);
    return `<div class="exam-wrap"><section class="verdict ${r.pass ? 'pass' : 'fail'}"><div class="eyebrow">${off ? 'Official exam' : 'Practice exam'} · ${r.timeUp ? 'Time is up · ' : ''}${r.pass ? 'Passed' : 'Not yet'}</div><div class="big-num">${r.score}%</div>
        <p>${r.right} of ${EX.qs.length} correct. ${note}</p>
        <div class="hero-actions">${off && P && !claimable ? `<a class="btn btn-primary" href="#certificate">${icon('cert')} Go to certificate</a>` : ''}<button class="btn ${r.pass ? '' : 'btn-primary'}" type="button" data-exstart="${off ? 'official' : 'practice'}">${off ? (r.pass ? 'Retake for a higher score' : 'Retake the official exam') : 'Another practice exam'}</button><button class="btn" type="button" data-exreview>${off ? 'See which answers were wrong' : 'Review answers'}</button></div></section>
      ${claimable ? claimHTML() : ''}
      <div class="card list-card"><div class="eyebrow">Score by module</div><div class="breakdown">${D.modules.filter(m => r.per[m.id]).map(m => { const p = r.per[m.id]; const v = Math.round(p.r / p.n * 100); return `<div class="bd-row"><span>${esc(m.code)}</span><div class="bar"><i style="width:${v}%"></i></div><span>${p.r}/${p.n}</span></div>`; }).join('')}</div></div>
      <div id="exReview"></div></div>`;
  }
  function examReview() {
    if (official()) {
      const mk = EX.result.marks || [];
      $('#exReview').innerHTML = `<p class="muted" style="margin:16px 0 8px">To keep the official exam fair, correct answers and explanations are not shown. Use the module scores above to choose what to revise.</p>` + EX.items.map((q, k) => { const a = EX.ans[k]; const ok = mk[k] === 1; return `<section class="quiz" style="border-color:${ok ? 'var(--good)' : 'var(--bad)'}"><div class="eyebrow">Question ${k + 1} · ${ok ? 'correct' : a == null ? 'not answered' : 'incorrect'}</div><div class="q-text">${md(q.q)}</div>${a != null && q.options[a] != null ? `<p class="muted">Your answer: ${md(q.options[a])}</p>` : ''}</section>`; }).join('');
      return;
    }
    $('#exReview').innerHTML = EX.qs.map((qi, k) => { const q = D.exam[qi]; const a = EX.ans[k]; return `<section class="quiz" style="border-color:${a === q.answer ? 'var(--good)' : 'var(--bad)'}"><div class="eyebrow">Question ${k + 1}${a == null ? ' · not answered' : a === q.answer ? ' · correct' : ' · incorrect'}</div><div class="q-text">${md(q.q)}</div><div class="opts">${q.options.map((o, j) => `<div class="opt ${j === q.answer ? 'ok' : j === a ? 'no' : ''}"><span class="k">${'ABCD'[j]}</span><span>${md(o)}</span></div>`).join('')}</div><div class="explain">${md(q.explain)}</div></section>`; }).join('');
  }
  async function claimCert(name) {
    const U = S.exam.unclaimed; if (!U) return;
    name = String(name || '').replace(/\s+/g, ' ').trim(); if (name.length < 2) { toast('Please type your full name.'); const i = $('#claimName'); if (i) i.focus(); return; }
    const b = $('#claimForm button'); if (b) { b.disabled = true; b.textContent = 'Issuing…'; }
    try {
      const c = await api('/v1/cert/claim', { attempt: U.attempt, name, capstone: capDone() });
      S.name = c.name; S.exam.passed = { v: 1, id: c.id, date: c.date, score: c.score, name: c.name, distinction: !!c.distinction, attempt: U.attempt }; delete S.exam.unclaimed; save();
      confetti(); toast(`Certificate issued: ${c.id}`, 5000);
      if (location.hash === '#certificate') render(); else { linkNav = true; location.hash = '#certificate'; }
    } catch (e) {
      toast(e.message, 7000);
      if ([403, 404, 410].includes(e.status)) { delete S.exam.unclaimed; save(); render(); } else if (b) { b.disabled = false; b.innerHTML = `${icon('cert')} Issue my certificate`; }
    }
  }
  async function restoreCert(id) {
    id = String(id || '').trim(); if (!id) return;
    const b = $('#restoreForm button'); if (b) b.disabled = true;
    try {
      const c = await api('/v1/verify/' + encodeURIComponent(id));
      if (c.track !== SLUG) { toast(`That ID belongs to ${c.short}. Open ${c.domain} to see it.`, 7000); return; }
      if (c.revoked) { toast('That certificate has been revoked.', 7000); return; }
      S.exam.passed = { v: 1, id: c.id, date: c.date, score: c.score, name: c.name, distinction: !!c.distinction, restored: true }; S.name = c.name; save(); render(); toast(`Restored certificate ${c.id}.`, 5000);
    } catch (e) { toast(e.status === 404 || e.status === 400 ? 'No certificate has that credential ID. Check it and try again.' : e.message, 7000); }
    finally { if (b && b.isConnected) b.disabled = false; }
  }
  async function upgradeCert() {
    const P = S.exam.passed; if (!P) return;
    try { const c = await api('/v1/cert/claim', { attempt: P.attempt, capstone: capDone() }); P.distinction = !!c.distinction; save(); render(); toast(P.distinction ? 'Upgraded: your certificate now shows Distinction.' : `Distinction needs ${M.distinctionMark}% and a complete capstone.`, 5000); }
    catch (e) { toast(e.message, 7000); }
  }

  /* ---------------- capstone ---------------- */
  function viewCapstone() {
    const c = M.capstone || {}; const done = (c.deliverables || []).filter((_, i) => S.cap.deliv[i]).length;
    return `<div class="page-head"><div class="eyebrow">Capstone project</div><h1 class="page-title">${esc(c.title || 'Capstone')}</h1><p class="muted" style="max-width:75ch">${md(c.brief || '')}</p></div>
      <div class="two"><section class="checklist"><h3 class="blk-title">Deliverables · ${done}/${(c.deliverables || []).length}</h3>${(c.deliverables || []).map((d, i) => `<label class="ck"><input type="checkbox" data-deliv="${i}" ${S.cap.deliv[i] ? 'checked' : ''}><span>${md(d)}</span></label>`).join('')}</section>
        <section class="reflection"><div class="eyebrow">Project notes</div><p>Write your project name, scope and links to your files here. Everything stays on this device.</p><textarea id="capNotes" style="min-height:220px">${esc(S.cap.notes || '')}</textarea></section></div>
      <h2 class="section-title">Self-assessment rubric <small>tap the level that matches your work</small></h2>
      <div class="tbl"><table class="rubric-tbl"><thead><tr><th>Criterion</th><th>Developing</th><th>Proficient</th><th>Excellent</th></tr></thead><tbody>${(c.rubric || []).map((r, i) => `<tr><td><b>${md(r.criterion)}</b></td>${r.levels.map((lv, j) => `<td class="${S.cap.rubric[i] === j ? 'sel' : ''}"><button type="button" class="rub-btn" data-rub="${i}:${j}" aria-pressed="${S.cap.rubric[i] === j}">${md(lv)}</button></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="muted" style="margin-top:12px">Complete every deliverable and score ${M.distinctionMark}%+ in the exam to earn your certificate <b>with Distinction</b>.</p>`;
  }

  /* ---------------- account: optional Google sign-in + progress sync ---------------- */
  const GOOGLE_CLIENT_ID = M.googleClientId || '263569409532-o59be67f62mk9je2kgerpah84kg8vn4e.apps.googleusercontent.com';
  const saveAuth = () => { try { if (AUTH) localStorage.setItem(AUTH_KEY, JSON.stringify(AUTH)); else localStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ } };
  function signOutLocal(msg) { AUTH = null; saveAuth(); clearTimeout(pushT); lastPushed = ''; renderChrome(); if (location.hash === '#account') render(); if (msg) toast(msg, 6000); }
  const syncData = () => { const d = JSON.parse(JSON.stringify(S)); delete d.theme; return d; };
  const syncLabel = () => AUTH && AUTH.synced ? `Last synced ${new Date(AUTH.synced).toLocaleString()}` : 'Not synced yet';
  function scheduleSync() { if (!AUTH) return; clearTimeout(pushT); pushT = setTimeout(() => pushProgress(), 5000); }
  async function pushProgress(keepalive) {
    clearTimeout(pushT); pushT = 0; if (!AUTH) return;
    const data = syncData(); const body = JSON.stringify(data); if (body === lastPushed) return;
    try {
      await api('/v1/progress/' + SLUG, { data }, { method: 'PUT', keepalive: !!keepalive && body.length < 60000 });
      lastPushed = body; if (AUTH) { AUTH.synced = Date.now(); saveAuth(); } const st = $('#syncState'); if (st) st.textContent = syncLabel();
    } catch (e) { /* kept on this device; sent again after the next change */ }
  }
  async function pullProgress(quiet) {
    if (!AUTH || pulling) return; pulling = true;
    try {
      const j = await api('/v1/progress/' + SLUG); lastPull = Date.now();
      if (j.data && typeof j.data === 'object') {
        const merged = mergeState(S, j.data); const changed = JSON.stringify(merged) !== JSON.stringify(S);
        S = merged; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
        if (changed) { applyTheme(); renderChrome(); const a = document.activeElement; const typing = a && (/^(INPUT|TEXTAREA)$/.test(a.tagName) || a.isContentEditable); if (!typing && !(EX && !EX.done)) render(); }
      }
      await pushProgress();
    } catch (e) { if (!quiet && e.status !== 401) toast(e.message, 6000); }
    finally { pulling = false; }
  }
  // merge this device's progress with the account copy: completion only grows, scores keep the best, edits keep the newest copy
  function mergeState(local, remote) {
    const L = normalize(local), R = normalize(remote);
    const newer = (R._t || 0) > (L._t || 0) ? R : L, older = newer === R ? L : R;
    const out = normalize(newer); out.theme = L.theme;
    Object.entries(older.done).forEach(([k, v]) => { if (!out.done[k] || String(v) < String(out.done[k])) out.done[k] = v; });
    Object.entries(older.quiz).forEach(([k, v]) => { out.quiz[k] = Math.max(+out.quiz[k] || 0, +v || 0); });
    ['checks', 'notes', 'cells', 'sc'].forEach(f => Object.entries(older[f]).forEach(([k, v]) => { if (!(k in out[f])) out[f][k] = v; }));
    ['deliv', 'rubric'].forEach(f => Object.entries(older.cap[f]).forEach(([k, v]) => { if (!(k in out.cap[f])) out.cap[f][k] = v; }));
    if (!out.cap.notes && older.cap.notes) out.cap.notes = older.cap.notes;
    Object.entries(older.srs).forEach(([k, v]) => { const m = out.srs[k]; if (v && (!m || (v.t || 0) > (m.t || 0))) out.srs[k] = v; });
    const E = out.exam, O = older.exam;
    E.best = Math.max(E.best, O.best); E.attempts = Math.max(E.attempts, O.attempts); E.pbest = Math.max(E.pbest || 0, O.pbest || 0);
    const seen = new Set();
    E.history = E.history.concat(O.history).filter(h => { if (!h || typeof h !== 'object') return false; const k = h.date + '|' + h.score; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-60);
    const rank = p => p ? (p.distinction ? 1000 : 0) + (+p.score || 0) : -1;
    if (rank(O.passed) > rank(E.passed)) E.passed = O.passed;
    if (!E.unclaimed && O.unclaimed) E.unclaimed = O.unclaimed;
    if (E.unclaimed && E.passed && (E.unclaimed.attempt === E.passed.attempt || E.unclaimed.score <= E.passed.score)) delete E.unclaimed;
    if (!out.name && older.name) out.name = older.name;
    out.xp = Math.max(+out.xp || 0, +older.xp || 0); out._t = Math.max(L._t || 0, R._t || 0);
    return out;
  }
  const inAppBrowser = () => /FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\/|MicroMessenger|; wv\)/i.test(navigator.userAgent);
  function viewAccount() {
    if (!AUTH) return `<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Keep your progress on every device</h1><p class="muted">Signing in is optional. With a Google account, your lessons, quiz scores, flashcards, notes, capstone work, exam record and certificate follow you to any phone or computer. Without it, everything stays in this browser only.</p></div>
      <div class="card list-card acct-card"><div class="eyebrow">Sign in</div>
        ${inAppBrowser() ? `<div class="callout warning"><span class="ct">Open in your browser</span>Google sign-in does not work inside the Facebook, Messenger or Instagram app. Open this page in Chrome or Safari (menu → Open in browser), then sign in.</div>` : ''}
        <div id="gsiBtn" class="gsi-slot"><span class="muted">Loading Google sign-in…</span></div>
        <p class="muted" style="font-size:.85rem;margin:0">ZyeemZia only receives your name, email address and profile picture from Google. Read the <a href="privacy.html">privacy notice</a>.</p></div>`;
    const u = AUTH.user || {};
    return `<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Your account</h1><p class="muted">Your ${esc(M.short)} progress is saved to your account and kept in sync on every device where you sign in.</p></div>
      <div class="card list-card acct-card"><div class="acct-who">${u.picture ? `<img src="${esc(u.picture)}" alt="" width="56" height="56" referrerpolicy="no-referrer">` : `<span class="acct-ini">${esc((u.name || u.email || '?').trim().charAt(0).toUpperCase())}</span>`}<div><b>${esc(u.name || '')}</b><br><span class="muted">${esc(u.email || '')}</span></div></div>
        <p class="muted" id="syncState" style="margin:0">${esc(syncLabel())}</p>
        <div class="hero-actions"><button class="btn btn-primary" type="button" data-acct="sync">Sync now</button><button class="btn" type="button" data-acct="out">Sign out</button></div></div>
      <div class="card list-card"><div class="eyebrow">Your ZyeemZia certificates</div><div id="acctCerts"><p class="muted">Loading…</p></div></div>
      <div class="card list-card"><div class="eyebrow">Privacy</div><p class="muted">Read the <a href="privacy.html">privacy notice</a>. Deleting your account removes your sign-in details and synced progress from ZyeemZia's servers. Issued certificates stay valid and verifiable, because they are public records. Progress on this device is kept.</p><span id="delSlot"><button class="btn btn-sm" type="button" data-acct="delask">Delete my account</button></span></div>`;
  }
  async function mountAccount() {
    if (!AUTH) { mountGoogleButton(); return; }
    try {
      const j = await api('/v1/me'); if (j.user && AUTH) { AUTH.user = j.user; saveAuth(); renderChrome(); }
      const el = $('#acctCerts'); if (!el) return; const cs = j.certificates || [];
      el.innerHTML = cs.length ? `<div class="req">${cs.map(c => `<a class="req-i ok" href="https://${esc(c.domain)}/#verify/${encodeURIComponent(c.id)}" style="text-decoration:none;color:inherit"><span class="st">✓</span><span><b>${esc(c.trackName)}</b><br><small class="muted">${esc(c.id)} · ${esc(c.date)} · ${c.score}%${c.distinction ? ' · Distinction' : ''}${c.revoked ? ' · revoked' : ''}</small></span>${icon('arrowR')}</a>`).join('')}</div>`
        : `<p class="muted" style="margin:0">No certificates yet. Certificates you claim while signed in appear here, from every ZyeemZia track.</p>`;
    } catch (e) { const el = $('#acctCerts'); if (el) el.innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
  }
  let gisP = null;
  const loadGIS = () => gisP || (gisP = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; sc.onload = () => res(); sc.onerror = () => { gisP = null; rej(new Error('Could not load Google sign-in. Check your internet connection and try again.')); }; document.head.appendChild(sc); }));
  async function mountGoogleButton() {
    const el = $('#gsiBtn'); if (!el) return;
    try {
      await loadGIS(); const slot = $('#gsiBtn'); if (!slot || !(window.google && google.accounts && google.accounts.id)) return;
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogleCredential, ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, itp_support: true });
      slot.innerHTML = ''; google.accounts.id.renderButton(slot, { theme: isDark() ? 'filled_black' : 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill', logo_alignment: 'left', width: Math.max(220, Math.min(340, slot.clientWidth || 300)) });
    } catch (e) { el.innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
  }
  async function onGoogleCredential(resp) {
    try {
      const j = await api('/v1/auth/google', { credential: resp && resp.credential });
      AUTH = { token: j.token, user: j.user }; saveAuth(); lastPushed = '';
      toast(`Signed in as ${j.user.name || j.user.email}. Syncing your progress…`, 4000);
      await pullProgress(); renderChrome(); if (location.hash === '#account') render();
    } catch (e) { toast(e.message, 7000); }
  }
  async function signOut() {
    try { await pushProgress(); await api('/v1/auth/logout', {}); } catch (e) { /* sign out on this device anyway */ }
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) { /* ignore */ }
    signOutLocal('Signed out. Your progress stays on this device.');
  }
  async function deleteAccount() { try { await api('/v1/me', null, { method: 'DELETE' }); signOutLocal('Your account and synced progress were deleted.'); } catch (e) { toast(e.message, 7000); } }

  /* ---------------- contact: the shared ZyeemZia contact form (civil tone), loaded only when opened ---------------- */
  const TX_BASE = 'https://zyeemzia.com/';
  let txP = null;
  const loadTransmit = () => window.ZZTransmit ? Promise.resolve() : txP || (txP = new Promise((res, rej) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = TX_BASE + 'transmit.css?v=3'; document.head.appendChild(l);
    const sc = document.createElement('script'); sc.src = TX_BASE + 'transmit.js?v=5'; sc.onload = () => res(); sc.onerror = () => { txP = null; rej(); }; document.head.appendChild(sc);
  }));
  function viewContact() {
    return `<div class="page-head"><div class="eyebrow">Contact</div><h1 class="page-title">Talk to ZyeemZia</h1><p class="muted">Questions about ${esc(M.short)}, your certificate, the exam or a partnership? Send a message and the reply will come to your email.</p></div>
      <section class="tx-mount" id="contact" data-tx-tone="civil" data-tx-topic="academy" data-tx-dark='html[data-theme="dark"]' data-tx-light='html[data-theme="light"]' data-tx-auto="media"
        data-tx-regarding="${esc(`${M.full} (${M.short})`)}" data-tx-source="${esc(M.domain)} · Course" data-tx-lead="Questions about this course, the official exam, your certificate or sign-in? Write to the ZyeemZia team and we will reply by email."><p class="muted">Loading the contact form…</p></section>`;
  }
  function mountContact() {
    loadTransmit().then(() => { const el = $('#view .tx-mount'); if (el && window.ZZTransmit) window.ZZTransmit.mount(el); })
      .catch(() => { const el = $('#view .tx-mount'); if (el) el.innerHTML = '<p class="muted">The contact form could not load. Check your connection, or email admin@zyeemzia.com.</p>'; });
  }

  /* ---------------- certificate ---------------- */
  const credId = () => (S.exam.passed && S.exam.passed.id) || '';
  const verifyURL = id => `https://${M.domain}/#verify/${encodeURIComponent(id)}`;
  function viewCertificate() {
    const r = req(); const ok = eligible(); const P = S.exam.passed; const U = S.exam.unclaimed;
    const examNote = P ? `Passed with ${P.score}% · ${P.id}` : U ? `Passed with ${U.score}%: claim your certificate below` : S.exam.best ? `Best official score ${S.exam.best}%` : 'Not attempted yet';
    const canUpgrade = P && P.attempt && !P.distinction && P.score >= M.distinctionMark && capDone();
    const items = [['Complete every lesson', `${doneCount()}/${D.lessons.length} lessons`, r.lessons, '#modules'], [`Pass the official exam with ${M.passMark}%+`, examNote, r.exam, '#exam'], [`Distinction (optional): ${M.distinctionMark}%+ and the capstone`, P && P.distinction ? 'Awarded' : capDone() ? 'Capstone complete' : 'Capstone in progress', distinction(), '#capstone']];
    return `<div class="page-head"><div class="eyebrow">${esc(M.short)} certificate</div><h1 class="page-title">${ok ? 'Your certificate is ready' : U ? 'Claim your certificate' : 'Unlock your certificate'}</h1><p class="muted">${ok ? 'Download it, add it to LinkedIn, or share its verification link: anyone can confirm it is genuine.' : U ? 'You passed the official exam. Type your name below to issue your certificate.' : 'Finish these steps to unlock your certificate. The preview below shows what you will receive.'}</p></div>
      <div class="req">${items.map(([t, s, done, href]) => `<a class="req-i ${done ? 'ok' : ''}" href="${href}" style="text-decoration:none;color:inherit"><span class="st">${done ? '✓' : ''}</span><span><b>${esc(t)}</b><br><small class="muted">${esc(s)}</small></span>${icon('arrowR')}</a>`).join('')}</div>
      ${U ? claimHTML() : ''}
      ${ok ? `<div class="cert-tools"><p class="cert-name">Name on certificate: <b>${esc(P.name)}</b><br><small class="muted">The name is fixed once issued. To correct a spelling mistake, <a href="#contact">contact ZyeemZia</a> with your credential ID.</small></p>
        <button class="btn btn-primary" type="button" data-certdl>${icon('download')} Download PNG</button>
        <a class="btn" id="lnBtn" href="${linkedinURL()}" target="_blank" rel="noopener">Add to LinkedIn</a>
        ${canUpgrade ? `<button class="btn" type="button" data-upgrade>Upgrade to Distinction</button>` : ''}</div>
        <p class="cred">Credential ID: <span id="credId">${esc(P.id)}</span> · <a href="#verify/${encodeURIComponent(P.id)}">Verification page</a></p>`
      : U ? '' : `<div class="cert-tools"><label>Preview your name<input id="certName" type="text" maxlength="80" value="${esc(S.name)}" placeholder="Your full name"></label></div>
        <div class="card list-card"><div class="eyebrow">Already certified?</div><p>Earned this certificate on another device or browser? Enter its credential ID to restore it here.</p><form class="search-page" id="restoreForm"><input class="search-in" name="id" placeholder="${esc(M.code)}-20261019-7K2QXM" aria-label="Credential ID" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn" type="submit">Restore</button></form></div>`}
      <canvas id="certCanvas" class="cert-canvas" width="1600" height="1130" aria-label="Certificate"></canvas>
      <p class="muted" style="font-size:.8rem;margin-top:12px">${esc(M.disclaimer || '')}</p>`;
  }
  function linkedinURL() {
    const p = S.exam.passed; if (!p) return '#certificate'; const [y, mo] = p.date.split('-');
    const q = new URLSearchParams({ startTask: 'CERTIFICATION_NAME', name: `${M.full} (${M.short})`, organizationName: 'ZyeemZia', issueYear: y, issueMonth: String(+mo), certUrl: verifyURL(p.id), certId: p.id });
    return 'https://www.linkedin.com/profile/add?' + q.toString();
  }

  /* ---------------- verify a credential ---------------- */
  const decodeArg = a => { try { return decodeURIComponent(a || ''); } catch (e) { return a || ''; } };
  function viewVerify(arg) {
    const id = decodeArg(arg);
    return `<div class="page-head"><div class="eyebrow">ZyeemZia credentials</div><h1 class="page-title">Verify a certificate</h1><p class="muted">Every ZyeemZia certificate has a credential ID, such as ${esc(M.code)}-20261019-7K2QXM. Enter it to confirm the certificate is genuine.</p>
      <form class="search-page" id="verifyForm"><input class="search-in" id="verifyIn" name="id" value="${esc(id)}" placeholder="Credential ID" aria-label="Credential ID" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn btn-primary" type="submit">Verify</button></form></div>
      <div id="verifyOut" aria-live="polite"></div>`;
  }
  let verifySeq = 0;
  async function runVerify(arg) {
    const id = decodeArg(arg).trim(); const out = $('#verifyOut'); if (!out || !id) return;
    const seq = ++verifySeq; out.innerHTML = `<p class="muted">Checking ${esc(id)}…</p>`; let html;
    try {
      const c = await api('/v1/verify/' + encodeURIComponent(id));
      const rows = [['Name', c.name], ['Certification', c.trackName], ['Issued', c.date], ['Exam score', c.score + '%'], ['Credential ID', c.id]];
      html = `<section class="verdict ${c.revoked ? 'fail' : 'pass'}"><div class="eyebrow">${c.revoked ? 'Revoked' : 'Verified'} · ZyeemZia</div><div class="big-num vf-big">${c.revoked ? 'Not valid' : 'Genuine'}</div><p>${c.revoked ? 'This certificate was issued by ZyeemZia but has been revoked.' : `This certificate was issued by ZyeemZia${c.distinction ? ' <b>with Distinction</b>' : ''}.`}</p></section>
        <div class="card list-card"><dl class="vf">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(String(v))}</dd>`).join('')}</dl>${c.domain && c.domain !== M.domain ? `<p class="muted" style="margin-top:10px">Course: <a href="https://${esc(c.domain)}/" rel="noopener">${esc(c.domain)}</a></p>` : ''}</div>`;
    } catch (e) {
      html = e.status === 404 || e.status === 400 ? `<section class="verdict fail"><div class="eyebrow">Not found</div><div class="big-num vf-big">No match</div><p>No ZyeemZia certificate has the ID <b>${esc(id)}</b>. Check it carefully: IDs look like ${esc(M.code)}-20261019-7K2QXM.</p></section>`
        : `<div class="callout warning"><span class="ct">Could not check</span>${esc(e.message)}</div>`;
    }
    if (seq === verifySeq && $('#verifyOut')) $('#verifyOut').innerHTML = html;
  }
  // canvas text needs its faces loaded first, otherwise the PNG falls back to system fonts
  let certFontsP = null;
  function certFonts() {
    if (!certFontsP) {
      const cs = getComputedStyle(document.documentElement); const f = v => cs.getPropertyValue(v).trim();
      certFontsP = document.fonts && document.fonts.load ? Promise.all([`800 74px ${f('--f-display')}`, `500 30px ${f('--f-body')}`, `600 24px ${f('--f-body')}`, `600 22px ${f('--f-mono')}`].map(s => document.fonts.load(s).catch(() => null))) : Promise.resolve();
    }
    return certFontsP;
  }
  let certRAF = 0;
  const drawCertSoon = () => { cancelAnimationFrame(certRAF); certRAF = requestAnimationFrame(drawCert); };
  function fitFont(x, text, weight, size, min, family, maxW) { let fs = size; do { x.font = `${weight} ${fs}px ${family}`; } while (x.measureText(text).width > maxW && --fs > min); return fs; }
  function drawCert() {
    const c = $('#certCanvas'); if (!c) return; const x = c.getContext('2d'); const W = c.width, H = c.height; const ok = eligible();
    // fixed (theme-independent) colours, so the PNG looks the same in light and dark mode
    const cs = getComputedStyle(document.documentElement); const acc = cs.getPropertyValue('--sg-accent').trim() || '#ff8a4c', acc2 = cs.getPropertyValue('--sg-accent-2').trim() || '#6fa8dc', dark = cs.getPropertyValue('--sg-node').trim() || '#13203a';
    const disp = cs.getPropertyValue('--f-display').trim(), body = cs.getPropertyValue('--f-body').trim(), mono = cs.getPropertyValue('--f-mono').trim();
    x.fillStyle = '#fbfbfd'; x.fillRect(0, 0, W, H);
    x.fillStyle = dark; x.fillRect(0, 0, 380, H);
    x.fillStyle = acc; x.fillRect(380, 0, 10, H);
    // side band: brand, code, seal
    x.fillStyle = '#ffffff'; x.textAlign = 'left'; x.font = `600 22px ${mono}`; x.fillText('ZyeemZia™', 48, 90);
    x.fillStyle = acc; fitFont(x, M.short, 800, 112, 40, disp, 310); x.fillText(M.short, 40, 230, 310);
    x.fillStyle = '#c9cfdd'; x.font = `500 24px ${body}`; wrapText(x, M.name, 48, 280, 300, 32);
    x.save(); x.translate(190, 760); x.strokeStyle = acc; x.lineWidth = 6; x.beginPath(); for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i, r = i % 2 ? 98 : 118; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.stroke();
    x.beginPath(); x.arc(0, 0, 80, 0, 7); x.strokeStyle = acc2; x.lineWidth = 3; x.stroke(); x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = `800 34px ${disp}`; x.fillText(distinction() ? 'DISTINCTION' : 'CERTIFIED', 0, 6); x.font = `500 18px ${mono}`; x.fillStyle = '#c9cfdd'; x.fillText((S.exam.passed ? S.exam.passed.date : today()).slice(0, 4), 0, 36); x.restore();
    // main panel
    const L = 460; x.textAlign = 'left';
    x.fillStyle = '#5b6478'; x.font = `600 24px ${mono}`; x.fillText((M.certificate || {}).title ? M.certificate.title.toUpperCase() : 'CERTIFICATE OF ACHIEVEMENT', L, 140);
    x.fillStyle = '#14182a'; x.font = `500 30px ${body}`; x.fillText('This certifies that', L, 230);
    x.fillStyle = '#0f1424'; const nm = ok ? S.exam.passed.name : ((S.name || '').trim() || 'Your Name'); fitFont(x, nm, 800, 74, 34, disp, W - L - 60); x.fillText(nm, L, 330, W - L - 60);
    x.fillStyle = acc; x.fillRect(L, 360, 520, 5);
    x.fillStyle = '#2b3245'; x.font = `400 30px ${body}`; wrapText(x, (M.certificate || {}).statement || '', L, 430, 1060, 42);
    x.fillStyle = '#5b6478'; x.font = `600 20px ${mono}`; x.fillText('SKILLS', L, 600);
    x.font = `500 24px ${body}`; let sx = L, sy = 620; ((M.certificate || {}).skills || []).forEach(s => { const w = x.measureText(s).width + 36; if (sx + w > W - 60) { sx = L; sy += 58; } x.fillStyle = '#eef0f6'; roundRect(x, sx, sy, w, 46, 23); x.fill(); x.fillStyle = '#2b3245'; x.fillText(s, sx + 18, sy + 31); sx += w + 12; });
    const p = S.exam.passed || {};
    const rows = [['Issued', ok ? p.date : '—'], ['Exam score', ok ? p.score + '%' : '—'], ['Credential ID', ok ? p.id : 'Issued after the official exam'], ['Verify', `${M.domain}/#verify`]];
    rows.forEach(([k, v], i) => { const cx = L + (i % 2) * 540, cy = 800 + Math.floor(i / 2) * 88; x.fillStyle = '#8a91a3'; x.font = `600 18px ${mono}`; x.fillText(k.toUpperCase(), cx, cy); x.fillStyle = '#14182a'; x.font = `600 28px ${body}`; x.fillText(v, cx, cy + 38, 510); });
    x.fillStyle = '#8a91a3'; x.font = `500 18px ${body}`; x.fillText('Issued by ZyeemZia · Copyright © ZyeemZia · Independent programme, not affiliated with any other certifying body.', L, H - 70);
    if (!ok) { x.save(); x.translate(W / 2 + 180, H / 2); x.rotate(-0.25); x.fillStyle = 'rgba(180,40,40,.16)'; x.font = `800 120px ${disp}`; x.textAlign = 'center'; x.fillText('PREVIEW', 0, 0); x.restore(); }
  }
  function wrapText(x, text, X, Y, maxW, lh) { const words = String(text).split(' '); let line = ''; words.forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, X, Y); Y += lh; line = w; } else line = t; }); if (line) x.fillText(line, X, Y); }
  function roundRect(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }

  /* ---------------- settings & search ---------------- */
  function viewSettings() {
    return `<div class="page-head"><div class="eyebrow">Settings</div><h1 class="page-title">Progress & settings</h1></div>
      <div class="two"><div class="card list-card"><div class="eyebrow">Progress</div><p>${doneCount()}/${D.lessons.length} lessons · best official exam ${S.exam.best}% · best practice exam ${S.exam.pbest}% · ${Object.keys(S.srs).length} flashcards studied</p><div class="bar"><i style="width:${pct()}%"></i></div></div>
        <div class="card list-card"><div class="eyebrow">Sync across devices</div><p>${AUTH ? `Signed in as <b>${esc((AUTH.user && (AUTH.user.name || AUTH.user.email)) || '')}</b>. Your progress is synced.` : 'Sign in with Google (optional) to keep your progress on every device.'}</p><a class="btn btn-sm" href="#account">${AUTH ? 'Manage account' : 'Sign in'}</a></div>
        <div class="card list-card"><div class="eyebrow">Theme</div><div class="chips">${['auto', 'light', 'dark'].map(t => `<button class="btn btn-sm ${S.theme === t ? 'btn-primary' : ''}" type="button" data-theme-set="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
        <div class="card list-card"><div class="eyebrow">Reset</div><p class="muted">Erase lessons, exam results, notes and flashcards on this device. An issued certificate stays valid: restore it later with its credential ID.</p><span id="resetSlot"><button class="btn btn-sm" type="button" data-reset="ask">Reset progress</button></span></div></div>`;
  }
  function viewSearch(q) {
    try { q = decodeURIComponent(q || ''); } catch (e) { q = q || ''; }
    q = q.toLowerCase().trim();
    const form = `<form class="search-page" id="searchPage" role="search"><input class="search-in" id="searchPageIn" type="search" value="${esc(q)}" placeholder="Search lessons and terms" aria-label="Search lessons and terms"><button class="btn btn-primary" type="submit">${icon('search')} Search</button></form>`;
    if (!q) return `<div class="page-head"><div class="eyebrow">Search</div><h1 class="page-title">Find a lesson or term</h1>${form}</div>`;
    const ls = D.lessons.filter(l => (plain(l.title) + ' ' + plain(l.subtitle)).toLowerCase().includes(q));
    const ts = D.terms.filter(t => (t.term + ' ' + t.def).toLowerCase().includes(q));
    return `<div class="page-head"><div class="eyebrow">Search · ${ls.length + ts.length} result${ls.length + ts.length === 1 ? '' : 's'}</div><h1 class="page-title">“${esc(q)}”</h1>${form}</div>
      ${!ls.length && !ts.length ? '<div class="empty">Nothing found.</div>' : ''}<div class="lesson-list">${ls.map(l => `<a class="lesson-row" href="#lesson/${l.id}"><span class="ln">${esc(l.module.code.slice(0, 3))}</span><span><b>${md(l.title)}</b><small>${md(l.subtitle)}</small></span></a>`).join('')}</div>
      <div class="terms" style="margin-top:14px">${ts.map(t => `<a class="term" href="#lesson/${t.lesson.id}" style="text-decoration:none;color:inherit"><b>${md(t.term)}</b><span>${md(t.def)}</span></a>`).join('')}</div>`;
  }
  function notFound() { return `<div class="empty"><p>Page not found.</p><a class="btn" href="#home">Home</a></div>`; }

  /* ---------------- router ---------------- */
  // remember where each page was scrolled, so Back returns to the same spot
  const scrollMem = {}; let linkNav = false;
  function route(ev) {
    if (ev && ev.oldURL) { const old = ev.oldURL.split('#')[1]; scrollMem['#' + (old || '')] = scrollY; }
    const [r, arg] = location.hash.slice(1).split('/');
    // a finished exam shows its result once; coming back later shows the exam start page again
    if (EX && EX.done && r !== 'exam' && !EX.unseen) EX = null;
    const V = { home: viewHome, '': viewHome, modules: viewModules, module: viewModule, lesson: viewLesson, practice: viewPractice, cards: viewCards, glossary: viewGlossary, exam: () => EX && EX.done && EX.result ? (EX.unseen = false, examResultHTML()) : viewExam(), capstone: viewCapstone, certificate: viewCertificate, settings: viewSettings, search: viewSearch, verify: viewVerify, account: viewAccount, contact: viewContact }[r || ''] || notFound;
    view.innerHTML = V(arg); renderChrome(); if (r === 'verify') runVerify(arg); if (r === 'account') mountAccount(); if (r === 'contact') mountContact();
    const back = ev && !linkNav && scrollMem[location.hash || '#'] != null; linkNav = false;
    const to = back ? scrollMem[location.hash || '#'] : 0; if (to || scrollY) window.scrollTo({ top: to, behavior: 'auto' });
    if (ev && !reduced() && view.animate) view.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' });
    watchPulse(); markWide();
    onScroll();
    if (r === 'exam') tickExam();
    if (r === 'certificate') { drawCert(); certFonts().then(drawCert); }
    if (r === 'search' && !arg) { const i = $('#searchPageIn'); if (i) i.focus(); }
    const l = r === 'lesson' && D.lessons.find(x => x.id === arg);
    document.title = l ? `${plain(l.title)} · ${M.short}` : `${M.full} (${M.short})`;
  }
  function render() { const y = scrollY; route(); window.scrollTo({ top: y, behavior: 'auto' }); }
  let scrollRAF = 0;
  /* the hero's animated signal only runs while it is on screen */
  const pulseIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('sg-paused', !e.isIntersecting))) : null;
  function watchPulse() { if (!pulseIO) return; pulseIO.disconnect(); new Set($$('.sg-pulse').map(p => p.ownerSVGElement).filter(Boolean)).forEach(s => pulseIO.observe(s)); }
  /* diagrams wider than the screen scroll sideways; mark them so a swipe hint shows */
  function markWide() { $$('.fig-scroll').forEach(x => x.classList.toggle('more', x.scrollWidth > x.clientWidth + 4)); }
  let wideT = 0; addEventListener('resize', () => { clearTimeout(wideT); wideT = setTimeout(markWide, 150); }, { passive: true });
  function onScroll() {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = 0; const p = $('#readBar');
      if (!location.hash.startsWith('#lesson/')) { if (p.style.transform !== 'scaleX(0)') p.style.transform = 'scaleX(0)'; return; }
      const h = document.documentElement.scrollHeight - innerHeight; p.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0})`;
    });
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', e => {
    const t = e.target;
    const ln = t.closest('a[href^="#"]'); if (ln) linkNav = true;
    if (t.closest('#themeBtn')) { S.theme = isDark() ? 'light' : 'dark'; save(); applyTheme(); renderChrome(); return; }
    const ts = t.closest('[data-theme-set]'); if (ts) { S.theme = ts.dataset.themeSet; save(); applyTheme(); render(); return; }
    const cp = t.closest('[data-complete]'); if (cp) { S.done[cp.dataset.complete] = today(); S.xp += 20; save(); confetti(); $('#completeSlot').innerHTML = completeHTML(D.lessons.find(l => l.id === cp.dataset.complete)); renderChrome(); if (eligible()) toast('All requirements met. Your certificate is unlocked!', 4000); return; }
    const qo = t.closest('[data-qopt]'); if (qo) { const [q, k] = qo.dataset.qopt.split(':'); quizPick(q, +k); return; }
    const qn = t.closest('[data-qnext]'); if (qn) { quizNext(qn.dataset.qnext); return; }
    const qr = t.closest('[data-qretry]'); if (qr) { const st = quizStates[qr.dataset.qretry]; Object.assign(st, { i: 0, picked: null, right: 0, res: [] }); if (st.practice) st.items = shuffle(st.items); $('#' + qr.dataset.qretry).innerHTML = quizInner(qr.dataset.qretry); return; }
    if (t.closest('[data-reveal]')) { const b = t.closest('[data-reveal]'); const r = b.nextElementSibling; r.hidden = !r.hidden; b.textContent = r.hidden ? 'Show model answer' : 'Hide model answer'; return; }
    const so = t.closest('[data-scopt]'); if (so) { const sec = so.closest('[data-sc]'); S.sc[sec.dataset.sc] = +so.dataset.scopt; save(); const at = blockAt(sec.dataset.sc); if (at) sec.outerHTML = block(at.l.blocks[at.i], at.i, at.l); return; }
    const sr = t.closest('[data-screset]'); if (sr) { const sec = sr.closest('[data-sc]'); delete S.sc[sec.dataset.sc]; save(); const at = blockAt(sec.dataset.sc); if (at) sec.outerHTML = block(at.l.blocks[at.i], at.i, at.l); return; }
    const csv = t.closest('[data-csv]'); if (csv) {
      const tb = csv.closest('.template').querySelector('table'); const rows = $$('tr', tb).map(tr => $$('th,td', tr).map(c => '"' + c.innerText.replace(/"/g, '""').trim() + '"').join(','));
      const text = rows.join('\n'); (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Copied. Paste into a spreadsheet.'), () => toast('Copy blocked by the browser. Select the table and copy it manually.'));
      return;
    }
    if (t.closest('[data-clicopy]')) { const pre = t.closest('.cli-win').querySelector('pre'); const text = pre.innerText; (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast('Copied to clipboard.'), () => { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Selected. Press Ctrl+C to copy.'); }); return; }
    const dr = t.closest('[data-drill]'); if (dr) { startDrill(dr.dataset.drill); return; }
    if (t.closest('#fcCard')) { fcFlip = !fcFlip; const c = $('#fcCard'); c.classList.toggle('flip', fcFlip); c.setAttribute('aria-pressed', fcFlip); const ft = fcQueue[0]; if (ft) c.setAttribute('aria-label', `${plain(ft.term)}. ${fcFlip ? plain(ft.def) : 'Press Enter to see the definition'}`); return; }
    const fg = t.closest('[data-fc]'); if (fg) { fcGrade(+fg.dataset.fc); return; }
    const xs = t.closest('[data-exstart]'); if (xs) { examStart(xs.dataset.exstart); return; }
    if (t.closest('[data-upgrade]')) { upgradeCert(); return; }
    const ac = t.closest('[data-acct]'); if (ac) {
      const a = ac.dataset.acct;
      if (a === 'sync') { ac.disabled = true; pullProgress().then(() => { toast('Synced.'); render(); }); }
      else if (a === 'out') signOut();
      else if (a === 'delask') $('#delSlot').innerHTML = `<span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm" type="button" data-acct="delno">Cancel</button><button class="btn btn-sm" type="button" data-acct="del" style="background:var(--bad);color:#fff;border-color:transparent">Yes, delete my account</button></span>`;
      else if (a === 'del') deleteAccount();
      else render();
      return;
    }
    const xa = t.closest('[data-exans]'); if (xa && EX && !EX.done) { examAnswer(+xa.dataset.exans); return; }
    const xg = t.closest('[data-exgo]'); if (xg && EX && !EX.done) { examGo(+xg.dataset.exgo); return; }
    if (t.closest('[data-exflag]') && EX && !EX.done) { examFlag(); return; }
    if (t.closest('[data-exsubmit]') && EX && !EX.done) {
      const un = EX.qs.length - Object.keys(EX.ans).length;
      $('#exConfirm').innerHTML = `<div class="callout warning" style="margin-top:10px"><span class="ct">Submit?</span>${un ? `${un} question${un > 1 ? 's are' : ' is'} unanswered. ` : ''}You cannot change answers after submitting.<div class="hero-actions" style="margin-top:8px"><button class="btn btn-sm" type="button" data-exback>Keep working</button><button class="btn btn-sm btn-primary" type="button" data-exconfirm>Submit now</button></div></div>`;
      $('#exConfirm').scrollIntoView({ behavior: smooth(), block: 'center' }); const nb = $('[data-exconfirm]'); if (nb) nb.focus({ preventScroll: true }); return;
    }
    if (t.closest('[data-exback]')) { paintExam('#exQ'); return; }
    if (t.closest('[data-exconfirm]')) { examSubmit(false); return; }
    if (t.closest('[data-exreview]')) { examReview(); $('#exReview').scrollIntoView({ behavior: smooth() }); return; }
    const rb = t.closest('[data-rub]'); if (rb) { const [i, j] = rb.dataset.rub.split(':').map(Number); S.cap.rubric[i] = j; save(); $$(`[data-rub^="${i}:"]`).forEach(b => { const on = b === rb; b.setAttribute('aria-pressed', on); b.parentElement.classList.toggle('sel', on); }); return; }
    if (t.closest('[data-certdl]')) {
      if (!eligible()) return;
      certFonts().then(() => { drawCert(); const a = document.createElement('a'); a.download = `${M.short}-certificate-${S.exam.passed.id}.png`; a.href = $('#certCanvas').toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); });
      return;
    }
    const rs = t.closest('[data-reset]'); if (rs) {
      if (rs.dataset.reset === 'ask') $('#resetSlot').innerHTML = `<span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm" type="button" data-reset="no">Cancel</button><button class="btn btn-sm" type="button" data-reset="yes" style="background:var(--bad);color:#fff;border-color:transparent">Yes, erase everything</button></span>`;
      else if (rs.dataset.reset === 'yes') { S = Object.assign(defaults(), { theme: S.theme }); save(); if (AUTH) pushProgress(); clearInterval(exTimer); EX = null; saveEX(); render(); toast('Progress reset.'); }
      else render();
    }
  });
  document.addEventListener('change', e => {
    const c = e.target;
    if (c.dataset.check) { S.checks[c.dataset.check] = c.checked; save(); }
    if (c.dataset.deliv != null) { S.cap.deliv[c.dataset.deliv] = c.checked; save(); }
  });
  document.addEventListener('input', e => {
    const c = e.target;
    if (c.dataset.note) { S.notes[c.dataset.note] = c.value; saveSoon(); }
    if (c.id === 'capNotes') { S.cap.notes = c.value; saveSoon(); }
    if (c.id === 'certName') { S.name = c.value; saveSoon(); drawCertSoon(); }
    if (c.id === 'glSearch') { glQuery = c.value; $('#glList').innerHTML = glossaryList(); }
    if (c.dataset.subnetIn != null) { c.closest('[data-subnet]').querySelector('.sn-out').innerHTML = subnetHTML(c.value); }
    if (c.dataset.cell) { const tpl = c.closest('[data-tpl]').dataset.tpl; const [r, k] = c.dataset.cell.split(':').map(Number); const g = S.cells[tpl] = S.cells[tpl] || []; g[r] = g[r] || []; g[r][k] = c.innerText; saveSoon(); }
  });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.id === 'fcCard') { e.preventDefault(); document.activeElement.click(); } });
  document.addEventListener('submit', e => {
    const cf = e.target.closest('#claimForm'); if (cf) { e.preventDefault(); claimCert($('input', cf).value); return; }
    const rf = e.target.closest('#restoreForm'); if (rf) { e.preventDefault(); restoreCert($('input', rf).value); return; }
    const vf = e.target.closest('#verifyForm'); if (vf) { e.preventDefault(); const h = '#verify/' + encodeURIComponent($('input', vf).value.trim()); linkNav = true; if (location.hash === h) runVerify(h.slice(8)); else location.hash = h; return; }
    const f = e.target.closest('#searchForm, #searchPage'); if (!f) return;
    e.preventDefault(); const q = $('input', f).value.trim(); linkNav = true; location.hash = '#search/' + encodeURIComponent(q);
  });
  addEventListener('hashchange', route);
  addEventListener('scroll', onScroll, { passive: true });
  // keep two open tabs in step instead of overwriting each other's progress
  addEventListener('storage', e => {
    if (e.key === AUTH_KEY) { AUTH = readAuth(); renderChrome(); if (location.hash === '#account') render(); return; }
    if (e.key !== KEY) return; S = loadState(); applyTheme(); renderChrome();
    const a = document.activeElement; const typing = a && (/^(INPUT|TEXTAREA)$/.test(a.tagName) || a.isContentEditable);
    if (!typing && !(EX && !EX.done)) render();
  });
  // never lose the last keystrokes when the tab is closed or hidden
  const flush = () => { if (saveT) save(); };
  addEventListener('pagehide', flush);
  addEventListener('pagehide', () => { if (official() && !EX.done) syncEX(true); if (AUTH && pushT) pushProgress(true); });
  // coming back to the tab: fetch changes made on other devices
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && AUTH && Date.now() - lastPull > 60e3) pullProgress(true); else if (document.visibilityState === 'hidden' && AUTH && pushT) pushProgress(true); });
  addEventListener('online', () => { if (official() && !EX.done && EX.pending) examSubmit(EX.end <= Date.now(), true); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  const mq = matchMedia('(prefers-color-scheme: dark)'); const onMQ = () => { if (S.theme === 'auto') renderChrome(); };
  if (mq.addEventListener) mq.addEventListener('change', onMQ); else if (mq.addListener) mq.addListener(onMQ);
  const disc = $('#disc'); if (disc) disc.textContent = M.disclaimer || '';
  applyTheme(); restoreEX(); route(); if (AUTH) pullProgress(true);
  // offline + instant repeat visits on the live site
  if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* optional */ }));
})();
