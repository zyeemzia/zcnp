/* ZyeemZia certification engine — shared helpers for the site (app.js) and the book (book.js). */
window.TRACK = window.TRACK || { modules: [], exam: [] };
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* inline markup: **bold**, `code`, line breaks */
  const md = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  const plain = s => String(s == null ? '' : s).replace(/\*\*|`/g, '');

  function prepare() {
    const T = window.TRACK;
    // ignore a second module with an id already seen (e.g. a stray test file), so lessons are never doubled
    const seenM = new Set(); const modules = (T.modules || []).filter(m => m && m.id && !seenM.has(m.id) && seenM.add(m.id)).sort((a, b) => a.order - b.order);
    const lessons = [];
    modules.forEach(m => m.lessons.forEach((l, i) => { l.module = m; l.index = i; l.gi = lessons.length; lessons.push(l); }));
    const exam = [].concat(...(T.exam || []).map(x => Array.isArray(x) ? x : [x]));
    const terms = []; const seen = new Set();
    lessons.forEach(l => l.blocks.forEach(b => { if (b.type === 'terms') b.items.forEach(t => { const k = t.term.toLowerCase(); if (!seen.has(k)) { seen.add(k); terms.push(Object.assign({ lesson: l }, t)); } }); }));
    terms.sort((a, b) => a.term.localeCompare(b.term));
    return { meta: T.meta || {}, modules, lessons, exam, terms };
  }

  /* signature diagrams */
  function loopSVG(modules, opts) {
    const o = opts || {}; const n = modules.length || 8; const cx = 200, cy = 200, R = 140;
    const pts = modules.map((m, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { m, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a }; });
    const arcs = pts.map((p, i) => { const q = pts[(i + 1) % n]; const a1 = p.a + 0.2, a2 = q.a - 0.2 + (i + 1 === n ? 2 * Math.PI : 0);
      const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      return `<path class="sg-arc" d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#sgArrow)"/>`; }).join('');
    const nodes = pts.map((p, i) => {
      const lx = cx + (R + 0) * Math.cos(p.a), ly = cy + (R + 0) * Math.sin(p.a);
      const tag = o.link ? `a href="#module/${p.m.id}"` : 'g';
      return `<${tag} class="sg-node ${o.done && o.done(p.m) ? 'done' : ''}"><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="31"/>
        <text x="${lx.toFixed(1)}" y="${(ly - 3).toFixed(1)}" class="sg-n">${String(i + 1).padStart(2, '0')}</text>
        <text x="${lx.toFixed(1)}" y="${(ly + 13).toFixed(1)}" class="sg-c">${esc(p.m.code)}</text></${o.link ? 'a' : 'g'}>`;
    }).join('');
    return `<svg class="sg sg-loop" viewBox="0 0 400 400" role="img" aria-label="${esc(o.name || 'Framework')}">
      <defs><marker id="sgArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="sg-arrow"/></marker></defs>
      <circle cx="${cx}" cy="${cy}" r="${R}" class="sg-ring"/>${arcs}
      <text x="${cx}" y="${cy - 8}" class="sg-title">${esc(o.center || '')}</text><text x="${cx}" y="${cy + 16}" class="sg-sub">${esc(o.centerSub || '')}</text>
      ${nodes}</svg>`;
  }
  function stackSVG(modules, opts) {
    const o = opts || {}; const list = modules.slice(); const trust = list.length > 1 ? list.pop() : null;
    const W = 460, top = 40, h = 36, gap = 6, x = 20, w = 420;
    const rows = list.slice().reverse().map((m, i) => {
      const y = top + i * (h + gap); const idx = list.length - i; const tag = o.link ? `a href="#module/${m.id}"` : 'g';
      return `<${tag} class="sg-layer ${o.done && o.done(m) ? 'done' : ''}"><rect x="${x + 14}" y="${y}" width="${w - 28}" height="${h}" rx="6"/>
        <text x="${x + 30}" y="${y + h / 2 + 5}" class="sg-n" text-anchor="start">${String(idx).padStart(2, '0')}</text>
        <text x="${x + 62}" y="${y + h / 2 + 5}" class="sg-c" text-anchor="start">${esc(m.code)}</text>
        <text x="${x + w - 28}" y="${y + h / 2 + 5}" class="sg-t" text-anchor="end">${esc(trunc(plain(m.title).split(/[—:]/).pop().trim(), Math.max(8, Math.floor((w - 28 - 62 - 14 - m.code.length * 8.4) / 6.5))))}</text></${o.link ? 'a' : 'g'}>`;
    }).join('');
    const H = top + list.length * (h + gap) + 30;
    const trustTag = trust ? (o.link ? `a href="#module/${trust.id}"` : 'g') : null;
    const frame = trust ? `<${trustTag} class="sg-trust ${o.done && o.done(trust) ? 'done' : ''}"><rect x="${x}" y="${top - 26}" width="${w}" height="${H - top + 30}" rx="14"/>
      <text x="${W / 2}" y="${top - 9}" class="sg-c">${String(modules.length).padStart(2, '0')} · ${esc(trust.code)} — wraps every layer</text></${o.link ? 'a' : 'g'}>` : '';
    return `<svg class="sg sg-stack" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="${esc(o.name || 'Framework')}">${frame}${rows}</svg>`;
  }
  const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const tag = (o, m) => o.link ? `a href="#module/${m.id}"` : 'g';
  const close = o => o.link ? 'a' : 'g';
  /* packet path: 8 hops along a snake-shaped cable */
  function pathSVG(modules, o) {
    const pts = modules.map((m, i) => { const row = i < 4 ? 0 : 1, col = row ? 3 - (i - 4) : i; return { m, i, x: 62 + col * 112, y: row ? 214 : 82 }; });
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ').replace(/L(\d+) 214/, (mm, x) => `C${+x + 70} 82 ${+x + 70} 214 ${x} 214`);
    return `<svg class="sg sg-path" viewBox="0 0 460 300" role="img" aria-label="${esc(o.name || 'Framework')}">
      <path class="sg-cable" d="${d}"/><path class="sg-cable sg-pulse" d="${d}"/>
      ${pts.map(p => `<${tag(o, p.m)} class="sg-node ${o.done && o.done(p.m) ? 'done' : ''}"><rect x="${p.x - 46}" y="${p.y - 27}" width="92" height="54" rx="12"/>
        <text x="${p.x}" y="${p.y - 5}" class="sg-n">HOP ${String(p.i + 1).padStart(2, '0')}</text><text x="${p.x}" y="${p.y + 13}" class="sg-c">${esc(trunc(p.m.code, 11))}</text></${close(o)}>`).join('')}
      <text x="230" y="150" class="sg-title" style="font-size:22px">${esc(o.center || '')}</text><text x="230" y="168" class="sg-sub">${esc(o.centerSub || '')}</text></svg>`;
  }
  /* hex fabric: two offset rows of four cells */
  function hexSVG(modules, o) {
    const R = 50, hx = (cx, cy) => Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + k * Math.PI / 3; return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`; }).join(' ');
    const cells = modules.map((m, i) => { const row = i < 4 ? 0 : 1, col = row ? i - 4 : i; return { m, i, x: 72 + col * 88 + row * 44, y: 92 + row * 78 }; });
    return `<svg class="sg sg-hex" viewBox="0 0 460 300" role="img" aria-label="${esc(o.name || 'Framework')}">
      ${cells.map(c => `<${tag(o, c.m)} class="sg-node ${o.done && o.done(c.m) ? 'done' : ''}"><polygon points="${hx(c.x, c.y)}"/>
        <text x="${c.x}" y="${c.y - 6}" class="sg-n">${String(c.i + 1).padStart(2, '0')}</text><text x="${c.x}" y="${c.y + 12}" class="sg-c">${esc(trunc(c.m.code, 10))}</text></${close(o)}>`).join('')}
      <text x="230" y="272" class="sg-title" style="font-size:22px">${esc(o.center || '')}</text><text x="230" y="290" class="sg-sub">${esc(o.centerSub || '')}</text></svg>`;
  }
  /* design blueprint: eight drawing sheets with dimension lines and title blocks */
  function blueprintSVG(modules, o) {
    const sheets = modules.map((m, i) => ({ m, i, x: 16 + (i % 4) * 110, y: i < 4 ? 34 : 164 }));
    return `<svg class="sg sg-blueprint" viewBox="0 0 460 300" role="img" aria-label="${esc(o.name || 'Framework')}">
      <line x1="16" y1="18" x2="446" y2="18" class="sg-dim"/><line x1="16" y1="12" x2="16" y2="24" class="sg-dim"/><line x1="446" y1="12" x2="446" y2="24" class="sg-dim"/>
      <text x="231" y="13" class="sg-sub">${esc(o.center || '')} · ${esc(o.centerSub || '')}</text>
      ${sheets.map(s => `<${tag(o, s.m)} class="sg-node sg-sheet ${o.done && o.done(s.m) ? 'done' : ''}"><rect x="${s.x}" y="${s.y}" width="100" height="112" rx="4"/>
        <line x1="${s.x + 12}" y1="${s.y + 28}" x2="${s.x + 88}" y2="${s.y + 28}" class="sg-grid"/><line x1="${s.x + 12}" y1="${s.y + 48}" x2="${s.x + 70}" y2="${s.y + 48}" class="sg-grid"/><line x1="${s.x + 12}" y1="${s.y + 62}" x2="${s.x + 80}" y2="${s.y + 62}" class="sg-grid"/>
        <rect x="${s.x + 6}" y="${s.y + 76}" width="88" height="30" rx="2" class="sg-tb"/>
        <text x="${s.x + 50}" y="${s.y + 18}" class="sg-n">SHEET ${String(s.i + 1).padStart(2, '0')}</text><text x="${s.x + 50}" y="${s.y + 96}" class="sg-c">${esc(trunc(s.m.code, 12))}</text></${close(o)}>`).join('')}</svg>`;
  }
  function signatureSVG(D, opts) {
    const sig = D.meta.signature || {}; const o = Object.assign({ center: D.meta.short, centerSub: sig.centerSub || 'Value Loop' }, opts);
    if (sig.type === 'stack') return stackSVG(D.modules, o);
    if (sig.type === 'path') return pathSVG(D.modules, o);
    if (sig.type === 'hex') return hexSVG(D.modules, o);
    if (sig.type === 'blueprint') return blueprintSVG(D.modules, o);
    return loopSVG(D.modules, o);
  }

  /* subnet maths for the calculator tool */
  function subnet(input) {
    const m = String(input).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*\/\s*(\d{1,2})$/);
    if (!m) return null;
    const oct = m.slice(1, 5).map(Number), p = +m[5];
    if (oct.some(x => x > 255) || p > 32) return null;
    const ip = ((oct[0] << 24) >>> 0) + (oct[1] << 16) + (oct[2] << 8) + oct[3];
    const mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
    const net = (ip & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
    const toIp = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
    const hosts = p >= 31 ? (p === 31 ? 2 : 1) : Math.pow(2, 32 - p) - 2;
    return { network: toIp(net), broadcast: toIp(bc), mask: toIp(mask), wildcard: toIp(~mask >>> 0), first: p >= 31 ? toIp(net) : toIp(net + 1), last: p >= 31 ? toIp(bc) : toIp(bc - 1), hosts, prefix: p,
      cls: oct[0] < 128 ? 'A' : oct[0] < 192 ? 'B' : oct[0] < 224 ? 'C' : oct[0] < 240 ? 'D (multicast)' : 'E',
      private: oct[0] === 10 || (oct[0] === 172 && oct[1] >= 16 && oct[1] <= 31) || (oct[0] === 192 && oct[1] === 168),
      binMask: [24, 16, 8, 0].map(s => ((mask >>> s) & 255).toString(2).padStart(8, '0')).join('.') };
  }

  /* small hash for credential IDs */
  function hash(str) { let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36).toUpperCase(); }
  function seeded(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

  window.ZZ = { esc, md, plain, prepare, signatureSVG, hash, seeded, subnet };
})();
