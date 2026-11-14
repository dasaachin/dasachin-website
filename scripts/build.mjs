// Builds the site into dist/: copies public/, then renders the blog from content/posts.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, MEDIA, loadPosts, esc } from './lib.mjs';

const DIST = path.join(ROOT, 'dist');
const URL_ = 'https://dasachin.com/';
const MONO = "font-family: 'JetBrains Mono', ui-monospace, monospace;";
const SERIF = "font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400; letter-spacing: -0.01em;";
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
if (fs.existsSync(MEDIA)) fs.cpSync(MEDIA, path.join(DIST, 'media'), { recursive: true });

const tpl = fs.readFileSync(path.join(ROOT, 'templates', 'page.html'), 'utf8');
function render({ title, desc, pathname, main, jsonld, ogImage, ogType = 'website' }) {
  const map = { TITLE: esc(title), DESC: esc(desc), PATH: pathname, JSONLD: JSON.stringify(jsonld, null, 1).replace(/</g, '\\u003c'), OGIMAGE: ogImage || URL_ + 'assets/og.jpg', OGTYPE: ogType, MAIN: main };
  return tpl.replace(/%%(\w+)%%/g, (m, k) => (k in map ? map[k] : m));
}
function write(pathname, html) {
  const file = path.join(DIST, pathname + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const taken = new Set(fs.readdirSync(path.join(ROOT, 'public')).map((f) => f.replace(/\.html$/, '')).concat(['blog', 'media', 'assets', 'api']));
const noDash = (t) => String(t || '').replace(/\s*(\u2014|&mdash;|&#8212;|&#x2014;)\s*/gi, ', ');
const posts = loadPosts().filter((p) => p.path && p.title && p.html).map((p) => ({ ...p, title: noDash(p.title), excerpt: noDash(p.excerpt), html: noDash(p.html) })).map((p) => (taken.has(p.path.split('/')[0]) && !p.path.startsWith('blog/') ? { ...p, path: 'blog/' + p.slug } : p));

// ---- blog index
const card = (p) => `
      <a class="card" href="/${p.path}" style="display: flex; flex-direction: column; border-radius: 24px; overflow: hidden; background: #FFFFFF; border: 1px solid #C9D4EE">
        ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" style="display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; background: #D5E2FF">` : `<div style="aspect-ratio: 16 / 10; background: #1B3BFF; color: #FFFFFF; display: flex; align-items: flex-end; padding: 22px; ${SERIF} font-size: 30px; line-height: 1.05">${esc(p.title)}</div>`}
        <div style="padding: 22px; display: flex; flex-direction: column; gap: 10px; flex: 1">
          <div style="${MONO} font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #1B3BFF">${fmt(p.date)}${p.source === 'medium' ? ' · Medium' : ''}</div>
          <h2 style="margin: 0; font-size: 23px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15">${esc(p.title)}</h2>
          <p style="margin: 0; font-size: 15.5px; line-height: 1.55; color: #3D4C70">${esc(p.excerpt || '')}</p>
        </div>
      </a>`;
const cards = posts.map(card).join('');
const blogMain = `<section>
  <div style="max-width: 1200px; margin: 0 auto; padding: 56px clamp(20px, 4vw, 40px) 88px; display: flex; flex-direction: column; gap: 40px">
    <div style="display: flex; flex-direction: column; gap: 24px">
      <div style="${MONO} font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #3D4C70">Blog</div>
      <h1 style="margin: 0; font-size: clamp(44px, 6.4vw, 92px); line-height: 0.97; font-weight: 800; letter-spacing: -0.045em">Notes on AI, brands and <span style="${SERIF} color: #1B3BFF">creative work.</span></h1>
      <p style="margin: 0; max-width: 620px; font-size: clamp(17px, 1.5vw, 20px); line-height: 1.55; color: #33415F">Essays and field notes by Da Sachin Sharma. New pieces from Medium appear here automatically.</p>
    </div>
    ${posts.length ? `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 24px">${cards}
    </div>` : `<p style="margin: 0; padding: 32px; border-radius: 24px; background: #E7EEFF; font-size: 18px">Posts are on their way. In the meantime, read Da on <a href="https://medium.com/@dasachin">Medium</a>.</p>`}
  </div>
</section>`;
write('blog', render({ title: 'Blog | Da Sachin Sharma on AI, Brands and Creative Work', desc: 'Essays and field notes by Da Sachin Sharma on generative AI, AI training, brand building and the creative industry in India.', pathname: 'blog', main: blogMain,
  jsonld: { '@context': 'https://schema.org', '@type': 'Blog', '@id': URL_ + 'blog#blog', url: URL_ + 'blog', name: 'Da Sachin Sharma, Blog', author: { '@id': URL_ + '#person' },
    blogPost: posts.slice(0, 50).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: URL_ + p.path, datePublished: p.date })) } }));

// ---- latest writing on the home page
const homeFile = path.join(DIST, 'index.html');
if (posts.length && fs.existsSync(homeFile)) {
  const h = fs.readFileSync(homeFile, 'utf8');
  if (h.includes('<!--LATEST-->')) fs.writeFileSync(homeFile, h.replace('<!--LATEST-->', posts.slice(0, 3).map(card).join('')).replace('data-latest hidden', 'data-latest'));
}

// ---- posts
posts.forEach((p, i) => {
  const next = posts[i + 1];
  const main = `<article>
  <div style="max-width: 820px; margin: 0 auto; padding: 48px clamp(20px, 4vw, 40px) 88px; display: flex; flex-direction: column; gap: 28px">
    <a href="/blog" style="${MONO} font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase">All posts</a>
    <div style="${MONO} font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #3D4C70">${fmt(p.date)}${(p.tags || []).length ? ' · ' + esc(p.tags.slice(0, 3).join(' · ')) : ''}</div>
    <h1 style="margin: 0; font-size: clamp(36px, 5vw, 64px); line-height: 1.02; font-weight: 800; letter-spacing: -0.04em; text-wrap: balance">${esc(p.title)}</h1>
    <div style="font-size: 16px; color: #3D4C70">By <a href="/about" style="font-weight: 600">Da Sachin Sharma</a></div>
    ${p.image && !p.html.includes(p.image) ? `<img src="${esc(p.image)}" alt="" style="display: block; width: 100%; border-radius: 24px">` : ''}
    <div class="prose">${p.html}</div>
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; padding-top: 28px; border-top: 2px solid #0A1A3F; font-size: 16px; font-weight: 600">
      ${p.source === 'medium' && p.originalUrl ? `<a href="${esc(p.originalUrl)}" rel="noopener">Also published on Medium</a>` : '<span></span>'}
      ${next ? `<a href="/${next.path}">Next: ${esc(next.title)}</a>` : ''}
    </div>
  </div>
</article>`;
  const img = p.image ? URL_ + p.image.replace(/^\//, '') : undefined;
  write(p.path, render({ title: `${p.title} | Da Sachin Sharma`, desc: p.excerpt || p.title, pathname: p.path, main, ogImage: img, ogType: 'article',
    jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.date, dateModified: p.date, url: URL_ + p.path, mainEntityOfPage: URL_ + p.path, image: img,
      author: { '@type': 'Person', '@id': URL_ + '#person', name: 'Da Sachin Sharma', url: URL_ }, publisher: { '@id': URL_ + '#person' }, keywords: (p.tags || []).join(', ') } }));
});

// ---- sitemap and feed
const today = new Date().toISOString().slice(0, 10);
const urls = [['', today, '1.0'], ['services', today, '0.9'], ['about', today, '0.8'], ['books', today, '0.7'], ['blog', today, '0.8'], ['contact', today, '0.8']]
  .concat(posts.map((p) => [p.path, p.date.slice(0, 10), '0.6']));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d, pr]) => `  <url><loc>${URL_}${u}</loc><lastmod>${d}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Da Sachin Sharma</title><link>${URL_}blog</link><description>Notes on AI, brands and creative work.</description>\n${posts.slice(0, 30).map((p) => `<item><title>${esc(p.title)}</title><link>${URL_}${p.path}</link><guid>${URL_}${p.path}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.excerpt || '')}</description></item>`).join('\n')}\n</channel></rss>\n`);
console.log(`Built ${posts.length} posts into dist/`);
