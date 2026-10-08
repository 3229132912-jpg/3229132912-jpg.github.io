/* chart-instant.js · §6 —— ①即时零售：份额迁移 + 投入 vs 市场规模 ②出海四范式（缺口如实绘制） */
(function () {
  const P = KIT.PAL;

  /* ── ① 即时零售战役：左=份额哑铃（战前→2025Q4） 右=投入区间 vs 市场规模 ── */
  (function () {
    const host = document.getElementById("instant-chart");
    if (!host) return;
    const body = U.frame(host, {
      title: "一年之内，从“一家独大”到“双雄对峙”",
      sub: "左：份额哑铃（战前晨星GTV口径 → 2025Q4易观即时交易口径，两口径并列不互除）· 右：三方投入区间 vs 市场规模（预测空心）· 点击钻取",
      src: "晨星/易观/高盛 + 商务部研究院《即时零售行业发展报告(2025)》· K12/K23–K26"
    });
    const W = 880, H = 380;
    const svg = KIT.svg(body, W, H);

    // 左：份额哑铃
    const LX = { a: 120, b: 320 };
    const yS = d3.scaleLinear([0, 80], [H - 70, 50]);
    [20, 40, 60].forEach(v => {
      svg.append("line").attr("x1", 60).attr("x2", 400).attr("y1", yS(v)).attr("y2", yS(v)).attr("stroke", P.lineLo);
      svg.append("text").attr("x", 54).attr("y", yS(v) + 3).attr("text-anchor", "end")
        .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo).text(v + "%");
    });
    KIT.halo(svg.append("text").attr("x", LX.a).attr("y", 30).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("fill", P.inkMd).attr("font-weight", 700)).text("战前（晨星）");
    KIT.halo(svg.append("text").attr("x", LX.b).attr("y", 30).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("fill", P.red).attr("font-weight", 700)).text("2025Q4（易观）");
    const pairs = [
      { name: "美团", a: 73, b: 45.0, k: "K26", down: true },
      { name: "淘宝闪购（阿里系）", a: 21, b: 45.2, k: "K26", down: false },
      { name: "京东", a: null, b: 8.4, k: "K26", down: false, entrant: true }
    ];
    const groups = [];
    pairs.forEach((p, i) => {
      const g = svg.append("g").attr("opacity", 0);
      const col = p.down ? P.neg : P.red;
      if (p.a != null) {
        g.append("line").attr("x1", LX.a).attr("x2", LX.b).attr("y1", yS(p.a)).attr("y2", yS(p.b))
          .attr("stroke", col).attr("stroke-width", 2.4);
        g.append("circle").attr("cx", LX.a).attr("cy", yS(p.a)).attr("r", 6).attr("fill", col);
        KIT.halo(g.append("text").attr("x", LX.a - 12).attr("y", yS(p.a) + 4).attr("text-anchor", "end")
          .attr("font-family", KIT.MONO).attr("font-size", 10).attr("fill", P.inkMd)).text(p.a + "%");
      } else {
        KIT.halo(g.append("text").attr("x", LX.a).attr("y", yS(p.b) + 4).attr("text-anchor", "middle")
          .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo)).text("新入场");
        g.append("line").attr("x1", LX.a + 30).attr("x2", LX.b - 12).attr("y1", yS(p.b)).attr("y2", yS(p.b))
          .attr("stroke", col).attr("stroke-width", 1.4).attr("stroke-dasharray", "4 3");
      }
      g.append("circle").attr("cx", LX.b).attr("cy", yS(p.b)).attr("r", 6)
        .attr("fill", "#fff").attr("stroke", col).attr("stroke-width", 2.2);
      const dy = i === 0 ? -12 : (i === 1 ? 16 : 4);
      KIT.halo(g.append("text").attr("x", LX.b + 12).attr("y", yS(p.b) + dy)
        .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700).attr("fill", col))
        .text(p.b + "%");
      KIT.halo(g.append("text").attr("x", LX.b + 12).attr("y", yS(p.b) + dy + 13)
        .attr("font-family", KIT.SERIF).attr("font-size", 10.5).attr("fill", P.ink)).text(p.name);
      KIT.drill(g, () => KIT.kdrill(p.k, `${p.name} ${p.a != null ? p.a + "% → " : "新入场 → "}${p.b}%`));
      groups.push(g);
    });

    // 右：投入 vs 市场规模
    const RX = 470;
    KIT.halo(svg.append("text").attr("x", RX).attr("y", 30)
      .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("fill", P.ink).attr("font-weight", 700)
      .attr("letter-spacing", ".1em")).text("投入 vs 市场规模（亿元）");
    const xR = d3.scaleLinear([0, 22000], [RX, W - 60]);
    const defs = svg.append("defs");
    const hp = defs.append("pattern").attr("id", "ir-hatch").attr("width", 6).attr("height", 6)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    hp.append("rect").attr("width", 6).attr("height", 6).attr("fill", "rgba(194,47,78,.10)");
    hp.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", P.neg).attr("stroke-width", 1.2);
    const rows = [
      { name: "三方合计投入（2025）", lo: 1500, hi: 2200, k: "K23", type: "invest" },
      { name: "市场规模 2024", lo: 7810, hi: 7810, k: "K12", type: "actual" },
      { name: "2026E", lo: 10000, hi: 10000, k: "K12", type: "fc" },
      { name: "2030E", lo: 20000, hi: 20000, k: "K12", type: "fc" }
    ];
    rows.forEach((r, i) => {
      const y = 60 + i * 62;
      const g = svg.append("g").attr("opacity", 0);
      if (r.type === "invest") {
        g.append("rect").attr("x", xR(0)).attr("y", y).attr("width", xR(r.hi) - xR(0)).attr("height", 22).attr("rx", 3)
          .attr("fill", "url(#ir-hatch)").attr("stroke", P.neg).attr("stroke-width", 1.2);
        g.append("line").attr("x1", xR(r.lo)).attr("x2", xR(r.lo)).attr("y1", y - 3).attr("y2", y + 25)
          .attr("stroke", P.neg).attr("stroke-width", 2);
        KIT.halo(g.append("text").attr("x", xR(r.hi) + 8).attr("y", y + 15)
          .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700).attr("fill", P.neg))
          .text("1500–2200");
      } else {
        const fc = r.type === "fc";
        g.append("rect").attr("x", xR(0)).attr("y", y).attr("width", xR(r.lo) - xR(0)).attr("height", 22).attr("rx", 3)
          .attr("fill", fc ? "none" : P.red)
          .attr("stroke", fc ? P.red : "none").attr("stroke-width", 1.6)
          .attr("stroke-dasharray", fc ? "5 3" : "0");
        KIT.halo(g.append("text").attr("x", xR(r.lo) + 8).attr("y", y + 15)
          .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700)
          .attr("fill", fc ? P.red : P.ink))
          .text(r.lo >= 10000 ? (r.lo / 10000) + "万亿" : r.lo + "亿");
      }
      KIT.halo(g.append("text").attr("x", RX).attr("y", y - 7)
        .attr("font-family", KIT.SERIF).attr("font-size", 11).attr("font-weight", 700).attr("fill", P.ink))
        .text(r.name);
      KIT.drill(g, () => KIT.kdrill(r.k, r.type === "invest" ? "1500–2200亿元" : (r.lo >= 10000 ? r.lo / 10000 + "万亿元" : r.lo + "亿元")));
      groups.push(g);
    });
    KIT.halo(svg.append("text").attr("x", RX).attr("y", H - 40)
      .attr("font-family", KIT.SERIF).attr("font-size", 11).attr("fill", P.inkMd))
      .text("一年投入≈2024年全市场的19%–28%：买的不是即时零售利润，而是主站打开频次。");

    KIT.enter(host, sn => {
      if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
      groups.forEach((g, i) => g.transition().delay(i * 80).duration(360).attr("opacity", 1));
    });
  })();

  /* ── ② 出海四范式：两条实数 + 两个缺口（红斜纹 + [TBD]） ── */
  (function () {
    const host = document.getElementById("outbound-chart");
    if (!host) return;
    const body = U.frame(host, {
      title: "出海第二战场：四种范式，两种尚无GMV披露",
      sub: "横条=2025年GMV（亿美元，估算口径斜纹）· 红斜纹缺口=无权威披露 [TBD]，缺口如实绘制不做插值 · 点击钻取",
      src: "第三方调研 / Momentum Works / 公司公告 · 估算口径 · K34"
    });
    const W = 880, H = 260;
    const svg = KIT.svg(body, W, H);
    const rows = window.RPT.outbound_2025;
    const xS = d3.scaleLinear([0, 1000], [170, W - 220]);
    [0, 250, 500, 750, 1000].forEach(v => {
      svg.append("line").attr("x1", xS(v)).attr("x2", xS(v)).attr("y1", 16).attr("y2", H - 36).attr("stroke", P.lineLo);
      svg.append("text").attr("x", xS(v)).attr("y", H - 20).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo).text("$" + v + "亿");
    });
    const defs = svg.append("defs");
    const hp = defs.append("pattern").attr("id", "ob-hatch").attr("width", 7).attr("height", 7)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    hp.append("rect").attr("width", 7).attr("height", 7).attr("fill", "rgba(194,47,78,.08)");
    hp.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 7).attr("stroke", P.neg).attr("stroke-width", 1.1);
    const he = defs.append("pattern").attr("id", "ob-est").attr("width", 6).attr("height", 6)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    he.append("rect").attr("width", 6).attr("height", 6).attr("fill", "rgba(34,81,255,.10)");
    he.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", P.red).attr("stroke-width", 1.2);

    const gap = (H - 60) / rows.length, rh = 24;
    const groups = [];
    rows.forEach((r, i) => {
      const y = 26 + i * gap + gap / 2 - rh / 2;
      const g = svg.append("g").attr("opacity", 0);
      KIT.halo(g.append("text").attr("x", 162).attr("y", y + rh / 2 + 4).attr("text-anchor", "end")
        .attr("font-family", KIT.SERIF).attr("font-size", 12.5).attr("font-weight", 700).attr("fill", P.ink))
        .text(r.name);
      if (r.value != null) {
        g.append("rect").attr("x", xS(0)).attr("y", y).attr("width", xS(r.value) - xS(0)).attr("height", rh).attr("rx", 3)
          .attr("fill", "url(#ob-est)").attr("stroke", P.red).attr("stroke-width", 1);
        KIT.halo(g.append("text").attr("x", xS(r.value) + 8).attr("y", y + rh / 2 + 4)
          .attr("font-family", KIT.MONO).attr("font-size", 10.5).attr("font-weight", 700).attr("fill", P.red))
          .text(`$${r.range}亿（${r.yoy}）`);
      } else {
        g.append("rect").attr("x", xS(0)).attr("y", y).attr("width", xS(220) - xS(0)).attr("height", rh).attr("rx", 3)
          .attr("fill", "url(#ob-hatch)").attr("stroke", P.neg).attr("stroke-width", 1).attr("stroke-dasharray", "4 3");
        KIT.halo(g.append("text").attr("x", xS(220) + 8).attr("y", y + rh / 2 + 4)
          .attr("font-family", KIT.MONO).attr("font-size", 10).attr("font-weight", 700).attr("fill", P.neg))
          .text("? 无GMV披露 [TBD]");
      }
      KIT.drill(g, () => ({
        title: `${r.name} · 出海2025`,
        value: r.value != null ? `$${r.range}亿 ${r.yoy}` : "无GMV披露 [TBD]",
        sub: r.basis, source: "锚点 K34 · 见来源登记"
      }));
      groups.push(g);
    });
    KIT.enter(host, sn => {
      if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
      groups.forEach((g, i) => {
        g.attr("transform", "translate(-14,0)");
        g.transition().delay(i * 90).duration(360).attr("opacity", 1).attr("transform", "translate(0,0)");
      });
    });
  })();
})();
