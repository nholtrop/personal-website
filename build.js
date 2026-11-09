#!/usr/bin/env node
// Builds public/ from content/*.yml and static/. No dependencies.
// Usage: node build.js            -> public/index.html
//        node build.js --preview F -> single-file preview (body fragment) at F
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');

// ---------- minimal YAML subset parser ----------
function parseYAML(src) {
  const lines = src.replace(/\t/g, '  ').split(/\r?\n/)
    .map(l => (/^\s*#/.test(l) ? '' : l.replace(/\s+$/, '')));
  let i = 0;
  const ind = l => l.match(/^ */)[0].length;
  const skip = () => { while (i < lines.length && lines[i].trim() === '') i++; };

  function scalar(v) {
    v = v.trim();
    if (v === '') return '';
    if (v[0] === '"') return JSON.parse(v);
    if (v[0] === "'") return v.slice(1, -1).replace(/''/g, "'");
    if (v[0] === '[') return v.slice(1, -1).split(',').map(s => scalar(s)).filter(s => s !== '');
    return v;
  }
  function splitKey(t) {
    const m = t.match(/^([A-Za-z0-9_]+):(?:\s+(.*))?$/);
    return m ? [m[1], m[2] === undefined ? '' : m[2]] : null;
  }
  function blockScalar(style, parentIndent) {
    const buf = [];
    while (i < lines.length && (lines[i].trim() === '' || ind(lines[i]) > parentIndent)) buf.push(lines[i++]);
    while (buf.length && buf[buf.length - 1].trim() === '') buf.pop();
    const min = Math.min(...buf.filter(l => l.trim()).map(ind));
    const body = buf.map(l => l.slice(min));
    if (style === '|') return body.join('\n');
    return body.join('\n').split(/\n\s*\n/).map(p => p.replace(/\n/g, ' ')).join('\n\n');
  }
  function block(indent) {
    skip();
    if (i >= lines.length) return '';
    return lines[i].trim().startsWith('- ') || lines[i].trim() === '-' ? list(ind(lines[i])) : map(ind(lines[i]));
  }
  function list(indent) {
    const out = [];
    while (true) {
      skip();
      if (i >= lines.length || ind(lines[i]) !== indent || !/^\s*-(\s|$)/.test(lines[i])) break;
      const rest = lines[i].trim().replace(/^-\s?/, '');
      if (rest === '') { i++; out.push(block(indent + 2)); continue; }
      if (splitKey(rest) && !/^["'[]/.test(rest)) {
        lines[i] = ' '.repeat(indent + 2) + rest;
        out.push(map(indent + 2));
      } else { i++; out.push(scalar(rest)); }
    }
    return out;
  }
  function map(indent) {
    const out = {};
    while (true) {
      skip();
      if (i >= lines.length || ind(lines[i]) !== indent || /^\s*-(\s|$)/.test(lines[i])) break;
      const kv = splitKey(lines[i].trim());
      if (!kv) throw new Error(`YAML: cannot read line ${i + 1}: "${lines[i].trim()}"`);
      const [k, v] = kv; i++;
      if (v === '|' || v === '>') out[k] = blockScalar(v, indent);
      else if (v === '') {
        skip();
        const next = i < lines.length ? lines[i] : '';
        const deeper = ind(next) > indent || (ind(next) === indent && /^\s*-(\s|$)/.test(next));
        out[k] = deeper ? block(ind(next)) : '';
      } else out[k] = scalar(v);
    }
    return out;
  }
  return block(0);
}

const load = f => parseYAML(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));
const arr = x => (Array.isArray(x) ? x : []);

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = s => esc(s)
  .replace(/\[([^\]]+)\]\((https?:[^)\s]+|mailto:[^)\s]+|[^)\s:]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');
const paras = s => String(s || '').split(/\n\s*\n/).filter(p => p.trim()).map(p => `<p>${inline(p.trim())}</p>`).join('\n');
const ext = url => /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : '';
const youtubeId = url => {
  const m = String(url || '').match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
};

function authorsHTML(a, self) {
  return esc(a).split(', ').map(n => (self.includes(n.trim()) ? `<strong>${n}</strong>` : n)).join(', ');
}
function linksHTML(links) {
  const L = arr(links).filter(l => l && l.url);
  if (!L.length) return '';
  return `<ul class="pills">${L.map(l => `<li><a class="pill" href="${esc(l.url)}"${ext(l.url)}>${esc(l.label)}</a></li>`).join('')}</ul>`;
}

const ICONS = {
  scholar: '<path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3Zm-6.8 9.2V16c0 1.7 3 3.5 6.8 3.5s6.8-1.8 6.8-3.5v-3.8L12 16l-6.8-3.8Z"/>',
  orcid: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.3 17H6.7V9.1h1.6V17Zm-.8-9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3 9V9.1h3.2c3 0 4.4 2.1 4.4 3.9 0 2-1.6 4-4.4 4h-3.2Zm1.6-1.4h1.5c2 0 2.9-1.2 2.9-2.6 0-1.3-.8-2.5-2.9-2.5h-1.5v5.1Z"/>',
  linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4V9.5Z"/>',
  university: '<path d="M12 2 2 7v2h20V7L12 2ZM4 11v7h3v-7H4Zm6.5 0v7h3v-7h-3ZM17 11v7h3v-7h-3ZM2 20v2h20v-2H2Z"/>',
  globe: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.9A8 8 0 0 1 18.9 8ZM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4ZM4.3 14a8.3 8.3 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3a15.7 15.7 0 0 0 1.4 3.9A8 8 0 0 1 5.1 16ZM8 8H5a8 8 0 0 1 4.4-3.9C8.9 5.3 8.4 6.6 8 8Zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.3 5.9c.6-1.2 1.1-2.5 1.4-3.9h3a8 8 0 0 1-4.4 3.9Zm1.7-5.9a16.5 16.5 0 0 0 0-4h3.4a8.3 8.3 0 0 1 0 4h-3.4Z"/>',
  play: '<path d="M8 5v14l11-7L8 5Z"/>',
};
const icon = n => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.globe}</svg>`;

// Illustrative control chart: interpurchase times with control limits (after Holtrop & Wieringa 2023).
function controlChart() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n = 34, vals = [];
  for (let k = 0; k < n; k++) {
    const base = 30 + (rnd() - 0.5) * 16 + (rnd() - 0.5) * 8;
    vals.push(k < n - 4 ? base : 44 + (k - (n - 4)) * 7 + rnd() * 4);
  }
  const W = 1000, H = 120, padL = 6, padR = 6, padT = 14, padB = 14;
  const lo = 0, hi = 72;
  const x = k => padL + (k / (n - 1)) * (W - padL - padR);
  const y = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const mean = 30, ucl = 48, lcl = 12;
  const breach = vals.findIndex(v => v > ucl);
  const pts = vals.map((v, k) => `${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const dots = vals.map((v, k) => `<circle cx="${x(k).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${k >= breach ? 4.2 : 3}" class="${k >= breach ? 'cc-hot' : 'cc-dot'}"/>`).join('');
  const line = (v, cls) => `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" class="${cls}"/>`;
  return `<figure class="cc" aria-label="Illustrative control chart of customer interpurchase times">
  <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">
    <rect x="${x(breach) - 10}" y="${padT - 6}" width="${W - padR - x(breach) + 10}" height="${H - padT - padB + 12}" class="cc-zone"/>
    ${line(ucl, 'cc-limit')}${line(mean, 'cc-mean')}${line(lcl, 'cc-limit')}
    <polyline points="${pts}" class="cc-path"/>${dots}
  </svg>
  <figcaption><span class="cc-key"><i></i>Control limits</span><span class="cc-key"><b></b>Signal</span><br>Interpurchase times crossing the upper control limit signal a customer drifting toward inactivity. Illustrative data, after <a href="#pub-timing-customer-reactivation-initiatives">Holtrop &amp; Wieringa (2023)</a>.</figcaption>
</figure>`;
}

const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);

const MIME = { woff: 'font/woff', woff2: 'font/woff2', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const dataURI = rel => `data:${MIME[rel.split('.').pop().toLowerCase()]};base64,` + fs.readFileSync(path.join(ROOT, 'static', rel)).toString('base64');
const inlineAssets = css => css.replace(/url\("(fonts\/[^"]+)"\)/g, (m, f) => `url("${dataURI(f)}")`);

// ---------- render ----------
function render({ preview = false } = {}) {
  const P = load('profile.yml');
  const PUB = load('publications.yml');
  const WP = load('working-papers.yml');
  const MED = load('media.yml');
  const T = load('teaching.yml');
  const CV = load('cv.yml');

  const self = [P.name, P.name.split(' ').map((w, k, a) => (k < a.length - 1 ? w[0] + '.' : w)).join(' ')];
  const topics = arr(PUB.topics);
  const pubs = arr(PUB.items);
  const hasPhoto = P.photo && fs.existsSync(path.join(ROOT, 'static', P.photo));
  const initials = P.name.split(' ').map(w => w[0]).join('');
  const year = new Date().getFullYear();

  const nav = [['about', 'About'], ['publications', 'Publications'], ['working-papers', 'Working papers'],
    ['media', 'Media'], ['teaching', 'Teaching'], ['cv', 'CV'], ['contact', 'Contact']]
    .filter(([id]) => id !== 'media' || arr(MED.items).length);

  const pubHTML = pubs.map(p => `
    <li class="pub" id="pub-${slug(p.title)}" data-topics="${esc(arr(p.topics).join(' '))}">
      <span class="pub-year">${esc(p.year)}</span>
      <div class="pub-body">
        <h3 class="pub-title">${inline(p.title)}</h3>
        <p class="pub-authors">${authorsHTML(p.authors, self)}</p>
        <p class="pub-venue"><em>${esc(p.journal)}</em>${p.details ? `, ${esc(p.details)}` : ''}</p>
        ${p.note ? `<p class="pub-note">${inline(p.note)}</p>` : ''}
        ${p.award ? `<p class="pub-award">${inline(p.award)}</p>` : ''}
        <div class="pub-actions">
          ${linksHTML(p.links)}
          ${p.abstract ? `<details class="abstract"><summary>Abstract</summary>${paras(p.abstract)}</details>` : ''}
        </div>
      </div>
    </li>`).join('');

  const simpleList = (items, withOutlet) => `<ul class="plain">${arr(items).map(w => `
      <li><span class="wp-title">${inline(w.title)}</span>
        <span class="wp-meta">${authorsHTML(w.authors, self)}${withOutlet && w.outlet ? `. <em>${esc(w.outlet)}</em>` : ''}${w.year ? `, ${esc(w.year)}` : ''}</span>
        ${linksHTML(w.links)}</li>`).join('')}</ul>`;

  const mediaTypeLabel = { press: 'Press', interview: 'Interview', video: 'Video', podcast: 'Podcast', photo: 'Photo' };
  const MEDIA_SHOWN = 9;
  const mediaHTML = arr(MED.items).map((m, idx) => {
    const yt = youtubeId(m.url);
    let visual = '';
    if (m.type === 'photo' && m.image) visual = `<img class="media-img" src="${esc(m.image)}" alt="${esc(m.title)}" loading="lazy">`;
    else if (yt) visual = `<button class="media-play" type="button" data-yt="${yt}" aria-label="Play ${esc(m.title)}">${icon('play')}<span>Play here</span></button>`;
    else if (m.audio) visual = `<audio class="media-audio" controls preload="none" src="${esc(m.audio)}"></audio>`;
    return `<li class="media-card media-${esc(m.type)}${idx >= MEDIA_SHOWN ? ' media-extra' : ''}">
      ${visual}
      <div class="media-text">
        <p class="media-kicker"><span>${esc(mediaTypeLabel[m.type] || m.type)}</span><span>${esc(m.outlet)}${m.date ? ` · ${esc(m.date)}` : ''}</span></p>
        <h3 class="media-title">${m.url ? `<a href="${esc(m.url)}"${ext(m.url)}>${inline(m.title)}</a>` : inline(m.title)}</h3>
        ${m.description ? `<p class="media-desc">${inline(m.description)}</p>` : ''}
        ${linksHTML(m.links)}
      </div></li>`;
  }).join('');

  const cvRows = (items, a, b, c) => `<ul class="cv-list">${arr(items).map(r => `
      <li><span class="cv-when">${esc(r[c] || '')}</span><div><span class="cv-what">${inline(r[a])}</span>${r[b] ? `<span class="cv-where">${inline(r[b])}</span>` : ''}${r.note ? `<span class="cv-note">${inline(r.note)}</span>` : ''}</div></li>`).join('')}</ul>`;

  const course = c => `<li>${c.url ? `<a href="${esc(c.url)}"${ext(c.url)}>${esc(c.title)}</a>` : esc(c.title)}</li>`;

  const desc = P.tagline || '';
  const ld = { '@context': 'https://schema.org', '@type': 'Person', name: P.name, jobTitle: P.title, email: P.email,
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Maastricht University' }, sameAs: arr(P.links).map(l => l.url) };


  const css = fs.readFileSync(path.join(ROOT, 'static', 'style.css'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'static', 'site.js'), 'utf8');

  const body = `
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap topbar-inner">
    <a class="brand" href="#top">${esc(P.name)}</a>
    <nav aria-label="Sections"><ul>${nav.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ul></nav>
  </div>
</header>
<main id="main">
  <section class="hero" id="top">
    <div class="wrap hero-grid">
      <div class="hero-text">
        <p class="eyebrow">${esc(P.affiliation)}</p>
        <h1>${esc(P.name)}</h1>
        <p class="role">${esc(P.title)}</p>
        <p class="tagline">${inline(P.tagline)}</p>
        <ul class="social">${arr(P.links).map(l => `<li><a href="${esc(l.url)}"${ext(l.url)}>${icon(l.icon)}<span>${esc(l.label)}</span></a></li>`).join('')}</ul>
      </div>
      <div class="portrait">${hasPhoto ? `<img src="${preview ? dataURI(P.photo) : esc(P.photo)}" alt="Portrait of ${esc(P.name)}" width="480" height="600">` : `<div class="monogram" aria-hidden="true">${esc(initials)}</div>`}</div>
    </div>
    <div class="wrap">${controlChart()}</div>
  </section>

  <section id="about" class="section">
    <div class="wrap two-col">
      <div class="col-head"><h2>About</h2></div>
      <div class="prose">
        ${paras(P.bio)}
        <div class="interests">
          <div><h3 class="mini">Substantive interests</h3><ul>${arr(P.substantive_interests).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
          <div><h3 class="mini">Methodological interests</h3><ul>${arr(P.methodological_interests).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </div>
  </section>

  <section id="publications" class="section alt">
    <div class="wrap">
      <div class="section-head">
        <h2>Publications</h2>
        <p class="count">${pubs.length} journal articles</p>
      </div>
      <div class="filters" role="group" aria-label="Filter publications by topic">
        <button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>
        ${topics.map(t => `<button type="button" class="chip" data-filter="${esc(t.id)}" aria-pressed="false">${esc(t.label)}</button>`).join('')}
      </div>
      <ol class="pubs">${pubHTML}</ol>
      ${PUB.pdf_note ? `<p class="pub-license">${inline(PUB.pdf_note)}</p>` : ''}
    </div>
  </section>

  <section id="working-papers" class="section">
    <div class="wrap two-col">
      <div class="col-head"><h2>Working papers</h2></div>
      <div class="stack">
        <div><h3 class="mini">Work in progress</h3>${simpleList(WP.work_in_progress)}</div>
        <div><h3 class="mini">Other publications</h3>${simpleList(WP.other_publications, true)}</div>
        <div><h3 class="mini">Archived projects</h3>${simpleList(WP.archived)}</div>
      </div>
    </div>
  </section>

  ${arr(MED.items).length ? `<section id="media" class="section alt">
    <div class="wrap">
      <div class="section-head"><h2>Media</h2><p class="count">Interviews, coverage and talks</p></div>
      <ul class="media-grid">${mediaHTML}</ul>
      ${arr(MED.items).length > MEDIA_SHOWN ? `<p class="more-wrap"><button type="button" class="more-btn" data-more aria-expanded="false" hidden>Show all ${arr(MED.items).length} media items</button></p>` : ''}
    </div>
  </section>` : ''}

  <section id="teaching" class="section">
    <div class="wrap two-col">
      <div class="col-head"><h2>Teaching</h2></div>
      <div class="prose">
        <p>${inline(T.intro)}</p>
        <div class="interests">
          <div><h3 class="mini">Current</h3><ul class="courses">${arr(T.current).map(course).join('')}</ul></div>
          <div><h3 class="mini">Previously taught</h3><ul class="courses">${arr(T.past).map(course).join('')}</ul></div>
        </div>
      </div>
    </div>
  </section>

  <section id="cv" class="section alt">
    <div class="wrap">
      <div class="section-head"><h2>Curriculum vitae</h2>${P.cv_pdf ? `<a class="btn" href="${esc(P.cv_pdf)}">Download full CV (PDF)</a>` : ''}</div>
      <div class="cv-grid">
        <div><h3 class="mini">Employment</h3>${cvRows(CV.employment, 'role', 'org', 'period')}
             <h3 class="mini">Education</h3>${cvRows(CV.education, 'degree', 'org', 'period')}</div>
        <div>${arr(CV.grants).length ? `<h3 class="mini">Grants</h3>${cvRows(CV.grants, 'title', 'detail', 'period')}` : ''}
             <h3 class="mini">Honors &amp; awards</h3>${cvRows(CV.awards, 'title', null, 'year')}
             <h3 class="mini">Service</h3><ul class="plain-bullets">${arr(CV.service).map(s => `<li>${inline(s)}</li>`).join('')}</ul></div>
      </div>
    </div>
  </section>

  <section id="contact" class="section">
    <div class="wrap two-col">
      <div class="col-head"><h2>Contact</h2></div>
      <div class="contact">
        <address>${esc(P.name)}<br>${esc(P.department)}<br>${arr(P.address).map(esc).join('<br>')}</address>
        <p class="email"><a href="mailto:${esc(P.email)}">${esc(P.email)}</a>
          <button type="button" class="copy" data-copy="${esc(P.email)}">Copy address</button></p>
      </div>
    </div>
  </section>
</main>
<footer class="footer"><div class="wrap"><p>© ${year} ${esc(P.name)}</p><p><a href="#top">Back to top</a></p></div></footer>
<script type="application/ld+json">${JSON.stringify(ld)}</script>`;

  if (preview) {
    return `<title>${esc(P.name)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${inlineAssets(css)}</style>
${body}
<script>${js}</script>`;
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(P.name)} | ${esc(P.title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(P.name)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="profile">
${P.site_url && P.share_image ? `<meta property="og:image" content="${esc(P.site_url.replace(/\/$/, '') + '/' + P.share_image)}">` : ''}
${P.site_url ? `<link rel="canonical" href="${esc(P.site_url)}">` : ''}
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/crimson-pro-400.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="style.css">
</head>
<body>${body}
<script src="site.js" defer></script>
</body>
</html>`;
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

const pi = process.argv.indexOf('--preview');
if (pi > -1) {
  fs.writeFileSync(process.argv[pi + 1], render({ preview: true }));
  console.log('Preview written to', process.argv[pi + 1]);
} else {
  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(path.join(ROOT, 'static'), OUT);
  fs.writeFileSync(path.join(OUT, 'index.html'), render());
  console.log('Site built in public/');
}
