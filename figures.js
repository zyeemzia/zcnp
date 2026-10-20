/* ZyeemZia certification engine — diagrams drawn from lesson data, shared by the site (app.js) and the book (book.js).
   Block types: topology · sequence · packet · cycle · timeline · matrix · tree · chart.  Everything is themed by CSS variables. */
(function () {
  const { esc, md, plain } = window.ZZ;
  const r1 = n => Math.round(n * 10) / 10;

  /* split text into lines of at most `max` characters, breaking on spaces */
  function lines(s, max, limit) {
    const out = []; let line = '';
    plain(s).split(/\s+/).filter(Boolean).forEach(w => {
      if (line && (line + ' ' + w).length > max) { out.push(line); line = w; } else line = line ? line + ' ' + w : w;
    });
    if (line) out.push(line);
    if (limit && out.length > limit) { const keep = out.slice(0, limit); keep[limit - 1] = keep[limit - 1].replace(/\s*\S*$/, '') + '…'; return keep; }
    return out;
  }
  const tspans = (ls, x, y, lh) => ls.map((l, i) => `<tspan x="${r1(x)}" y="${r1(y + i * lh)}">${esc(l)}</tspan>`).join('');
  const head = (x, y, ang, s = 7) => { const a = ang, p = (d, o) => `${r1(x - s * Math.cos(a) + o * Math.sin(a) * d)},${r1(y - s * Math.sin(a) - o * Math.cos(a) * d)}`; return `<path class="arw" d="M${r1(x)},${r1(y)} L${p(1, s * .55)} L${p(1, -s * .55)} Z"/>`; };
  const svg = (w, h, label, body, minW) => `<div class="fig-scroll"><svg viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" style="max-width:${Math.ceil(w * 1.05)}px;min-width:${Math.ceil(minW || w * .62)}px" role="img" aria-label="${esc(plain(label || 'Diagram'))}" xmlns="http://www.w3.org/2000/svg">${body}</svg></div>`;

  /* ---------- device and concept icons (about 44 × 44, centred on 0,0) ---------- */
  const user = '<circle cy="-9" r="8" class="f-soft"/><path class="f-soft" d="M-16 18a16 15 0 0 1 32 0z"/>';
  const ICON = {
    router: '<circle r="20" class="f-soft"/><path d="M-12-5h18m-5-5 5 5-5 5M12 5H-6m5-5-5 5 5 5"/>',
    switch: '<rect x="-22" y="-14" width="44" height="28" rx="5" class="f-soft"/><path d="M-13-5h21m-5-4 5 4-5 4M13 5H-8m5-4-5 4 5 4"/>',
    l3switch: '<rect x="-22" y="-14" width="44" height="28" rx="5" class="f-soft"/><path d="M-13-5h21m-5-4 5 4-5 4M13 5H-8m5-4-5 4 5 4"/><circle cx="17" cy="-14" r="7" class="f-ac"/>',
    firewall: '<rect x="-20" y="-16" width="40" height="32" rx="3" class="f-soft"/><path d="M-20-5h40M-20 6h40M-8-16v11M8-16v11M0-5v11M-14 6v10M14 6v10"/>',
    server: '<rect x="-15" y="-20" width="30" height="40" rx="3" class="f-soft"/><path d="M-15-7h30M-15 6h30M-2-13h9M-2 0h9M-2 13h9"/><circle cx="-8" cy="-13" r="1.8" class="f-ac"/><circle cx="-8" cy="0" r="1.8" class="f-ac"/><circle cx="-8" cy="13" r="1.8" class="f-ac"/>',
    host: '<rect x="-20" y="-17" width="40" height="26" rx="3" class="f-soft"/><path d="M-8 17h16M0 9v8"/>',
    laptop: '<rect x="-15" y="-14" width="30" height="20" rx="2" class="f-soft"/><path class="f-soft" d="M-21 13h42l-4-7h-34z"/>',
    phone: '<rect x="-11" y="-19" width="22" height="38" rx="4" class="f-soft"/><path d="M-3 13h6"/>',
    ap: '<rect x="-17" y="5" width="34" height="11" rx="5" class="f-soft"/><path d="M-13-6q13-11 26 0M-8 0q8-6 16 0"/><circle cy="4" r="1.6" class="f-ac"/>',
    cloud: '<path class="f-soft" d="M-15 12H14A9 9 0 0 0 15-6 12 12 0 0 0-7-10 11 11 0 0 0-15 12z"/>',
    lb: '<rect x="-21" y="-14" width="42" height="28" rx="14" class="f-soft"/><path d="M-13 0h8l12-7M-5 0h12M-5 0l12 7"/>',
    db: '<path class="f-soft" d="M-16-12v24a16 6 0 0 0 32 0v-24"/><ellipse cy="-12" rx="16" ry="6" class="f-soft"/><path d="M-16-1a16 6 0 0 0 32 0"/>',
    storage: '<rect x="-18" y="-17" width="36" height="10" rx="3" class="f-soft"/><rect x="-18" y="-5" width="36" height="10" rx="3" class="f-soft"/><rect x="-18" y="7" width="36" height="10" rx="3" class="f-soft"/>',
    vm: '<rect x="-20" y="-16" width="40" height="32" rx="4" class="f-soft"/><rect x="-12" y="-8" width="24" height="16" rx="2"/>',
    container: '<path class="f-soft" d="M0-19 17-9.5v19L0 19-17 9.5v-19z"/><path d="M-17-9.5 0 0 17-9.5M0 0v19"/>',
    user,
    attacker: user + '<path d="M-6-11h12"/>',
    team: '<g transform="translate(-9 2) scale(.75)">' + user + '</g><g transform="translate(9 2) scale(.75)">' + user + '</g>',
    model: '<rect x="-20" y="-18" width="40" height="36" rx="9" class="f-soft"/><path d="M-10-8 0 0-10 8M10-8 0 0 10 8"/><circle cx="-10" cy="-8" r="3" class="f-ac"/><circle cx="-10" cy="8" r="3" class="f-ac"/><circle r="3.4" class="f-ac"/><circle cx="10" cy="-8" r="3" class="f-ac"/><circle cx="10" cy="8" r="3" class="f-ac"/>',
    api: '<rect x="-21" y="-14" width="42" height="28" rx="6" class="f-soft"/><path d="M-6-8q-5 0-5 4v1q0 3-3 3 3 0 3 3v1q0 4 5 4M6-8q5 0 5 4v1q0 3 3 3-3 0-3 3v1q0 4-5 4"/>',
    sensor: '<circle r="6" class="f-soft"/><path d="M-11-11a16 16 0 0 0 0 22M11-11a16 16 0 0 1 0 22M-17-16a23 23 0 0 0 0 32M17-16a23 23 0 0 1 0 32"/>',
    controller: '<rect x="-21" y="-14" width="42" height="28" rx="6" class="f-soft"/><circle r="6"/><path d="M0-11v4M0 7v4M-11 0h4M7 0h4"/>',
    monitor: '<rect x="-20" y="-17" width="40" height="26" rx="3" class="f-soft"/><path d="M-14 3l7-7 5 4 8-9 6 4M-8 17h16M0 9v8"/>',
    shield: '<path class="f-soft" d="M0-19 16-12v8c0 11-7 18-16 22-9-4-16-11-16-22v-8z"/><path d="M-6 0l4 4 8-8"/>',
    vault: '<rect x="-18" y="-16" width="36" height="32" rx="4" class="f-soft"/><circle r="7"/><path d="M0-7v-4M0 7v4M-7 0h-4M7 0h4"/>',
    doc: '<path class="f-soft" d="M-13-18h17l9 9v27h-26z"/><path d="M4-18v9h9M-7-2h14M-7 5h14M-7 12h9"/>',
    tower: '<path d="M0-4-9 18M0-4 9 18M-6 11h12"/><circle cy="-8" r="3" class="f-ac"/><path d="M-9-16a12 12 0 0 0 0 15M9-16a12 12 0 0 1 0 15"/>',
    process: '<rect x="-21" y="-14" width="42" height="28" rx="7" class="f-soft"/><path d="M-9 0h18m-5-5 5 5-5 5"/>',
  };
  const ALIAS = { pc: 'host', workstation: 'host', desktop: 'host', internet: 'cloud', wan: 'cloud', saas: 'cloud', iot: 'sensor', hacker: 'attacker', threat: 'attacker',
    ai: 'model', llm: 'model', agent: 'model', kms: 'vault', secrets: 'vault', idp: 'shield', identity: 'shield', policy: 'shield', siem: 'monitor', dashboard: 'monitor',
    gateway: 'api', service: 'process', app: 'process', mobile: 'phone', wifi: 'ap', nas: 'storage', san: 'storage', l3: 'l3switch', group: 'team', document: 'doc', data: 'db' };
  const kindOf = k => { k = String(k || '').toLowerCase(); return ICON[k] ? k : ICON[ALIAS[k]] ? ALIAS[k] : 'process'; };

  /* ---------- topology: devices on a grid joined by links, optional zones ---------- */
  function topology(b) {
    const CW = 165, nodes = b.nodes || [], byId = {};
    nodes.forEach(n => { byId[n.id] = n; });
    const zones = b.zones || [];
    const xs = nodes.map(n => +n.x || 0).concat(zones.flatMap(z => [+z.x, +z.x + (+z.w || 1) - 1]));
    const ys = nodes.map(n => +n.y || 0).concat(zones.flatMap(z => [+z.y, +z.y + (+z.h || 1) - 1]));
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    /* wide diagrams are shown scaled down, so devices and labels grow with the width to stay readable */
    const k = Math.max(1, Math.min(1.45, ((maxX - minX) * CW + 184) / 760)), RH = Math.round(126 * (1 + (k - 1) * .8)), MX = Math.round(92 * k);
    const top = zones.length ? Math.round(RH / 2 + 14) : Math.round(44 * k), W = (maxX - minX) * CW + 2 * MX, H = (maxY - minY) * RH + top + Math.round((zones.length ? 98 : 80) * k);
    const P = n => [MX + ((+n.x || 0) - minX) * CW, top + ((+n.y || 0) - minY) * RH];
    let s = '';
    zones.forEach(z => {
      /* a zone wraps its nodes including the labels under them, so its edge never cuts through text */
      const x = MX + (+z.x - minX - .5) * CW + 3, y = top + (+z.y - minY - .5) * RH + 6, w = (+z.w || 1) * CW - 6, h = ((+z.h || 1) - 1) * RH + RH / 2 - 6 + 88 * k;
      s += `<g class="zone t-${esc(z.tone || 'neutral')}"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="14"/><text class="zone-t" style="font-size:${r1(10 * k)}px" x="${r1(x + 12)}" y="${r1(y + 6 + 11 * k)}">${esc(plain(z.label))}</text></g>`;
    });
    (b.links || []).forEach(l => {
      const a = byId[l.a], c = byId[l.b]; if (!a || !c) return;
      const [x1, y1] = P(a), [x2, y2] = P(c), st = esc(l.style || 'solid');
      s += `<line class="lnk ${st}" x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"/>`;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len, nx = -uy, ny = ux;
      if (l.label) { const vert = Math.abs(uy) > .9, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + (vert ? 12 * k : -8 * k), fs = 10.5 * k, ls = lines(l.label, Math.max(12, Math.floor((len - 70) / (fs * .63))), 2);
        s += `<text class="lnk-t halo" style="font-size:${r1(fs)}px${vert ? ';text-anchor:start' : ''}">${tspans(ls, mx + (vert ? 8 : 0), my - (ls.length - 1) * fs * .55 + 4, fs * 1.15)}</text>`; }
      /* interface labels sit near their device but clear of the device's own label below it; on vertical links they sit beside the line */
      const end = (txt, x, y, ux2, uy2) => {
        if (!txt) return '';
        const vert = Math.abs(ux2) < .3, tw = plain(txt).length * 6.1 * k;
        const d = Math.min(len * .42, 28 * k + (vert ? 0 : tw / 2 * Math.abs(ux2)) + (uy2 > .35 ? 50 * uy2 * k : uy2 < -.35 ? 8 * k : 0));
        const ex = x + ux2 * d + (vert ? 8 * k : nx * 10 * k), ey = y + uy2 * d + (vert ? 4 : ny * 10 * k + 4);
        return `<text class="lnk-e halo" style="font-size:${r1(10 * k)}px${vert ? ';text-anchor:start' : ''}" x="${r1(ex)}" y="${r1(ey)}">${esc(plain(txt))}</text>`;
      };
      s += end(l.aEnd, x1, y1, ux, uy) + end(l.bEnd, x2, y2, -ux, -uy);
    });
    nodes.forEach(n => {
      const [x, y] = P(n), kd = kindOf(n.kind), ls = lines(n.label, 17, 2);
      s += `<g class="node k-${kd}" transform="translate(${r1(x)} ${r1(y)}) scale(${r1(k * 100) / 100})"><g class="ic">${ICON[kd]}</g><text class="lbl halo">${tspans(ls, 0, 38, 14)}</text>${n.sub ? `<text class="sub halo">${tspans(lines(n.sub, 21, 2), 0, 38 + ls.length * 14, 12)}</text>` : ''}</g>`;
    });
    /* on phones the diagram scrolls sideways; never shrink it so far that its text drops below about 10.5px */
    return svg(W, H, b.title, s, W * Math.max(.5, .81 / k));
  }

  /* ---------- sequence: messages between actors over time ---------- */
  function sequence(b) {
    const actors = b.actors || [], n = actors.length, CW = n > 4 ? 160 : 190, W = n * CW, RH = 52, top = 66;
    const idx = v => typeof v === 'number' ? v : Math.max(0, actors.findIndex(a => plain(a).toLowerCase() === plain(v).toLowerCase()));
    const X = i => CW / 2 + i * CW, steps = b.steps || [], H = top + 24 + steps.length * RH + 14;
    let s = '';
    actors.forEach((a, i) => { const ls = lines(a, 20, 2);
      s += `<line class="life" x1="${X(i)}" y1="48" x2="${X(i)}" y2="${H - 8}"/><rect class="actor" x="${X(i) - CW / 2 + 12}" y="6" width="${CW - 24}" height="42" rx="10"/><text class="actor-t">${tspans(ls, X(i), ls.length > 1 ? 23 : 32, 14)}</text>`; });
    steps.forEach((m, k) => {
      const f = idx(m.from), t = idx(m.to), y = top + 30 + k * RH, cls = m.reply ? 'msg reply' : 'msg';
      s += `<circle class="seq-n" cx="${X(Math.min(f, t)) - 16}" cy="${y}" r="8"/><text class="seq-nt" x="${X(Math.min(f, t)) - 16}" y="${y + 3.5}">${k + 1}</text>`;
      if (f === t) {
        const x = X(f);
        s += `<path class="${cls}" d="M${x} ${y - 8}h34v18h-30"/>${head(x + 3, y + 10, Math.PI)}<text class="msg-t halo" x="${x + 42}" y="${y + 4}" style="text-anchor:start">${esc(plain(m.label))}</text>`;
        if (m.note) s += `<text class="msg-n" x="${x + 42}" y="${y + 18}" style="text-anchor:start">${esc(plain(m.note))}</text>`;
      } else {
        const x1 = X(f) + (t > f ? 3 : -3), x2 = X(t) + (t > f ? -3 : 3), span = Math.abs(x2 - x1), ls = lines(m.label, Math.max(14, Math.floor((span - 16) / 6.8)), 2);
        s += `<line class="${cls}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>${head(x2, y, t > f ? 0 : Math.PI)}<text class="msg-t halo">${tspans(ls, (x1 + x2) / 2, y - 7 - (ls.length - 1) * 13, 13)}</text>`;
        if (m.note) s += `<text class="msg-n" x="${r1((x1 + x2) / 2)}" y="${y + 15}">${esc(plain(m.note))}</text>`;
      }
    });
    return svg(W, H, b.title, s, Math.min(W, n * 130));
  }

  /* ---------- packet: header fields laid out on a bit ruler ---------- */
  function packet(b) {
    const BW = +b.width || 32, cell = 640 / BW, L = 14, top = 26, RH = 44, segs = []; let pos = 0;
    (b.fields || []).forEach((f, fi) => {
      let left = Math.max(1, +f.bits || BW);
      const varLen = !!f.variable;
      while (left > 0) { const row = Math.floor(pos / BW), start = pos % BW, len = Math.min(left, BW - start); segs.push({ row, start, len, f, fi, varLen }); pos += len; left -= len; }
    });
    const rows = Math.max(1, Math.ceil(pos / BW)), W = 640 + 2 * L, H = top + rows * RH + 10;
    let s = '';
    for (let i = 0; i <= BW; i += BW >= 32 ? 8 : Math.max(1, BW / 4)) { const x = L + Math.min(i, BW) * cell; s += `<text class="bit-t" x="${r1(i === BW ? x - 4 : x + 2)}" y="16" ${i === BW ? 'style="text-anchor:end"' : 'style="text-anchor:start"'}>${i === BW ? BW - 1 : i}</text><line class="bit-k" x1="${r1(x)}" y1="19" x2="${r1(x)}" y2="${top}"/>`; }
    segs.forEach(g => {
      const x = L + g.start * cell, y = top + g.row * RH, w = g.len * cell, label = plain(g.f.label), size = Math.max(8.5, Math.min(12.5, (w - 8) / (label.length * .58)));
      const fits = label.length * size * .58 <= w - 6, ls = fits ? [label] : lines(label, Math.max(4, Math.floor((w - 6) / (size * .58))), 2);
      const bits = g.varLen ? 'variable' : `${g.f.bits} bit${+g.f.bits === 1 ? '' : 's'}`;
      s += `<rect class="pk ${g.fi % 2 ? 'alt' : ''}" x="${r1(x)}" y="${y}" width="${r1(w)}" height="${RH}"/><text class="pk-t" style="font-size:${r1(size)}px">${tspans(ls, x + w / 2, y + (w >= 56 ? 19 : 25) - (ls.length - 1) * 6, size + 1)}</text>${w >= 56 && ls.length === 1 ? `<text class="pk-b" x="${r1(x + w / 2)}" y="${y + 34}">${bits}</text>` : ''}`;
    });
    return svg(W, H, b.title, s, 520);
  }

  /* ---------- cycle: a repeating loop of stages ---------- */
  function cycle(b) {
    const it = b.items || [], n = it.length, W = 640, H = n > 6 ? 460 : 420, cx = W / 2, cy = H / 2, RX = 228, RY = n > 6 ? 168 : 150, PW = 150, PH = 46;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = a => [cx + RX * Math.cos(a), cy + RY * Math.sin(a)];
    let s = `<ellipse class="cyc-ring" cx="${cx}" cy="${cy}" rx="${RX}" ry="${RY}"/>`;
    const gap = Math.min(.42, Math.PI / n * .62);
    for (let i = 0; i < n; i++) {
      const a0 = ang(i) + gap, a1 = ang(i + 1) - gap, steps = 18; let d = '';
      for (let k = 0; k <= steps; k++) { const [x, y] = pt(a0 + (a1 - a0) * k / steps); d += (k ? 'L' : 'M') + r1(x) + ' ' + r1(y); }
      const [xa, ya] = pt(a1 - .02), [xb, yb] = pt(a1);
      s += `<path class="cyc-arc" d="${d}"/>${head(xb, yb, Math.atan2(yb - ya, xb - xa), 9)}`;
    }
    if (b.center) { const ls = lines(b.center, 14, 3); s += `<circle class="cyc-c" cx="${cx}" cy="${cy}" r="62"/><text class="cyc-ct">${tspans(ls, cx, cy + 5 - (ls.length - 1) * 8, 16)}</text>`; }
    it.forEach((x, i) => { const [px, py] = pt(ang(i)), ls = lines(x.label, 19, 2);
      s += `<g transform="translate(${r1(px)} ${r1(py)})"><rect class="cyc-p" x="${-PW / 2}" y="${-PH / 2}" width="${PW}" height="${PH}" rx="23"/><circle class="cyc-n" cx="${-PW / 2 + 4}" cy="${-PH / 2 + 4}" r="11"/><text class="cyc-nt" x="${-PW / 2 + 4}" y="${-PH / 2 + 8}">${i + 1}</text><text class="cyc-t">${tspans(ls, 0, 5 - (ls.length - 1) * 7, 14)}</text></g>`; });
    const legend = it.some(x => x.text) ? `<ol class="fig-legend">${it.map(x => `<li><b>${md(x.label)}</b>${x.text ? ` — ${md(x.text)}` : ''}</li>`).join('')}</ol>` : '';
    return svg(W, H, b.title, s, 460) + legend;
  }

  /* ---------- chart: bar or line, one or more series ---------- */
  function chart(b) {
    const labels = b.labels || [], series = (b.series || []).filter(x => x && Array.isArray(x.values)), unit = b.unit || '';
    const all = series.flatMap(x => x.values.map(Number)).filter(v => isFinite(v)), hi = Math.max(0, ...all), lo = Math.min(0, ...all);
    const raw = (hi - lo) / 4 || 1, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(v => v >= raw);
    const yMax = Math.ceil(hi / step) * step || step, yMin = Math.floor(lo / step) * step;
    const W = 680, H = 330, L = 58, R = 18, Tp = series.length > 1 ? 40 : 22, B = 50, pw = W - L - R, ph = H - Tp - B;
    const Y = v => Tp + ph - (v - yMin) / (yMax - yMin) * ph, gw = pw / Math.max(1, labels.length);
    const fmt = v => (Math.abs(v) >= 1000 ? (+v).toLocaleString('en') : String(+(+v).toFixed(2))) + unit;
    let s = '';
    for (let v = yMin; v <= yMax + 1e-9; v += step) s += `<line class="grid${v === 0 ? ' zero' : ''}" x1="${L}" x2="${W - R}" y1="${r1(Y(v))}" y2="${r1(Y(v))}"/><text class="ax-t" x="${L - 8}" y="${r1(Y(v) + 4)}" style="text-anchor:end">${esc(fmt(+v.toFixed(6)))}</text>`;
    labels.forEach((lb, i) => { const ls = lines(lb, Math.max(6, Math.floor(gw / 7)), 2); s += `<text class="ax-t">${tspans(ls, L + gw * (i + .5), H - B + 18, 13)}</text>`; });
    if (b.yLabel) s += `<text class="ax-l" transform="translate(14 ${r1(Tp + ph / 2)}) rotate(-90)">${esc(plain(b.yLabel))}</text>`;
    if (b.kind === 'line') {
      series.forEach((x, si) => { const pts = x.values.map((v, i) => [L + gw * (i + .5), Y(+v)]);
        s += `<polyline class="ln s${si % 4}" points="${pts.map(p => p.map(r1).join(',')).join(' ')}"/>` + pts.map((p, i) => `<circle class="dot s${si % 4}" cx="${r1(p[0])}" cy="${r1(p[1])}" r="4"/>${series.length === 1 ? `<text class="val" x="${r1(p[0])}" y="${r1(p[1] - 9)}">${esc(fmt(x.values[i]))}</text>` : ''}`).join(''); });
    } else {
      const bw = Math.min(46, gw * .72 / Math.max(1, series.length));
      series.forEach((x, si) => x.values.forEach((v, i) => { const x0 = L + gw * (i + .5) - bw * series.length / 2 + si * bw, y0 = Y(Math.max(0, +v)), h = Math.abs(Y(+v) - Y(0));
        s += `<rect class="cbar s${si % 4}" x="${r1(x0 + 1)}" y="${r1(y0)}" width="${r1(bw - 2)}" height="${r1(Math.max(1, h))}" rx="3"/>${bw >= 22 ? `<text class="val" x="${r1(x0 + bw / 2)}" y="${r1(+v >= 0 ? y0 - 5 : y0 + h + 12)}">${esc(fmt(v))}</text>` : ''}`; }));
    }
    if (series.length > 1) { let lx = L; series.forEach((x, si) => { s += `<rect class="cbar s${si % 4}" x="${r1(lx)}" y="10" width="12" height="12" rx="3"/><text class="lg-t" x="${r1(lx + 17)}" y="20">${esc(plain(x.name))}</text>`; lx += 34 + plain(x.name).length * 6.8; }); }
    return svg(W, H, b.title, s, 480);
  }

  /* ---------- HTML figures: timeline, matrix, tree ---------- */
  function timeline(b) {
    const it = b.items || [];
    return `<ol class="tl ${it.length > 5 ? 'tl-v' : ''}" style="--n:${it.length}">${it.map(x => `<li><span class="tl-when">${md(x.when)}</span><b>${md(x.label)}</b>${x.text ? `<p>${md(x.text)}</p>` : ''}</li>`).join('')}</ol>`;
  }
  function matrix(b) {
    const q = b.quadrants || [];
    return `<div class="mx"><div class="mx-y"><span>${md(b.y || '')} →</span></div><div class="mx-grid">${q.map((c, i) => `<div class="mx-q q${i}"><b>${md(c.title)}</b>${(c.items || []).length ? `<ul>${c.items.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div><div class="mx-x">${md(b.x || '')} →</div></div>`;
  }
  function tree(b) {
    const leaves = n => (n.children && n.children.length) ? n.children.reduce((a, c) => a + leaves(c), 0) : 1;
    const node = (n, d) => `<li><div class="tr-n d${Math.min(d, 2)}"><b>${md(n.label)}</b>${n.text ? `<span>${md(n.text)}</span>` : ''}</div>${n.children && n.children.length ? `<ul>${n.children.map(c => node(c, d + 1)).join('')}</ul>` : ''}</li>`;
    return b.root ? `<div class="fig-scroll"><ul class="tree" style="--leaves:${leaves(b.root)}">${node(b.root, 0)}</ul></div>` : '';
  }

  const FIG = { topology, sequence, packet, cycle, chart, timeline, matrix, tree };
  /* titleHTML comes from the caller so the site and the book keep their own heading styles */
  function figure(b, titleHTML) {
    let body = '';
    try { body = FIG[b.type](b); } catch (e) { body = ''; }
    if (!body) return '';
    return `<figure class="fig fig-${b.type}">${titleHTML || ''}${body}${b.caption ? `<figcaption>${md(b.caption)}</figcaption>` : ''}</figure>`;
  }
  Object.assign(window.ZZ, { FIG, figure, ICONS: Object.keys(ICON) });
})();
