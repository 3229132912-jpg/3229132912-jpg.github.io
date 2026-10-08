/* chart-money.js · take rate 梯队 —— 区间阶梯图（估算斜纹，京东弱测算空心虚框） */
(function () {
  const host = document.getElementById("takerate-chart");
  if (!host) return;
  const body = U.frame(host, {
    title: "货币化率梯队：抖音居首、闲鱼垫底，淘天处于追赶位",
    sub: "横条=机构测算区间（%）· 斜纹=测算口径 · 空心虚框=缺乏可靠综合测算 · 右列=趋势 · 点击钻取测算方与口径",
    src: "国海/国信/华鑫/雪球/天风等测算与平台官方规则 · 除闲鱼外均为估算区间 · K27"
  });
  const P = KIT.PAL;
  const W = 880, H = 360;
  const svg = KIT.svg(body, W, H);
  const rows = window.RPT.take_rate.rows;

  const defs = svg.append("defs");
  const hpat = defs.append("pattern").attr("id", "tr-hatch").attr("width", 6).attr("height", 6)
    .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  hpat.append("rect").attr("width", 6).attr("height", 6).attr("fill", "rgba(34,81,255,.10)");
  hpat.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", P.red).attr("stroke-width", 1.2);

  const xS = d3.scaleLinear([0, 16], [150, W - 210]);
  [0, 4, 8, 12, 16].forEach(v => {
    svg.append("line").attr("x1", xS(v)).attr("x2", xS(v)).attr("y1", 20).attr("y2", H - 40).attr("stroke", P.lineLo);
    svg.append("text").attr("x", xS(v)).attr("y", H - 24).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo).text(v + "%");
  });

  const gap = (H - 70) / rows.length, rh = 24;
  const groups = [];
  rows.forEach((r, i) => {
    const y = 30 + i * gap + gap / 2 - rh / 2;
    const g = svg.append("g").attr("opacity", 0);
    const x0 = xS(r.low), x1 = xS(r.high);
    if (r.weak) {
      g.append("rect").attr("x", x0).attr("y", y).attr("width", x1 - x0).attr("height", rh).attr("rx", 3)
        .attr("fill", "none").attr("stroke", P.inkLo).attr("stroke-width", 1.2).attr("stroke-dasharray", "4 3");
    } else {
      g.append("rect").attr("x", x0).attr("y", y).attr("width", Math.max(4, x1 - x0)).attr("height", rh).attr("rx", 3)
        .attr("fill", r.name === "闲鱼" ? P.ink : "url(#tr-hatch)")
        .attr("stroke", r.name === "闲鱼" ? "none" : P.red).attr("stroke-width", 1);
    }
    // 平台名 + 梯队
    KIT.halo(g.append("text").attr("x", 142).attr("y", y + rh / 2 + 4).attr("text-anchor", "end")
      .attr("font-family", KIT.SERIF).attr("font-size", 13).attr("font-weight", 700).attr("fill", P.ink))
      .text(r.name);
    // 区间标签（右端贴近趋势列时改入条内右对齐）
    if (x1 > xS(12.6)) {
      g.append("text").attr("x", x1 - 8).attr("y", y + rh / 2 + 4).attr("text-anchor", "end")
        .attr("font-family", KIT.MONO).attr("font-size", 11).attr("font-weight", 700)
        .attr("fill", r.weak ? P.inkLo : P.red)
        .text(r.low + "%–" + r.high + "%");
    } else {
      KIT.halo(g.append("text").attr("x", x1 + 8).attr("y", y + rh / 2 + 4)
        .attr("font-family", KIT.MONO).attr("font-size", 11).attr("font-weight", 700)
        .attr("fill", r.weak ? P.inkLo : P.red))
        .text(r.low + "%–" + r.high + "%");
    }
    // 趋势
    KIT.halo(g.append("text").attr("x", W - 196).attr("y", y + rh / 2 + 4)
      .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkMd))
      .text(r.trend);
    KIT.drill(g, () => ({
      title: `${r.name} · 货币化率（${r.tier}）`,
      value: `${r.low}%–${r.high}%`,
      sub: r.basis, source: "锚点 K27 · 见来源登记"
    }));
    groups.push(g);
  });

  KIT.enter(host, sn => {
    if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
    groups.forEach((g, i) => {
      g.attr("transform", "translate(-14,0)");
      g.transition().delay(i * 80).duration(380).attr("opacity", 1).attr("transform", "translate(0,0)");
    });
  });
})();
