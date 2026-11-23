/* Lock-in Soundscapes — slow generative backgrounds, one scene per track.
   Calm by design: low contrast, slow motion, ~30 fps, pauses when the tab is hidden,
   static frame when motion is off or the OS asks for reduced motion. */
(() => {
  const cv = document.getElementById("bg");
  const ctx = cv.getContext("2d");
  const dark = () => matchMedia("(prefers-color-scheme: dark)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1;
  let motion = !reduce;
  try { const m = localStorage.getItem("lockin-motion"); if (m !== null) motion = m === "1"; } catch (e) {}

  // ---------- helpers ----------
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;
  const K = 1.7;                     // overall visibility: calm, but clearly there
  const LIFT = 0.16;                 // horizon lift, so silhouettes sit above the player bar
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${Math.min(1, a * K)})`;
  }
  function sky(top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function ridge(seed, base, amp, color) {
    base -= H * LIFT;
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) {
      const y = base - amp * (0.5 + 0.3 * Math.sin(x / 170 + seed) + 0.2 * Math.sin(x / 63 + seed * 3.1));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }
  function glow(x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }

  // ---------- palettes (light, dark) ----------
  const P = {
    stars:    [["#dfe6ee", "#eef0ea", "#7d8fa3", "#c9d2cc"], ["#0d1420", "#162026", "#dfe8f0", "#1c2a2e"]],
    snow:     [["#dde6ee", "#f1f3f2", "#ffffff", "#c4cfd8"], ["#111a26", "#1b2530", "#e8f0f8", "#223040"]],
    rain:     [["#cfd8dd", "#e4e8e6", "#8fa1ad", "#e7b96a"], ["#0f161c", "#18222a", "#7f97a8", "#e0a45a"]],
    city:     [["#d9d6e6", "#ece9ee", "#d99a3a", "#d3cfdf"], ["#10101e", "#1d1a2a", "#f0c070", "#0a0a14"]],
    fields:   [["#dde8dc", "#eef0e4", "#d9c35a", "#a9bca2"], ["#0e1712", "#18221a", "#f2dd6c", "#0a120c"]],
    train:    [["#d8dbe4", "#e8e8ea", "#d99a3a", "#c9cdd6"], ["#0c0f18", "#151923", "#f3c779", "#06080d"]],
    library:  [["#efe6d6", "#f3eee4", "#c99a52", "#e3d3b6"], ["#1b1610", "#241e16", "#e2b56b", "#14100b"]],
    temple:   [["#e3e6e2", "#f0f0ea", "#ffffff", "#b6c1bb"], ["#121816", "#1c2320", "#c9d6d0", "#0d1311"]],
    aurora:   [["#dbe7ea", "#eef1ee", "#5fb39a", "#8a7fc8"], ["#071218", "#0d1a20", "#6fe0b6", "#9c86ff"]],
    clouds:   [["#e3e2ea", "#f1efef", "#ffffff", "#c9c3d6"], ["#13121c", "#1d1b26", "#d9d2ea", "#2a2638"]],
    petals:   [["#efe6e6", "#f3efe9", "#d98c9c", "#e2b27a"], ["#18131a", "#1f1a1e", "#d99aa8", "#e8c79a"]],
    bokeh:    [["#e9e0d6", "#f1ece6", "#e0a96a", "#c98d8d"], ["#16110f", "#211915", "#f0b06a", "#e08a7a"]],
    embers:   [["#efe2d6", "#f3ebe3", "#e0823a", "#e9c08a"], ["#170e0a", "#22150f", "#ff9a4a", "#ffcf8a"]],
    waves:    [["#dbe3ec", "#ecefef", "#8aa2b8", "#fdfbf2"], ["#0a1220", "#121c2a", "#7f9cc0", "#f4efd6"]],
    sunrise:  [["#f1e4d4", "#eef0e6", "#f3b46b", "#c8d6c4"], ["#1d1612", "#1a2018", "#e8a35c", "#16201a"]],
  };

  // ---------- scenes ----------
  // each scene: init() -> state, draw(s, dt, t, speed, pal)
  const S = {};
  S.stars = {
    init: () => ({ st: Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: R(0.4, 1.4), p: R(0, TAU) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      for (const p of s.st) { ctx.fillStyle = rgba(c[2], 0.25 + 0.25 * Math.sin(t * 0.4 * sp + p.p)); ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, TAU); ctx.fill(); }
      ridge(1.7, H * 0.92, H * 0.12, c[3]);
    },
  };
  S.snow = {
    init: () => ({ f: Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), r: R(0.6, 2.4), v: R(8, 26), w: R(0, TAU) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      ridge(0.3, H * 0.86, H * 0.2, rgba(c[3], 0.7));
      ridge(2.1, H * 0.95, H * 0.12, c[3]);
      for (const f of s.f) {
        f.y += f.v * f.r * 0.35 * dt * sp / H; f.x += Math.sin(t * 0.3 + f.w) * 0.00012 * sp;
        if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        ctx.fillStyle = rgba(c[2], 0.35 + f.r * 0.15); ctx.beginPath(); ctx.arc(f.x * W, f.y * H, f.r, 0, TAU); ctx.fill();
      }
    },
  };
  S.rain = {
    init: () => ({ d: Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), l: R(10, 26), v: R(280, 480) })),
                   b: Array.from({ length: 16 }, () => ({ x: Math.random(), y: R(0.45, 0.95), r: R(30, 90), p: R(0, TAU) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      for (const b of s.b) glow(b.x * W, b.y * H, b.r, c[3], 0.10 + 0.05 * Math.sin(t * 0.2 + b.p));
      ctx.strokeStyle = rgba(c[2], 0.28); ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of s.d) {
        d.y += d.v * dt * sp * 0.6 / H; if (d.y > 1.05) { d.y = -0.05; d.x = Math.random(); }
        const x = d.x * W, y = d.y * H; ctx.moveTo(x, y); ctx.lineTo(x - d.l * 0.12, y + d.l);
      }
      ctx.stroke();
    },
  };
  S.city = {
    init() {
      const b = []; let x = 0;
      while (x < 1) { const w = R(0.03, 0.08); b.push({ x, w, h: R(0.12, 0.34), win: Array.from({ length: 30 }, () => ({ u: Math.random(), v: Math.random(), p: R(0, TAU), on: Math.random() < 0.45 })) }); x += w + R(0, 0.01); }
      return { b, l: Array.from({ length: 14 }, () => ({ x: Math.random(), y: R(0.2, 0.6), r: R(40, 110), p: R(0, TAU) })) };
    },
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      for (const l of s.l) glow(l.x * W, l.y * H, l.r, c[2], 0.06 + 0.03 * Math.sin(t * 0.15 + l.p));
      for (const b of s.b) {
        const x = b.x * W, w = b.w * W, h = b.h * H, y = H * (1 - LIFT) - h;
        ctx.fillStyle = c[3]; ctx.fillRect(x, y, w, h + H * LIFT);
        for (const wn of b.win) if (wn.on) {
          ctx.fillStyle = rgba(c[2], 0.35 + 0.25 * Math.sin(t * 0.05 * sp + wn.p));
          ctx.fillRect(x + 3 + wn.u * (w - 8), y + 6 + wn.v * (h - 12), 2.5, 3.5);
        }
      }
    },
  };
  S.fields = {
    init: () => ({ f: Array.from({ length: 45 }, () => ({ x: Math.random(), y: R(0.55, 0.92), a: R(0, TAU), p: R(0, TAU) })),
                   st: Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.45, r: R(0.4, 1.2) })),
                   g: Array.from({ length: 160 }, () => ({ x: Math.random(), h: R(0.04, 0.12), k: R(-0.02, 0.02) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      ctx.fillStyle = rgba(c[2], 0.35); for (const p of s.st) { ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, TAU); ctx.fill(); }
      ridge(4.2, H * 0.97, H * 0.08, c[3]);
      ctx.strokeStyle = c[3]; ctx.lineWidth = 1.2; ctx.beginPath();
      const gy = H * (1 - LIFT);
      for (const g of s.g) { const x = g.x * W; ctx.moveTo(x, gy); ctx.quadraticCurveTo(x, gy - g.h * H * 0.6, x + (g.k + 0.01 * Math.sin(t * 0.4 + g.x * 9)) * W, gy - g.h * H); }
      ctx.stroke();
      for (const f of s.f) {
        f.a += R(-0.4, 0.4) * dt; f.x += Math.cos(f.a) * 0.004 * dt * sp; f.y += Math.sin(f.a) * 0.003 * dt * sp;
        f.x = (f.x + 1) % 1; f.y = Math.min(0.95, Math.max(0.5, f.y));
        glow(f.x * W, f.y * H, 9, c[2], Math.max(0, 0.55 * Math.sin(t * 0.7 + f.p)));
      }
    },
  };
  S.train = {
    init: () => ({ l: Array.from({ length: 26 }, () => ({ x: Math.random(), y: R(0.35, 0.8), len: R(20, 120), v: R(0.03, 0.12) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      ridge(0.9, H * 0.82, H * 0.1, rgba(c[3], 0.8));
      ctx.lineCap = "round";
      for (const l of s.l) {
        l.x -= l.v * dt * sp; if (l.x < -0.2) { l.x = 1.1; l.y = R(0.35, 0.8); }
        const g = ctx.createLinearGradient(l.x * W, 0, l.x * W + l.len, 0);
        g.addColorStop(0, rgba(c[2], 0.5)); g.addColorStop(1, rgba(c[2], 0));
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l.x * W, l.y * H); ctx.lineTo(l.x * W + l.len, l.y * H); ctx.stroke();
      }
      ctx.fillStyle = c[3]; ctx.fillRect(0, H * (0.88 - LIFT), W, H * (0.12 + LIFT));
      ctx.fillRect(W * 0.5 - 4, 0, 8, H * (0.88 - LIFT));
    },
  };
  S.library = {
    init: () => ({ m: Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: R(0.6, 1.8), a: R(0, TAU) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      ctx.fillStyle = rgba(c[3], 0.5);
      for (let i = 0; i < 6; i++) ctx.fillRect(W * (0.04 + i * 0.16), H * 0.62, W * 0.12, H * 0.38);
      const g = ctx.createLinearGradient(W * 0.75, 0, W * 0.3, H);
      g.addColorStop(0, rgba(c[2], 0.22)); g.addColorStop(1, rgba(c[2], 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W * 0.62, 0); ctx.lineTo(W * 0.92, 0); ctx.lineTo(W * 0.55, H); ctx.lineTo(W * 0.15, H); ctx.closePath(); ctx.fill();
      for (const m of s.m) {
        m.a += R(-0.2, 0.2) * dt; m.x += Math.cos(m.a) * 0.002 * dt * sp; m.y += (Math.sin(m.a) * 0.002 - 0.001) * dt * sp;
        if (m.y < 0) m.y = 1; m.x = (m.x + 1) % 1;
        ctx.fillStyle = rgba(c[2], 0.45); ctx.beginPath(); ctx.arc(m.x * W, m.y * H, m.r, 0, TAU); ctx.fill();
      }
    },
  };
  S.temple = {
    init: () => ({ m: Array.from({ length: 7 }, (_, i) => ({ x: Math.random(), y: 0.55 + i * 0.06, w: R(0.5, 0.9), v: R(0.004, 0.012) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      ridge(0.4, H * 0.7, H * 0.28, rgba(c[3], 0.45));
      ridge(2.6, H * 0.82, H * 0.22, rgba(c[3], 0.7));
      ridge(5.1, H * 0.96, H * 0.14, c[3]);
      for (const m of s.m) {
        m.x += m.v * dt * sp; if (m.x > 1.3) m.x = -0.6;
        const g = ctx.createRadialGradient(m.x * W, m.y * H, 0, m.x * W, m.y * H, m.w * W * 0.5);
        g.addColorStop(0, rgba(c[2], 0.22)); g.addColorStop(1, rgba(c[2], 0));
        ctx.fillStyle = g; ctx.fillRect(0, m.y * H - H * 0.12, W, H * 0.24);
      }
    },
  };
  S.aurora = {
    init: () => ({ st: Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * 0.8, r: R(0.4, 1.2) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      ctx.fillStyle = rgba(c[2], 0.25); for (const p of s.st) { ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, TAU); ctx.fill(); }
      for (let k = 0; k < 3; k++) {
        const col = k === 1 ? c[3] : c[2];
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) {
          const y = H * (0.28 + k * 0.08) + Math.sin(x / (220 + k * 60) + t * 0.08 * sp + k) * H * 0.06 + Math.sin(x / 90 + t * 0.05 * sp) * H * 0.015;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(col, 0.16); ctx.lineWidth = H * 0.06; ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.12); ctx.lineWidth = H * 0.015; ctx.stroke();
      }
      ridge(3.3, H * 0.97, H * 0.1, rgba(c[0], 0.9));
    },
  };
  S.clouds = {
    init: () => ({ c: Array.from({ length: 10 }, () => ({ x: Math.random(), y: R(0.1, 0.7), r: R(0.15, 0.35), v: R(0.003, 0.009) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      for (let i = 0; i < 4; i++) {
        const x = W * (0.25 + i * 0.17) + Math.sin(t * 0.03 + i) * 30;
        const g = ctx.createLinearGradient(x, 0, x - W * 0.1, H);
        g.addColorStop(0, rgba(c[2], 0.12)); g.addColorStop(1, rgba(c[2], 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 20, 0); ctx.lineTo(x + 20, 0); ctx.lineTo(x - W * 0.05, H); ctx.lineTo(x - W * 0.15, H); ctx.closePath(); ctx.fill();
      }
      for (const cl of s.c) { cl.x += cl.v * dt * sp; if (cl.x > 1.4) cl.x = -0.4; glow(cl.x * W, cl.y * H, cl.r * W, c[3], 0.35); }
    },
  };
  S.petals = {
    init: () => ({ p: Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: R(8, 15), v: R(10, 22),
                                                       a: R(0, TAU), va: R(-0.6, 0.6), w: R(0, TAU), k: Math.random() < 0.7 })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      glow(W * 0.82, H * 0.18, H * 0.45, c[3], 0.35);          // soft window light, upper right
      for (const p of s.p) {
        p.y += p.v * dt * sp / H; p.x += (Math.sin(t * 0.35 + p.w) * 6 + 4) * dt * sp / W; p.a += p.va * dt * sp;
        if (p.y > 1.05) { p.y = -0.05; p.x = Math.random() * 1.1 - 0.1; }
        if (p.x > 1.05) p.x = -0.05;
        ctx.save(); ctx.translate(p.x * W, p.y * H); ctx.rotate(p.a);
        ctx.scale(1, 0.55 + 0.35 * Math.sin(t * 0.8 + p.w));        // slow flutter
        ctx.fillStyle = rgba(p.k ? c[2] : c[3], 0.42);
        ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.6, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    },
  };
  S.bokeh = {
    init: () => ({ b: Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), r: R(20, 70), v: R(0.004, 0.012), k: Math.random() < 0.5 })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      for (const b of s.b) { b.y -= b.v * dt * sp; if (b.y < -0.1) { b.y = 1.1; b.x = Math.random(); } glow(b.x * W, b.y * H, b.r, b.k ? c[2] : c[3], 0.16); }
    },
  };
  S.embers = {
    init: () => ({ e: Array.from({ length: 70 }, () => ({ x: R(0.3, 0.7), y: Math.random(), v: R(0.02, 0.06), p: R(0, TAU), r: R(0.6, 1.8) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      glow(W * 0.5, H * 1.05, H * 0.55, c[2], 0.25 + 0.05 * Math.sin(t * 1.3));
      for (const e of s.e) {
        e.y -= e.v * dt * sp; e.x += Math.sin(t * 0.8 + e.p) * 0.0006;
        if (e.y < 0.2) { e.y = 1.02; e.x = R(0.3, 0.7); }
        ctx.fillStyle = rgba(c[3], Math.max(0, (e.y - 0.2) * 0.8)); ctx.beginPath(); ctx.arc(e.x * W, e.y * H, e.r, 0, TAU); ctx.fill();
      }
    },
  };
  S.waves = {
    init: () => ({ st: Array.from({ length: 100 }, () => ({ x: Math.random(), y: Math.random() * 0.55, r: R(0.4, 1.3), p: R(0, TAU) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      for (const p of s.st) { ctx.fillStyle = rgba(c[2], 0.3 + 0.2 * Math.sin(t * 0.3 + p.p)); ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, TAU); ctx.fill(); }
      glow(W * 0.78, H * 0.2, 60, c[3], 0.5);
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 10) { const y = H * (0.72 + k * 0.06) + Math.sin(x / (120 + k * 30) + t * (0.25 + k * 0.05) * sp) * (6 + k * 2); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.strokeStyle = rgba(c[2], 0.18 + k * 0.04); ctx.lineWidth = 1.2; ctx.stroke();
      }
    },
  };
  S.sunrise = {
    init: () => ({ m: Array.from({ length: 5 }, (_, i) => ({ x: Math.random(), y: 0.6 + i * 0.07, v: R(0.004, 0.01) })) }),
    draw(s, dt, t, sp, c) {
      sky(c[0], c[1]);
      glow(W * 0.3, H * 0.62, H * 0.5, c[2], 0.35);
      ctx.fillStyle = rgba(c[2], 0.6); ctx.beginPath(); ctx.arc(W * 0.3, H * 0.62, 26, 0, TAU); ctx.fill();
      ridge(1.2, H * 0.8, H * 0.14, rgba(c[3], 0.8));
      ridge(3.8, H * 0.95, H * 0.1, c[3]);
      for (const m of s.m) { m.x += m.v * dt * sp; if (m.x > 1.3) m.x = -0.5; glow(m.x * W, m.y * H, W * 0.3, "#ffffff", 0.12); }
    },
  };

  // ---------- track -> scene ----------
  const MAP = {
    s08: "city", s09: "snow", s10: "rain", s11: "fields", s12: "train", s13: "library", s14: "temple",
    g15: "aurora", g16: "clouds", g17: "petals", g18: "bokeh",
    o01: "sunrise", o02: "rain", o03: "library", o04: "temple", o05: "embers", o06: "waves", o07: "city",
  };
  const SPEED = { low: 0.6, mid: 1, high: 1.45 };

  let cur = { name: "stars", st: S.stars.init(), sp: 0.6 }, prev = null, fade = 1;
  function setScene(track) {
    const name = track ? (MAP[track.key.slice(0, 3)] || "stars") : "stars";
    const sp = track ? SPEED[track.level] || 1 : 0.6;
    if (name === cur.name) { cur.sp = sp; return; }
    prev = cur; cur = { name, st: S[name].init(), sp }; fade = 0;
    if (!motion) { fade = 1; prev = null; frame(0); }
    document.documentElement.dataset.scene = name;
  }

  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    frame(0);
  }

  let last = 0, t = 0, raf = 0;
  function frame(dt) {
    const pal = P;
    const d = dark() ? 1 : 0;
    if (prev && fade < 1) {
      S[prev.name].draw(prev.st, dt, t, prev.sp, pal[prev.name][d]);
      ctx.globalAlpha = fade;
      S[cur.name].draw(cur.st, dt, t, cur.sp, pal[cur.name][d]);
      ctx.globalAlpha = 1;
    } else {
      S[cur.name].draw(cur.st, dt, t, cur.sp, pal[cur.name][d]);
      prev = null;
    }
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return;              // ~30 fps is plenty for slow scenes
    const dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;
    if (fade < 1) fade = Math.min(1, fade + dt / 2);
    frame(dt);
  }
  function start() { if (!raf && motion && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  addEventListener("resize", resize);
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => frame(0));

  window.LockinBG = {
    setScene,
    get motion() { return motion; },
    setMotion(on) {
      motion = !!on;
      try { localStorage.setItem("lockin-motion", motion ? "1" : "0"); } catch (e) {}
      if (motion) start(); else { stop(); fade = 1; prev = null; frame(0); }
    },
  };
  resize();
  start();
})();
