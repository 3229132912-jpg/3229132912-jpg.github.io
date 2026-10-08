/* chart-players.js · P9 small-multiples —— 七平台同一标尺：GMV × MAU × 模式 */
(function () {
  const host = document.getElementById("players-chart");
  if (!host) return;
  const body = U.frame(host, {
    title: "七张面孔同一标尺：规模、流量与模式各归其位",
    sub: "每面板：GMV条（对数同尺）+ MAU条（线性同尺）+ 模式标签 · 斜纹=估算口径 · 点击面板钻取",
    src: "GMV为2025年混合口径（K6–K9）；MAU为QuestMobile 2025-10统一口径（K13–K16）"
  });
  const P = KIT.PAL;
  const W = 924, H = 560;
  const svg = KIT.svg(body, W, H);

  const gmvMap = {}; window.RPT.gmv_scale_2025.forEach(r => gmvMap[r.key] = r);
  const mauMap = {}; window.RPT.mau_2025_10.forEach(r => mauMap[r.key] = r);
  const panels = [
    { key: "taotian", gmv: "taotian", mau: "taobao", name: "淘天", mode: "3P平台 · CMR变现", note: "规模之王，份额趋势向下", hot: false },
    { key: "douyin", gmv: "douyin", mau: "douyin", name: "抖音电商", mode: "内容场+货架场", note: "唯一改写格局者，已超京东居第三", hot: true },
    { key: "pdd", gmv: "pdd", mau: "pdd", name: "拼多多", mode: "低价流量分配", note: "净利率约23%，利润密度行业极致", hot: false },
    { key: "jd", gmv: "jd", mau: "jd", name: "京东", mode: "1P自营+物流履约", note: "营收之王是口径幻觉，净利率约1.5%", hot: false },
    { key: "xianyu", gmv: "xianyu", mau: "xianyu", name: "闲鱼", mode: "C2C闲置撮合", note: "MAU增速电商类第一（+19.6%）", hot: false },
    { key: "dewu", gmv: "dewu", mau: "dewu", name: "得物", mode: "3P+鉴别服务", note: "人群浓度即资产：客单价约行业5倍", hot: false },
    { key: "vips", gmv: "vips", mau: "vips", name: "唯品会", mode: "半自营特卖", note: "12%的SVIP贡献52%的线上销售", hot: false }
  ];

  const cols = 4, pw = W / cols, ph = 268;
  const defs = svg.append("defs");
  const h2 = defs.append("pattern").attr("id", "pl-hatch").attr("width", 6).attr("height", 6)
    .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  h2.append("rect").attr("width", 6).attr("height", 6).attr("fill", "rgba(34,81,255,.10)");
  h2.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", P.red).attr("stroke-width", 1);

  const gmvX = d3.scaleLog([0.1, 12], [0, pw - 60]);
  const mauX = d3.scaleLinear([0, 10.5], [0, pw - 60]);
  const groups = [];

  panels.forEach((p, i) => {
    const cx = (i % cols) * pw, cy = Math.floor(i / cols) * ph + 8;
    const g = svg.append("g").attr("transform", `translate(${cx + 14},${cy})`).attr("opacity", 0);
    const gmv = gmvMap[p.gmv], mau = mauMap[p.mau];
    // 分隔细线
    if (i % cols) g.append("line").attr("x1", -14).attr("x2", -14).attr("y1", 10).attr("y2", ph - 30).attr("stroke", P.lineLo);
    // 名 + 模式
    KIT.halo(g.append("text").attr("x", 0).attr("y", 22)
      .attr("font-family", KIT.SERIF).attr("font-size", 16).attr("font-weight", 700)
      .attr("fill", p.hot ? P.red : P.ink)).text(p.name);
    g.append("text").attr("x", 0).attr("y", 40)
      .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", P.inkLo)
      .attr("letter-spacing", ".1em").text(p.mode.toUpperCase ? p.mode : p.mode);
    // GMV 条
    g.append("text").attr("x", 0).attr("y", 66).attr("font-family", KIT.MONO).attr("font-size", 8).attr("fill", P.inkLo).text("GMV（2025，对数尺）");
    const gw = gmvX(Math.max(0.1, gmv.high));
    g.append("rect").attr("x", 0).attr("y", 72).attr("width", gw).attr("height", 16).attr("rx", 2)
      .attr("fill", gmv.est ? "url(#pl-hatch)" : P.red)
      .attr("stroke", gmv.est ? P.red : "none").attr("stroke-dasharray", gmv.est ? "3 2" : "0");
    KIT.halo(g.append("text").attr("x", gw + 6).attr("y", 84)
      .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700).attr("fill", P.ink))
      .text(gmv.label);
    // MAU 条（标签按宽度自适应：条内白字或条外，避免穿越面板分隔线）
    g.append("text").attr("x", 0).attr("y", 116).attr("font-family", KIT.MONO).attr("font-size", 8).attr("fill", P.inkLo).text("MAU（亿，线性尺）");
    const mw = mauX(mau.value);
    g.append("rect").attr("x", 0).attr("y", 122).attr("width", mw).attr("height", 16).attr("rx", 2)
      .attr("fill", mau.est ? "url(#pl-hatch)" : P.ink)
      .attr("stroke", mau.est ? P.ink : "none").attr("stroke-dasharray", mau.est ? "3 2" : "0");
    const mv = mau.value + "亿";
    if (mw > 64) {
      g.append("text").attr("x", mw - 6).attr("y", 134).attr("text-anchor", "end")
        .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700)
        .attr("fill", mau.est ? P.ink : "#fff").text(mv);
      KIT.halo(g.append("text").attr("x", mw + 6).attr("y", 134)
        .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo))
        .text(mau.yoy != null ? `+${mau.yoy}%` : "估算口径");
    } else {
      KIT.halo(g.append("text").attr("x", mw + 6).attr("y", 134)
        .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700).attr("fill", P.inkMd))
        .text(mv);
      KIT.halo(g.append("text").attr("x", mw + 6).attr("y", 147)
        .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", P.inkLo))
        .text(mau.yoy != null ? `+${mau.yoy}%` : "估算/财报口径");
    }
    // 底注
    const note = g.append("text").attr("x", 0).attr("y", 170)
      .attr("font-family", KIT.SERIF).attr("font-size", 11.5)
      .attr("font-weight", p.hot ? 700 : 400)
      .attr("fill", p.hot ? P.red : P.inkMd).text(p.note);
    KIT.drill(g, () => ({
      title: `${p.name} · 规模双锚`,
      value: `GMV ${gmv.label} · MAU ${mau.value}亿`,
      sub: `${gmv.basis}；${mau.basis}`,
      source: "锚点 K6/K13 等 · 见来源登记"
    }));
    groups.push(g);
  });

  // 第 8 格：口径说明
  const nx = (7 % cols) * pw, ny = Math.floor(7 / cols) * ph + 8;
  const ng = svg.append("g").attr("transform", `translate(${nx + 14},${ny})`);
  ng.append("line").attr("x1", -14).attr("x2", -14).attr("y1", 10).attr("y2", ph - 30).attr("stroke", P.lineLo);
  KIT.halo(ng.append("text").attr("x", 0).attr("y", 22)
    .attr("font-family", KIT.MONO).attr("font-size", 10).attr("fill", P.red).attr("letter-spacing", ".14em"))
    .text("口径说明");
  ["京东GMV区间3.5–4.5万亿源于口径差异", "拼多多2022Q2起停披GMV", "得物GMV官方未确认（估算区间）", "唯品会用户数为财报年活跃口径"].forEach((s, i) => {
    ng.append("text").attr("x", 0).attr("y", 46 + i * 20)
      .attr("font-family", KIT.SERIF).attr("font-size", 10.5).attr("fill", P.inkMd).text("· " + s);
  });

  KIT.enter(host, sn => {
    if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
    groups.forEach((g, i) => g.transition().delay(i * 90).duration(360).attr("opacity", 1));
  });
})();
