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

