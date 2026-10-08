/* dashboard.js · P14 常驻右栏仪表盘 —— 随滚动切换窗口状态（CHARTS.md P14 组件栈） */
(function () {
  const rail = document.getElementById("dash-rail");
  const canvas = document.getElementById("dash-canvas");
  if (!rail || !canvas) return;
  const { ctx, fit } = U.bindCanvas(canvas);
  const PAL = U.PAL, TAU = U.TAU, clamp = U.clamp;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MONO = "Menlo, Consolas, monospace";
  const SERIF = "'et-book', Palatino, Georgia, serif";

  const SEGS = ["格局", "玩家", "财务", "用户", "货币化", "战役", "展望", "附录"];
  const WINS = {
    exec: { no: "§0", title: "核心发现", seg: -1, plaque: { v: "15.97万亿", l: "2025年网上零售额 · +8.6%", k: "K1" },
      curve: [26.8, 26.6, 26.4, 26.2, 26.1], curveLab: "实物网零占社零比重（%）· 见顶回落",
      stats: [["四强合计份额", "约90%", "K3"], ["即时零售投入", "1500–2200亿", "K23"], ["二手电商增速", "+31.8%", "K33"], ["2027E 阿里:抖音", "28:26", "K4"]] },
    share: { no: "§1", title: "格局重排", seg: 0, plaque: { v: "31%→28%", l: "淘天份额路径（高盛口径）", k: "K4" },
      curve: [31, 31, 29, 28], curve2: [24, 22, 24, 26], curveLab: "淘天（墨）vs 抖音（蓝）份额路径 %",
      stats: [["抖音2025Q4", "24%", "K3"], ["拼多多", "19%", "K3"], ["京东", "16%", "K3"], ["视频号2027E", "5%", "K4"]] },
    players: { no: "§2", title: "七平台面板", seg: 1, plaque: { v: "4万亿", l: "第一梯队门槛", k: "K6" },
      curve: [8.3, 5.2, 4.35, 4.0, 0.36, 0.225, 0.2135], curveLab: "GMV梯队（万亿，对数感知）",
      stats: [["淘天GMV", "约8.3万亿", "K6"], ["抖音", "4.3–4.4万亿", "K6"], ["闲鱼年化", "约3600亿", "K7"], ["得物", "2000–2500亿", "K8"]] },
    fin: { no: "§3", title: "利润牺牲期", seg: 2, plaque: { v: "-62%", l: "阿里FY2026 Non-GAAP净利", k: "K17" },
      curve: [-62, -53, -12, -3.3], curveLab: "2025净利降幅 %（阿里/京东/拼多多/唯品会）",
      stats: [["京东归母净利", "196亿", "K18"], ["拼多多净利", "994亿", "K19"], ["京东Q2拐点", "+20.3%", "K21"], ["唯品会连续盈利", "50+季度", "K9"]] },
    users: { no: "§4", title: "用户画像", seg: 3, plaque: { v: "10.0亿", l: "淘宝MAU（2025-10首破）", k: "K13" },
      curve: [10.0, 9.48, 7.20, 6.48, 2.17, 1.0, 0.848], curveLab: "MAU梯队（亿）",
      stats: [["得物30岁以下", "约70%", "K28"], ["唯品会女性", "71.9%", "K30"], ["拼多多一线占比", "10.5%", "K31"], ["88VIP", "约6400万", "K32"]] },
    money: { no: "§5", title: "货币化", seg: 4, plaque: { v: "8–10%", l: "抖音take rate（机构测算）", k: "K27" },
      curve: [9, 11, 4.75, 4, 6.5, 1.1], curveLab: "take rate区间中值 %（抖音/得物/拼多多/淘天/京东3P/闲鱼）",
      stats: [["得物名义", "7–15%", "K27"], ["拼多多主站", "4.5–5%", "K27"], ["淘天", "约4%", "K27"], ["闲鱼", "0.6–1.6%", "K27"]] },
    instant: { no: "§6", title: "即时零售战役", seg: 5, plaque: { v: "45.2%", l: "闪购2025Q4份额 · 反超0.2pct", k: "K26" },
      curve: [73, 66, 58, 51, 45.0], curve2: [21, 27, 34, 40, 45.2], curveLab: "美团（墨）vs 闪购（蓝）份额演变 %",
      stats: [["三方投入", "1500–2200亿", "K23"], ["京东外卖年亏", "466.4亿", "K24"], ["闪购日峰值", "1.2亿单", "K25"], ["2030E规模", "2万亿", "K12"]] },
    outlook: { no: "§7", title: "2027展望", seg: 6, plaque: { v: "28 : 26", l: "2027E 阿里 vs 抖音（高盛）", k: "K4" },
      curve: [31, 30, 29, 28], curve2: [22, 23.5, 24.5, 26], curveLab: "分庭抗礼路径（单一券商观点）",
      stats: [["利润修复", "2026H2起", "K21"], ["即时零售", "2026破万亿", "K12"], ["二手增速", "25%+（估算）", "K33"], ["监管", "合规成本上升", "K36"]] },
    appendix: { no: "§8", title: "附录 · 口径", seg: 7, plaque: { v: "三把尺", l: "营收口径 / 财年口径 / 估算分级", k: "K6" },
      curve: [52, 52, 52], curveLab: "唯品会营收/GMV≈52%（半自营谱系中点）",
      stats: [["京东口径", "总额法", "K18"], ["阿里财年", "4月–3月", "K17"], ["弃用口径", "下沉73%", "K31"], ["缺口标记", "[TBD]", "K34"]] }
  };
  const COHORT = [
    ["淘天", "TT"], ["抖音", "DY"], ["拼多多", "PDD"], ["京东", "JD"],
    ["闲鱼", "XY"], ["得物", "DW"], ["唯品会", "VIPS"]
  ];
  const COHORT_NOTE = {
    exec: ["份额承压", "改写格局", "让利周期", "拐点确认", "一家独大", "信任壁垒", "防御现金牛"],
    share: ["31→28", "24→26", "19横盘", "16→15", "—", "—", "—"],
    players: ["8.3万亿", "4.4万亿", "5.2万亿", "3.5–4.5万亿", "3600亿", "2250亿档", "2135亿"],
    fin: ["-62%", "未上市估算", "-12%首降", "-53%→拐点", "并入阿里", "无披露", "基本持平"],
    users: ["10.0亿", "9.48亿", "7.20亿", "6.48亿", "2.17亿", "约1亿", "0.848亿"],
    money: ["约4%", "8–10%", "4.5–5%", "3P弱变现", "0.6–1.6%", "7–15%", "差价模式"],
    instant: ["闪购45.2%", "本地弱相关", "未参战受损", "8.4%", "—", "—", "—"],
    outlook: ["分庭抗礼", "追赶路径", "生态防守", "修复先行", "商业化起步", "扩张验证", "独家货品"],
    appendix: ["服务净额", "未披露", "服务净额", "总额法", "服务净额", "查验服务", "净额52%"]
  };

  let view = null, win = "exec", pulse = 0, raf = 0;

  /* 72 点半场圆点山形曲线（resample + morph） */
  function resample(pts, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1) * (pts.length - 1);
      const a = Math.floor(f), b = Math.min(pts.length - 1, a + 1);
      out.push(U.lerp(pts[a], pts[b], f - a));
    }
    return out;
  }

  function draw() {
    if (!view || view.w === 0) view = fit();
    const W = view.w, H = view.h;
    const cfg = WINS[win] || WINS.exec;
    ctx.clearRect(0, 0, W, H);
    const pad = 30, colW = W - pad * 2;
    let y = 42;

    // ① 窗口徽标 + 标题
    ctx.font = `700 10px ${MONO}`; ctx.fillStyle = PAL.red;
    ctx.fillText(cfg.no + " · WINDOW", pad, y);
    ctx.font = `700 21px ${SERIF}`; ctx.fillStyle = PAL.ink;
    ctx.fillText(cfg.title, pad, y + 28);
    y += 52;

    // ② 八段相位条
    const segW = colW / SEGS.length;
    SEGS.forEach((s, i) => {
      ctx.fillStyle = i === cfg.seg ? PAL.red : PAL.line;
      ctx.fillRect(pad + i * segW, y, segW - 3, i === cfg.seg ? 4 : 2);
      ctx.font = `8.5px ${MONO}`; ctx.fillStyle = i === cfg.seg ? PAL.red : PAL.inkLo;
      ctx.fillText(s, pad + i * segW, y + 15);
    });
    y += 34;

    // ③ 数据牌（可钻取）
    ctx.strokeStyle = PAL.line; ctx.lineWidth = 1;
    ctx.strokeRect(pad, y, colW, 74);
    ctx.font = `700 25px ${MONO}`; ctx.fillStyle = PAL.ink;
    ctx.fillText(cfg.plaque.v, pad + 14, y + 34);
    ctx.font = `10px ${MONO}`; ctx.fillStyle = PAL.inkLo;
    ctx.fillText(cfg.plaque.l, pad + 14, y + 56);
    const plaqueBox = { x: pad, y, w: colW, h: 74, k: cfg.plaque.k, v: cfg.plaque.v };
    y += 92;

    // ④ 半色调点阵山形曲线（72点 + 端脉冲光标 + 读数安全区 28px）
    const cvTop = y + 30, cvH = 120, cvBot = cvTop + cvH;
    const s1 = resample(cfg.curve, 72);
    const s2 = cfg.curve2 ? resample(cfg.curve2, 72) : null;
    const all = s2 ? s1.concat(s2) : s1;
    const lo = Math.min(...all, 0), hi = Math.max(...all);
    const py = v => cvBot - (v - lo) / (hi - lo || 1) * cvH;
    function mountain(series, color, filled) {
      const gap = colW / 72;
      for (let i = 0; i < 72; i++) {
        const x = pad + i * gap, yy = py(series[i]);
        if (filled) {
          for (let dy = cvBot; dy > yy; dy -= 7) {
            const d = (cvBot - dy) / cvH;
            ctx.globalAlpha = 0.10 + 0.25 * (1 - d);
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(x, dy, 1.7, 0, TAU); ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(x, yy, 1.9, 0, TAU); ctx.fill();
        }
      }
    }
    if (s2) { mountain(s2, PAL.red, true); mountain(s1, PAL.ink, false); }
    else mountain(s1, PAL.red, true);
    // 端脉冲光标 + 大读数
    const lastV = cfg.curve[cfg.curve.length - 1];
    const ex = pad + colW - colW / 72, ey = py(s1[71]);
    if (!REDUCE) {
      ctx.strokeStyle = `rgba(34,81,255,${0.5 + 0.4 * Math.sin(pulse)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(ex, ey, 6 + 2 * Math.sin(pulse), 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.arc(ex, ey, 3, 0, TAU); ctx.fill();
    ctx.font = `700 15px ${MONO}`;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 5; ctx.lineJoin = "round";
    const rv = String(cfg.curve[cfg.curve.length - 1]);
    ctx.strokeText(rv, ex - ctx.measureText(rv).width - 10, ey + 4);
    ctx.fillText(rv, ex - ctx.measureText(rv).width - 10, ey + 4);
    ctx.font = `8.5px ${MONO}`; ctx.fillStyle = PAL.inkLo;
    ctx.fillText(cfg.curveLab.toUpperCase ? cfg.curveLab : cfg.curveLab, pad, cvTop - 12);
    y = cvBot + 20;

    // ⑤ 四个 stat 块
    const sw = colW / 2;
    cfg.stats.forEach((s, i) => {
      const sx = pad + (i % 2) * sw, sy = y + Math.floor(i / 2) * 58;
      ctx.strokeStyle = PAL.lineLo; ctx.strokeRect(sx, sy, sw - 8, 50);
      ctx.font = `700 14px ${MONO}`; ctx.fillStyle = PAL.ink;
      ctx.fillText(s[1], sx + 10, sy + 22);
      ctx.font = `8.5px ${MONO}`; ctx.fillStyle = PAL.inkLo;
      ctx.fillText(s[0], sx + 10, sy + 39);
    });
    const statBoxes = cfg.stats.map((s, i) => ({ x: pad + (i % 2) * sw, y: y + Math.floor(i / 2) * 58, w: sw - 8, h: 50, k: s[2], v: s[1], n: s[0] }));
    y += 2 * 58 + 14;

    // ⑥ 平台队列状态格（固定缩写表）
    ctx.font = `700 9px ${MONO}`; ctx.fillStyle = PAL.inkLo;
    ctx.fillText("COHORT STATUS · 七平台", pad, y);
    y += 10;
    const cellH = 26;
    COHORT.forEach((c, i) => {
      const cy = y + i * cellH;
      ctx.strokeStyle = PAL.lineLo;
      ctx.beginPath(); ctx.moveTo(pad, cy + cellH); ctx.lineTo(pad + colW, cy + cellH); ctx.stroke();
      ctx.font = `700 10px ${MONO}`; ctx.fillStyle = PAL.ink;
      ctx.fillText(c[1], pad, cy + 17);
      ctx.font = `11px ${SERIF}`; ctx.fillStyle = PAL.inkMd;
      ctx.fillText(c[0], pad + 44, cy + 17);
      ctx.font = `9.5px ${MONO}`; ctx.fillStyle = PAL.red;
      const note = (COHORT_NOTE[win] || [])[i] || "—";
      ctx.fillText(note, pad + 120, cy + 17);
    });
    y += COHORT.length * cellH + 16;
    ctx.font = `8.5px ${MONO}`; ctx.fillStyle = PAL.inkLo;
    ctx.fillText("点击数据牌/统计块钻取依据 · 随章节滚动切换", pad, Math.min(y, H - 8));

    hitZones = [plaqueBox].concat(statBoxes);
  }

  let hitZones = [];
  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const z = hitZones.find(z => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);
    if (z) U.showDrill(Object.assign(KIT.kdrill(z.k, z.v), z.n ? { title: z.n + " · " + KIT.kdrill(z.k).title } : {}), { x: e.clientX, y: e.clientY });
  });

  function loop() {
    pulse += 0.06;
    draw();
    if (!REDUCE) raf = requestAnimationFrame(loop);
  }

  window.DASH = {
    setWin(w) {
      if (!WINS[w]) return;
      if (w === win) { return; }
      win = w;
      if (REDUCE) draw();
    },
    start() {
      view = fit(); draw();
      if (!REDUCE) { cancelAnimationFrame(raf); loop(); }
    },
    refit() { view = fit(); draw(); }
  };
  window.addEventListener("resize", () => DASH.refit());
})();
