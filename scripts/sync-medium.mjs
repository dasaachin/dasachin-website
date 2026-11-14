// Copies new Medium stories into content/posts. Runs on a schedule from
// .github/workflows/sync-medium.yml. Stories already saved are left untouched.
import { get, decode, sanitize, excerpt, localiseImages, loadPosts, savePost, slugify, normTitle, text } from './lib.mjs';

const USER = process.env.MEDIUM_USER || '@dasachin';
const FEED = `https://medium.com/feed/${USER}`;

function parse(xml) {
  return xml.split(/<item>/).slice(1).map((it) => {
    const pick = (tag) => { const m = it.match(new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`)); return m ? m[1].trim() : ''; };
    return { title: decode(text(pick('title'))), link: pick('link').split('?')[0], guid: pick('guid'), date: pick('pubDate'),
      html: pick('content:encoded') || pick('description'),
      tags: [...it.matchAll(/<category>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/category>/g)].map((m) => decode(m[1])) };
  });
}

let items = [];
try { items = parse((await get(FEED)).data); }
catch (e) {
  console.warn('Medium feed failed:', e.message, '- trying rss2json');
  const { data } = await get('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED), 'json');
  items = (data.items || []).map((i) => ({ title: decode(i.title), link: String(i.link).split('?')[0], guid: i.guid, date: i.pubDate + ' UTC', html: i.content || i.description || '', tags: i.categories || [] }));
}
console.log(`Medium feed: ${items.length} stories`);

const existing = loadPosts();
const seenGuid = new Set(existing.map((p) => p.guid).filter(Boolean));
const seenTitle = new Set(existing.map((p) => normTitle(p.title)));
let added = 0;
for (const it of items) {
  if (!it.title || !it.html || text(it.html).length < 200) continue; // skip comments and stubs
  if (seenGuid.has(it.guid) || seenTitle.has(normTitle(it.title))) continue;
  const slug = slugify(it.title);
  console.log('+', it.title);
  let html = sanitize(it.html).replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, '');
  const loc = await localiseImages(html, `medium/${slug}`);
  savePost({ source: 'medium', slug, path: `blog/${slug}`, title: it.title, date: new Date(it.date).toISOString(), guid: it.guid,
    excerpt: excerpt(loc.html), image: loc.first, tags: it.tags, originalUrl: it.link, html: loc.html });
  seenTitle.add(normTitle(it.title));
  added++;
}
console.log(`Added ${added} new stories.`);
