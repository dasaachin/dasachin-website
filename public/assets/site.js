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
  /* ---------- latest writing from Medium ---------- */
  (function () {
    var box = document.querySelector('[data-medium]');
    if (!box) { return; }
    var limit = parseInt(box.getAttribute('data-medium'), 10) || 12;
    var wrap = document.querySelector('[data-medium-wrap]'), empty = document.querySelector('[data-medium-empty]');
    function el(tag, css, text) { var e = document.createElement(tag); if (css) { e.style.cssText = css; } if (text != null) { e.textContent = text; } return e; }
    var MONO = "font-family:'JetBrains Mono',ui-monospace,monospace;";
    function none() { box.textContent = ''; if (empty) { empty.hidden = false; } else if (wrap) { wrap.hidden = true; } }
    fetch('/api/medium').then(function (r) { return r.ok ? r.json() : { items: [] }; }).then(function (j) {
      var items = (j.items || []).slice(0, limit);
      if (!items.length) { none(); return; }
      box.textContent = '';
      items.forEach(function (it) {
        var a = el('a', 'display:flex;flex-direction:column;border-radius:24px;overflow:hidden;background:#FFFFFF;border:1px solid #C9D4EE;color:#0A1A3F;text-decoration:none');
        a.href = it.url; a.className = 'lift';
        var top = el('div', 'aspect-ratio:16/9;background:#1B3BFF;display:flex;align-items:flex-end;padding:20px;overflow:hidden;position:relative');
        if (it.image) {
          var im = el('img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover');
          im.src = it.image; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
          im.addEventListener('error', function () { im.remove(); });
          top.appendChild(im);
        } else {
          top.appendChild(el('span', "font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:64px;line-height:1;color:#FFFFFF", (it.title || 'A').charAt(0)));
        }
        a.appendChild(top);
        var body = el('div', 'display:flex;flex-direction:column;gap:12px;padding:24px;flex:1');
        body.appendChild(el('div', 'font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#3D4C70;' + MONO, [it.dateText, it.minutes ? it.minutes + ' min read' : ''].filter(Boolean).join(' · ')));
        body.appendChild(el('h3', 'margin:0;font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.12', it.title));
        body.appendChild(el('p', 'margin:0;font-size:15.5px;line-height:1.55;color:#3D4C70', it.excerpt));
        body.appendChild(el('span', 'margin-top:auto;font-weight:600;color:#1B3BFF;font-size:15px', 'Read article'));
        a.appendChild(body);
        box.appendChild(a);
      });
      if (wrap) { wrap.hidden = false; }
    }).catch(none);
  })();
  /* ---------- AI readiness assessment ---------- */
  (function () {
    if (!$('as-intro')) { return; }
    var DIMS = [
      { k: 'Leadership and strategy', svc: 'AI consulting for managements', why: 'The first gap is at the top: AI needs an owner, a budget and a business reason before any tool is chosen.',
        d: ['AI has no owner and no place in the plan yet. Until leadership names what AI is for, every tool bought is a guess.', 'Leadership is interested and some priorities exist, but ownership, budget or targets are still loose. Work starts and stalls.', 'AI has an owner, money and a business reason. This is the foundation the other four areas are built on.'] },
      { k: 'Problem clarity', svc: 'A Diagnose and Define session', why: 'The first gap is the brief: the business problems AI should solve are not yet named and measured.',
        d: ['The company wants to "use AI" but has not named the problems it should solve. This is the most common reason AI projects fail.', 'You know roughly where AI could help, but the problems are not measured, so nobody can say later whether it worked.', 'You can name the problems, you know how the work is done today, and you have numbers to move. Solutions can be designed against something real.'] },
      { k: 'Data, tools and workflow', svc: 'Custom AI tools and workflows', why: 'The first gap is in the plumbing: information is scattered and AI use has not become a repeatable workflow.',
        d: ['The information AI needs is in people\'s heads and inboxes, and tool use is individual. Results cannot be repeated or shared.', 'Some tools and organised material are in place, but AI is still an experiment for most work, not a documented way of working.', 'Your material is organised, tools are chosen deliberately and at least some AI workflows are part of regular work.'] },
      { k: 'People and skills', svc: 'AI training for teams', why: 'The first gap is in the team: people have not been trained on their own work, so usage depends on a few enthusiasts.',
        d: ['Few people use AI and nobody has been trained. Any workflow you build will sit unused until that changes.', 'Some people use AI and want direction. Without hands-on training on their real work, usage stays uneven.', 'Most of the team uses AI with confidence and shares what works. This is what makes results last.'] },
      { k: 'Guardrails and measurement', svc: 'AI consulting for managements', why: 'The first gap is control: there are no clear rules, review steps or measures for AI work.',
        d: ['There are no rules for what goes into AI tools, no defined review, and no measurement. This is a risk to client data and to the brand.', 'There is some guidance and some review, but it depends on the person. Results are known through stories, not numbers.', 'People know the rules, output is reviewed before it goes out, and results are tracked against business numbers.'] }
    ];
    var QS = [
      [0, 'How does your leadership team deal with AI today?', ['It has not come up seriously', 'We discuss it, but nobody owns it', 'One leader owns it, with a few stated priorities', 'It is in the business plan, with an owner, budget and targets'], 'Name one leader who owns AI, and write down the two or three business outcomes it must support this year.'],
      [0, 'Is money and time set aside for AI work?', ['No budget and no time', 'Ad hoc: people pay for tools themselves and fit it in where they can', 'A budget for pilots this year', 'A recurring budget and protected time for teams'], 'Set a small pilot budget and protect a few hours a week for the people running it.'],
      [0, 'If AI saved a team ten hours a week, do you know where those hours should go?', ['We have not thought about it', 'A rough idea', 'Clear for one or two teams', 'Yes, tied to growth or cost targets'], 'Decide in advance what saved time is for: more output, faster delivery or new work. Otherwise the saving disappears.'],
      [1, 'Can you name the top three business problems you want AI to solve?', ['No, we just want to use AI', 'One, loosely', 'Yes, but they are not measured', 'Yes, each with a number we want to move'], 'Run a working session with decision makers to list where time and money leak, and pick three problems worth solving.'],
      [1, 'How do AI ideas get chosen?', ['Whichever tool is trending', 'Whoever is most excited about it', 'By likely impact, informally', 'A shortlist scored on impact, effort and risk'], 'Score every AI idea on impact, effort and risk, and start with the one that wins on all three.'],
      [1, 'Do you know how the work is done today in the areas you want to improve: steps, time and cost?', ['No', 'Roughly, from memory', 'Documented for some processes', 'Measured, with a baseline'], 'Map the current steps and time for one process before changing it, so you have a baseline to compare against.'],
      [2, 'Where does the information AI would need live: brand guidelines, product data, past work, customer queries?', ['In people\'s heads and chats', 'Scattered across drives and inboxes', 'Mostly organised, with gaps', 'Organised, current and easy to give to a tool'], 'Collect brand guidelines, product information and your best past work in one shared place. AI can only be as good as what you give it.'],
      [2, 'Which AI tools does the company use?', ['None', 'Personal accounts, each person their own', 'Company accounts for a few tools', 'A chosen set, with shared prompts, templates or custom workflows'], 'Choose a small set of tools on company accounts and build shared prompts and templates for your most repeated tasks.'],
      [2, 'Has any AI workflow become part of regular work, not a one-off experiment?', ['No', 'For a few individuals', 'One team uses one regularly', 'Several teams, with documented steps'], 'Take one experiment that worked, document the steps and make it the standard way one team does that task.'],
      [3, 'How many of the people who could benefit use AI at least weekly?', ['Almost none', 'A few enthusiasts', 'About half', 'Most of them'], 'Pick the two or three tasks every team member does weekly and show each person how AI fits into exactly those.'],
      [3, 'What AI training has the team had?', ['None', 'Self-taught, from videos and articles', 'A one-time workshop', 'Hands-on training on our own work, with follow-up'], 'Train the team hands-on, on their own real work, with a follow-up session. One-time workshops are forgotten within a week.'],
      [3, 'How do people feel about AI at work?', ['Worried or resistant', 'Curious, but unsure where to start', 'Willing and waiting for direction', 'Confident and sharing what works'], 'Address the fear directly: show what AI changes in each role and what it does not, and let people try it on low-risk work first.'],
      [4, 'Are there rules for AI use: confidential data, client information, disclosure?', ['None', 'Unwritten common sense', 'Some written guidance', 'A clear policy that people know and follow'], 'Write a one-page AI use policy: what may never be pasted into a tool, which tools are approved and when to tell a client.'],
      [4, 'Who checks AI output before it goes out?', ['Nobody in particular', 'It depends on the person', 'A reviewer for important work', 'Defined review steps for brand, facts and legal'], 'Define who reviews AI output for brand, facts and legal risk before anything reaches a client or the public.'],
      [4, 'Do you measure results from AI work?', ['No', 'Only through stories', 'Time saved is tracked on some tasks', 'Tracked against business numbers and reviewed regularly'], 'Track one number per AI workflow, such as hours saved or turnaround time, and review it monthly.']
    ];
    var LEVELS = [
      [0, 'Exploring', 'AI is still an idea in your company, not a way of working. That is a fine place to start, as long as you start with the business problem and not with a tool.'],
      [35, 'Experimenting', 'People are trying things, but the effort is scattered. Individual wins are not turning into company results because the basics underneath are missing.'],
      [60, 'Building', 'The foundations are in place and some AI work is real. The job now is to close the weakest area so that what works in one team spreads to the rest.'],
      [80, 'Scaling', 'AI is part of how your company works. Your gains now come from depth: custom workflows, sharper measurement and keeping the team ahead.']
    ];
    var KEY = 'dss-ai-readiness-v1', ans = [], size = '11 to 50', cur = 0;
    try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv && sv.ans && sv.ans.length === QS.length) { ans = sv.ans; size = sv.size || size; } } catch (e) { /* storage unavailable */ }
    function save() { try { localStorage.setItem(KEY, JSON.stringify({ ans: ans, size: size })); } catch (e) { /* ignore */ } }
    function el(tag, css, text) { var e = document.createElement(tag); if (css) { e.style.cssText = css; } if (text != null) { e.textContent = text; } return e; }
    function add(p) { for (var i = 1; i < arguments.length; i++) { if (arguments[i]) { p.appendChild(arguments[i]); } } return p; }
    var MONO = "font-family:'JetBrains Mono',ui-monospace,monospace;", SERIF = "font-family:'Instrument Serif',Georgia,serif;";
    var EB = MONO + 'font-size:12px;letter-spacing:.14em;text-transform:uppercase;';
    function show(id) { ['as-intro', 'as-quiz', 'as-report'].forEach(function (x) { $(x).hidden = x !== id; }); window.scrollTo({ top: 0, behavior: 'auto' }); }

    function ask() {
      var q = QS[cur];
      $('as-count').textContent = 'Question ' + (cur + 1) + ' of ' + QS.length;
      $('as-dim').textContent = DIMS[q[0]].k;
      $('as-bar').style.width = (cur / QS.length * 100) + '%';
      $('as-prog').setAttribute('aria-valuenow', String(cur));
      $('as-q').textContent = q[1];
      var box = $('as-opts'); box.textContent = '';
      q[2].forEach(function (label, i) {
        var on = ans[cur] === i;
        var b = el('button', 'display:flex;align-items:center;gap:16px;width:100%;min-height:64px;padding:14px 20px;border-radius:16px;border:1.5px solid ' + (on ? '#1B3BFF' : '#C9D4EE') + ';background:' + (on ? '#1B3BFF' : '#FFFFFF') + ';color:' + (on ? '#FFFFFF' : '#0A1A3F') + ';font:inherit;font-size:17px;line-height:1.4;text-align:left;cursor:pointer');
        b.type = 'button'; b.className = 'opt'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
        add(b, el('span', 'flex:none;width:34px;height:34px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:13px;' + MONO, String(i + 1)), el('span', 'flex:1;min-width:0', label));
        b.addEventListener('click', function () { ans[cur] = i; save(); if (cur < QS.length - 1) { cur += 1; ask(); $('as-q').focus(); } else { report(); } });
        box.appendChild(b);
      });
      $('as-back').textContent = cur === 0 ? 'Back to start' : 'Back';
    }
    $('as-back').addEventListener('click', function () { if (cur === 0) { show('as-intro'); } else { cur -= 1; ask(); } });
    $('as-start').addEventListener('click', function () {
      var c = document.querySelector('#as-size input:checked'); size = c ? c.value : size;
      ans = []; cur = 0; save(); show('as-quiz'); ask(); $('as-q').focus();
    });

    function calc() {
      var dim = DIMS.map(function () { return 0; }), total = 0;
      QS.forEach(function (q, i) { dim[q[0]] += ans[i]; total += ans[i]; });
      var pct = Math.round(total / (QS.length * 3) * 100), lvl = LEVELS[0];
      LEVELS.forEach(function (l) { if (pct >= l[0]) { lvl = l; } });
      var dims = dim.map(function (v, i) { return { i: i, name: DIMS[i].k, pct: Math.round(v / 9 * 100), band: v <= 3 ? 0 : (v <= 6 ? 1 : 2) }; });
      var order = dims.slice().sort(function (a, b) { return a.pct - b.pct || a.i - b.i; });
      var gaps = QS.map(function (q, i) { return { i: i, s: ans[i], d: q[0], fix: q[3] }; }).filter(function (g) { return g.s < 3; })
        .sort(function (a, b) { return a.s - b.s || order.findIndex(function (o) { return o.i === a.d; }) - order.findIndex(function (o) { return o.i === b.d; }) || a.i - b.i; });
      return { pct: pct, total: total, lvl: lvl, dims: dims, weakest: order[0], strongest: order[order.length - 1], gaps: gaps };
    }
    function summary(r) {
      var L = ['AI readiness report (dasachin.com)', 'Company size: ' + size, 'Overall: ' + r.pct + ' / 100 (' + r.lvl[1] + ')', ''];
      r.dims.forEach(function (d) { L.push(d.name + ': ' + d.pct + '%'); });
      L.push('', 'Weakest area: ' + r.weakest.name, 'Suggested starting point: ' + DIMS[r.weakest.i].svc, '', 'Priority actions:');
      r.gaps.slice(0, 6).forEach(function (g, n) { L.push((n + 1) + '. ' + g.fix); });
      L.push('', 'Answers (0 to 3 each): ' + ans.join(' '));
      return L.join('\n');
    }
    function report() {
      var r = calc(), R = $('as-report'); R.textContent = '';
      R.style.cssText = 'display:flex;flex-direction:column;gap:56px';
      // header
      var C = 2 * Math.PI * 54, ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ring.setAttribute('viewBox', '0 0 120 120'); ring.setAttribute('role', 'img'); ring.setAttribute('aria-label', 'Score ' + r.pct + ' out of 100'); ring.style.cssText = 'width:min(220px,60vw);height:auto;flex:none';
      ring.innerHTML = '<circle cx="60" cy="60" r="54" fill="none" stroke="#D5E2FF" stroke-width="10"></circle><circle cx="60" cy="60" r="54" fill="none" stroke="#1B3BFF" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (C * r.pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 60 60)"></circle><text x="60" y="66" text-anchor="middle" style="font:800 34px \'Bricolage Grotesque\',system-ui,sans-serif;fill:#0A1A3F;letter-spacing:-1px">' + r.pct + '</text><text x="60" y="84" text-anchor="middle" style="font:500 9px \'JetBrains Mono\',monospace;fill:#3D4C70;letter-spacing:1px">OUT OF 100</text>';
      var head = el('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:clamp(24px,5vw,56px)');
      var ht = el('div', 'flex:1 1 360px;min-width:0;display:flex;flex-direction:column;gap:16px');
      add(ht, el('div', EB + 'color:#3D4C70', 'Your AI readiness report · company of ' + size),
        el('h1', 'margin:0;font-size:clamp(44px,6.4vw,88px);font-weight:800;letter-spacing:-.045em;line-height:.98', r.lvl[1] + '.'),
        el('p', 'margin:0;max-width:560px;font-size:19px;line-height:1.55;color:#33415F', r.lvl[2]));
      R.appendChild(add(head, ring, ht));
      // dimensions
      var sec = el('section', 'display:flex;flex-direction:column;gap:0');
      add(sec, el('div', EB + 'color:#3D4C70;padding-bottom:16px', 'The five areas'));
      r.dims.forEach(function (d) {
        var row = el('div', 'display:flex;flex-wrap:wrap;gap:12px 32px;padding:24px 0;border-top:1px solid #C9D4EE');
        var left = el('div', 'flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:12px');
        var top = el('div', 'display:flex;justify-content:space-between;align-items:baseline;gap:12px');
        add(top, el('h2', 'margin:0;font-size:22px;font-weight:800;letter-spacing:-.02em', d.name), el('span', MONO + 'font-size:15px', d.pct + '%'));
        var track = el('div', 'height:10px;border-radius:999px;background:#D5E2FF;overflow:hidden');
        track.appendChild(el('div', 'height:100%;width:' + d.pct + '%;border-radius:999px;background:' + (d.band === 0 ? '#0A1A3F' : (d.band === 1 ? '#5B7BFF' : '#1B3BFF'))));
        add(left, top, track, el('span', EB + 'font-size:11px;color:' + (d.band === 2 ? '#1B3BFF' : '#0A1A3F'), ['Needs attention first', 'Partly in place', 'A strength'][d.band]));
        add(row, left, el('p', 'flex:1.4 1 320px;min-width:0;margin:0;font-size:16.5px;line-height:1.6;color:#33415F', DIMS[d.i].d[d.band]));
        sec.appendChild(row);
      });
      R.appendChild(sec);
      // what it means
      var two = el('section', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:20px');
      var w = el('div', 'padding:32px;border-radius:28px;background:#061230;color:#FFFFFF;display:flex;flex-direction:column;gap:12px');
      add(w, el('div', EB + 'color:#A9B8DD', 'Where to start'), el('div', 'font-size:28px;font-weight:800;letter-spacing:-.03em;line-height:1.08', r.weakest.name), el('p', 'margin:0;font-size:16px;line-height:1.55;color:#C6D2EE', DIMS[r.weakest.i].why));
      var st = el('div', 'padding:32px;border-radius:28px;background:#FFFFFF;border:1px solid #C9D4EE;display:flex;flex-direction:column;gap:12px');
      add(st, el('div', EB + 'color:#1B3BFF', 'What you can build on'), el('div', 'font-size:28px;font-weight:800;letter-spacing:-.03em;line-height:1.08', r.strongest.pct > r.weakest.pct ? r.strongest.name : 'An even start'),
        el('p', 'margin:0;font-size:16px;line-height:1.55;color:#3D4C70', r.strongest.pct > r.weakest.pct ? 'This is your strongest area at ' + r.strongest.pct + '%. Use it to pull the weaker areas up, not as a reason to skip them.' : 'All five areas scored the same, so there is no single weak link. Work through the plan below in order.'));
      R.appendChild(add(two, w, st));
      // plan
      var plan = el('section', 'display:flex;flex-direction:column;gap:20px');
      add(plan, el('div', EB + 'color:#3D4C70', 'Your 90-day plan, in order of priority'));
      if (!r.gaps.length) {
        plan.appendChild(el('p', 'margin:0;font-size:18px;line-height:1.6;color:#33415F', 'You chose the highest answer for every question. Your next gains are in depth: custom workflows built around your business and sharper measurement of what they return.'));
      } else {
        var grid = el('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:20px');
        [['First 30 days', 0, 3], ['Days 31 to 60', 3, 6], ['Days 61 to 90', 6, 9]].forEach(function (p) {
          var items = r.gaps.slice(p[1], p[2]); if (!items.length) { return; }
          var card = el('div', 'padding:28px;border-radius:24px;background:#FFFFFF;border:1px solid #C9D4EE;display:flex;flex-direction:column;gap:16px');
          card.appendChild(el('h2', 'margin:0;font-size:24px;font-weight:800;letter-spacing:-.02em', p[0]));
          var ol = el('ol', 'margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px');
          items.forEach(function (g) {
            var li = el('li', 'display:flex;flex-direction:column;gap:4px;padding-top:14px;border-top:1px solid #DCE4F5');
            add(li, el('span', EB + 'font-size:11px;color:#1B3BFF', DIMS[g.d].k), el('span', 'font-size:16px;line-height:1.5', g.fix));
            ol.appendChild(li);
          });
          grid.appendChild(add(card, ol));
        });
        plan.appendChild(grid);
      }
      R.appendChild(plan);
      // call to action
      var cta = el('section', 'padding:clamp(28px,4vw,48px);border-radius:28px;background:#1B3BFF;color:#FFFFFF;display:flex;flex-wrap:wrap;gap:36px');
      cta.className = 'noprint';
      var cl = el('div', 'flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:14px');
      add(cl, el('div', EB + 'color:#E7EEFF', 'Suggested starting point'), el('h2', 'margin:0;font-size:clamp(30px,3.6vw,46px);font-weight:800;letter-spacing:-.035em;line-height:1.02', DIMS[r.weakest.i].svc),
        el('p', 'margin:0;font-size:17px;line-height:1.55;color:#F0F4FF', 'Send me this report and I will go through it with you on a call: what I would fix first in your business, and what it would take. There is no charge for the review call.'));
      var f = el('form', 'flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:12px'); f.noValidate = true;
      function field(name, label, type, auto) { var l = el('label', 'display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600'); var i = el('input', 'font:inherit;font-weight:400;font-size:16px;color:#0A1A3F;background:#FFFFFF;border:1.5px solid #FFFFFF;border-radius:12px;padding:13px 16px;min-height:50px;width:100%'); i.type = type; i.name = name; i.autocomplete = auto; i.required = true; return add(l, el('span', '', label), i); }
      var msg = el('div', 'font-size:15px;line-height:1.5'); msg.setAttribute('role', 'alert'); msg.hidden = true;
      var sb = el('button', 'align-self:flex-start;min-height:54px;padding:0 28px;border-radius:999px;border:none;background:#FFFFFF;color:#0A1A3F;font:inherit;font-weight:600;font-size:17px;cursor:pointer', 'Send report and request a call'); sb.type = 'submit'; sb.className = 'btn';
      add(f, field('name', 'Your name', 'text', 'name'), field('email', 'Work email', 'email', 'email'), field('company', 'Company', 'text', 'organization'), msg, sb);
      f.addEventListener('submit', function (e) {
        e.preventDefault(); msg.hidden = true;
        var n = f.elements.name.value.trim(), em = f.elements.email.value.trim(), co = f.elements.company.value.trim();
        if (!n || !co || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { msg.textContent = 'Please enter your name, a valid work email and your company.'; msg.hidden = false; return; }
        sb.disabled = true; sb.textContent = 'Sending...';
        fetch('https://formsubmit.co/ajax/dasachin@xdotai.in', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: n, email: em, company: co, company_size: size, score: r.pct + ' / 100 (' + r.lvl[1] + ')', weakest_area: r.weakest.name, report: summary(r), _subject: 'AI readiness report: ' + co + ' scored ' + r.pct, _template: 'table', _captcha: 'false' }) })
          .then(function (x) { return x.json().then(function (j) { return x.ok && String(j.success) === 'true'; }); })
          .then(function (ok) {
            if (ok) { f.textContent = ''; add(f, el('div', 'font-size:26px;font-weight:800;letter-spacing:-.02em', 'Report sent.'), el('p', 'margin:0;font-size:17px;line-height:1.55', 'Thank you, ' + n + '. I will read it and reply to you personally to set up the call.')); }
            else { sb.disabled = false; sb.textContent = 'Send report and request a call'; msg.textContent = 'The report could not be sent. Please try again in a minute, or use the contact page.'; msg.hidden = false; }
          })
          .catch(function () { sb.disabled = false; sb.textContent = 'Send report and request a call'; msg.textContent = 'The report could not be sent. Please check your connection and try again.'; msg.hidden = false; });
      });
      R.appendChild(add(cta, cl, f));
      // tools + method
      var tools = el('div', 'display:flex;flex-wrap:wrap;gap:12px'); tools.className = 'noprint';
      function tool(label, fn) { var b = el('button', 'min-height:46px;padding:0 20px;border-radius:999px;border:1.5px solid #0A1A3F;background:transparent;color:#0A1A3F;font:inherit;font-weight:600;font-size:15px;cursor:pointer', label); b.type = 'button'; b.addEventListener('click', function () { fn(b); }); return b; }
      add(tools, tool('Print or save as PDF', function () { window.print(); }),
        tool('Copy report as text', function (b) { var t = summary(r); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = 'Copy not available'; }); }),
        tool('Retake the assessment', function () { ans = []; cur = 0; save(); show('as-intro'); }));
      R.appendChild(tools);
      R.appendChild(el('p', 'margin:0;max-width:720px;font-size:14px;line-height:1.6;color:#3D4C70', 'How this is scored: each answer scores 0 to 3. Your overall score is your total out of ' + (QS.length * 3) + ', shown out of 100, and each area is scored the same way from its three questions. The plan lists the actions for your lowest answers first. This is a self-assessment based only on your answers, not an audit of your company.'));
      show('as-report');
    }
    if (ans.length === QS.length && ans.every(function (a) { return a >= 0 && a <= 3; })) { report(); }
  })();
})();
