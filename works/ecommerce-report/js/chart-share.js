/* chart-share.js · §1 格局 —— ①份额迁移哑铃图（2025Q4→2027E） ②GMV梯队对数区间图 */
(function () {
  const P = KIT.PAL;

  /* ── ① 份额哑铃：两期配对比较，斜率即结论 ── */
  (function () {
    const host = document.getElementById("share-chart");
    if (!host) return;
    const body = U.frame(host, {
      title: "唯一主变量是抖音对淘天的追赶，其余横盘",
      sub: "左点=2025Q4实际预测 · 右点=2027E（空心=预测）· 红=份额下滑 · 中间灰点=2025E/2026E路径 · 点击钻取",
      src: "高盛预测（2025-09/2025-12转引）· 单一券商观点而非市场共识 · K3/K4"
    });
    const W = 880, H = 400;
    const svg = KIT.svg(body, W, H);
    const S = window.RPT.market_share;
    const yS = d3.scaleLinear([0, 34], [H - 60, 46]);
    const colX = { a: 250, b: 630 };
    [10, 20, 30].forEach(v => {
      svg.append("line").attr("x1", 150).attr("x2", W - 110).attr("y1", yS(v)).attr("y2", yS(v))
        .attr("stroke", P.lineLo);
      svg.append("text").attr("x", 140).attr("y", yS(v) + 3).attr("text-anchor", "end")
        .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("fill", P.inkLo).text(v + "%");
    });
    KIT.halo(svg.append("text").attr("x", colX.a).attr("y", 26).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 10).attr("fill", P.ink).attr("font-weight", 700)).text("2025Q4");
    KIT.halo(svg.append("text").attr("x", colX.b).attr("y", 26).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 10).attr("fill", P.red).attr("font-weight", 700)).text("2027E 预测");
    // 路径参考（2025E/2026E 中间灰点）
    const midX = [390, 510];

    const groups = [];
    S.series.forEach((s, i) => {
      const v0 = s.values[0], v3 = s.values[3];
      const delta = v3 - v0;
      const col = delta < -0.5 ? P.neg : (delta > 0.5 ? P.red : P.inkMd);
      const g = svg.append("g").attr("opacity", 0);
      // 连线
      g.append("line").attr("x1", colX.a).attr("x2", colX.b)
        .attr("y1", yS(v0)).attr("y2", yS(v3))
        .attr("stroke", col).attr("stroke-width", Math.abs(delta) > 0.5 ? 2.4 : 1.4);
      // 中间路径点
      [s.values[1], s.values[2]].forEach((v, j) => {
        g.append("circle").attr("cx", midX[j]).attr("cy", yS(v)).attr("r", 2.4).attr("fill", P.inkLo).attr("opacity", .55);
      });
      // 端点
      g.append("circle").attr("cx", colX.a).attr("cy", yS(v0)).attr("r", 6.5).attr("fill", col);
      g.append("circle").attr("cx", colX.b).attr("cy", yS(v3)).attr("r", 6.5)
        .attr("fill", "#fff").attr("stroke", col).attr("stroke-width", 2.2)
        .attr("stroke-dasharray", "3 2");
      // 标签（左右错层：奇偶行上下错开）
      const dy = (i % 2) ? -13 : 14;
      KIT.halo(g.append("text").attr("x", colX.a - 14).attr("y", yS(v0) + 4).attr("text-anchor", "end")
        .attr("font-family", KIT.SERIF).attr("font-size", 13).attr("font-weight", 700).attr("fill", P.ink))
        .text(s.name);
      KIT.halo(g.append("text").attr("x", colX.a + 13).attr("y", yS(v0) + dy)
        .attr("font-family", KIT.MONO).attr("font-size", 10.5).attr("fill", P.inkMd))
        .text(v0 + "%");
      KIT.halo(g.append("text").attr("x", colX.b + 13).attr("y", yS(v3) - dy)
        .attr("font-family", KIT.MONO).attr("font-size", 10.5).attr("font-weight", 700).attr("fill", col))
        .text(v3 + "%" + (delta ? (delta > 0 ? " ▲" : " ▼") : ""));
      KIT.drill(g, () => KIT.kdrill(Math.abs(delta) > 0.5 ? "K4" : "K3", `${s.name} ${v0}% → ${v3}%`));
      groups.push(g);
    });
    KIT.enter(host, sn => {
      if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
      groups.forEach((g, i) => g.transition().delay(i * 90).duration(380).attr("opacity", 1));
    });
  })();

  /* ── ② GMV 梯队：对数标尺 + 区间（估算斜纹） ── */
  (function () {
    const host = document.getElementById("gmv-chart");
    if (!host) return;
    const body = U.frame(host, {
      title: "四万亿成为第一梯队门槛，垂类三杰同在两千亿档",
      sub: "对数标尺（万亿）· 实心=财报/官方锚点 · 斜纹=估算口径 · 条带宽度=口径区间 · 点击钻取",
      src: "市场预计与媒体/机构估算混合口径，逐条标注 · K6/K7/K8/K9"
    });
    const W = 880, H = 340;
    const svg = KIT.svg(body, W, H);
    const rows = window.RPT.gmv_scale_2025;
    const xS = d3.scaleLog([0.1, 12], [120, W - 150]);
    // 斜纹定义
    const defs = svg.append("defs");
    const hatch = defs.append("pattern").attr("id", "gmv-hatch").attr("width", 6).attr("height", 6)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    hatch.append("rect").attr("width", 6).attr("height", 6).attr("fill", "rgba(34,81,255,.10)");
    hatch.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", P.red).attr("stroke-width", 1.2);
    // 网格
    [0.1, 0.3, 1, 3, 10].forEach(v => {
      svg.append("line").attr("x1", xS(v)).attr("x2", xS(v)).attr("y1", 24).attr("y2", H - 42).attr("stroke", P.lineLo);
      svg.append("text").attr("x", xS(v)).attr("y", H - 26).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo)
        .text(v < 1 ? (v * 10000) + "亿" : v + "万亿");
    });
    const rh = 26, gap = (H - 80) / rows.length;
    const groups = [];
    rows.forEach((r, i) => {
      const y = 34 + i * gap + gap / 2 - rh / 2;
      const g = svg.append("g").attr("opacity", 0);
      const x0 = xS(r.low), x1 = xS(r.high);
      g.append("rect").attr("x", x0).attr("y", y).attr("width", Math.max(4, x1 - x0)).attr("height", rh).attr("rx", 3)
        .attr("fill", r.est ? "url(#gmv-hatch)" : P.red)
        .attr("stroke", r.est ? P.red : "none").attr("stroke-width", 1)
        .attr("stroke-dasharray", r.est ? "4 3" : "0");
      KIT.halo(g.append("text").attr("x", 112).attr("y", y + rh / 2 + 4).attr("text-anchor", "end")
        .attr("font-family", KIT.SERIF).attr("font-size", 13).attr("font-weight", 700).attr("fill", P.ink))
        .text(r.name);
      KIT.halo(g.append("text").attr("x", x1 + 10).attr("y", y + rh / 2 + 4)
        .attr("font-family", KIT.MONO).attr("font-size", 11).attr("font-weight", 700)
        .attr("fill", r.est ? P.red : P.ink))
        .text(r.label);
      KIT.drill(g, () => ({
        title: `${r.name} · GMV规模${r.est ? "（估算口径）" : ""}`,
        value: r.label, sub: r.basis,
        source: "锚点 " + (r.key === "vips" ? "K9" : r.key === "xianyu" ? "K7" : r.key === "dewu" ? "K8" : "K6") + " · 见来源登记"
      }));
      groups.push(g);
    });
    KIT.enter(host, sn => {
      if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
      groups.forEach((g, i) => {
        g.attr("transform", "translate(-16,0)");
        g.transition().delay(i * 80).duration(400).attr("opacity", 1).attr("transform", "translate(0,0)");
      });
    });
  })();
})();
