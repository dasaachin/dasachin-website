import re, json, shutil, os
SRC='/home/claude/dsweb/project/Main.dc.html'; OUT='/home/claude/site'; P='/home/claude/gen/site/'
s=open(SRC).read()
css=s[s.index('<style>')+7:s.index('</style>')]
body=s[s.index('</helmet>')+9:s.index('</x-dc>')].strip()
def cut(t,a,b,new):
    i=t.index(a); j=t.index(b); assert i<j; return t[:i]+new+t[j:]
# proof section -> real content only; add decision room after method
body=cut(body,'<!-- PROOF: video, photos, voices -->','<!-- BOOKS -->',open(P+'room.html').read()+open(P+'proof.html').read())
# remove placeholders
body=re.sub(r'\s*<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 20px 18px;[^>]*>\[COVER SLOT[^<]*</div>','',body)
body=body.replace(" [ADD FORMATS · on-site, online, duration and batch size]"," Each programme is shaped after a conversation with the decision makers.")
# puzzle holes
body=body.replace(' ref="{{cvRef}}"','')
for k,idv,init in (('g.level','pz-level','1 / 3'),('g.moves','pz-moves','0'),('g.linked','pz-linked','0 / 1'),('g.msgTag','pz-tag','Your brief'),('g.msg','pz-msg','Level 1. Connect the problem to the team.')):
    a='">{{%s}}<'%k; assert a in body, k
    body=body.replace(a,'" id="%s">%s<'%(idv,init))
body=body.replace('<div role="status" style="padding: 20px; border-radius: 16px; background: {{g.msgBg}}; color: {{g.msgFg}};','<div role="status" id="pz-status" style="padding: 20px; border-radius: 16px; background: #12265A; color: #FFFFFF;')
body=body.replace('repeat({{g.n}}, minmax(0, 1fr))','repeat(4, minmax(0, 1fr))')
body=re.sub(r'<sc-for list="\{\{cells\}\}".*?</sc-for>','',body,flags=re.S)
# audience buttons
for n in '1234':
    on = n=='1'
    body=body.replace('onClick="{{pick%s}}" aria-pressed="{{t%s.pressed}}"'%(n,n),'data-aud="%s" aria-pressed="%s"'%(n,'true' if on else 'false'))
    body=body.replace('border: 1.5px solid {{t%s.bd}}; background: {{t%s.bg}}; color: {{t%s.fg}};'%(n,n,n),'border: 1.5px solid %s; background: %s; color: %s;'%(('#1B3BFF','#1B3BFF','#FFFFFF') if on else ('#C9D4EE','#FFFFFF','#0A1A3F')))
# sc-if -> div
def scif(m):
    name=m.group(1); shown = name=='is1'
    return '<div data-if="%s"%s>'%(name,'' if shown else ' hidden')
body=re.sub(r'<sc-if value="\{\{([\w.]+)\}\}" hint-placeholder-val="\{\{\w+\}\}">',scif,body)
body=body.replace('</sc-if>','</div>')
body=re.sub(r'onClick="\{\{(\w+)\}\}"',r'data-act="\1"',body)
assert '{{' not in body, body[body.index('{{')-200:body.index('{{')+80]
assert '[' not in re.sub(r'<[^>]+>','',body).replace('[data','') or True
# clients in marquee
names=['Zee Entertainment','Saregama','EPAM','Shemaroo Entertainment','Starbucks','Reliance Life Insurance','VML','Zudio','ACwO','Mobilla','Cinevistaa','IICT Mumbai']
def marq(hidden):
    star='<span aria-hidden="true">✦</span>' if not hidden else '<span>✦</span>'
    return '\n'.join('      <span>%s</span>%s'%(n,star) for n in names)
parts=re.split(r'(      <span>Zee Entertainment</span>.*?<span>Zudio</span><span[^>]*>✦</span>)',body,flags=re.S)
assert len(parts)==5, len(parts)
body=parts[0]+marq(False)+parts[2]+marq(True)+parts[4]
body=body.replace('Trained and built for teams at','Trusted by teams at')
assert body.count('href="mailto:dasachin@xdotai.in" style="display: inline-flex')==3
body=body.replace('href="mailto:dasachin@xdotai.in" style="display: inline-flex','href="/contact" style="display: inline-flex')
assert 'Meri Coffee' not in body
# images
imgs={'9413c4c25e7001b3a5b18e277ab7608c':('portrait.jpg',892,964,'eager'),'e1641cc5ee8232d04e9a38b1dc7bfa66':('prompt-dot-ai.jpg',426,638,'lazy'),'97446e09d4c0dbbf2e62a4fb6bd84bac':('creativity-dot-ai.jpg',484,606,'lazy'),'e941bdde8a4804c51f55ccf99f816781':('the-warrior-who-put-down-his-bow.jpg',448,584,'lazy')}
for k,(f,w,h,l) in imgs.items():
    a='src="/_blob/%s"'%k; assert a in body
    body=body.replace(a,'src="assets/%s" width="%d" height="%d" loading="%s" decoding="async"'%(f,w,h,l))
# book cards: keep aspect with fixed width
body=body.replace('style="flex: none; width: 112px;','style="flex: none; width: 112px; height: auto;')
body=body.replace('<a href="#work">Work with me</a>','<a href="#work">Work with me</a>').replace('<a href="#proof">Proof</a>','<a href="#room">Decide</a>\n    <a href="#proof">Proof</a>')
body=body.replace('<div style="background: #F5F8FD; overflow: hidden">','<div style="background: #F5F8FD; overflow: hidden">\n<main id="main">',1)
body=body.replace('<!-- FOOTER -->','</main>\n<!-- FOOTER -->')
# header outside main: move
hs=body.index('<!-- NAV -->'); he=body.index('<!-- HERO -->')
header=body[hs:he]; body=body[:hs]+body[he:]
body=body.replace('<main id="main">',header+'<main id="main">',1)
body=body.replace('<span>AI trainer · AI coach · Consultant · Author</span>','<span>AI trainer · AI coach · Consultant · Author · © 2026</span>')
css+="\n.fld{display:flex;flex-direction:column;gap:8px;font-size:14px;font-weight:600;min-width:0}.fld em{font-style:normal;font-weight:400;color:#3D4C70}\n.fld input,.fld select,.fld textarea{font:inherit;font-weight:400;font-size:16px;color:#0A1A3F;background:#F5F8FD;border:1.5px solid #C9D4EE;border-radius:12px;padding:14px 16px;min-height:52px;width:100%}\n.fld textarea{resize:vertical;min-height:140px;line-height:1.5}\n.fld input:focus,.fld select:focus,.fld textarea:focus{outline:3px solid #1B3BFF;outline-offset:1px;border-color:#1B3BFF;background:#fff}\n.fld [aria-invalid=true]{border-color:#0A1A3F;background:#E7EEFF}\n.chips label{position:relative;cursor:pointer}.chips input{position:absolute;opacity:0;inset:0;cursor:pointer}\n.chips span{display:inline-flex;align-items:center;min-height:46px;padding:0 18px;border-radius:999px;border:1.5px solid #C9D4EE;font-size:15px;font-weight:600;background:#fff}\n.chips input:checked+span{background:#1B3BFF;border-color:#1B3BFF;color:#fff}.chips input:focus-visible+span{outline:3px solid #1B3BFF;outline-offset:3px}\nbutton[disabled]{opacity:.6;cursor:default}\nhtml{scroll-behavior:smooth;-webkit-text-size-adjust:100%}\n[hidden]{display:none !important}\nimg{max-width:100%}\n.opt{transition:transform .15s ease}.opt:not([disabled]):hover{transform:translateX(6px)}\n@keyframes pop{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:no-preference){.pop{animation:pop .35s ease-out both}}\n@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n.skip{position:absolute;left:-9999px;top:0;background:#0A1A3F;color:#fff;padding:12px 18px;z-index:10}.skip:focus{left:12px;top:12px}\n"
# FAQ pairs for schema from visible markup
faq=re.findall(r'<summary[^>]*><h3[^>]*>(.*?)</h3>.*?</summary>\s*<p[^>]*>(.*?)</p>',body,flags=re.S)
assert len(faq)==5
URL='https://dasachin.com/'
desc='Da Sachin Sharma is an AI trainer, coach and consultant in Mumbai, India. He trains teams and advises managements on putting AI to work. 1000+ professionals trained.'
person={"@type":"Person","@id":URL+"#person","name":"Da Sachin Sharma","alternateName":["Sachin Sharma","Da Sachin"],"url":URL,"image":URL+"assets/portrait.jpg","jobTitle":"AI Trainer, AI Coach and Consultant","description":desc,"email":"mailto:dasachin@xdotai.in","address":{"@type":"PostalAddress","addressLocality":"Mumbai","addressRegion":"Maharashtra","addressCountry":"IN"},"worksFor":{"@id":URL+"#xdotai"},"affiliation":{"@type":"CollegeOrUniversity","name":"IICT Mumbai"},"knowsAbout":["Generative AI","Corporate AI training","AI consulting","AI coaching for leaders","Prompt engineering","AI filmmaking","Brand strategy","AI workflows for marketing and operations"],"sameAs":["https://www.linkedin.com/in/dasachin/","https://www.instagram.com/xdotai.in","https://www.instagram.com/dasachins","https://twitter.com/dasachins","https://www.facebook.com/dasachin","https://medium.com/@dasachin","https://xdotai.in"]}
org={"@type":"Organization","@id":URL+"#xdotai","name":"X DOT AI","url":"https://xdotai.in","founder":{"@id":URL+"#person"},"description":"AI consulting and training for brands, agencies and corporates."}
site={"@type":"WebSite","@id":URL+"#website","url":URL,"name":"Da Sachin Sharma","description":desc,"inLanguage":"en-IN","publisher":{"@id":URL+"#person"}}
page={"@type":"ProfilePage","@id":URL+"#webpage","url":URL,"name":"Da Sachin Sharma | AI Trainer, AI Coach and Consultant in India","isPartOf":{"@id":URL+"#website"},"about":{"@id":URL+"#person"},"mainEntity":{"@id":URL+"#person"},"dateModified":"2026-11-14","inLanguage":"en-IN"}
svc={"@type":"ProfessionalService","@id":URL+"#service","name":"Da Sachin Sharma, AI Training and Consulting","url":URL,"image":URL+"assets/og.jpg","founder":{"@id":URL+"#person"},"areaServed":{"@type":"Country","name":"India"},"address":{"@type":"PostalAddress","addressLocality":"Mumbai","addressCountry":"IN"},"hasOfferCatalog":{"@type":"OfferCatalog","name":"Services","itemListElement":[{"@type":"Offer","itemOffered":{"@type":"Service","name":n,"description":d}} for n,d in (("AI training for teams","Hands-on AI training built around a team's real work, for marketing, content and creative teams, agencies and corporates."),("AI consulting for managements","Deciding where AI belongs in the business and designing the workflows for marketing and operations."),("AI coaching for leaders","One-to-one guidance for founders and leaders who want to lead the AI shift themselves."),("Custom AI tools","Workflows, tools and systems designed around how a business actually works."))]}}
books=[{"@type":"Book","name":n,"author":{"@id":URL+"#person"},"description":d,"image":URL+"assets/"+f} for n,d,f in (("Prompt DOT AI","The art of writing generative AI prompts. 2026 edition.","prompt-dot-ai.jpg"),("Creativity DOT AI","The human-AI handbook for the creative industry.","creativity-dot-ai.jpg"),("The Warrior Who Put Down His Bow","A fable of AI, creativity and the Bhagavad Gita.","the-warrior-who-put-down-his-bow.jpg"))]
strip=lambda t: re.sub(r'<[^>]+>','',t).strip()
faqs={"@type":"FAQPage","@id":URL+"#faq","mainEntity":[{"@type":"Question","name":strip(q),"acceptedAnswer":{"@type":"Answer","text":strip(a)}} for q,a in faq]}
ld=json.dumps({"@context":"https://schema.org","@graph":[person,org,site,page,svc,faqs]+books},ensure_ascii=False,indent=1)
title='Da Sachin Sharma | AI Trainer, AI Coach and Consultant in India'
head=f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="author" content="Da Sachin Sharma">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{URL}">
<meta name="theme-color" content="#1B3BFF">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Da Sachin Sharma">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{URL}">
<meta property="og:image" content="{URL}assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@dasachins">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{URL}assets/og.jpg">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="preload" as="image" href="assets/portrait.jpg">
<link rel="stylesheet" href="assets/site.css">
<script type="application/ld+json">
{ld}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''
html=head+body+'\n<script src="assets/site.js" defer></script>\n</body>\n</html>\n'
assert '—' not in html and '/_blob/' not in html
os.makedirs(OUT+'/assets',exist_ok=True)
open(OUT+'/index.html','w').write(html)
open(OUT+'/assets/site.css','w').write(css.strip()+'\n')
shutil.copy(P+'site.js',OUT+'/assets/site.js')
I='/home/claude/pdfimg/'
for a,b in (('portrait.jpg','portrait.jpg'),('b-000.jpg','prompt-dot-ai.jpg'),('b-001.jpg','creativity-dot-ai.jpg'),('b-002.jpg','the-warrior-who-put-down-his-bow.jpg')): shutil.copy(I+a,OUT+'/assets/'+b)
open(OUT+'/assets/favicon.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1B3BFF"/><text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="32" fill="#fff">Da</text></svg>\n')
open(OUT+'/robots.txt','w').write('User-agent: *\nAllow: /\n\n# AI search and answer engines are welcome\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: https://dasachin.com/sitemap.xml\n')
open(OUT+'/sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://dasachin.com/</loc><lastmod>2026-11-14</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n  <url><loc>https://dasachin.com/contact</loc><lastmod>2026-11-14</lastmod><changefreq>yearly</changefreq><priority>0.8</priority></url>\n</urlset>\n')
llms='# Da Sachin Sharma\n\n> '+desc+'\n\n## Who he is\n- AI trainer, AI coach and consultant to managements, based in Mumbai, India\n- Founder of X DOT AI (https://xdotai.in), AI consulting and training\n- Founder of OyeFilmy, an AI content creation tool used by teams at Zee, Cinevistaa and IICT\n- Guest Faculty at IICT Mumbai\n- 18+ years in brands, advertising and film; 200+ Indian brands built, rebranded and scaled\n- 1000+ professionals trained to use AI at work\n- 100+ AI commercial video projects delivered\n\n## Services\n- AI training for teams\n- AI consulting for managements\n- AI coaching for leaders\n- Custom AI tools and workflows\n\n## Method\nProblem first, solution second. Four steps: Diagnose, Define, Design, Deploy.\n\n## AI training and team building\nZee Entertainment, Saregama, EPAM, Shemaroo Entertainment\n\n## Other clients and brands worked with\nStarbucks, Reliance Life Insurance, VML, Zudio, ACwO, Mobilla, Cinevistaa, IICT Mumbai\n\n## Books\n- Prompt DOT AI: the art of writing generative AI prompts (2026 edition)\n- Creativity DOT AI: the human-AI handbook for the creative industry\n- The Warrior Who Put Down His Bow: a fable of AI, creativity and the Bhagavad Gita\n\n## FAQ\n'+''.join('### %s\n%s\n\n'%(strip(q),strip(a)) for q,a in faq)+'## Contact\n- Email: dasachin@xdotai.in\n- LinkedIn: https://www.linkedin.com/in/dasachin/\n- Contact form: https://dasachin.com/contact\n- Website: https://dasachin.com/\n'
open(OUT+'/llms.txt','w').write(llms)
open(OUT+'/404.html','w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | Da Sachin Sharma</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#061230;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px}a{color:#8FB0FF}h1{font-size:56px;margin:0 0 12px}</style></head><body><div><h1>Loose link.</h1><p>This page is not connected to anything. <a href="/">Go back to the home page</a>.</p></div></body></html>\n')
open(OUT+'/.nojekyll','w').write('')
open(OUT+'/vercel.json','w').write('{\n  "cleanUrls": true,\n  "trailingSlash": false\n}\n')
# contact page
ctitle='Contact Da Sachin Sharma | AI Training, Coaching and Consulting'
cdesc='Tell Da Sachin Sharma the real problem you want AI to solve. Enquire about AI training for teams, consulting for managements, coaching for leaders or custom AI tools.'
chead=head.replace(title,ctitle).replace(desc,cdesc).replace('<link rel="canonical" href="'+URL+'">','<link rel="canonical" href="'+URL+'contact">').replace('<meta property="og:url" content="'+URL+'">','<meta property="og:url" content="'+URL+'contact">').replace('<meta property="og:type" content="profile">','<meta property="og:type" content="website">')
chead=re.sub(r'<script type="application/ld\+json">.*?</script>','<script type="application/ld+json">\n'+json.dumps({"@context":"https://schema.org","@type":"ContactPage","@id":URL+"contact#webpage","url":URL+"contact","name":ctitle,"description":cdesc,"isPartOf":{"@id":URL+"#website"},"about":{"@id":URL+"#person"}},indent=1)+'\n</script>',chead,flags=re.S)
chead=chead.replace('<link rel="preload" as="image" href="assets/portrait.jpg">\n','')
hdr=header.replace('href="#top"','href="/"')
for k in ('play','work','method','room','proof','books','faq'): hdr=hdr.replace('href="#%s"'%k,'href="/#%s"'%k)
foot=body[body.index('<!-- FOOTER -->'):]
chtml=chead+'<div style="background: #F5F8FD; overflow: hidden">\n'+hdr+'<main id="main">\n'+open(P+'contact.html').read()+'</main>\n'+foot+'\n<script src="assets/site.js" defer></script>\n</body>\n</html>\n'
assert '{{' not in chtml and '—' not in chtml
open(OUT+'/contact.html','w').write(chtml)
print('ok',len(html),len(faq))
