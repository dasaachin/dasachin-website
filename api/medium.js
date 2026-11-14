// GET /api/medium : latest Medium articles as JSON. Cached at the edge for 30 minutes.
const { load } = require('./_feed.js');
module.exports = async (req, res) => {
  const data = await load();
  const items = data.items.filter((i) => i.slug && i.title).map((i) => ({ title: i.title, url: '/blog/medium/' + i.slug, medium: i.link, date: i.date, dateText: i.dateText, image: i.image, excerpt: i.excerpt, minutes: i.minutes, tags: i.tags }));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', items.length ? 'public, s-maxage=1800, stale-while-revalidate=86400' : 'public, s-maxage=120');
  res.status(200).send(JSON.stringify({ source: data.source, count: items.length, items: items }));
};
