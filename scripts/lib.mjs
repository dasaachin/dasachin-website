// Shared helpers for the import, sync and build scripts. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const POSTS = path.join(ROOT, 'content', 'posts');
export const MEDIA = path.join(ROOT, 'content', 'media');
export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '-' };
export function decode(s = '') {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m));
}
export function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
export function text(html = '') {
  return decode(String(html).replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}
export function excerpt(html, n = 180) {
  const t = text(html);
  if (t.length <= n) return t;
  return t.slice(0, n).replace(/\s+\S*$/, '') + '…';
}
export function slugify(s = '') {
  return decode(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 90) || 'post';
}
export function normTitle(s = '') {
  return text(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Keep the author's own markup, drop anything executable or tied to the old host.
export function sanitize(html = '') {
  let h = String(html);
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(/<(script|style|noscript|form|object|embed)[\s\S]*?<\/\1>/gi, '');
  h = h.replace(/<(script|style|link|meta|input|button)[^>]*>/gi, '');
  h = h.replace(/<iframe[^>]*src=["']([^"']+)["'][^>]*>\s*<\/iframe>/gi, (m, src) =>
    /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|open\.spotify\.com)\//.test(src)
      ? `<iframe src="${esc(decode(src))}" loading="lazy" allowfullscreen title="Embedded media"></iframe>` : '');
  h = h.replace(/<iframe[^>]*>(\s*<\/iframe>)?/gi, (m) => (m.includes('title="Embedded media"') ? m : ''));
  h = h.replace(/\s(on\w+|srcset|sizes|style|class|id|data-[\w-]+|width|height|loading|decoding|fetchpriority)=("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  h = h.replace(/href=(["'])\s*javascript:[^"']*\1/gi, 'href="#"');
  h = h.replace(/<img /gi, '<img loading="lazy" decoding="async" ');
  h = h.replace(/—/g, ', ');
  return h.trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The Internet Archive rate-limits hard: go slowly there and retry when told to wait.
export async function get(url, type = 'text') {
  const slow = String(url).includes('web.archive.org');
  let r;
  for (let attempt = 1; attempt <= (slow ? 6 : 1); attempt++) {
    if (slow) await sleep(attempt === 1 ? 4000 : 25000 * (attempt - 1));
    r = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' }, redirect: 'follow' });
    if (!(slow && (r.status === 429 || r.status === 503 || r.status === 504))) break;
  }
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  if (type === 'json') return { data: await r.json(), headers: r.headers };
  if (type === 'buffer') return { data: Buffer.from(await r.arrayBuffer()), headers: r.headers };
  return { data: await r.text(), headers: r.headers };
}

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif' };
// Download one image into content/media/<dir>/ and return its public path (/media/...), or null.
export async function saveImage(url, dir, hint = 'image') {
  try {
    const u = new URL(decode(url));
    if (!/^https?:$/.test(u.protocol)) return null;
    const { data, headers } = await get(u.href, 'buffer');
    const ct = (headers.get('content-type') || '').split(';')[0].trim();
    if (!ct.startsWith('image/')) return null;
    let base = path.basename(u.pathname).replace(/[^\w.-]/g, '').slice(-80);
    if (!/\.\w{3,4}$/.test(base)) base = slugify(base || hint) + (EXT[ct] || '.jpg');
    const out = path.join(MEDIA, dir);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, base), data);
    return `/media/${dir}/${base}`;
  } catch (e) {
    console.warn('  image skipped:', url, String(e.message || e));
    return null;
  }
}

// Download every <img> in the html and point it at the local copy.
export async function localiseImages(html, dir) {
  const srcs = [...new Set([...html.matchAll(/<img[^>]*\ssrc=["']([^"']+)["']/gi)].map((m) => m[1]))];
  let first = null;
  for (const src of srcs) {
    const local = await saveImage(src, dir);
    if (local) { html = html.split(src).join(local); first = first || local; }
  }
  return { html, first };
}

export function loadPosts() {
  if (!fs.existsSync(POSTS)) return [];
  return fs.readdirSync(POSTS).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(POSTS, f), 'utf8')))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
export function savePost(p) {
  fs.mkdirSync(POSTS, { recursive: true });
  fs.writeFileSync(path.join(POSTS, `${p.source}-${p.slug}.json`), JSON.stringify(p, null, 1) + '\n');
}
