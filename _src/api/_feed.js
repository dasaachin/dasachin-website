// Reads Da Sachin Sharma's Medium feed. Shared by /api/medium and /api/post.
const FEED = 'https://medium.com/feed/@dasachin';
const UA = 'Mozilla/5.0 (compatible; dasachin.com feed reader; +https://dasachin.com)';

function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function tag(xml, name) {
  const m = new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i').exec(xml);
  return m ? m[1].trim() : '';
}
function raw(xml, name) {
  const v = tag(xml, name);
  return /<!\[CDATA\[/.test(v) ? v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : decode(v);
}
function text(html) {
  return decode(String(html || '').replace(/<figcaption[\s\S]*?<\/figcaption>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'a', 'img', 'figure', 'figcaption', 'blockquote', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'hr', 'pre', 'code']);
function sanitize(html) {
  let h = String(html || '');
  h = h.replace(/<(script|style|iframe|object|embed|form|svg|noscript|video|audio)\b[\s\S]*?<\/\1>/gi, '');
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/gi, '');
  h = h.replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi, (m, close, name, attrs) => {
    let t = name.toLowerCase();
    if (t === 'h1') { t = 'h2'; }
    if (t === 'h5' || t === 'h6') { t = 'h4'; }
    if (!ALLOWED.has(t)) { return ''; }
    if (close) { return '</' + t + '>'; }
    let out = '';
    if (t === 'a') {
      const href = /href\s*=\s*"([^"]*)"/i.exec(attrs);
      if (href && /^https?:\/\//i.test(href[1])) { out = ' href="' + esc(decode(href[1])) + '" rel="noopener"'; }
    }
    if (t === 'img') {
      const src = /src\s*=\s*"([^"]*)"/i.exec(attrs), alt = /alt\s*=\s*"([^"]*)"/i.exec(attrs);
      if (!src || !/^https:\/\//i.test(src[1])) { return ''; }
      out = ' src="' + esc(decode(src[1])) + '" alt="' + esc(decode(alt ? alt[1] : '')) + '" loading="lazy" decoding="async"';
    }
    return '<' + t + out + '>';
  });
  return h;
}
function shape(it) {
  const link = String(it.link || '').split('?')[0];
  let slug = '';
  try { slug = new URL(link).pathname.split('/').filter(Boolean).pop() || ''; } catch (e) { slug = ''; }
  slug = slug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  const content = it.content || '';
  const img = /<img[^>]+src\s*=\s*"(https:\/\/[^"]+)"/i.exec(content.replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/gi, ''));
  const plain = text(content);
  const words = plain ? plain.split(' ').length : 0;
  const d = new Date(it.date);
  return {
    title: text(it.title), link: link, slug: slug,
    date: isNaN(d) ? '' : d.toISOString(),
    dateText: isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }),
    image: img ? decode(img[1]) : (it.thumbnail && /^https:\/\//.test(it.thumbnail) ? it.thumbnail : ''),
    excerpt: plain.length > 190 ? plain.slice(0, 190).replace(/\s+\S*$/, '') + '...' : plain,
    minutes: Math.max(1, Math.round(words / 220)),
    tags: (it.tags || []).slice(0, 4), content: content
  };
}
function parseRss(xml) {
  const out = [];
  const re = /<item>([\s\S]*?)<\/item>/gi; let m;
  while ((m = re.exec(xml))) {
    const x = m[1], tags = []; const cre = /<category>([\s\S]*?)<\/category>/gi; let c;
    while ((c = cre.exec(x))) { tags.push(text(decode(c[1]))); }
    out.push(shape({ title: raw(x, 'title'), link: raw(x, 'link'), date: raw(x, 'pubDate'), content: raw(x, 'content:encoded') || raw(x, 'description'), tags: tags }));
  }
  return out;
}
async function get(url, ms) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, application/xml, application/json, text/xml, */*' }, signal: ctl.signal }); }
  finally { clearTimeout(t); }
}
async function load() {
  try {
    const r = await get(FEED, 7000);
    if (r.ok) { const items = parseRss(await r.text()); if (items.length) { return { source: 'medium', items: items }; } }
  } catch (e) { /* fall through to the backup reader */ }
  try {
    const r = await get('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED), 7000);
    if (r.ok) {
      const j = await r.json();
      if (j && Array.isArray(j.items)) {
        return { source: 'rss2json', items: j.items.map((i) => shape({ title: i.title, link: i.link, date: String(i.pubDate || '').replace(' ', 'T') + 'Z', content: i.content || i.description, tags: i.categories, thumbnail: i.thumbnail })) };
      }
    }
  } catch (e) { /* nothing more to try */ }
  return { source: 'none', items: [] };
}
module.exports = { load, sanitize, esc, parseRss, FEED };
