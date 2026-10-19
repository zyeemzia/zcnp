/* ZyeemZia certification engine — printable book. Same data as the site. */
(function () {
  'use strict';
  document.documentElement.setAttribute('data-theme', 'light');
  const { esc, md, plain, prepare, signatureSVG } = window.ZZ;
  const D = prepare(); const M = D.meta;
  const KEY = 'ABCD';
  const num = i => String(i + 1).padStart(2, '0');

  function cover() {
    return `<section class="page cover"><div class="motif"></div><div class="cover-in">
      <div class="c-top"><span>ZyeemZia™ Certification Track</span><span>${esc(M.domain)}</span></div>
      <div class="c-mid"><div class="c-code">${esc(M.short)}</div><h1>${esc(M.full)}</h1><p class="c-tag">${esc(M.tagline)}</p></div>
      <div class="c-sig">${signatureSVG(D, { name: M.signature && M.signature.name })}</div>
      <div class="c-bot"><span>Course book · Workbook · Exam preparation</span><span>${D.modules.length} modules · ${D.lessons.length} lessons · ${D.exam.length} exam questions</span><span>Copyright © ZyeemZia</span></div>
    </div></section>`;
  }
  function intro() {
    const steps = [['Learn', `Work through ${D.lessons.length} lessons. Each ends with a knowledge check.`], ['Practise', 'Fill in the templates, answer the scenarios and case studies, review the glossary.'], ['Certify', `Take the ${M.examSize}-question official exam at ${M.domain}, graded on the ZyeemZia server. Pass mark ${M.passMark}%.`], ['Get certified', `Download your certificate online. Anyone can verify its credential ID at ${M.domain}/#verify. ${M.distinctionMark}%+ and the capstone earn Distinction.`]];
    return `<section class="flow"><div class="eyebrow">Before you begin</div><h1 class="h-page">How to use this book</h1>
      <p>${md(M.lead)}</p>
      <div class="how">${steps.map(([t, s], i) => `<div><span class="n">${num(i)}</span><b>${t}</b><p>${esc(s)}</p></div>`).join('')}</div>
      <h2 class="h-sec">Eight-week study plan</h2>
      <table><thead><tr><th>When</th><th>Module</th><th>Do this</th><th>Done</th></tr></thead><tbody>${(M.studyPlan || []).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td class="box">☐</td></tr>`).join('')}</tbody></table>
      <div class="learner"><div>Learner name <span class="line"></span></div><div>Start date <span class="line"></span> Target exam date <span class="line"></span></div></div>
      <p class="disc">${esc(M.disclaimer || '')}</p></section>`;
  }
  function toc() {
    return `<section class="flow"><div class="eyebrow">Contents</div><h1 class="h-page">What you will learn</h1>
      ${D.modules.map((m, i) => `<div class="toc-m"><div class="toc-h"><span class="toc-n">${num(i)}</span><b>${esc(m.code)} — ${md(m.title)}</b></div><ol>${m.lessons.map(l => `<li>${md(l.title)} <span class="muted">· ${l.minutes} min</span></li>`).join('')}</ol></div>`).join('')}
      <div class="toc-m"><div class="toc-h"><span class="toc-n">+</span><b>Glossary · Capstone guide · Practice exam & answers · Certificate · Notes</b></div></div></section>`;
  }
  function signaturePage() {
    const s = M.signature || {};
    return `<section class="page sigpage"><div class="eyebrow">The framework</div><h1 class="h-page">${esc(s.name || '')}</h1><p class="lead">${esc(s.caption || '')}</p>
      <div class="sig-big">${signatureSVG(D, { name: s.name })}</div>
      <div class="sig-list">${D.modules.map((m, i) => `<div><span class="n">${num(i)}</span><b>${esc(m.code)}</b><p>${md(m.subtitle)}</p></div>`).join('')}</div></section>`;
  }

  const T = b => b.title ? `<h3 class="b-title">${md(b.title)}</h3>` : '';
  const KIND = { insight: 'Insight', warning: 'Watch out', example: 'Example', pro: 'Pro tip', definition: 'Definition' };
  function block(b, ctx) {
    switch (b.type) {
      case 'text': return `<p class="b">${md(b.text)}</p>`;
      case 'callout': return `<aside class="callout ${esc(b.kind)}"><span class="ct">${KIND[b.kind] || ''}${b.title ? ' · ' + md(b.title) : ''}</span>${md(b.text)}</aside>`;
      case 'keypoints': return `<div class="kp">${T(b)}<ul>${b.items.map(x => `<li>${md(x)}</li>`).join('')}</ul></div>`;
      case 'table': return `<div class="blk">${T(b)}<table><thead><tr>${b.head.map(h => `<th>${md(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'steps': return `<div class="blk">${T(b)}<ol class="steps">${b.items.map(x => `<li><b>${md(x.title)}</b> ${md(x.text)}</li>`).join('')}</ol></div>`;
      case 'framework': return `<div class="blk">${T(b)}<div class="fw">${b.items.map(x => `<div><span class="lab">${esc(x.label)}</span><b>${md(x.title)}</b><p>${md(x.text)}</p></div>`).join('')}</div></div>`;
      case 'compare': return `<div class="blk">${T(b)}<div class="cmp" style="grid-template-columns:repeat(${b.columns.length},1fr)">${b.columns.map(c => `<div><b>${md(c.title)}</b><ul>${c.items.map(x => `<li>${md(x)}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
      case 'flow': return `<div class="blk">${T(b)}<div class="flowx">${b.items.map((x, k) => `<div><span class="k">${num(k)}</span><b>${md(x.label)}</b>${x.text ? `<p>${md(x.text)}</p>` : ''}</div>`).join('<i>→</i>')}</div></div>`;
      case 'layers': return `<div class="blk">${T(b)}<div class="layers">${b.items.map(x => `<div><b>${md(x.label)}</b><span>${x.parts.map(p => `<em>${md(p)}</em>`).join('')}</span></div>`).join('')}</div></div>`;
      case 'formula': return `<div class="blk">${T(b)}<table class="fm"><thead><tr><th>Measure</th><th>Formula</th><th>What it tells you</th></tr></thead><tbody>${b.items.map(x => `<tr><td><b>${md(x.name)}</b></td><td><code>${esc(plain(x.expr))}</code></td><td>${md(x.meaning)}</td></tr>`).join('')}</tbody></table></div>`;
      case 'case': { ctx.key.push({ kind: 'Case study', title: b.title, body: b.answer }); return `<div class="case"><div class="case-h">Case study · ${md(b.title)}</div><p>${md(b.context)}</p><ol>${b.questions.map(q => `<li>${md(q)}<div class="write-lines"></div></li>`).join('')}</ol><p class="hint">Model answer: module answer key.</p></div>`; }
      case 'scenario': { const best = b.options.findIndex(o => o.best); ctx.key.push({ kind: 'Scenario', title: b.title || plain(b.situation).slice(0, 70) + '…', body: `**${KEY[best]}** is best. ${b.options[best].feedback}` }); return `<div class="scenario"><div class="sc-h">Scenario · decide${b.title ? ' · ' + md(b.title) : ''}</div><p>${md(b.situation)}</p><div class="sc-o">${b.options.map((o, k) => `<div><b>${KEY[k]}</b> ${md(o.text)}</div>`).join('')}</div><p class="hint">Circle your choice. Answer and feedback: module answer key.</p></div>`; }
      case 'checklist': return `<div class="kp check">${`<h3 class="b-title">${md(b.title)}</h3>`}<ul>${b.items.map(x => `<li>☐ ${md(x)}</li>`).join('')}</ul></div>`;
      case 'template': return `<div class="tpl"><div class="tpl-h"><span>Template</span><b>${md(b.title)}</b></div><p class="hint">${md(b.purpose)}</p><table><thead><tr>${b.columns.map(c => `<th>${md(c)}</th>`).join('')}</tr></thead><tbody>${(b.example || []).map(r => `<tr class="ex">${r.map(c => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}${Array.from({ length: b.rows || 4 }, () => `<tr class="blank">${b.columns.map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'reflection': return `<div class="refl"><span class="ct">Reflect</span><p>${md(b.prompt)}</p><div class="write-lines tall"></div></div>`;
      case 'terms': return `<div class="blk"><h3 class="b-title">Key terms</h3><dl class="terms">${b.items.map(x => `<div><dt>${md(x.term)}</dt><dd>${md(x.def)}</dd></div>`).join('')}</dl></div>`;
      case 'cli': return `<div class="cli">${T(b)}<div class="cli-h">${esc(b.device)}</div><pre>${b.lines.map(l => esc(l)).join('\n')}</pre>${b.note ? `<p class="hint">${md(b.note)}</p>` : ''}</div>`;
      case 'tool': {
        const tasks = ['192.168.10.77/26', '10.45.130.9/20', '172.20.5.200/27', '10.0.0.129/25', '192.168.1.5/30', '172.16.99.1/22'];
        return `<div class="tpl sn"><div class="tpl-h"><span>Practice</span><b>${b.title ? md(b.title) : 'Subnetting worksheet'}</b></div>${b.prompt ? `<p class="hint">${md(b.prompt)}</p>` : ''}
          <table><thead><tr><th>Address / prefix</th><th>Network</th><th>Mask</th><th>First host</th><th>Last host</th><th>Broadcast</th><th>Hosts</th></tr></thead><tbody>
          ${tasks.map(t => `<tr class="blank"><td><code>${t}</code></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
          <p class="hint">Answers: use the subnet calculator on the course website, or check with the answer key at the end of the book.</p></div>`;
      }
      case 'quiz': { const start = ctx.quiz.length + 1; b.items.forEach(q => ctx.quiz.push(q)); return `<div class="quiz"><div class="q-h">Knowledge check</div><ol start="${start}">${b.items.map(q => `<li>${md(q.q)}<div class="qo">${q.options.map((o, k) => `<span><b>${KEY[k]}</b> ${md(o)}</span>`).join('')}</div></li>`).join('')}</ol></div>`; }
      default: return '';
    }
  }
  function moduleSection(m, i) {
    const ctx = { quiz: [], key: [] };
    let h = `<section class="page opener"><div class="motif"></div><div class="op-in"><div class="op-num">${num(i)}</div><div class="eyebrow">Module ${i + 1} · ${esc(m.code)}</div><h1>${md(m.title)}</h1><p class="lead">${md(m.subtitle)}</p>
      <h3>By the end of this module you will be able to</h3><ul>${m.outcomes.map(o => `<li>${md(o)}</li>`).join('')}</ul>
      <h3>Lessons</h3><ol>${m.lessons.map(l => `<li>${md(l.title)} <span>· ${l.minutes} min</span></li>`).join('')}</ol></div></section>`;
    m.lessons.forEach((l, j) => {
      h += `<section class="flow"><header class="l-head"><div class="eyebrow">Module ${i + 1} · ${esc(m.code)} · Lesson ${j + 1} · ${l.minutes} min</div><h2>${md(l.title)}</h2><p class="muted">${md(l.subtitle)}</p>
        <ul class="obj">${l.objectives.map(o => `<li>${md(o)}</li>`).join('')}</ul></header>
        ${l.blocks.map(b => block(b, ctx)).join('')}
        <p class="done-line">☐ Lesson complete · Date ____________ · Knowledge check score ____ / ${l.blocks.filter(b => b.type === 'quiz').reduce((n, b) => n + b.items.length, 0)}</p></section>`;
    });
    h += `<section class="flow"><div class="eyebrow">Module ${i + 1} · ${esc(m.code)}</div><h1 class="h-page">Answer key</h1>
      <h3 class="b-title">Knowledge checks</h3><div class="key">${ctx.quiz.map((q, k) => `<div><b>${k + 1}. ${KEY[q.answer]}</b> ${md(q.explain)}</div>`).join('')}</div>
      ${ctx.key.length ? `<h3 class="b-title">Scenarios & case studies</h3>${ctx.key.map(k => `<div class="key-item"><b>${esc(k.kind)} · ${md(k.title)}</b><p>${md(k.body)}</p></div>`).join('')}` : ''}</section>`;
    return h;
  }
  function glossary() {
    let last = '';
    return `<section class="flow"><div class="eyebrow">Reference</div><h1 class="h-page">Glossary</h1><div class="gloss">${D.terms.map(t => { const L = t.term[0].toUpperCase(); const hd = L !== last ? `<div class="gl-l">${esc(L)}</div>` : ''; last = L; return `${hd}<div class="gl"><b>${md(t.term)}</b> ${md(t.def)} <span class="muted">(${esc(t.lesson.module.code)})</span></div>`; }).join('')}</div></section>`;
  }
  function capstone() {
    const c = M.capstone || {};
    return `<section class="flow"><div class="eyebrow">Capstone</div><h1 class="h-page">${esc(c.title || 'Capstone')}</h1><p>${md(c.brief || '')}</p>
      <h3 class="b-title">Deliverables</h3><ul class="kp-list">${(c.deliverables || []).map(d => `<li>☐ ${md(d)}</li>`).join('')}</ul>
      <h3 class="b-title">Self-assessment rubric</h3><table><thead><tr><th>Criterion</th><th>Developing</th><th>Proficient</th><th>Excellent</th></tr></thead><tbody>${(c.rubric || []).map(r => `<tr><td><b>${md(r.criterion)}</b></td>${r.levels.map(l => `<td>○ ${md(l)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>
      <section class="flow"><div class="eyebrow">Capstone</div><h1 class="h-page">Planning pages</h1><p class="hint">Sketch your design, timeline or architecture here.</p><div class="grid-paper"></div></section>`;
  }
  function exam() {
    let n = 0; const key = [];
    const body = D.modules.map(m => { const qs = D.exam.filter(q => q.module === m.id); if (!qs.length) return ''; return `<h3 class="b-title">${esc(m.code)} — ${md(m.title)}</h3><ol class="exam-q" start="${n + 1}">${qs.map(q => { n++; key.push({ n, q }); return `<li>${md(q.q)}<div class="qo">${q.options.map((o, k) => `<span><b>${KEY[k]}</b> ${md(o)}</span>`).join('')}</div></li>`; }).join('')}</ol>`; }).join('');
    return `<section class="flow"><div class="eyebrow">Exam preparation</div><h1 class="h-page">Practice exam · ${D.exam.length} questions</h1>
      <p>The official online exam draws ${M.examSize} questions at random from a separate, secret bank that tests the same skills, with a ${M.examMinutes}-minute limit and a ${M.passMark}% pass mark. Practise with these questions first: time yourself, mark your answers, then check the key and read every explanation, including for the questions you got right.</p>${body}</section>
      <section class="flow"><div class="eyebrow">Exam preparation</div><h1 class="h-page">Practice exam answers & explanations</h1><div class="key">${key.map(k => `<div><b>${k.n}. ${KEY[k.q.answer]}</b> ${md(k.q.explain)}</div>`).join('')}</div></section>`;
  }
  function certificate() {
    const c = M.certificate || {};
    return `<section class="page certpage"><div class="cert"><div class="band"><span>ZyeemZia™</span><b>${esc(M.short)}</b><small>${esc(M.name)}</small></div>
      <div class="cert-main"><div class="eyebrow">${esc(c.title || 'Certificate of Achievement')}</div><p>This certifies that</p><div class="name-line"></div><p>${esc(c.statement || '')}</p>
      <div class="skills">${(c.skills || []).map(s => `<span>${esc(s)}</span>`).join('')}</div>
      <div class="cert-meta"><div>Issued<span></span></div><div>Credential ID<span></span></div></div>
      <p class="hint">Earn the official certificate online at ${esc(M.domain)}: complete every lesson and pass the official exam. Anyone can verify your credential ID at ${esc(M.domain)}/#verify. This page is for your printed record.</p></div></div></section>`;
  }
  function academy() {
    const F = window.ZZ_FAMILY || []; if (!F.length) return '';
    const net = F.filter(f => f.path === 'Networking').sort((a, b) => a.tier - b.tier), other = F.filter(f => f.path !== 'Networking');
    const card = f => `<div class="ac ${f.code === M.code ? 'me' : ''} ${f.soon && f.code !== M.code ? 'soon' : ''}"><span>${esc(f.level)}</span><b>${esc(f.code)}</b><small>ZyeemZia™ ${esc(f.name)}</small><em>${f.soon && f.code !== M.code ? 'Coming soon' : esc(f.domain)}</em></div>`;
    return `<section class="flow"><div class="eyebrow">ZyeemZia™ Academy</div><h1 class="h-page">Your certification path</h1>
      <p>Each ZyeemZia™ track stands on its own, and together they form a path from first network to expert design, plus leadership and AI architecture. Take the next step at the sites below.</p>
      <h3 class="b-title">Networking ladder</h3><div class="ac-row">${net.map(card).join('<i>→</i>')}</div>
      <h3 class="b-title">Leadership & AI</h3><div class="ac-row">${other.map(card).join('')}</div></section>`;
  }
  function subnetKey() {
    if (!D.lessons.some(l => l.blocks.some(b => b.type === 'tool'))) return '';
    const tasks = ['192.168.10.77/26', '10.45.130.9/20', '172.20.5.200/27', '10.0.0.129/25', '192.168.1.5/30', '172.16.99.1/22'];
    return `<section class="flow"><div class="eyebrow">Answer key</div><h1 class="h-page">Subnetting worksheet answers</h1><table><thead><tr><th>Address / prefix</th><th>Network</th><th>Mask</th><th>First host</th><th>Last host</th><th>Broadcast</th><th>Hosts</th></tr></thead><tbody>
      ${tasks.map(t => { const r = window.ZZ.subnet(t); return `<tr><td><code>${t}</code></td><td>${r.network}</td><td>${r.mask}</td><td>${r.first}</td><td>${r.last}</td><td>${r.broadcast}</td><td>${r.hosts}</td></tr>`; }).join('')}</tbody></table></section>`;
  }
  function notes() { return `<section class="flow"><div class="eyebrow">Notes</div><h1 class="h-page">My notes</h1><div class="write-lines notes"></div></section>`; }

  const header = document.createElement('style');
  header.textContent = `@page { @top-right { content: "${(M.short + ' · ' + M.full).replace(/"/g, '')}"; font: 500 8pt "IBM Plex Mono", monospace; color: #8a91a3; } } @page cover { @top-right { content: none; } } @page full { @top-right { content: none; } }`;
  document.head.appendChild(header);
  const render = () => {
    document.getElementById('book').innerHTML = cover() + intro() + toc() + signaturePage() + D.modules.map(moduleSection).join('') + glossary() + capstone() + exam() + subnetKey() + academy() + certificate() + notes();
    document.body.setAttribute('data-ready', '1');
  };
  const faces = ['400 16px "IBM Plex Sans"', '600 16px "IBM Plex Sans"', '700 16px "IBM Plex Sans"', '400 16px "IBM Plex Mono"', '600 16px "IBM Plex Mono"', '700 16px Archivo', '800 16px Archivo', '700 16px Sora', '800 16px Sora'];
  if (document.fonts && document.fonts.load) Promise.all(faces.map(f => document.fonts.load(f, 'Aa'))).then(render, render); else render();
})();
