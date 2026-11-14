# Multi-page build. Runs build.py first (home + contact from the design source), then composes all pages.
import re, json, os, shutil
exec(open('/home/claude/gen/site/build.py').read())
from PIL import Image

MONO="font-family: 'JetBrains Mono', ui-monospace, monospace"
SERIF="font-family: 'Instrument Serif', Georgia, serif"
# ---------- logo + favicon
lg=Image.open('/mnt/user-data/uploads/5b89d60f-image.png').convert('RGBA'); lg.save(OUT+'/assets/logo.png',optimize=True)
mark=lg.crop((8,0,76,106)); fav=Image.new('RGBA',(128,128),(255,255,255,255)); m2=mark.resize((int(68*112/106),112),Image.LANCZOS); fav.alpha_composite(m2,((128-m2.size[0])//2,8)); fav.convert('RGB').save(OUT+'/assets/favicon.png',optimize=True)
if os.path.exists(OUT+'/assets/favicon.svg'): os.remove(OUT+'/assets/favicon.svg')

NAV=[('/services','Services'),('/about','About'),('/books','Books'),('/blog','Blog'),('/#play','Play')]
links=''.join('\n    <a href="%s">%s</a>'%x for x in NAV)
new_header=f'''<!-- NAV -->
<header style="position: relative; z-index: 5; max-width: 1200px; margin: 0 auto; padding: 18px clamp(20px, 4vw, 40px); display: flex; align-items: center; justify-content: space-between; gap: 20px">
  <a href="/" aria-label="Da Sachin Sharma, home" style="display: flex; flex: none"><img src="/assets/logo.png" alt="Da Sachin Sharma" width="400" height="106" style="display: block; height: 46px; width: auto"></a>
  <nav class="navl" aria-label="Primary" style="display: flex; gap: 30px; {MONO}; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase">{links}
  </nav>
  <div style="display: flex; align-items: center; gap: 10px">
    <a class="btn" href="/contact" style="display: inline-flex; align-items: center; min-height: 44px; padding: 0 20px; border-radius: 999px; background: #0A1A3F; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 15px; white-space: nowrap">Book a call</a>
    <details class="mnav">
      <summary aria-label="Menu" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #0A1A3F"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" style="fill: none; stroke: #0A1A3F; stroke-width: 2.2; stroke-linecap: round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></summary>
      <nav aria-label="Mobile" style="position: absolute; right: clamp(20px, 4vw, 40px); top: 76px; min-width: 220px; padding: 10px; border-radius: 18px; background: #FFFFFF; border: 1px solid #C9D4EE; box-shadow: 0 30px 60px -30px rgba(10,26,63,0.5); display: flex; flex-direction: column">{''.join('<a href="%s" style="padding: 14px 16px; border-radius: 12px; color: #0A1A3F; text-decoration: none; font-weight: 600; font-size: 17px">%s</a>'%x for x in NAV+[('/contact','Contact')])}</nav>
    </details>
  </div>
</header>

'''
new_footer=f'''<!-- FOOTER -->
<footer class="onnavy" style="background: #061230; color: #A9B8DD">
  <div style="max-width: 1200px; margin: 0 auto; padding: 56px clamp(20px, 4vw, 40px) 40px; display: flex; flex-direction: column; gap: 36px">
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 32px">
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px">
        <a href="/" aria-label="Da Sachin Sharma, home" style="display: flex"><img src="/assets/logo.png" alt="Da Sachin Sharma" width="400" height="106" loading="lazy" style="display: block; height: 52px; width: auto; filter: invert(1)"></a>
        <p style="margin: 0; font-size: 15px; line-height: 1.55">AI trainer, coach and consultant. Problem first, solution second.</p>
      </div>
      <nav aria-label="Footer" style="display: flex; flex-wrap: wrap; gap: 14px 28px; align-content: flex-start; font-size: 16px; font-weight: 600">
        <a href="/services">Services</a><a href="/about">About</a><a href="/books">Books</a><a href="/blog">Blog</a><a href="/contact">Contact</a>
      </nav>
      <nav aria-label="Social" style="display: flex; flex-wrap: wrap; gap: 14px 28px; align-content: flex-start; font-size: 16px; font-weight: 600">
        <a href="https://www.linkedin.com/in/dasachin/" rel="noopener me">LinkedIn</a><a href="https://medium.com/@dasachin" rel="noopener me">Medium</a><a href="https://www.instagram.com/xdotai.in" rel="noopener me">Instagram</a><a href="https://xdotai.in" rel="noopener">X DOT AI</a>
      </nav>
    </div>
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding-top: 24px; border-top: 1px solid #1E2E5C; {MONO}; font-size: 12px; letter-spacing: 0.08em">
      <span>Da Sachin Sharma · Mumbai, India</span>
      <span>AI trainer · AI coach · Consultant · Author · © 2026</span>
    </div>
  </div>
</footer>
'''
# ---------- split the home body into sections
assert header in body
body=body.replace(header,'')
marks=['<!-- HERO -->','<!-- MARQUEE -->','<!-- THE GAP · playable -->',"<!-- WHO'S ASKING (interactive) -->",'<!-- WAYS TO WORK TOGETHER (bento) -->','<!-- METHOD -->','<!-- THE DECISION ROOM -->','<!-- PROOF -->','<!-- BOOKS -->','<!-- ABOUT + VENTURES -->','<!-- FAQ (answer-first, for search and AI engines) -->','<!-- CTA -->','</main>\n<!-- FOOTER -->']
keys=['hero','marquee','play','who','work','method','room','proof','books','about','faq','cta']
pos=[body.index(m) for m in marks]; assert pos==sorted(pos)
S={k:body[pos[i]:pos[i+1]] for i,k in enumerate(keys)}
abs_=lambda t:t.replace('src="assets/','src="/assets/').replace('href="assets/','href="/assets/')
S={k:abs_(v) for k,v in S.items()}
OPEN='<div style="background: #F5F8FD; overflow: hidden">\n'+new_header+'<main id="main">\n'
CLOSE='</main>\n'+new_footer+'\n</div>'
def eyebrow(t,c='#3D4C70'): return f'<div style="{MONO}; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: {c}">{t}</div>'
def phero(eb,a,b,lead):
    return f'''<section>
  <div style="max-width: 1200px; margin: 0 auto; padding: 56px clamp(20px, 4vw, 40px) 64px; display: flex; flex-direction: column; gap: 24px">
    {eyebrow(eb)}
    <h1 style="margin: 0; max-width: 980px; font-size: clamp(44px, 6.4vw, 92px); line-height: 0.98; font-weight: 800; letter-spacing: -0.045em; text-wrap: balance">{a} <span style="{SERIF}; font-style: italic; font-weight: 400; letter-spacing: -0.01em; color: #1B3BFF">{b}</span></h1>
    <p style="margin: 0; max-width: 640px; font-size: clamp(17px, 1.5vw, 20px); line-height: 1.55; color: #33415F">{lead}</p>
  </div>
</section>
'''
GRID='display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 20px'
writing=f'''<!-- LATEST WRITING (filled by scripts/build.mjs) -->
<section data-latest hidden style="background: #FFFFFF; border-top: 1px solid #DCE4F5">
  <div style="max-width: 1200px; margin: 0 auto; padding: 88px clamp(20px, 4vw, 40px); display: flex; flex-direction: column; gap: 36px">
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 24px">
      <div style="display: flex; flex-direction: column; gap: 18px">
        {eyebrow('From the blog')}
        <h2 style="margin: 0; font-size: clamp(38px, 5.2vw, 72px); font-weight: 800; letter-spacing: -0.04em; line-height: 1">Latest <span style="{SERIF}; font-style: italic; font-weight: 400; letter-spacing: -0.01em; color: #1B3BFF">writing.</span></h2>
      </div>
      <a href="/blog" style="font-weight: 600; font-size: 16px">All articles</a>
    </div>
    <div style="{GRID}"><!--LATEST--></div>
  </div>
</section>

'''
blog_sec=f'''<section style="background: #FFFFFF; border-top: 1px solid #DCE4F5">
  <div style="max-width: 1200px; margin: 0 auto; padding: 64px clamp(20px, 4vw, 40px) 96px; display: flex; flex-direction: column; gap: 28px">
    <div data-medium="24" style="{GRID}"><p style="margin: 0; font-size: 17px; color: #3D4C70">Loading articles...</p></div>
    <div data-medium-empty hidden style="padding: 32px; border-radius: 24px; background: #E7EEFF; font-size: 18px; line-height: 1.55">New articles appear here automatically when they are published. Until then, read everything on <a href="https://medium.com/@dasachin" rel="noopener">Medium</a>.</div>
  </div>
</section>
'''
# ---------- head helper
head=abs_(head).replace('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">','<link rel="icon" href="/assets/favicon.png" type="image/png">\n<link rel="apple-touch-icon" href="/assets/favicon.png">\n<link rel="alternate" type="application/rss+xml" title="Da Sachin Sharma on Medium" href="https://medium.com/feed/@dasachin">')
assert 'favicon.png' in head
# ---------- books (five titles, new cover art, buy links)
BOOKS=[
 dict(id='prompt-dot-ai',img='/mnt/user-data/uploads/9a3eac64-image.png',title='Prompt DOT AI',tag='AI · 2026 edition',sub='The art of writing generative AI prompts',buy='https://a.co/d/0dSiGPXW',
      para="The art of writing generative AI prompts, fully updated for 2026. This edition adds the Seedance masterclass, agents, skills and vibe coding, reference-driven images and video, omni models, the creator's vocabulary and real broadcast case studies from India."),
 dict(id='creativity-dot-ai',img='/mnt/user-data/uploads/2e1a5f2c-image.png',title='Creativity DOT AI',tag='AI · Creative industry',sub='The human-AI playbook for the creative industry',buy='https://a.co/d/00VSZAUt',
      para="The human-AI playbook for the creative industry. Written for writers, designers, filmmakers and agencies who want AI to serve their vision instead of replacing it: vision first, tool second."),
 dict(id='the-warrior-who-put-down-his-bow',img='/mnt/user-data/uploads/2c97872c-image.png',title='The Warrior Who Put Down His Bow',tag='Fable · AI and the Gita',sub="When everything you're good at stops working",buy='https://a.co/d/06O3KfbU',
      para="When everything you're good at stops working. A fable of AI, creativity and the Bhagavad Gita, for anyone whose craft is being rewritten by machines and who is wondering what to pick up next."),
 dict(id='why-you-do-this-to-me',img='/mnt/user-data/uploads/129af38a-image.png',title='Why You Do This To Me',tag='Letters · Love',sub='Unsent love letters',buy='https://a.co/d/0fpGd12X',
      para="A collection of unsent love letters, written by a man to the woman who left without an explanation. A book about everything that was felt and never said."),
 dict(id='emotional-gully',img='/mnt/user-data/uploads/ca0c184c-image.png',title='Emotional Gully',tag='Poetry · Hindi with English translation',sub='Poems by Da Sachin Sharma',buy='https://a.co/d/0bibYRmO',
      para="Poems by Da Sachin Sharma, with English translations by Prakash Khetpal. Small, observed moments from the lanes where feeling lives."),
]
os.makedirs(OUT+'/assets/books',exist_ok=True)
for f in ('prompt-dot-ai.jpg','creativity-dot-ai.jpg','the-warrior-who-put-down-his-bow.jpg'):
    if os.path.exists(OUT+'/assets/'+f): os.remove(OUT+'/assets/'+f)
for k in BOOKS:
    im=Image.open(k['img']).convert('RGB'); w=900; im=im.resize((w,round(im.size[1]*w/im.size[0])),Image.LANCZOS); im.save(OUT+'/assets/books/'+k['id']+'.jpg',quality=84,optimize=True,progressive=True); k['wh']=im.size
BTN='display: inline-flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 26px; border-radius: 999px; background: #1B3BFF; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px'
ARROW='<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style="fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>'
def cover(k,lazy=True):
    return '<img src="/assets/books/%s.jpg" alt="Cover of %s by Da Sachin Sharma" width="%d" height="%d" loading="%s" decoding="async" style="display: block; width: 100%%; height: auto">'%(k['id'],k['title'],k['wh'][0],k['wh'][1],'lazy' if lazy else 'eager')
rows=''
for i,k in enumerate(BOOKS):
    d='row' if i%2==0 else 'row-reverse'
    rows+=('    <article id="%s" class="rv" style="display: flex; flex-wrap: wrap; flex-direction: %s; align-items: center; gap: clamp(28px, 5vw, 72px); padding: 56px 0; border-top: 1px solid #C9D4EE">\n'%(k['id'],d)
      +'      <div class="book" style="flex: 1 1 320px; min-width: 0; max-width: 460px; border-radius: 28px; overflow: hidden; box-shadow: 0 40px 80px -44px rgba(10,26,63,0.55)">'+cover(k,i>0)+'</div>\n'
      +'      <div style="flex: 1.2 1 360px; min-width: 0; display: flex; flex-direction: column; gap: 18px">\n'
      +'        <div style="'+MONO+'; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #1B3BFF">'+k['tag']+'</div>\n'
      +'        <h2 style="margin: 0; font-size: clamp(34px, 4.4vw, 60px); font-weight: 800; letter-spacing: -0.04em; line-height: 1">'+k['title']+'</h2>\n'
      +'        <p style="margin: 0; '+SERIF+'; font-style: italic; font-size: clamp(22px, 2.2vw, 28px); line-height: 1.2; color: #1B3BFF">'+k['sub']+'</p>\n'
      +'        <p style="margin: 0; max-width: 540px; font-size: 17.5px; line-height: 1.6; color: #33415F">'+k['para']+'</p>\n'
      +'        <a class="btn" href="'+k['buy']+'" rel="noopener" style="align-self: flex-start; margin-top: 6px; '+BTN+'">Buy now on Amazon '+ARROW+'</a>\n'
      +'      </div>\n    </article>\n')
books_full='<section style="background: #F5F8FD">\n  <div style="max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 40px) 72px; display: flex; flex-direction: column">\n'+rows+'  </div>\n</section>\n'
tiles=''.join('      <a class="book card" href="/books#'+k['id']+'" style="display: flex; flex-direction: column; gap: 14px">\n        <div style="border-radius: 20px; overflow: hidden; box-shadow: 0 26px 50px -34px rgba(10,26,63,0.6)">'+cover(k)+'</div>\n        <div style="display: flex; flex-direction: column; gap: 4px"><h3 style="margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15">'+k['title']+'</h3><span style="'+MONO+'; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #1B3BFF">'+k['tag']+'</span></div>\n      </a>\n' for k in BOOKS)
S['books']=('<!-- BOOKS -->\n<section id="books" style="background: #FFFFFF; border-top: 1px solid #DCE4F5">\n  <div style="max-width: 1200px; margin: 0 auto; padding: 88px clamp(20px, 4vw, 40px); display: flex; flex-direction: column; gap: 40px">\n    <div class="rv" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 24px">\n      <div style="display: flex; flex-direction: column; gap: 18px">\n        '+eyebrow('Author')+'\n        <h2 style="margin: 0; font-size: clamp(38px, 5.2vw, 72px); font-weight: 800; letter-spacing: -0.04em; line-height: 1">Ideas, <span style="'+SERIF+'; font-style: italic; font-weight: 400; letter-spacing: -0.01em; color: #1B3BFF">written down.</span></h2>\n      </div>\n      <a href="/books" style="font-weight: 600; font-size: 16px">All five books</a>\n    </div>\n    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 24px">\n'+tiles+'    </div>\n  </div>\n</section>\n\n')
books=[{"@type":"Book","@id":URL+"books#"+k['id'],"name":k['title'],"author":{"@id":URL+"#person"},"description":k['para'],"image":URL+"assets/books/"+k['id']+".jpg","url":URL+"books#"+k['id'],"sameAs":k['buy']} for k in BOOKS]
_m=re.search(r'<script type="application/ld\+json">\n(.*?)\n</script>',head,re.S); _g=json.loads(_m.group(1)); _g['@graph']=[x for x in _g['@graph'] if x.get('@type')!='Book']+books
head=head[:_m.start(1)]+json.dumps(_g,ensure_ascii=False,indent=1)+head[_m.end(1):]

LD_RE=re.compile(r'<script type="application/ld\+json">.*?</script>',re.S)
def mkhead(t,d,path,ld,preload=False):
    h=head.replace(title,t).replace(desc,d).replace('<link rel="canonical" href="'+URL+'">','<link rel="canonical" href="'+URL+path+'">').replace('<meta property="og:url" content="'+URL+'">','<meta property="og:url" content="'+URL+path+'">').replace('<meta property="og:type" content="profile">','<meta property="og:type" content="website">')
    h=LD_RE.sub(lambda m:'<script type="application/ld+json">\n'+json.dumps(ld,ensure_ascii=False,indent=1)+'\n</script>',h)
    if not preload: h=h.replace('<link rel="preload" as="image" href="/assets/portrait.jpg">\n','')
    return h
def crumbs(name,path): return {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":URL},{"@type":"ListItem","position":2,"name":name,"item":URL+path}]}
def wp(t,d,path,typ='WebPage',extra=None):
    g=[{"@type":typ,"@id":URL+path+"#webpage","url":URL+path,"name":t,"description":d,"isPartOf":{"@id":URL+"#website"},"about":{"@id":URL+"#person"},"inLanguage":"en-IN"},crumbs(t.split(' | ')[0],path)]
    return {"@context":"https://schema.org","@graph":g+(extra or [])}
TAIL='\n<script src="/assets/site.js" defer></script>\n</body>\n</html>\n'
def write(name,html):
    assert '{{' not in html and '—' not in html and 'src="assets/' not in html, name
    open(OUT+'/'+name,'w').write(html)
# ---------- pages
home=head+OPEN+S['hero']+S['marquee']+S['play']+S['work']+S['method']+S['room']+S['proof']+S['books']+writing+S['faq']+S['cta']+CLOSE+TAIL
write('index.html',home)
PAGES=[]
def page(name,t,d,sections,typ='WebPage',extra=None):
    write(name+'.html',mkhead(t,d,name,wp(t,d,name,typ,extra))+OPEN+sections+CLOSE+TAIL); PAGES.append(name)
page('services','AI Training, Consulting and Coaching Services | Da Sachin Sharma','Corporate AI training for teams, AI consulting for managements, one-to-one coaching for leaders and custom AI tools, by Da Sachin Sharma in Mumbai, India.',
     phero('Services','AI training, consulting and','coaching.','For founders, CXOs and team leaders who want AI working inside the business. Every engagement starts with the problem, not the tool.')+S['who']+S['work']+S['method']+S['room']+S['faq']+S['cta'],extra=[svc,faqs])
page('about','About Da Sachin Sharma | AI Trainer, Coach and Consultant','Da Sachin Sharma is the founder of X DOT AI, Guest Faculty at IICT Mumbai and the author of five books. 18+ years in brands, advertising and film, 1000+ professionals trained in AI.',
     phero('About','Da Sachin','Sharma.','AI trainer, coach and consultant. Founder of X DOT AI, Guest Faculty at IICT Mumbai and author of five books.')+S['about']+S['method']+S['proof']+S['cta'],typ='AboutPage')
page('books','Books by Da Sachin Sharma | Prompt DOT AI, Creativity DOT AI and more','Five books by Da Sachin Sharma: Prompt DOT AI, Creativity DOT AI, The Warrior Who Put Down His Bow, Why You Do This To Me and Emotional Gully. Read about each and buy on Amazon.',
     phero('Publications','Five books,','three on AI.','From the craft of prompting to unsent love letters and Hindi poetry. Each one is available on Amazon.')+books_full+S['cta'],extra=books)
# contact: rebuild with new chrome
c=open(P+'contact.html').read()
ct='Contact Da Sachin Sharma | AI Training, Coaching and Consulting'; cd='Tell Da Sachin Sharma the real problem you want AI to solve. Enquire about AI training for teams, consulting for managements, coaching for leaders or custom AI tools.'
write('contact.html',mkhead(ct,cd,'contact',wp(ct,cd,'contact','ContactPage'))+OPEN+c+CLOSE+TAIL); PAGES.append('contact')
# ---------- css
css2=open(OUT+'/assets/site.css').read()+""".mnav{display:none;position:static}.mnav summary{cursor:pointer}.mnav a:hover{background:#E7EEFF}
@media (max-width:760px){.mnav{display:block}}
.prose iframe{display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:16px;margin:2em 0}
.card{color:#0A1A3F;text-decoration:none;transition:transform .25s ease,box-shadow .25s ease}.card:hover{color:#0A1A3F;transform:translateY(-6px);box-shadow:0 28px 50px -28px rgba(10,26,63,.45)}
.post{font-size:19px;line-height:1.7;color:#1F2D4F}.post p{margin:0 0 1.2em}.post h2,.post h3,.post h4{margin:1.8em 0 .5em;color:#0A1A3F;letter-spacing:-.02em;line-height:1.15}.post h2{font-size:32px}.post h3{font-size:26px}.post h4{font-size:21px}
.post img{display:block;max-width:100%;height:auto;border-radius:16px;margin:0 auto}.post figure{margin:2em 0}.post figcaption{margin-top:10px;font-size:14px;color:#3D4C70;text-align:center}
.post blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:3px solid #1B3BFF;font-family:"Instrument Serif",Georgia,serif;font-size:26px;line-height:1.3;color:#0A1A3F}
.post ul,.post ol{margin:0 0 1.2em;padding-left:1.3em}.post li{margin:.35em 0}.post pre{overflow-x:auto;padding:18px;border-radius:14px;background:#061230;color:#fff;font-size:15px}.post hr{border:none;border-top:1px solid #C9D4EE;margin:2.4em 0}.post a{text-underline-offset:3px}
.prose{font-size:19px;line-height:1.7;color:#1F2D4F}.prose p{margin:0 0 1.2em}.prose h2,.prose h3,.prose h4{margin:1.8em 0 .5em;color:#0A1A3F;letter-spacing:-.02em;line-height:1.15}.prose h2{font-size:32px}.prose h3{font-size:26px}.prose h4{font-size:21px}
.prose img{display:block;max-width:100%;height:auto;border-radius:16px;margin:0 auto}.prose figure{margin:2em 0}.prose figcaption{margin-top:10px;font-size:14px;color:#3D4C70;text-align:center}
.prose blockquote{margin:1.6em 0;padding:4px 0 4px 22px;border-left:3px solid #1B3BFF;font-family:"Instrument Serif",Georgia,serif;font-size:26px;line-height:1.3;color:#0A1A3F}
.prose ul,.prose ol{margin:0 0 1.2em;padding-left:1.3em}.prose li{margin:.35em 0}.prose pre{overflow-x:auto;padding:18px;border-radius:14px;background:#061230;color:#fff;font-size:15px}.prose hr{border:none;border-top:1px solid #C9D4EE;margin:2.4em 0}.prose a{text-underline-offset:3px}
"""
open(OUT+'/assets/site.css','w').write(css2)
# ---------- page template for scripts/build.mjs (blog index and posts)
th=mkhead('%%TITLE%%','%%DESC%%','%%PATH%%',{})
th=th.replace('<meta property="og:type" content="website">','<meta property="og:type" content="%%OGTYPE%%">').replace('content="'+URL+'assets/og.jpg"','content="%%OGIMAGE%%"')
th=LD_RE.sub('<script type="application/ld+json">\n%%JSONLD%%\n</script>',th)
for tok in ('%%TITLE%%','%%DESC%%','%%PATH%%','%%OGTYPE%%','%%OGIMAGE%%','%%JSONLD%%'): assert tok in th, tok
TEMPLATE=th+OPEN+'%%MAIN%%\n'+S['cta']+CLOSE+TAIL
VERCEL=json.dumps({"buildCommand":"node scripts/build.mjs","outputDirectory":"dist","framework":None,"cleanUrls":True,"trailingSlash":False,
 "redirects":[{"source":"/about-me","destination":"/about","permanent":True},{"source":"/publications","destination":"/books","permanent":True},{"source":"/category/:c*","destination":"/blog","permanent":False},{"source":"/page/:n","destination":"/blog","permanent":False},{"source":"/blog/medium/:slug","destination":"/blog","permanent":False}]},indent=2)+'\n'
for f in ('vercel.json','.vercelignore','sitemap.xml','.nojekyll','blog.html'):
    if os.path.exists(OUT+'/'+f): os.remove(OUT+'/'+f)
shutil.rmtree(OUT+'/api',ignore_errors=True)
ll=open(OUT+'/llms.txt').read().replace('## Contact\n','## Pages\n- Services: https://www.dasachin.com/services\n- About: https://www.dasachin.com/about\n- Books: https://www.dasachin.com/books\n- Blog: https://www.dasachin.com/blog\n- Medium: https://medium.com/@dasachin\n\n## Contact\n')
open(OUT+'/llms.txt','w').write(ll)
open('/home/claude/gen/site/_template.html','w').write(TEMPLATE); open('/home/claude/gen/site/_vercel.json','w').write(VERCEL)
print('pages',PAGES,{k:len(v) for k,v in S.items()})
