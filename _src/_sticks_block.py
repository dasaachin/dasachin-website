# ---------- hero background: animated stick-figure scenes for each service
def _fig(x,y,arms=True):
    # head, body, legs (standing figure ~62 units tall)
    s='<circle cx="%d" cy="%d" r="7"></circle><path d="M%d %d V%d M%d %d l-8 22 M%d %d l8 22"></path>'%(x,y,x,y+7,y+40,x,y+40,x,y+40)
    return s
SCENES={
'train':('AI training',
  _fig(26,30)+'<path d="M26 47 l-9 14"></path><g class="st-point" style="transform-origin: 26px 47px"><path d="M26 47 L46 38 L58 30"></path></g>'
  '<rect x="60" y="14" width="50" height="36" rx="3"></rect><path class="st-draw" pathLength="100" d="M66 42 L78 34 L88 38 L104 22"></path>'
  '<g class="st-bob"><circle cx="66" cy="84" r="5"></circle><path d="M57 100 q9 -12 18 0"></path></g><g class="st-bob st-d1"><circle cx="86" cy="84" r="5"></circle><path d="M77 100 q9 -12 18 0"></path></g><g class="st-bob st-d2"><circle cx="106" cy="84" r="5"></circle><path d="M97 100 q9 -12 18 0"></path></g>'),
'consult':('Consulting',
  _fig(22,40)+'<path d="M22 57 L40 66"></path>'+_fig(98,40)+'<path d="M98 57 L80 66"></path>'
  '<path d="M38 70 H82 M60 70 V102"></path><g class="st-grow" style="transform-origin: 60px 68px"><path d="M50 68 V60 M60 68 V52 M70 68 V44"></path></g>'
  '<g class="st-blink"><path d="M30 12 h22 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-12 l-6 6 v-6 h-4 a4 4 0 0 1 -4 -4 v-8 a4 4 0 0 1 4 -4z"></path></g>'
  '<g class="st-blink st-d2"><path d="M68 6 h22 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-4 v6 l-6 -6 h-12 a4 4 0 0 1 -4 -4 v-8 a4 4 0 0 1 4 -4z"></path><path d="M73 14 h12"></path></g>'),
'brand':('Brand building',
  _fig(24,40)+'<path d="M24 57 L44 60 M24 57 L42 70"></path>'
  '<rect x="54" y="84" width="22" height="18" rx="2"></rect><rect x="78" y="84" width="22" height="18" rx="2"></rect>'
  '<rect class="st-drop" x="66" y="64" width="22" height="18" rx="2"></rect><g class="st-drop st-d2"><rect x="66" y="44" width="22" height="18" rx="2"></rect></g>'
  '<g class="st-pop" style="transform-origin: 77px 28px"><path d="M77 16 l3.4 7 7.6 1 -5.5 5.4 1.3 7.6 -6.8 -3.6 -6.8 3.6 1.3 -7.6 -5.5 -5.4 7.6 -1z"></path></g>'),
'content':('Content creation',
  '<circle cx="30" cy="44" r="7"></circle><path d="M30 51 V78 H52 M52 78 V100 M30 78 l-4 22"></path><g class="st-tap" style="transform-origin: 30px 58px"><path d="M30 58 L50 66"></path></g>'
  '<path d="M48 70 h30 M56 70 l4 -18 h26 l-4 18"></path>'
  '<g class="st-float"><rect x="84" y="30" width="16" height="12" rx="2"></rect><path d="M90 33 v6 l5 -3z"></path></g>'
  '<g class="st-float st-d1"><path d="M66 34 l5 -12 5 12 M68 30 h6"></path></g><g class="st-float st-d2"><rect x="100" y="50" width="12" height="14" rx="2"></rect><path d="M103 55 h6 M103 59 h6"></path></g>'),
'film':('Filmmaking',
  _fig(26,38)+'<path d="M26 55 L46 52 M26 55 L44 62"></path>'
  '<rect x="48" y="44" width="30" height="20" rx="3"></rect><path d="M78 50 l14 -6 v20 l-14 -6 M63 64 V78 M63 78 l-12 24 M63 78 l12 24 M63 78 V102"></path>'
  '<g class="st-spin" style="transform-origin: 55px 34px"><circle cx="55" cy="34" r="8"></circle><path d="M55 26 v16 M47 34 h16"></path></g><g class="st-spin" style="transform-origin: 73px 34px"><circle cx="73" cy="34" r="8"></circle><path d="M73 26 v16 M65 34 h16"></path></g>'
  '<rect x="92" y="84" width="24" height="16" rx="2"></rect><g class="st-clap" style="transform-origin: 92px 84px"><path d="M92 84 L116 78 M98 82.500 l3 -5 M106 80.500 l3 -5"></path></g>'
  '<g class="st-blink"><path d="M98 40 l8 -6 M100 54 h10 M98 66 l8 6"></path></g>'),
}
def scene(key,css):
    label,inner=SCENES[key]
    return '<svg class="stick" viewBox="0 0 120 108" style="%s; fill: none; stroke: #1B3BFF; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; overflow: visible">%s</svg>'%(css,inner)
side=[('train','left: 1.2%; top: 9%'),('consult','left: 1.2%; top: 44%'),('brand','left: 1.2%; top: 77%'),('film','right: 1.2%; top: 12%'),('content','right: 1.2%; top: 52%')]
sticks='  <div class="sticks-side" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none">'+''.join(scene(k,'position: absolute; %s; width: min(150px, calc((100vw - 1200px) / 2 + 16px)); opacity: 0.6'%pos) for k,pos in side)+'</div>\n'
row='  <div class="sticks-row" aria-hidden="true" style="position: relative; max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 40px) 36px; display: none; justify-content: space-between; gap: 8px">'+''.join(scene(k,'flex: 1 1 0; min-width: 0; max-width: 130px; opacity: 0.7') for k in SCENES)+'</div>\n'
_h=S['hero']
_a='  <div style="position: relative; max-width: 1200px; margin: 0 auto; padding: 48px clamp(20px, 4vw, 40px) 72px;'; assert _a in _h
_h=_h.replace(_a,sticks+_a,1)
_b='  <div style="position: relative; max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 40px) 56px">'; assert _b in _h
S['hero']=_h.replace(_b,row+_b,1)
STICK_CSS="""@media (max-width:1339px){.sticks-side{display:none}.sticks-row{display:flex !important}}
@keyframes st-point{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-14deg)}}
@keyframes st-draw{0%{stroke-dashoffset:100}55%,100%{stroke-dashoffset:0}}
@keyframes st-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes st-grow{0%,100%{transform:scaleY(.35)}55%,80%{transform:scaleY(1)}}
@keyframes st-blink{0%,45%{opacity:1}55%,100%{opacity:.12}}
@keyframes st-drop{0%{transform:translateY(-46px);opacity:0}30%,88%{transform:translateY(0);opacity:1}100%{transform:translateY(0);opacity:0}}
@keyframes st-pop{0%,45%{transform:scale(0) rotate(-40deg);opacity:0}62%{transform:scale(1.25) rotate(0);opacity:1}72%,90%{transform:scale(1);opacity:1}100%{opacity:0}}
@keyframes st-tap{0%,100%{transform:rotate(0)}50%{transform:rotate(9deg)}}
@keyframes st-float{0%{transform:translateY(16px);opacity:0}25%,70%{opacity:1}100%{transform:translateY(-16px);opacity:0}}
@keyframes st-clap{0%,62%,100%{transform:rotate(-24deg)}70%,78%{transform:rotate(0)}}
.st-draw{stroke-dasharray:100;stroke-dashoffset:0}
@media (prefers-reduced-motion:no-preference){
.st-point{animation:st-point 2.4s ease-in-out infinite}.st-draw{animation:st-draw 4s ease-in-out infinite}
.st-bob{animation:st-bob 1.8s ease-in-out infinite}.st-grow{animation:st-grow 4s ease-in-out infinite}
.st-blink{animation:st-blink 2.6s ease-in-out infinite}.st-drop{animation:st-drop 4.5s ease-out infinite}
.st-pop{animation:st-pop 4.5s ease-out infinite}.st-tap{animation:st-tap .45s ease-in-out infinite}
.st-float{animation:st-float 3.6s ease-in-out infinite}.st-spin{animation:spin 5s linear infinite}
.st-clap{animation:st-clap 2.8s ease-in infinite}
.st-d1{animation-delay:-.9s}.st-d2{animation-delay:-1.8s}
}
"""
