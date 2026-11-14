(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- hero particles ---------- */
  (function () {
    var cv = document.querySelector('canvas[data-dsp]');
    if (!cv || !cv.getContext) { return; }
    var ctx = cv.getContext('2d'), host = cv.parentElement;
    var N = window.innerWidth < 700 ? 44 : 80, P = [], k;
    for (k = 0; k < N; k++) {
      P.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005, r: 1.4 + Math.random() * 1.8, near: 0, X: 0, Y: 0 });
    }
    var ptr = { x: 0, y: 0, on: false }, t0 = performance.now(), visible = true, raf = 0;
    host.addEventListener('pointermove', function (e) {
      var b = cv.getBoundingClientRect();
      ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; ptr.on = true;
    });
    host.addEventListener('pointerleave', function () { ptr.on = false; });
    function frame(now) {
      raf = 0;
      var w = cv.clientWidth, h = cv.clientHeight, d = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var px = ptr.x, py = ptr.y, t = (now - t0) / 1000;
      if (!ptr.on) { px = w * (0.5 + 0.36 * Math.sin(t * 0.23)); py = h * (0.5 + 0.3 * Math.sin(t * 0.31 + 1.3)); }
      var a, b2, i, j, dx, dy, dist, lim, al, m;
      for (i = 0; i < N; i++) {
        a = P[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > 1) { a.vx = -a.vx; }
          if (a.y < 0 || a.y > 1) { a.vy = -a.vy; }
        }
        a.X = a.x * w; a.Y = a.y * h;
        dx = px - a.X; dy = py - a.Y; dist = Math.sqrt(dx * dx + dy * dy);
        a.near = dist < 230 ? 1 - dist / 230 : 0;
        if (!reduce && a.near > 0) { a.x += (dx / w) * 0.003 * a.near; a.y += (dy / h) * 0.003 * a.near; }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < N; i++) {
        a = P[i];
        for (j = i + 1; j < N; j++) {
          b2 = P[j];
          m = Math.max(a.near, b2.near);
          lim = 92 + 100 * m;
          dx = a.X - b2.X; dy = a.Y - b2.Y; dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < lim) {
            al = (1 - dist / lim) * (0.12 + 0.55 * m);
            ctx.strokeStyle = 'rgba(27,59,255,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.X, a.Y); ctx.lineTo(b2.X, b2.Y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < N; i++) {
        a = P[i];
        ctx.fillStyle = a.near > 0.05 ? 'rgba(27,59,255,0.95)' : 'rgba(27,59,255,0.28)';
        ctx.beginPath(); ctx.arc(a.X, a.Y, a.r + a.near * 1.8, 0, 6.2832); ctx.fill();
      }
      if (!reduce && visible) { raf = requestAnimationFrame(frame); }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !raf && !reduce) { raf = requestAnimationFrame(frame); }
      }).observe(host);
    }
    raf = requestAnimationFrame(frame);
  })();

  /* ---------- who's asking ---------- */
  (function () {
    var btns = document.querySelectorAll('[data-aud]');
    function pick(n) {
      btns.forEach(function (b) {
        var on = b.getAttribute('data-aud') === n;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.background = on ? '#1B3BFF' : '#FFFFFF';
        b.style.color = on ? '#FFFFFF' : '#0A1A3F';
        b.style.borderColor = on ? '#1B3BFF' : '#C9D4EE';
      });
      document.querySelectorAll('[data-if^="is"]').forEach(function (p) { p.hidden = p.getAttribute('data-if') !== 'is' + n; });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-aud')); }); });
  })();

  /* ---------- puzzle: wire the workflow ---------- */
  var Puzzle = (function () {
    var LEVELS = [
      { n: 4, par: 7, brief: 'Level 1. Connect the problem to the team.', s: 'E1pL1-L2-T0-L3-I3-L1-T3-T1-L3-I0-L3-T0-L1-L2-E0t' },
      { n: 5, par: 12, brief: 'Level 2. Now the data has to reach it too.', s: 'I1-T0-L0-I0-E3dI0-L0-I3-T3-L1-E1pI0-T3-T0-L1-L3-L1-I3-L2-T1-L2-L0-L1-I0-E3t' },
      { n: 5, par: 17, brief: 'Level 3. Problem, data, team and result. Wire them all.', s: 'E2pT3-T1-L3-E2dL1-I0-T0-I0-L1-L0-I0-T3-L3-T1-I3-L0-L3-I0-L1-E0tL3-I3-L1-E0r' }
    ];
    var NAMES = { p: 'PROBLEM', d: 'DATA', t: 'TEAM', r: 'RESULT' };
    var BASE = { I: 5, L: 3, T: 7, X: 15, E: 1 };
    var PATHS = { I: 'M50 0 L50 100', L: 'M50 0 L50 50 L100 50', T: 'M50 0 L50 100 M50 50 L100 50', X: 'M50 0 L50 100 M0 50 L100 50', E: 'M50 0 L50 50' };
    function parse(L) {
      var out = [], i;
      for (i = 0; i < L.s.length; i += 3) { out.push({ t: L.s.charAt(i), r: parseInt(L.s.charAt(i + 1), 10), f: NAMES[L.s.charAt(i + 2)] || '' }); }
      return out;
    }
    function power(n, base, rots) {
      var m = [], i, src = 0;
      for (i = 0; i < base.length; i++) {
        var b = BASE[base[i].t], k = ((rots[i] % 4) + 4) % 4;
        while (k-- > 0) { b = ((b << 1) & 15) | (b >> 3); }
        m.push(b);
        if (base[i].f === 'PROBLEM') { src = i; }
      }
      var on = {}, stack = [src], dirs = [[1, -1, 0, 4], [2, 0, 1, 8], [4, 1, 0, 1], [8, 0, -1, 2]];
      on[src] = true;
      while (stack.length) {
        var cur = stack.pop(), r = Math.floor(cur / n), c = cur % n, d;
        for (d = 0; d < 4; d++) {
          if (m[cur] & dirs[d][0]) {
            var rr = r + dirs[d][1], cc = c + dirs[d][2];
            if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
              var j = rr * n + cc;
              if ((m[j] & dirs[d][3]) && !on[j]) { on[j] = true; stack.push(j); }
            }
          }
        }
      }
      var sinks = 0, lit = 0;
      for (i = 0; i < base.length; i++) { if (base[i].f && base[i].f !== 'PROBLEM') { sinks++; if (on[i]) { lit++; } } }
      return { on: on, sinks: sinks, lit: lit, won: lit === sinks };
    }
    return { LEVELS: LEVELS, parse: parse, power: power, PATHS: PATHS };
  })();
  window.__Puzzle = Puzzle;

  (function () {
    var grid = document.querySelector('[data-grid]');
    if (!grid) { return; }
    var st = { lvl: 0, base: [], rots: [], moves: 0 }, cells = [];
    var SVGNS = 'http://www.w3.org/2000/svg';
    function load(lvl) {
      st.lvl = lvl; st.base = Puzzle.parse(Puzzle.LEVELS[lvl]); st.rots = st.base.map(function (c) { return c.r; }); st.moves = 0;
      var n = Puzzle.LEVELS[lvl].n;
      grid.style.gridTemplateColumns = 'repeat(' + n + ', minmax(0, 1fr))';
      grid.textContent = ''; cells = [];
      st.base.forEach(function (c, idx) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'cell';
        b.style.cssText = 'position:relative;aspect-ratio:1/1;padding:0;border-radius:12px;border:1.5px solid #2A3A66;background:#12265A;cursor:pointer;touch-action:manipulation;overflow:hidden';
        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true');
        svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;transition:transform .22s ease';
        var p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', Puzzle.PATHS[c.t]); p.setAttribute('fill', 'none'); p.setAttribute('stroke-width', '16'); p.setAttribute('stroke-linejoin', 'round');
        var dot = document.createElementNS(SVGNS, 'circle');
        dot.setAttribute('cx', '50'); dot.setAttribute('cy', '50'); dot.setAttribute('r', '11');
        svg.appendChild(p); svg.appendChild(dot); b.appendChild(svg);
        var chip = null;
        if (c.f) {
          chip = document.createElement('span');
          chip.textContent = c.f;
          chip.style.cssText = "position:absolute;inset:14%;border-radius:8px;color:#061230;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:clamp(8px,1.05vw,11px);font-weight:500;letter-spacing:.02em";
          b.appendChild(chip);
        }
        b.addEventListener('click', function () { turn(idx); });
        b.addEventListener('keydown', function (e) { key(e, idx); });
        grid.appendChild(b);
        cells.push({ b: b, svg: svg, p: p, dot: dot, chip: chip });
      });
      paint();
    }
    function turn(idx) {
      var n = Puzzle.LEVELS[st.lvl].n;
      if (st.base[idx].f || Puzzle.power(n, st.base, st.rots).won) { return; }
      st.rots[idx] += 1; st.moves += 1; paint();
    }
    function key(e, idx) {
      var n = Puzzle.LEVELS[st.lvl].n, k = e.key, t = -1, r = Math.floor(idx / n), col = idx % n;
      if (k === 'ArrowRight' && col < n - 1) { t = idx + 1; }
      else if (k === 'ArrowLeft' && col > 0) { t = idx - 1; }
      else if (k === 'ArrowDown' && r < n - 1) { t = idx + n; }
      else if (k === 'ArrowUp' && r > 0) { t = idx - n; }
      else if (k === 'r' || k === 'R') { load(st.lvl); cells[idx].b.focus(); return; }
      if (k.indexOf('Arrow') === 0) { e.preventDefault(); }
      if (t >= 0) { cells[t].b.focus(); }
    }
    function paint() {
      var L = Puzzle.LEVELS[st.lvl], pw = Puzzle.power(L.n, st.base, st.rots), last = st.lvl >= Puzzle.LEVELS.length - 1;
      cells.forEach(function (c, idx) {
        var lit = !!pw.on[idx], f = st.base[idx].f, col = lit ? '#FFFFFF' : '#46598F';
        c.svg.style.transform = 'rotate(' + (st.rots[idx] * 90) + 'deg)';
        c.p.setAttribute('stroke', col); c.dot.setAttribute('fill', col);
        c.b.style.background = lit ? '#1B3BFF' : '#12265A';
        c.b.style.borderColor = lit ? '#8FB0FF' : '#2A3A66';
        if (c.chip) { c.chip.style.background = lit ? '#FFFFFF' : '#C6D2EE'; }
        c.b.setAttribute('aria-label', (f ? f + ', fixed tile' : 'Pipe tile, press to turn') + (lit ? ', connected' : ', not connected'));
      });
      $('pz-level').textContent = (st.lvl + 1) + ' / ' + Puzzle.LEVELS.length;
      $('pz-moves').textContent = String(st.moves);
      $('pz-linked').textContent = pw.lit + ' / ' + pw.sinks;
      var rating = st.moves <= L.par ? 'Sharp thinking' : (st.moves <= Math.round(L.par * 1.6) ? 'Solid work' : 'You got there');
      var box = $('pz-status');
      box.style.background = pw.won ? '#8FB0FF' : '#12265A';
      box.style.color = pw.won ? '#061230' : '#FFFFFF';
      $('pz-tag').textContent = pw.won ? (rating + ' · ' + st.moves + ' moves, best is ' + L.par) : 'Your brief';
      $('pz-msg').textContent = pw.won ? (last ? 'All wired. That is the job: connect the real problem to data, to people, to a result.' : 'Connected. Nothing moved until the last link did.') : L.brief;
      if (pw.won && !st.wonShown) { st.wonShown = true; var rc = box.getBoundingClientRect(); if (rc.top < 0 || rc.bottom > window.innerHeight) { box.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } }
      if (!pw.won) { st.wonShown = false; }
      document.querySelector('[data-if="g.showNext"]').hidden = !(pw.won && !last);
      document.querySelector('[data-if="g.showEnd"]').hidden = !(pw.won && last);
    }
    var acts = {
      nextLevel: function () { load(Math.min(st.lvl + 1, Puzzle.LEVELS.length - 1)); },
      restart: function () { load(0); },
      resetLevel: function () { load(st.lvl); }
    };
    document.querySelectorAll('[data-act]').forEach(function (el) {
      var a = acts[el.getAttribute('data-act')];
      if (a) { el.addEventListener('click', a); }
    });
    load(0);
  })();

  /* ---------- the decision room ---------- */
  (function () {
    if (!$('dr-intro')) { return; }
    var R = [
      { step: 'Diagnose', title: 'The board wants AI. Where do you start?', opts: [
        { label: 'Buy an enterprise AI suite for the whole company', short: 'Bought an AI suite for everyone', c: 6, i: 5, a: -10, g: 0, text: 'Tools first. Nobody knows which problem it solves, so the licences sit unused.' },
        { label: 'Spend a week finding where time and money actually leak', short: 'Found the real leak first', c: 1, i: 20, a: 15, g: 2, text: 'Problem first. You find that content and customer replies eat most of the team week.' },
        { label: 'Ask every department to try ChatGPT on their own', short: 'Let every team experiment alone', c: 0, i: 5, a: 5, g: 1, text: 'Cheap, but scattered. Ten people, ten habits and no shared result.' }] },
      { step: 'Define', title: 'Content and customer replies are eating the week. What is the goal?', opts: [
        { label: 'Use AI across the company', short: 'Set a vague, company-wide goal', c: 0, i: 0, a: -5, g: 0, text: 'Too vague to measure, so nothing gets measured and nothing changes.' },
        { label: 'Halve the time from product brief to live listing, without losing brand voice', short: 'Set one clear, measurable goal', c: 0, i: 20, a: 10, g: 2, text: 'One clear target the team can see. Now there is something to scale.' },
        { label: 'Replace the content team with AI', short: 'Tried to replace the team', c: 0, i: 5, a: -25, g: 0, text: 'Costs look good for a month. Then the brand voice goes flat and your best people leave.' }] },
      { step: 'Design', title: 'How do you build it?', opts: [
        { label: 'Take an off-the-shelf tool exactly as it ships', short: 'Used a generic tool as is', c: 2, i: 10, a: 5, g: 1, text: 'Fine for generic copy. Your brand voice and approval flow do not fit it.' },
        { label: 'Design a workflow around your brand voice and approval steps', short: 'Designed a workflow for this brand', c: 3, i: 25, a: 10, g: 2, text: 'Built for this business and no other. The team recognises its own process in it.' },
        { label: 'Commission a custom AI platform from scratch', short: 'Built a platform from scratch', c: 8, i: 10, a: -5, g: 0, text: 'Six months and most of the budget for a problem a workflow would have solved.' }] },
      { step: 'Deploy', title: 'The pilot works. Now what?', opts: [
        { label: 'Email everyone a PDF guide', short: 'Sent a PDF guide', c: 0, i: 0, a: -10, g: 0, text: 'Nobody opens it. By Friday everyone is back to the old way.' },
        { label: 'Train the team hands-on, on real work, with one owner per team', short: 'Trained people on real work', c: 2, i: 15, a: 30, g: 2, text: 'The team runs it without you. This is the only step that makes the rest count.' },
        { label: 'Keep it with the two people who built it', short: 'Kept it with two experts', c: 0, i: 5, a: -15, g: 1, text: 'It works until one of them goes on leave.' }] }
    ];
    var TAGS = ['Costly call', 'Half right', 'Strong call'], KEYS = ['A', 'B', 'C'];
    var s;
    function reset() { s = { phase: 'intro', r: 0, picked: null, impact: 20, adopt: 40, budget: 10, log: [] }; }
    function clamp(v) { return Math.max(0, Math.min(100, v)); }
    function el(tag, css, text) { var e = document.createElement(tag); if (css) { e.style.cssText = css; } if (text != null) { e.textContent = text; } return e; }
    var MONO = "font-family:'JetBrains Mono',ui-monospace,monospace;";
    function render() {
      $('dr-intro').hidden = s.phase !== 'intro';
      $('dr-play').hidden = s.phase !== 'play';
      $('dr-done').hidden = s.phase !== 'done';
      $('dr-impact').textContent = String(s.impact); $('dr-impact-bar').style.width = s.impact + '%';
      $('dr-adopt').textContent = String(s.adopt); $('dr-adopt-bar').style.width = s.adopt + '%';
      var over = s.budget < 0;
      $('dr-budget').textContent = over ? 'Over by ₹' + (-s.budget) + ' lakh' : '₹' + s.budget + ' lakh left';
      $('dr-budget-bar').style.width = Math.max(0, Math.min(100, s.budget * 10)) + '%';
      var steps = $('dr-steps'); steps.textContent = '';
      R.forEach(function (r, idx) {
        var done = s.phase === 'done' || idx < s.r || (idx === s.r && s.picked !== null && s.phase === 'play');
        var cur = s.phase === 'play' && idx === s.r;
        var row = el('div', 'display:flex;align-items:center;gap:12px;font-size:15px;color:' + ((done || cur) ? '#FFFFFF' : '#A9B8DD'));
        row.appendChild(el('span', 'flex:none;width:12px;height:12px;border-radius:50%;background:' + (done ? '#8FB0FF' : (cur ? '#FFFFFF' : 'transparent')) + ';border:1.5px solid ' + (done ? '#8FB0FF' : (cur ? '#FFFFFF' : '#56689A'))));
        row.appendChild(el('span', '', (idx + 1) + '. ' + r.step));
        steps.appendChild(row);
      });
      if (s.phase === 'play') {
        var round = R[s.r];
        $('dr-kicker').textContent = 'Decision ' + (s.r + 1) + ' of ' + R.length + ' · ' + round.step;
        $('dr-title').textContent = round.title;
        var box = $('dr-opts'); box.textContent = '';
        round.opts.forEach(function (o, idx) {
          var chosen = s.picked === idx, locked = s.picked !== null;
          var b = el('button', 'display:flex;align-items:center;gap:16px;width:100%;min-height:64px;padding:14px 18px;border-radius:16px;border:1.5px solid ' + (chosen ? '#1B3BFF' : '#C9D4EE') + ';background:' + (chosen ? '#1B3BFF' : '#FFFFFF') + ';color:' + (chosen ? '#FFFFFF' : '#0A1A3F') + ';opacity:' + ((locked && !chosen) ? '0.5' : '1') + ';font:inherit;font-size:16.5px;line-height:1.4;text-align:left;cursor:pointer');
          b.type = 'button'; b.className = 'opt'; b.disabled = locked;
          b.appendChild(el('span', 'flex:none;width:34px;height:34px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:13px;' + MONO, KEYS[idx]));
          b.appendChild(el('span', 'flex:1;min-width:0', o.label));
          b.appendChild(el('span', 'flex:none;font-size:12px;letter-spacing:.06em;' + MONO, o.c > 0 ? '₹' + o.c + ' lakh' : 'No cost'));
          b.addEventListener('click', function () { pick(idx); });
          box.appendChild(b);
        });
        var fb = $('dr-fb');
        fb.hidden = s.picked === null;
        if (s.picked !== null) {
          var p = round.opts[s.picked];
          fb.style.background = p.g === 2 ? '#D5E2FF' : (p.g === 1 ? '#EEF2FB' : '#0A1A3F');
          fb.style.color = p.g === 0 ? '#FFFFFF' : '#0A1A3F';
          $('dr-fb-tag').textContent = TAGS[p.g] + ' · Impact ' + (p.i >= 0 ? '+' : '') + p.i + ' · Adoption ' + (p.a >= 0 ? '+' : '') + p.a + ' · ' + (p.c > 0 ? 'Spend ₹' + p.c + ' lakh' : 'No spend');
          $('dr-fb-text').textContent = p.text;
          var nx = $('dr-next');
          nx.textContent = s.r >= R.length - 1 ? 'See my result' : 'Next decision';
          nx.style.background = p.g === 0 ? '#FFFFFF' : '#1B3BFF';
          nx.style.color = p.g === 0 ? '#0A1A3F' : '#FFFFFF';
        }
      }
      if (s.phase === 'done') {
        var score = Math.max(0, Math.round((s.impact + s.adopt) / 2) - (over ? 10 : 0));
        var v = score >= 80
          ? ['AI-fluent leader.', 'You started with the problem, set one clear goal, built for your own business and trained your people. That is the whole method, and it is exactly how I work with clients.']
          : (score >= 50
            ? ['Halfway there.', 'Some strong calls and a few shortcuts. The shortcuts are usually where AI projects stall: a vague goal, a generic tool, or a team that was never trained.']
            : ['Tool collector.', 'You bought before you understood the problem. Most stalled AI projects look exactly like this, and they are fixable once the real problem is on the table.']);
        $('dr-score').textContent = 'Your result · ' + score + ' / 100';
        $('dr-verdict').textContent = v[0];
        $('dr-verdict-text').textContent = v[1];
        var log = $('dr-log'); log.textContent = '';
        s.log.forEach(function (l) {
          var row = el('div', 'display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;padding:12px 0;border-bottom:1px solid #DCE4F5;font-size:15.5px');
          row.appendChild(el('span', 'flex:none;width:96px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#1B3BFF;' + MONO, l.step));
          row.appendChild(el('span', 'flex:1 1 260px;min-width:0', l.label));
          row.appendChild(el('span', 'flex:none;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#3D4C70;' + MONO, l.tag));
          log.appendChild(row);
        });
      }
    }
    function pick(idx) {
      if (s.picked !== null) { return; }
      var o = R[s.r].opts[idx];
      s.picked = idx; s.impact = clamp(s.impact + o.i); s.adopt = clamp(s.adopt + o.a); s.budget -= o.c;
      s.log.push({ step: R[s.r].step, label: o.short, tag: TAGS[o.g] });
      render();
      $('dr-next').focus();
    }
    document.querySelectorAll('[data-act="drStart"]').forEach(function (b) {
      b.addEventListener('click', function () { reset(); s.phase = 'play'; render(); });
    });
    $('dr-next').addEventListener('click', function () {
      if (s.r >= R.length - 1) { s.phase = 'done'; s.picked = null; } else { s.r += 1; s.picked = null; }
      render();
    });
    reset(); render();
  })();
  /* ---------- contact form ---------- */
  (function () {
    var form = $('contact-form');
    if (!form) { return; }
    var ENDPOINT = 'https://formsubmit.co/ajax/dasachin@xdotai.in';
    var err = $('contact-error'), btn = $('contact-send'), done = $('contact-done');
    function fail(msg) { err.textContent = msg; err.hidden = false; btn.disabled = false; btn.textContent = 'Send message'; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var f = form.elements, bad = null;
      ['name', 'email', 'company', 'message'].forEach(function (k) {
        var el = f[k], ok = el.value.trim().length > 0 && (k !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()));
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) { bad = el; }
      });
      if (bad) { fail(bad.name === 'email' ? 'Please enter a valid work email.' : 'Please fill in your name, work email, company and the problem.'); bad.focus(); return; }
      if (f._honey.value) { form.hidden = true; done.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'Sending...';
      var data = {
        name: f.name.value.trim(), email: f.email.value.trim(), company: f.company.value.trim(), role: f.role.value.trim(),
        phone: f.phone.value.trim(), team_size: f.team_size.value, need: f.need.value, message: f.message.value.trim(),
        _subject: 'dasachin.com enquiry: ' + f.need.value + ' (' + f.company.value.trim() + ')', _template: 'table', _captcha: 'false'
      };
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === 'true') { form.hidden = true; done.hidden = false; done.focus(); done.scrollIntoView({ block: 'center' }); }
          else { fail('The message could not be sent. Please try again in a minute, or reach me on LinkedIn.'); }
        })
        .catch(function () { fail('The message could not be sent. Please check your connection and try again, or reach me on LinkedIn.'); });
    });
  })();
})();
