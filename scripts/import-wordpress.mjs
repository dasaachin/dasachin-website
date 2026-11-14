// One-time import of every post from the old WordPress site into content/posts.
// Run by .github/workflows/import-wordpress.yml (GitHub has the network access).
import { get, decode, sanitize, excerpt, localiseImages, saveImage, savePost, text } from './lib.mjs';

const SITE = (process.env.WP_SITE || 'https://dasachin.com').replace(/\/$/, '');

async function viaRest() {
  const out = [];
  for (let page = 1; page < 20; page++) {
    let res;
    try { res = await get(`${SITE}/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed=1`, 'json'); }
    catch (e) {
      try { res = await get(`${SITE}/?rest_route=/wp/v2/posts&per_page=50&page=${page}&_embed=1`, 'json'); }
      catch (e2) { if (page === 1) throw e; break; }
    }
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
    try { xml = (await get(page === 1 ? `${SITE}/feed/` : `${SITE}/feed/?paged=${page}`)).data; } catch (e) { if (page === 1) throw e; break; }
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


// Last resort: find post URLs in sitemaps and listing pages, then read each post page.
function innerDiv(html, re) {
  const m = re.exec(html);
  if (!m) return '';
  let i = m.index + m[0].length, depth = 1;
  const tag = /<(\/?)div\b[^>]*>/gi; tag.lastIndex = i;
  let t;
  while ((t = tag.exec(html))) { depth += t[1] ? -1 : 1; if (depth === 0) return html.slice(i, t.index); }
  return html.slice(i);
}
async function viaCrawl() {
  const found = new Set();
  const POST = new RegExp(`${SITE.replace(/[.]/g, '\\.')}/\\d{4}/\\d{2}/\\d{2}/[^/"'<\\s?#]+/?`, 'g');
  const seeds = ['/wp-sitemap-posts-post-1.xml', '/post-sitemap.xml', '/sitemap.xml', '/sitemap_index.xml', '/', '/category/ai/', '/category/business/', '/category/creativity/', '/category/lifestyle/', '/category/fashion/'];
  for (let n = 2; n <= 8; n++) seeds.push(`/page/${n}/`, `/?paged=${n}`, `/category/ai/page/${n}/`);
  for (const s of seeds) {
    try { const { data } = await get(SITE + s); const hits = data.match(POST) || []; hits.forEach((u) => found.add(u.replace(/\/?$/, '/'))); console.log(`  ${s}: ${hits.length} links`); }
    catch (e) { console.log(`  ${s}: ${e.message.slice(0, 40)}`); }
  }
  console.log(`Crawl: ${found.size} post URLs`);
  const out = [];
  for (const link of found) {
    try {
      const { data } = await get(link);
      const meta = (prop) => { const m = data.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`, 'i')) || data.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`, 'i')); return m ? decode(m[1]) : ''; };
      const h1 = data.match(/<h1[^>]*class=["'][^"']*(?:entry-title|post-title)[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
      const title = decode(text(h1 ? h1[1] : meta('og:title').replace(/\s[-–|]\s[^-–|]*$/, '')));
      let html = innerDiv(data, /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>/i) || innerDiv(data, /<div[^>]+class=["'][^"']*\b(?:post-entry|post-content|single-content)\b[^"']*["'][^>]*>/i);
      html = html.split(/<div[^>]+class=["'][^"']*(?:sharedaddy|post-tags|penci-single-link-pages|related-posts|post-share|jp-relatedposts|tags-links)/i)[0];
      const d = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
      const date = meta('article:published_time') || `${d[1]}-${d[2]}-${d[3]}T06:00:00Z`;
      if (!title || text(html).length < 120) { console.log('  skipped (no content found):', link); continue; }
      out.push({ slug: new URL(link).pathname.replace(/\/$/, '').split('/').pop(), title, date, link, html, excerptHtml: meta('og:description') || meta('description'), image: meta('og:image') || null,
        tags: [...data.matchAll(/<meta[^>]+property=["']article:section["'][^>]+content=["']([^"']*)["']/gi)].map((m) => decode(m[1])) });
    } catch (e) { console.log('  failed:', link, e.message.slice(0, 60)); }
  }
  return out;
}

let posts = [];
try { posts = await viaRest(); console.log(`REST API: ${posts.length} posts`); }
catch (e) {
  console.log('REST API failed:', e.message, '- trying the RSS feed');
  try { posts = await viaFeed(); console.log(`RSS feed: ${posts.length} posts`); }
  catch (e2) { console.log('RSS feed failed:', e2.message, '- reading the pages directly'); posts = await viaCrawl(); }
}
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
