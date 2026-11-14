# dasachin.com

Static website for Da Sachin Sharma: AI trainer, coach and consultant. No build step. Plain HTML, CSS and JavaScript.

## How it is built

- `public/`: the fixed pages (home, services, about, books, contact) and `assets/`
- `content/posts/`: one JSON file per blog post; `content/media/`: their images
- `templates/page.html`: the page shell used for the blog index and every post
- `scripts/build.mjs`: Vercel runs this on every push. It copies `public/` into `dist/`, then renders `/blog`, every post, the home page's "Latest writing" cards, `sitemap.xml` and `feed.xml`

## Blog and Medium

- `scripts/sync-medium.mjs` runs every 6 hours on GitHub Actions (`.github/workflows/sync-medium.yml`). It reads the Medium feed of `@dasachin`, saves any new story and its images into `content/`, and commits. That commit triggers a Vercel deploy, so new Medium stories appear on the site without any manual step.
- `scripts/import-wordpress.mjs` is a one-time import of the old WordPress posts (`.github/workflows/import-wordpress.yml`). Imported posts keep their original URLs.
- To run either by hand: GitHub, Actions tab, pick the workflow, "Run workflow".

## Go live

1. The repository is connected to Vercel. Build command and output folder are set in `vercel.json`.
2. Open the temporary URL the host gives you and check the site.
3. Add `dasachin.com` as a custom domain in the host, then update the DNS records at your domain registrar exactly as the host shows.
4. After the domain works, add the site in Google Search Console and Bing Webmaster Tools and submit `https://dasachin.com/sitemap.xml`.

## Before you switch the domain

The current dasachin.com is a WordPress blog. Once DNS points here, the old blog posts and their Google rankings stop working. Take a WordPress backup first, and decide whether to keep the blog on a subdomain such as `blog.dasachin.com`.

## Still to add

Hidden until supplied: a photo of a live training (hero), a 60 to 90 second showreel, client quotes, and training formats in the FAQ.

## Contact form

`contact.html` posts enquiries to FormSubmit (formsubmit.co), which forwards them to dasachin@xdotai.in. The first message ever sent triggers a one-time activation email from FormSubmit to that inbox; click the link in it, and every later enquiry is delivered normally. To change the receiving address, edit `ENDPOINT` in `assets/site.js`.
