// One-time import of every post from the old WordPress site into content/posts.
// Run by .github/workflows/import-wordpress.yml (GitHub has the network access).
import { get, decode, sanitize, excerpt, localiseImages, saveImage, savePost, text } from './lib.mjs';

const SITE = (process.env.WP_SITE || 'https://dasachin.com').replace(/\/$/, '');

async function viaRest() {
  const out = [];
  for (let page = 1; page < 20; page++) {
    let res;
    try { res = await get(`${SITE}/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed=1`, 'json'); }
    catch (e) { if (page === 1) throw e; break; }
    if (!Array.isArray(res.data) || !res.data.length) break;
    for (const p of res.data) {
      const media = p._embedded?.['wp:featuredmedia']?.[0];
      const terms = (p._embedded?.['wp:term'] || []).flat().filter((t) => t && t.taxonomy === 'category').map((t) => decode(t.name));
      out.push({ slug: p.slug, title: decode(text(p.title?.rendered)), date: p.date_gmt ? p.date_gmt + 'Z' : p.date, link: p.link,
        html: p.content?.rendered || '', excerptHtml: p.excerpt?.rendered || '', image: media?.source_url || null, tags: terms });
    }
    if (res.data.length < 50) break;
  }
  return out;
}

async function viaFeed() {
  const out = [];
  for (let page = 1; page < 30; page++) {
    let xml;
    try { xml = (await get(`${SITE}/feed/?paged=${page}`)).data; } catch (e) { if (page === 1) throw e; break; }
    const items = xml.split(/<item>/).slice(1);
    if (!items.length) break;
    for (const it of items) {
      const pick = (tag) => { const m = it.match(new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`)); return m ? m[1].trim() : ''; };
      const link = pick('link');
      out.push({ slug: new URL(link).pathname.replace(/\/$/, '').split('/').pop(), title: decode(text(pick('title'))), date: new Date(pick('pubDate')).toISOString(), link,
        html: pick('content:encoded') || pick('description'), excerptHtml: pick('description'), image: null,
        tags: [...it.matchAll(/<category>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/category>/g)].map((m) => decode(m[1])) });
    }
  }
  return out;
}

let posts = [];
try { posts = await viaRest(); console.log(`REST API: ${posts.length} posts`); }
catch (e) { console.warn('REST API failed:', e.message, '- trying the RSS feed'); posts = await viaFeed(); console.log(`RSS feed: ${posts.length} posts`); }
if (!posts.length) { console.error('No posts found.'); process.exit(1); }

for (const p of posts) {
  console.log('-', p.title);
  const dir = `wp/${p.slug}`;
  let { html, first } = await localiseImages(sanitize(p.html), dir);
  html = html.replace(new RegExp(`https?://(www\\.)?${new URL(SITE).hostname.replace(/\./g, '\\.')}/`, 'g'), '/');
  const image = (p.image && (await saveImage(p.image, dir, 'cover'))) || first;
  const pathname = new URL(p.link).pathname.replace(/^\/|\/$/g, '') || p.slug;
  savePost({ source: 'wordpress', slug: p.slug, path: pathname, title: p.title, date: new Date(p.date).toISOString(),
    excerpt: excerpt(p.excerptHtml || html), image, tags: p.tags.filter((t) => t && t !== 'Uncategorized'), originalUrl: p.link, html });
}
console.log(`Imported ${posts.length} posts.`);
