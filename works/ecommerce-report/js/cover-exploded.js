/* cover-exploded.js · B/D 共享引擎 —— 快递包裹分层爆炸图 + 开箱揭幕时间线（COVER.md §4/§6）
   主题原子：快递包裹。层序（顶→底）：面单箱盖 / 缓冲层 / 商品 / 箱体。
   D = B 引擎 + 开箱时间线；reduced-motion 直接给静态完成帧。 */
(function () {
  const host = document.getElementById("cover");
  const canvas = document.getElementById("cover-canvas-x");
  if (!host || !canvas) return;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { ctx, fit } = U.bindCanvas(canvas);
  const TAU = U.TAU, clamp = U.clamp, lerp = U.lerp;
  const PAL = U.PAL;

  /* ── 材料：真实材质色（封面豁免单色系纪律） ── */
  const M = {
    kraftTop: "#c9a06b", kraftSideA: "#b08a56", kraftSideB: "#9a7443", kraftEdge: "#7d5c33",
    tape: "rgba(232,238,246,.78)",
    bill: "#f4f6f8", billInk: "#42566a",
    cushion: "rgba(196,212,232,.55)", cushionEdge: "rgba(125,155,255,.65)",
    goodsTop: "#1233b8", goodsSideA: "#0e2a94", goodsSideB: "#0a2076",
    ink: PAL.ink, red: PAL.neg, blue: PAL.red
  };

  /* ── 层定义：footprint 半宽 hw/hd，厚度 th，装配位 z0，爆炸分离 sep ── */
  const LAYERS = [
    { key: "bill", hw: 11, hd: 8, th: 1.0, z0: 6.2, sep: 13.6,
      head: "面单 · 履约与频次入口", col: M.blue,
      sub: "即时零售2026年破万亿：买的是主站打开频次（K12）" },
    { key: "cushion", hw: 10, hd: 7.2, th: 1.7, z0: 4.5, sep: 9.4,
      head: "缓冲层 · 退货与损耗", col: M.red,
      sub: "女装直播退货率60–80%：GMV的水分与履约损耗（K41）" },
    { key: "goods", hw: 7.2, hd: 5.2, th: 2.6, z0: 1.9, sep: 5.4,
      head: "商品 · 利润池再分配", col: M.blue,
      sub: "约4000亿利润池：即时零售 / AI / 商家生态三线分流（K23）" },
    { key: "box", hw: 11, hd: 8, th: 6.2, z0: 0, sep: 0,
      head: "箱体 · 四强并立", col: M.ink,
      sub: "2025Q4份额合计约90%：淘天31 / 抖音24 / 拼多多19 / 京东16（K3）" }
  ];

  /* ── 状态 ── */
  let active = false, raf = 0, t = 0, last = 0;
  let k = 1, kTgt = 1;                 // 爆炸主进度（0 装配 / 1 爆炸）
  let yaw = Math.PI / 4, mx = 0;       // 转盘 + 鼠标偏移
  let view = null;
  const INTRO = { on: false, t: 0, dur: 2.95, uK: 1, yawX: 0, shk: 0, lidT: -1, firedRing: false };
  let particles = [];
  let labelAlpha = 1;
  const rng = U.makeRng(20261004);

  function measure() {
    view = fit();
    return view;
  }

  /* ── 投影（COVER.md §2 轴测公式） ── */
  function camera() {
    const W = view.w, H = view.h;
    const leftBound = 0.585 * W, right = W - 332;
    let u = Math.min((right - leftBound) / 34, H * 0.0132);
    let cx, cy = 0.56 * H, rr = right;
    if (u < 5.6) { rr = W - 40; u = Math.min((rr - leftBound) / 34, H * 0.0132); }
    cx = (leftBound + rr) / 2;
    u = Math.max(5, u) * INTRO.uK;
    return { u, cx, cy, labels: u >= 5.6 };
  }
  function pt(cam, x, y, z) {
    const rx = x * Math.cos(yaw) - y * Math.sin(yaw);
    const ry = x * Math.sin(yaw) + y * Math.cos(yaw);
    return { x: cam.cx + rx * cam.u, y: cam.cy + ry * cam.u * 0.5 - z * cam.u };
  }

  /* ── 每层 z 位置（爆炸分离 +  stagger 回弹 + 呼吸浮动） ── */
  function layK(i) { return clamp(k * 1.55 - i * 0.17, 0, 1); }
  function layerZ(L, i) {
    const lk = layK(i);
    const breathe = Math.sin(t * 1.1 + i * 1.7) * 0.12 * lk;
    return L.z0 + L.sep * lk + breathe;
  }

  /* ── 轴测盒（画家序：两个可见侧面 → 顶面） ── */
  function slab(cam, hw, hd, z0, th, faces, opt = {}) {
    const z1 = z0 + th;
    const c = [
      pt(cam, -hw, -hd, z1), pt(cam, hw, -hd, z1), pt(cam, hw, hd, z1), pt(cam, -hw, hd, z1)];
    const b = [
      pt(cam, -hw, -hd, z0), pt(cam, hw, -hd, z0), pt(cam, hw, hd, z0), pt(cam, -hw, hd, z0)];
    const poly = (pts, fill, stroke) => {
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };
    // 侧面 +x（c1-c2 边下垂）与 +y（c2-c3 边下垂）
    poly([c[1], c[2], b[2], b[1]], faces.sideA, opt.edge);
    poly([c[2], c[3], b[3], b[2]], faces.sideB, opt.edge);
    poly(c, faces.top, opt.edge);
    // 顶面倒角亮线
    ctx.beginPath(); c.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1; ctx.stroke();
    return { top: c, bot: b };
  }

  /* ── 层间悬浮软影 ── */
  function plateShadow(cam, hw, hd, z, sepGap) {
    const p = pt(cam, 0, 0, z);
    const a = clamp(.20 - sepGap * .012, 0.05, .2);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(0);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, hw * cam.u * 1.1);
    g.addColorStop(0, `rgba(5,28,44,${a})`); g.addColorStop(1, "rgba(5,28,44,0)");
    ctx.scale(1, .42); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, hw * cam.u * 1.15, 0, TAU); ctx.fill(); ctx.restore();
  }

  /* ── 层身份细节 ── */
  function drawBillFace(cam, top) {
    // 面单白单贴在箱盖顶面：投影四边形内绘条码 + 地址行 + 蓝色已验视章
    const c = top;
    const cx = (c[0].x + c[2].x) / 2, cy = (c[0].y + c[2].y) / 2;
    const ex = (c[1].x - c[0].x) / 2, ey = (c[1].y - c[0].y) / 2;
    const fx = (c[3].x - c[0].x) / 2, fy = (c[3].y - c[0].y) / 2;
    const P = (u, v) => ({ x: cx + ex * u + fx * v, y: cy + ey * u + fy * v });
    ctx.save();
    const q = [P(-0.72, -0.62), P(0.72, -0.62), P(0.72, 0.62), P(-0.72, 0.62)];
    ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    ctx.fillStyle = M.bill; ctx.fill(); ctx.strokeStyle = "rgba(66,86,106,.5)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.clip();
    // 条码
    ctx.strokeStyle = M.billInk; ctx.lineWidth = 1.4;
    let bx = -0.62; const rr = U.makeRng(7);
    while (bx < -0.1) {
      const a = P(bx, -0.5), b = P(bx, -0.18);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.lineWidth = rr() > .5 ? 2.2 : 1; ctx.stroke(); bx += 0.045 + rr() * 0.03;
    }
    // 地址行
    ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(66,86,106,.75)";
    for (let i = 0; i < 3; i++) {
      const a = P(-0.62, 0.02 + i * 0.18), b = P(0.28 - i * 0.12, 0.02 + i * 0.18);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // 已验视章（电蓝圆章）
    const st = P(0.42, 0.28);
    ctx.strokeStyle = M.blue; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(st.x, st.y, 0.16 * Math.abs(ex), 0, TAU); ctx.stroke();
    ctx.restore();
    // 封箱胶带十字（顶面中线）
    ctx.save();
    ctx.beginPath(); q0(c); ctx.clip();
    ctx.strokeStyle = M.tape; ctx.lineWidth = 0.16 * Math.abs(ex);
    const m1 = P(0, -1), m2 = P(0, 1);
    ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.stroke();
    ctx.restore();
    function q0(cc) { cc.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); }
  }

  function drawCushionFace(cam, top, hw) {
    // 气泡膜：顶面规则气泡点阵
    const c = top;
    const cx = (c[0].x + c[2].x) / 2, cy = (c[0].y + c[2].y) / 2;
    const ex = (c[1].x - c[0].x) / 2, ey = (c[1].y - c[0].y) / 2;
    const fx = (c[3].x - c[0].x) / 2, fy = (c[3].y - c[0].y) / 2;
    ctx.save();
    ctx.beginPath(); c.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.clip();
    const r = Math.abs(ex) * 0.11;
    for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) {
      const x = cx + ex * (i / 4.6) + fx * (j / 3.4), y = cy + ey * (i / 4.6) + fy * (j / 3.4);
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = "rgba(125,155,255,.18)"; ctx.fill();
    }
    ctx.restore();
  }

  function drawBoxStencil(cam, zb) {
    // 箱体正面竖排模版印字：直接 upright 绘制在近墙面 bbox 中心（不随面倾斜翻转）
    const a = pt(cam, 11, -8, zb + 4.4), b = pt(cam, 11, 8, zb + 0.9);
    const cxp = (a.x + b.x) / 2, cyp = (a.y + b.y) / 2;
    ctx.save();
    ctx.font = "700 11px Menlo, Consolas, monospace";
    ctx.textAlign = "center"; ctx.fillStyle = "rgba(5,28,44,.55)";
    ctx.fillText("THIS SIDE UP ↑", cxp, cyp - 8);
    ctx.fillText("FRAGILE", cxp, cyp + 8);
    ctx.restore();
  }

  /* ── 粒子（木屑 + 冲击环，在抖动的坐标系内绘制） ── */
  function spawnBurst(cam) {
    const o = pt(cam, 0, 0, 6.5);
    for (let i = 0; i < 46; i++) {
      const a = rng() * TAU, sp = 40 + rng() * 150;
      particles.push({ kind: "dust", x: o.x, y: o.y, vx: Math.cos(a) * sp, vy: -60 - rng() * 160,
        r: 1 + rng() * 2.4, life: 0, max: 0.9 + rng() * 0.9,
        col: rng() > .45 ? "#b08a56" : "#8595a6" });
    }
    particles.push({ kind: "ring", x: o.x, y: o.y, r: 10, life: 0, max: 0.8 });
  }
  function drawParticles(dt) {
    particles = particles.filter(p => p.life < p.max);
    for (const p of particles) {
      p.life += dt;
      const f = p.life / p.max;
      if (p.kind === "dust") {
        p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = (1 - f) * 0.9; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      } else {
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.5);
        ctx.globalAlpha = (1 - f) * 0.55; ctx.strokeStyle = M.blue; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, p.r + f * 130, 0, TAU); ctx.stroke();
        ctx.restore(); ctx.globalAlpha = 1;
      }
    }
  }

  /* ── 标签列（右侧 312px，引导线 + 行去冲突） ── */
  function drawLabels(cam) {
    if (!cam.labels) return;
    const la = INTRO.on ? clamp((k - 0.45) * 2.4, 0, 1) * clamp((INTRO.t - 1.9) / 0.9, 0, 1) : labelAlpha;
    if (la <= 0.01) return;
    const W = view.w;
    const colX = W - 332 + 26, colW = 312 - 40;
    let rows = [];
    LAYERS.forEach((L, i) => {
      const z = layerZ(L, i);
      // 候选锚点：取投影 x 最大的角
      const corners = [[L.hw, -L.hd], [L.hw, L.hd], [-L.hw, L.hd]].map(([x, y]) => pt(cam, x, y, z + L.th * 0.6));
      const anchor = corners.reduce((a, b) => (b.x > a.x ? b : a));
      rows.push({ L, anchor, y: anchor.y });
    });
    rows.sort((a, b) => a.y - b.y);
    let prevY = -1e9;
    rows.forEach(r => { r.ly = Math.max(r.y, prevY + 34); prevY = r.ly; });
    ctx.save(); ctx.globalAlpha = la;
    rows.forEach(r => {
      const { L, anchor, ly } = r;
      ctx.strokeStyle = "rgba(66,86,106,.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(anchor.x + 4, anchor.y);
      ctx.lineTo(colX - 12, ly + 4); ctx.lineTo(colX - 4, ly + 4); ctx.stroke();
      ctx.fillStyle = L.col; ctx.beginPath(); ctx.arc(anchor.x, anchor.y, 2.6, 0, TAU); ctx.fill();
      ctx.font = "700 11px Menlo, Consolas, monospace"; ctx.textAlign = "left";
      ctx.fillStyle = L.col;
      ctx.fillText(fitStr(L.head, colW, 11), colX, ly);
      ctx.font = "11px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = PAL.inkMd;
      ctx.fillText(fitStr(L.sub, colW, 10.5, true), colX, ly + 15);
    });
    ctx.restore();
  }
  function fitStr(s, budget, px, serif) {
    const per = serif ? 5.8 * (px / 10) : 6 * (px / 10);
    const n = Math.floor(budget / per);
    if (s.length <= n) return s;
    let cut = s.slice(0, Math.max(4, n - 2));
    cut = cut.replace(/[，、,:：\s]+$/u, "");
    return cut + " …";
  }

  /* ── 盖体飞片（D 时间线专用：箱盖+面单整体飞离再归位） ── */
  function lidFlight() {
    // 返回 {dx,dy,rot,alpha} 屏幕空间变换
    if (!INTRO.on) return { dx: 0, dy: 0, rot: 0, alpha: 1 };
    const tI = INTRO.t;
    if (tI < 0.5) return { dx: 0, dy: 0, rot: 0, alpha: 1 };
    if (tI < 1.35) {
      const f = (tI - 0.5) / 0.85, e = 1 - Math.pow(1 - f, 3);
      return { dx: -150 * e, dy: -40 * e - 90 * e, rot: -0.85 * e, alpha: 1 - Math.max(0, f - 0.55) / 0.45 };
    }
    if (tI < 1.55) return { dx: 0, dy: 0, rot: 0, alpha: 0 };
    const f = clamp((tI - 1.55) / 0.55, 0, 1);       // 归位：从上方落回爆炸位
    return { dx: 0, dy: -70 * (1 - f), rot: 0, alpha: f };
  }

  /* ── 主绘制 ── */
  function draw(dt) {
    if (!view) measure();
    const cam = camera();
    const W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);

    // 屏幕抖动（只摇 3D 内容，不摇文字层）
    const shk = INTRO.shk;
    ctx.save();
    if (shk > 0.05) ctx.translate(Math.sin(t * 96) * shk, Math.cos(t * 81) * shk * 0.7);

    // 地面阴影
    const g0 = pt(cam, 0, 0, -0.4);
    const gg = ctx.createRadialGradient(g0.x, g0.y, 4, g0.x, g0.y, 16 * cam.u);
    gg.addColorStop(0, "rgba(5,28,44,.16)"); gg.addColorStop(1, "rgba(5,28,44,0)");
    ctx.save(); ctx.translate(g0.x, g0.y); ctx.scale(1, .4);
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, 16 * cam.u, 0, TAU); ctx.fill(); ctx.restore();

    // 装配状态（k≈0 且未开箱）：闭合包裹 = 箱体 + 闭合盖 + 面单胶带
    const closed = k < 0.04 && !INTRO.on;
    const introClosed = INTRO.on && INTRO.t < 0.5;

    // 层间软影
    LAYERS.forEach((L, i) => { if (i > 0 && layK(i) > 0.03) plateShadow(cam, L.hw, L.hd, layerZ(L, i) - 0.5, L.sep); });

    // 商品与缓冲层（先画，箱体前壁会遮挡其下部——画家序：内容在箱体前壁之前）
    const order = ["goods", "cushion"];
    order.forEach(key => {
      const i = LAYERS.findIndex(l => l.key === key), L = LAYERS[i];
      const z = layerZ(L, i);
      if (key === "goods") {
        const f = slab(cam, L.hw, L.hd, z, L.th, { top: M.goodsTop, sideA: M.goodsSideA, sideB: M.goodsSideB }, { edge: "rgba(255,255,255,.25)" });
        // 商品盒封口贴（白签）
        const c = f.top, cxp = (c[0].x + c[2].x) / 2, cyp = (c[0].y + c[2].y) / 2;
        ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(Math.atan2(c[1].y - c[0].y, c[1].x - c[0].x));
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.fillRect(-0.3 * Math.abs(c[1].x - c[0].x) / 2, -6, 0.6 * Math.abs(c[1].x - c[0].x) / 2, 12);
        ctx.restore();
      } else {
        const f = slab(cam, L.hw, L.hd, z, L.th, { top: M.cushion, sideA: "rgba(170,192,224,.42)", sideB: "rgba(150,175,215,.38)" }, { edge: M.cushionEdge });
        drawCushionFace(cam, f.top, L.hw);
      }
    });

    // 箱体（底→壁；顶面开口：画四壁 + 内壁暗色）
    {
      const L = LAYERS[3], z = layerZ(L, 3);
      const f = slab(cam, L.hw, L.hd, z, L.th, { top: M.kraftTop, sideA: M.kraftSideA, sideB: M.kraftSideB }, { edge: M.kraftEdge });
      // 开口时的内腔（盖已飞离：k>0.04 或 intro 开箱后）
      if (!closed && !introClosed) {
        const iz = z + L.th - 0.55;
        const ic = [pt(cam, -L.hw, -L.hd, iz), pt(cam, L.hw, -L.hd, iz), pt(cam, L.hw, L.hd, iz), pt(cam, -L.hw, L.hd, iz)];
        ctx.beginPath(); ic.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
        ctx.fillStyle = "rgba(5,28,44,.28)"; ctx.fill();
      }
      drawBoxStencil(cam, z);
    }

    // 面单箱盖（顶层，含 D 飞片变换）
    {
      const L = LAYERS[0];
      const z = closed || introClosed ? L.z0 : layerZ(L, 0);
      const fl = lidFlight();
      if (fl.alpha > 0.01) {
        ctx.save();
        const o = pt(cam, 0, 0, z + L.th);
        ctx.translate(o.x + fl.dx, o.y + fl.dy); ctx.rotate(fl.rot); ctx.translate(-o.x, -o.y);
        ctx.globalAlpha = fl.alpha;
        const f = slab(cam, L.hw, L.hd, z, L.th, { top: M.kraftTop, sideA: M.kraftSideA, sideB: M.kraftSideB }, { edge: M.kraftEdge });
        drawBillFace(cam, f.top);
        ctx.restore(); ctx.globalAlpha = 1;
      }
    }

    if (INTRO.on) drawParticles(dt);
    ctx.restore(); // 抖动系结束

    // 左栏白色渐变洗（文字可读性）
    const wash = ctx.createLinearGradient(0, 0, 0.62 * W, 0);
    wash.addColorStop(0, "rgba(255,255,255,.96)");
    wash.addColorStop(0.55, "rgba(255,255,255,.82)");
    wash.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 0.62 * W, H);

    if (!closed && !introClosed) drawLabels(cam);

    // 右下签名条：状态文案随交互切换
    ctx.save();
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right";
    ctx.fillStyle = "rgba(66,86,106,.85)";
    const cap = INTRO.on ? "UNBOXING · 开箱中 …" : (k > 0.5 ? "EXPLODED · 分层展开 — 点击空白处组装" : "ASSEMBLED · 已封装 — 点击空白处拆解");
    ctx.fillText(cap, W - 26, H - 22);
    ctx.restore();
  }

  /* ── 时间线推进 ── */
  const backOut = (x, s) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
  function step(ts) {
    if (!active) return;
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    t += dt;

    if (INTRO.on) {
      INTRO.t += dt;
      const tI = INTRO.t;
      if (tI < 0.5) INTRO.shk = 1.2 + 1.2 * Math.abs(Math.sin(tI * 34));
      else INTRO.shk *= Math.exp(-dt * 5.5);
      if (tI >= 0.5 && !INTRO.firedRing) { INTRO.firedRing = true; INTRO.shk = 15; spawnBurst(camera()); }
      if (tI >= 0.5 && tI < 0.62) INTRO.shk = Math.max(INTRO.shk, 15 * (1 - (tI - 0.5) / 0.12));
      // 喷射主进度 0.60→2.00，backOut amp 3.1
      const kk = clamp((tI - 0.6) / 1.4, 0, 1);
      k = backOut(kk, 3.1); if (kk >= 1) k = 1;
      INTRO.uK = lerp(1.34, 1, clamp((tI - 0.55) / 1.55, 0, 1));
      INTRO.yawX = lerp(0.55, 0, clamp((tI - 0.55) / 1.55, 0, 1));
      if (tI >= INTRO.dur) finishIntro();
    } else {
      k = U.ease(k, kTgt, dt, 0.22);
      INTRO.uK = U.ease(INTRO.uK, 1, dt, 0.3);
      INTRO.yawX = U.ease(INTRO.yawX, 0, dt, 0.3);
    }
    yaw = Math.PI / 4 + (REDUCE ? 0 : 0.14 * Math.sin(t * 0.6)) + mx * 0.11 + INTRO.yawX;
    draw(dt);
    raf = requestAnimationFrame(step);
  }

  function finishIntro() {
    INTRO.on = false; INTRO.t = 0; INTRO.firedRing = false;
    k = 1; kTgt = 1; INTRO.uK = 1; INTRO.yawX = 0; INTRO.shk = 0;
    particles = [];
  }

  function startIntro() {
    if (REDUCE) { finishIntro(); drawOnce(); return; }
    INTRO.on = true; INTRO.t = 0; INTRO.firedRing = false;
    INTRO.uK = 1.34; INTRO.yawX = 0.55; INTRO.shk = 0; k = 0; particles = [];
  }
  function drawOnce() { if (!view || view.w === 0) measure(); draw(0.016); }

  /* ── 交互 ── */
  host.addEventListener("mousemove", e => {
    const r = host.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  });
  host.addEventListener("click", e => {
    if (!active || canvas.style.display === "none") return;
    if (INTRO.on) return;
    if (e.target.closest("button, a, .chip, .cover-mode")) return;
    kTgt = kTgt > 0.5 ? 0 : 1;
  });
  host.addEventListener("dblclick", e => {
    if (!active || canvas.style.display === "none") return;
    if (e.target.closest("button, a, .chip, .cover-mode")) return;
    if (window.COVER_WIRE && COVER_WIRE.mode() === "d") startIntro();
  });

  window.COVER_X = {
    setActive(on, opt = {}) {
      active = on;
      if (on) {
        canvas.style.display = "";
        // display:none 时测量为 0×0：等布局回流后再 fit + 绘制
        requestAnimationFrame(() => {
          measure();
          if (opt.intro && !REDUCE) startIntro();
          else { finishIntro(); drawOnce(); }
          cancelAnimationFrame(raf); last = 0;
          if (!REDUCE) raf = requestAnimationFrame(step);
          else drawOnce();
        });
      } else {
        cancelAnimationFrame(raf); canvas.style.display = "none";
      }
    },
    playIntro: startIntro,
    redraw: drawOnce
  };
})();
