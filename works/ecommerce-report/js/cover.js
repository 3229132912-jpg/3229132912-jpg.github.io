/* cover.js · A 态 —— 包裹无限递归（COVER.md §3）
   递归对象是包裹本身：俯视面单+封箱胶带的纸箱，镜头持续拉远，
   当前包裹墙精确缩入上一层墙的中央格口（无缝 12s/层循环）。
   reduced-motion：静态完成帧。 */
(function () {
  const host = document.getElementById("cover");
  const canvas = document.getElementById("cover-canvas");
  if (!host || !canvas) return;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { ctx, fit } = U.bindCanvas(canvas);
  const clamp = U.clamp, TAU = U.TAU;
  const PAL = U.PAL;

  let active = false, raf = 0, t = 0, last = 0, view = null;
  const N = 5;                       // 每层 5×5 包裹墙
  const LOOP = 12;                   // 12s/层
  const R = N / 0.78;                // 层间变焦比

  /* 单个包裹俯视：牛皮纸箱 + 胶带十字 + 面单 + 偶发蓝色验视章 */
  function parcel(x, y, s, seed, alpha) {
    const rng = U.makeRng(seed);
    const kraft = ["#c9a06b", "#c19a64", "#cfa871", "#bb9059"][seed % 4];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    // 箱体
    ctx.fillStyle = kraft;
    ctx.strokeStyle = "rgba(125,92,51,.8)";
    ctx.lineWidth = Math.max(0.6, s * 0.012);
    const r = s * 0.08;
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, r);
    ctx.fill(); ctx.stroke();
    // 封箱胶带（方向随种子变化）
    ctx.strokeStyle = "rgba(238,242,248,.85)";
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    if (seed % 3 === 0) { ctx.moveTo(0, -s / 2); ctx.lineTo(0, s / 2); }
    else if (seed % 3 === 1) { ctx.moveTo(-s / 2, 0); ctx.lineTo(s / 2, 0); }
    else { ctx.moveTo(-s / 2, -s / 2); ctx.lineTo(s / 2, s / 2); }
    ctx.stroke();
    // 面单
    const bw = s * (0.3 + rng() * 0.12), bh = s * 0.22;
    const bx = (rng() - 0.5) * s * 0.36, by = (rng() - 0.5) * s * 0.36;
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
    ctx.strokeStyle = "rgba(66,86,106,.55)"; ctx.lineWidth = Math.max(0.5, s * 0.006);
    ctx.strokeRect(bx - bw / 2, by - bh / 2, bw, bh);
    if (s > 26) { // 面单条码
      ctx.strokeStyle = "rgba(66,86,106,.8)"; ctx.lineWidth = Math.max(0.5, s * 0.008);
      for (let i = 0; i < 5; i++) {
        const lx = bx - bw / 2 + bw * 0.12 + i * bw * 0.16;
        ctx.beginPath(); ctx.moveTo(lx, by - bh * 0.28); ctx.lineTo(lx, by + bh * 0.28); ctx.stroke();
      }
    }
    // 蓝色验视章（少量格口）
    if (seed % 7 === 2 && s > 18) {
      ctx.strokeStyle = "rgba(34,81,255,.75)"; ctx.lineWidth = Math.max(0.7, s * 0.01);
      ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.28, s * 0.09, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }

  /* 一层包裹墙：以 (0,0) 为中心的 N×N 格口；t01 本层进度驱动 BFS 诞生序 */
  function wall(scale, t01, levelSeed) {
    const s = scale;                       // 单个格口边长
    const half = (N - 1) / 2;
    // 格口底板（分拣墙）
    ctx.fillStyle = "rgba(5,28,44,.035)";
    ctx.fillRect(-N * s / 2 - s * 0.08, -N * s / 2 - s * 0.08, N * s + s * 0.16, N * s + s * 0.16);
    const cells = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const gx = i - half, gy = j - half;
      if (gx === 0 && gy === 0) continue;  // 中央格口留给下一层递归
      const d = Math.max(Math.abs(gx), Math.abs(gy));       // BFS 圈层
      cells.push({ gx, gy, d });
    }
    cells.sort((a, b) => a.d - b.d);
    for (const c of cells) {
      // 诞生序：按圈层在 t01 前 40% 内 stagger 出现 + 电蓝诞生闪
      const born = clamp((t01 * 2.5 - (c.d - 1) * 0.55), 0, 1);
      if (born <= 0) continue;
      const flash = born < 0.55 ? (0.55 - born) / 0.55 : 0;
      const seed = (c.gx + 7) * 31 + (c.gy + 7) * 17 + levelSeed * 13;
      parcel(c.gx * s, c.gy * s, s * 0.92, seed, born);
      if (flash > 0.02) {
        ctx.save(); ctx.globalAlpha = flash * 0.5;
        ctx.strokeStyle = PAL.red; ctx.lineWidth = Math.max(1, s * 0.03);
        ctx.strokeRect(c.gx * s - s * 0.46, c.gy * s - s * 0.46, s * 0.92, s * 0.92);
        ctx.restore();
      }
    }
  }

  function drawFrame() {
    if (!view || view.w === 0) view = fit();
    const W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);

    // 左侧文字栏白色渐变洗
    const wash = ctx.createLinearGradient(0, 0, 0.62 * W, 0);
    wash.addColorStop(0, "rgba(255,255,255,.97)");
    wash.addColorStop(0.6, "rgba(255,255,255,.85)");
    wash.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 0.62 * W, H);

    const t01 = REDUCE ? 0.999 : (t % LOOP) / LOOP;
    // 递归中心偏右（避开左栏文字）
    const cx = W * (W > 1180 ? 0.72 : 0.5), cy = H * 0.52;
    const base = Math.min(W, H) * 0.16;
    ctx.save();
    ctx.translate(cx, cy);
    // 三层嵌套：L-1（更大，淡出）、L0（当前）、L+1（从中央格口放大而来）
    const sc0 = base * Math.pow(R, t01);           // 当前墙格口尺寸
    // 上一层（当前墙是它的中央格口）
    ctx.save(); ctx.globalAlpha = clamp(1 - t01 * 1.6, 0, 0.5);
    wall(sc0 * R, 1, 8);
    ctx.restore();
    // 当前层
    wall(sc0, t01, 3);
    // 下一层：从中央格口放大（t01→1 时正好铺满成为新的当前层）
    ctx.save();
    ctx.beginPath(); ctx.rect(-sc0 * 0.5, -sc0 * 0.5, sc0, sc0); ctx.clip();
    wall(sc0 / R * R, t01, 21);  // 与当前同格口尺寸，但绘制在裁剪窗内并按 t01 放大
    ctx.restore();
    // 取景框（蓝色四角，仅随相位淡出不随时间闪烁）
    const vf = clamp(1 - t01 * 1.35, 0, 1);
    if (vf > 0.02) {
      ctx.strokeStyle = PAL.red; ctx.lineWidth = 2; ctx.globalAlpha = vf;
      const h = sc0 * 0.56, g = sc0 * 0.14;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(sx * h, sy * h - sy * g); ctx.lineTo(sx * h, sy * h); ctx.lineTo(sx * h - sx * g, sy * h);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // 右下签名条
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right";
    ctx.fillStyle = "rgba(66,86,106,.85)";
    ctx.fillText("RECURSION · 每一个包裹都是更大包裹墙上的一个格口 — 规模，一路向上", W - 26, H - 22);
  }

  function step(ts) {
    if (!active) return;
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    t += dt;
    drawFrame();
    raf = requestAnimationFrame(step);
  }

  window.COVER_A = {
    setActive(on) {
      active = on;
      if (on) {
        canvas.style.display = "";
        requestAnimationFrame(() => {
          view = fit(); drawFrame();
          cancelAnimationFrame(raf); last = 0;
          if (!REDUCE) raf = requestAnimationFrame(step);
        });
      } else { cancelAnimationFrame(raf); canvas.style.display = "none"; }
    }
  };
})();
