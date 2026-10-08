/* cover-wire.js · C 态 —— 工程线框图（与 B 同几何，X 射线线框渲染，COVER.md §5）
   同时拥有四态切换器：A/B/C/D 药丸键 + localStorage + ?cover= 直达。 */
(function () {
  const host = document.getElementById("cover");
  const canvas = document.getElementById("cover-canvas-w");
  if (!host || !canvas) return;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { ctx, fit } = U.bindCanvas(canvas);
  const TAU = U.TAU, clamp = U.clamp;
  const PAL = U.PAL;

  /* 与 B 相同的层几何（线框版） */
  const LAYERS = [
    { key: "bill", hw: 11, hd: 8, th: 1.0, z0: 6.2, sep: 13.6, col: PAL.red, head: "面单 · 履约与频次入口", sub: "FIG.1A WAYBILL — 即时零售频次之争（K12）" },
    { key: "cushion", hw: 10, hd: 7.2, th: 1.7, z0: 4.5, sep: 9.4, col: PAL.neg, head: "缓冲层 · 退货与损耗", sub: "FIG.1B CUSHION — 女装直播退货率60–80%（K41）" },
    { key: "goods", hw: 7.2, hd: 5.2, th: 2.6, z0: 1.9, sep: 5.4, col: PAL.redHi, head: "商品 · 利润池再分配", sub: "FIG.1C GOODS — 约4000亿利润池三线分流（K23）" },
    { key: "box", hw: 11, hd: 8, th: 6.2, z0: 0, sep: 0, col: PAL.ink, head: "箱体 · 四强并立", sub: "FIG.1D CRATE — 2025Q4份额合计约90%（K3）" }
  ];

  let active = false, raf = 0, t = 0, last = 0, view = null;
  let k = 1, kTgt = 1, yaw = Math.PI / 4, mx = 0;

  function camera() {
    const W = view.w, H = view.h;
    const leftBound = 0.585 * W, right = W - 332;
    let u = Math.min((right - leftBound) / 34, H * 0.0132);
    let rr = right;
    if (u < 5.6) { rr = W - 40; u = Math.min((rr - leftBound) / 34, H * 0.0132); }
    return { u: Math.max(5, u), cx: (leftBound + rr) / 2, cy: 0.56 * H, labels: u >= 5.6 };
  }
  function pt(cam, x, y, z) {
    const rx = x * Math.cos(yaw) - y * Math.sin(yaw);
    const ry = x * Math.sin(yaw) + y * Math.cos(yaw);
    return { x: cam.cx + rx * cam.u, y: cam.cy + ry * cam.u * 0.5 - z * cam.u };
  }
  const layK = i => clamp(k * 1.55 - i * 0.17, 0, 1);
  const layerZ = (L, i) => L.z0 + L.sep * layK(i);

  /* X 射线线框：不做隐藏线消除；远角 .22 / 近边 .7 / 顶面轮廓 .85 */
  function wireBox(cam, L, z) {
    const hw = L.hw, hd = L.hd, z0 = z, z1 = z + L.th;
    const V = [];
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([x, y]) => {
      V.push({ t: pt(cam, x, y, z1), b: pt(cam, x, y, z0), wx: x, wy: y });
    });
    const edge = (a, b, alpha, w = 1) => {
      ctx.strokeStyle = hexA(L.col, alpha); ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };
    // 顶面白纱罩（前后层次）
    ctx.beginPath(); V.forEach((v, i) => i ? ctx.lineTo(v.t.x, v.t.y) : ctx.moveTo(v.t.x, v.t.y)); ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,.62)"; ctx.fill();
    // 底面四边（远，淡）
    for (let i = 0; i < 4; i++) edge(V[i].b, V[(i + 1) % 4].b, 0.22);
    // 立柱
    V.forEach((v, i) => edge(v.t, v.b, (v.wx > 0 || v.wy > 0) ? 0.7 : 0.3));
    // 顶面轮廓（最重）
    for (let i = 0; i < 4; i++) edge(V[i].t, V[(i + 1) % 4].t, 0.85, 1.4);
    // 身份细线
    if (L.key === "bill") {   // 面单虚线窗
      const c = V.map(v => v.t);
      const cxp = (c[0].x + c[2].x) / 2, cyp = (c[0].y + c[2].y) / 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = hexA(L.col, .55); ctx.lineWidth = 1;
      ctx.strokeRect(cxp - cam.u * 4, cyp - cam.u * 2.4, cam.u * 8, cam.u * 4.8);
      ctx.setLineDash([]);
    }
    if (L.key === "box") {    // 箱壁瓦楞细线
      for (let i = 1; i < 5; i++) {
        const a = pt(cam, hw, -hd + i * (2 * hd / 5), z0 + 0.4);
        const b = pt(cam, hw, -hd + i * (2 * hd / 5), z1 - 0.4);
        edge(a, b, 0.3);
      }
    }
    return V;
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function draw() {
    if (!view || view.w === 0) view = fit();
    const cam = camera(), W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);

    // 制图十字网格底（52px）
    ctx.strokeStyle = "rgba(133,149,166,.14)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 52) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 52) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
    // 四角对位标记（电蓝）
    ctx.strokeStyle = PAL.red; ctx.lineWidth = 1.4;
    [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
    });
    // 左栏白洗
    const wash = ctx.createLinearGradient(0, 0, 0.62 * W, 0);
    wash.addColorStop(0, "rgba(255,255,255,.95)"); wash.addColorStop(0.6, "rgba(255,255,255,.8)"); wash.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 0.62 * W, H);

    // 层（远→近画家序）
    const anchors = [];
    [3, 2, 1, 0].forEach(i => {
      const L = LAYERS[i];
      const V = wireBox(cam, L, layerZ(L, i));
      const c = V.map(v => v.t);
      const a = c.reduce((p, q) => (q.x > p.x ? q : p));
      anchors.push({ L, a });
    });

    // 标签列：空心圆引导端点
    if (cam.labels) {
      const colX = W - 332 + 26, colW = 312 - 40;
      anchors.sort((p, q) => p.a.y - q.a.y);
      let prevY = -1e9;
      anchors.forEach(r => {
        const ly = Math.max(r.a.y, prevY + 34); prevY = ly;
        ctx.strokeStyle = "rgba(66,86,106,.7)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(r.a.x + 6, r.a.y); ctx.lineTo(colX - 14, ly + 4); ctx.lineTo(colX - 4, ly + 4); ctx.stroke();
        ctx.beginPath(); ctx.arc(r.a.x, r.a.y, 3.4, 0, TAU);
        ctx.strokeStyle = r.L.col; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.font = "700 11px Menlo, Consolas, monospace"; ctx.textAlign = "left"; ctx.fillStyle = r.L.col;
        ctx.fillText(r.L.head, colX, ly);
        ctx.font = "10px Menlo, Consolas, monospace"; ctx.fillStyle = PAL.inkMd;
        ctx.fillText(r.L.sub.length * 6 > colW ? r.L.sub.slice(0, Math.floor(colW / 6) - 2) + " …" : r.L.sub, colX, ly + 14);
      });
    }

    // 右下签名条
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right"; ctx.fillStyle = "rgba(66,86,106,.9)";
    ctx.fillText(k > 0.5 ? "FIG. 1 · 快递包裹分层 · SCALE NTS · 点击空白处组装" : "FIG. 1 · 快递包裹（装配态）· SCALE NTS · 点击空白处拆解", W - 26, H - 22);
  }

  function step(ts) {
    if (!active) return;
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    t += dt;
    k = U.ease(k, kTgt, dt, 0.22);
    yaw = Math.PI / 4 + (REDUCE ? 0 : 0.14 * Math.sin(t * 0.6)) + mx * 0.11;
    draw();
    raf = requestAnimationFrame(step);
  }

  host.addEventListener("mousemove", e => {
    const r = host.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  });
  host.addEventListener("click", e => {
    if (!active) return;
    if (e.target.closest("button, a, .chip, .cover-mode")) return;
    kTgt = kTgt > 0.5 ? 0 : 1;
  });

  const COVER_W = {
    setActive(on) {
      active = on;
      if (on) {
        canvas.style.display = "";
        requestAnimationFrame(() => {
          view = fit(); draw();
          cancelAnimationFrame(raf); last = 0;
          if (!REDUCE) raf = requestAnimationFrame(step);
        });
      } else { cancelAnimationFrame(raf); canvas.style.display = "none"; }
    }
  };

  /* ── 四态切换器（D 与 B 共享 COVER_X；D = 带 intro 的 B） ── */
  const pills = document.querySelectorAll("#cover-mode button");
  let cur = "d";
  function setMode(m, opt = {}) {
    cur = m;
    pills.forEach(b => b.classList.toggle("on", b.dataset.mode === m));
    const useX = (m === "x" || m === "d");
    COVER_A.setActive(m === "rec");
    COVER_X.setActive(useX, { intro: m === "d" });
    COVER_W.setActive(m === "w");
    try { localStorage.setItem("cover-mode", m); } catch (e) {}
  }
  pills.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  window.COVER_WIRE = { setMode, mode: () => cur };

  const qp = new URLSearchParams(location.search).get("cover");
  const saved = (() => { try { return localStorage.getItem("cover-mode"); } catch (e) { return null; } })();
  const init = ({ a: "rec", rec: "rec", b: "x", x: "x", c: "w", w: "w", d: "d" })[qp] || saved || "d";
  // 等首帧布局稳定后启动
  requestAnimationFrame(() => setMode(init));
})();
