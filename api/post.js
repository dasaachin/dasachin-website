// GET /blog/medium/:slug : a Medium article rendered inside the site. Canonical points to Medium.
const { load, sanitize, esc } = require('./_feed.js');
const layout = require('./_layout.js');
module.exports = async (req, res) => {
  const slug = String((req.query && req.query.slug) || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const data = await load();
  const post = data.items.find((i) => i.slug === slug);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!post) {
    res.setHeader('Cache-Control', 'public, s-maxage=120');
    res.status(404).send(layout.page({ title: 'Article not found | Da Sachin Sharma', desc: 'This article is not available here.', canonical: 'https://dasachin.com/blog', robots: 'noindex', body: '<section style="max-width: 760px; margin: 0 auto; padding: 96px clamp(20px, 4vw, 40px)"><h1 style="margin: 0 0 16px; font-size: clamp(40px, 6vw, 72px); font-weight: 800; letter-spacing: -0.04em; line-height: 1">This article is not here.</h1><p style="font-size: 18px; line-height: 1.6; color: #33415F">It may be older than the latest articles kept on this site. <a href="/blog">Go to the blog</a> or read everything on <a href="https://medium.com/@dasachin" rel="noopener">Medium</a>.</p></section>' }));
    return;
  }
  const tags = post.tags.map((t) => '<span style="padding: 6px 12px; border-radius: 999px; border: 1px solid #C9D4EE; font-size: 13px">' + esc(t) + '</span>').join('');
  const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, datePublished: post.date, image: post.image || undefined, url: 'https://dasachin.com/blog/medium/' + post.slug, mainEntityOfPage: post.link, author: { '@type': 'Person', '@id': 'https://dasachin.com/#person', name: 'Da Sachin Sharma', url: 'https://dasachin.com/' } };
  const body = '<article style="max-width: 760px; margin: 0 auto; padding: 56px clamp(20px, 4vw, 40px) 88px">'
    + '<a href="/blog" style="font-family: \'JetBrains Mono\', ui-monospace, monospace; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase">Back to the blog</a>'
    + '<div style="margin-top: 28px; font-family: \'JetBrains Mono\', ui-monospace, monospace; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #3D4C70">' + esc(post.dateText) + ' · ' + post.minutes + ' min read</div>'
    + '<h1 style="margin: 16px 0 20px; font-size: clamp(36px, 5vw, 64px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; text-wrap: balance">' + esc(post.title) + '</h1>'
    + (tags ? '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px">' + tags + '</div>' : '')
    + '<div class="post">' + sanitize(post.content) + '</div>'
    + '<p style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #0A1A3F; font-size: 16px; color: #3D4C70">Written by Da Sachin Sharma. Originally published on <a href="' + esc(post.link) + '" rel="noopener">Medium</a>.</p>'
    + '</article>';
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
  res.status(200).send(layout.page({ title: post.title + ' | Da Sachin Sharma', desc: post.excerpt, canonical: post.link, image: post.image, ld: ld, body: body }));
};
