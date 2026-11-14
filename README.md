# dasachin.com

Static website for Da Sachin Sharma: AI trainer, coach and consultant. No build step. Plain HTML, CSS and JavaScript.

## Files

- `index.html`: the whole page, with SEO meta tags and schema.org data (Person, Organization, ProfessionalService, FAQPage, Book)
- `assets/site.css`, `assets/site.js`: styles, particle hero, the "Wire the workflow" puzzle and the "Decision Room" game
- `assets/`: portrait, book covers, share image (`og.jpg`), favicon
- `robots.txt`, `sitemap.xml`, `llms.txt`: for search engines and AI answer engines
- `404.html`: not-found page

## Go live

1. Connect this repository to a static host (Netlify, Vercel, Cloudflare Pages or GitHub Pages). Build command: none. Publish directory: the repository root.
2. Open the temporary URL the host gives you and check the site.
3. Add `dasachin.com` as a custom domain in the host, then update the DNS records at your domain registrar exactly as the host shows.
4. After the domain works, add the site in Google Search Console and Bing Webmaster Tools and submit `https://dasachin.com/sitemap.xml`.

## Before you switch the domain

The current dasachin.com is a WordPress blog. Once DNS points here, the old blog posts and their Google rankings stop working. Take a WordPress backup first, and decide whether to keep the blog on a subdomain such as `blog.dasachin.com`.

## Still to add

Hidden until supplied: a photo of a live training (hero), a 60 to 90 second showreel, client quotes, and training formats in the FAQ.
