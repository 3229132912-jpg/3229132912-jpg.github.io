/* chart-fin.js · §3 财务 —— ①P11 营收×净利配对图（比值=净利率是主角） ②利润下滑同源性流向 */
(function () {
  const P = KIT.PAL;

  /* ── ① 配对图：营收实心蓝 × 净利描边墨，上方印净利率 ── */
  (function () {
    const host = document.getElementById("fin-chart");
    if (!host) return;
    const body = U.frame(host, {
      title: "利润榜与营收榜完全倒置：平台模式的变现效率约为自营的8倍",
      sub: "每公司一对：实心=2025营收（亿元）· 描边=净利 · 上方=净利率 · 红=该对中净利率跌破2%或利润腰斩 · 点击钻取（含2026Q2拐点信号）",
      src: "各公司财报（阿里FY2026口径）· K9/K17–K19 · 京东为自营总额法口径，营收不可与平台模式直接比较"
    });
    const W = 880, H = 430;
    const svg = KIT.svg(body, W, H);
    const rows = window.RPT.financials_2025;
    const yS = d3.scaleLinear([0, 14000], [H - 70, 84]);
    [0, 4000, 8000, 12000].forEach(v => {
      svg.append("line").attr("x1", 70).attr("x2", W - 40).attr("y1", yS(v)).attr("y2", yS(v)).attr("stroke", P.lineLo);
      svg.append("text").attr("x", 62).attr("y", yS(v) + 3).attr("text-anchor", "end")
        .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkLo).text(v.toLocaleString());
    });
    const gw = (W - 120) / rows.length;
    const groups = [];
    rows.forEach((r, i) => {
      const cx = 80 + i * gw + gw / 2;
      const margin = r.profit / r.revenue * 100;
      const deep = margin < 2 || r.profit_yoy <= -50;
      const col = deep ? P.neg : P.red;
      const g = svg.append("g").attr("opacity", 0);
      const bw = 34;
      // 营收（实心蓝；破限公司改语义红）
      g.append("rect").attr("x", cx - bw - 4).attr("y", yS(r.revenue))
        .attr("width", bw).attr("height", yS(0) - yS(r.revenue)).attr("fill", col);
      // 净利（描边墨）
      g.append("rect").attr("x", cx + 4).attr("y", yS(r.profit))
        .attr("width", bw).attr("height", Math.max(2, yS(0) - yS(r.profit)))
        .attr("fill", "none").attr("stroke", P.ink).attr("stroke-width", 1.8);
      // 净利率印于对子上方（比值才是主角）
      KIT.halo(g.append("text").attr("x", cx).attr("y", yS(r.revenue) - 26).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 12.5).attr("font-weight", 700).attr("fill", col))
        .text("净利率 " + margin.toFixed(1) + "%");
      KIT.halo(g.append("text").attr("x", cx).attr("y", yS(r.revenue) - 10).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", P.inkLo))
        .text(`营收${r.rev_yoy > 0 ? "+" : ""}${r.rev_yoy}% / 净利${r.profit_yoy}%`);
      // 数值
      KIT.halo(g.append("text").attr("x", cx - bw / 2 - 4).attr("y", yS(r.revenue) + 16).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("fill", "#fff"))
        .text((r.revenue / 1000).toFixed(1) + "k");
      KIT.halo(g.append("text").attr("x", cx + bw / 2 + 4).attr("y", yS(r.profit) - 6).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("font-weight", 700).attr("fill", P.ink))
        .text(r.profit >= 100 ? Math.round(r.profit) : r.profit);
      // 公司名
      KIT.halo(g.append("text").attr("x", cx).attr("y", H - 42).attr("text-anchor", "middle")
        .attr("font-family", KIT.SERIF).attr("font-size", 13).attr("font-weight", 700).attr("fill", P.ink))
        .text(r.name);
      g.append("text").attr("x", cx).attr("y", H - 26).attr("text-anchor", "middle")
        .attr("font-family", KIT.MONO).attr("font-size", 8).attr("fill", P.inkLo).text(r.period);
      KIT.drill(g, () => Object.assign(KIT.kdrill({ baba: "K17", jd: "K18", pdd: "K19", vips: "K9" }[r.key],
        `营收${r.revenue}亿 / ${r.profit_basis}${r.profit}亿（${r.profit_yoy}%）`),
        { sub: r.note + "。2026Q2：" + (window.RPT.financials_2026q2.find(q => q.key === r.key) || {}).note }));
      groups.push(g);
    });
    KIT.enter(host, sn => {
      if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
      groups.forEach((g, i) => g.transition().delay(i * 110).duration(400).attr("opacity", 1));
    });
  })();

  /* ── ② 同源性：左=净利降幅（语义红） 右=三场战争投向 ── */
  (function () {
    const host = document.getElementById("profitwar-chart");
    if (!host) return;
    const body = U.frame(host, {
      title: "利润同向下滑，投向清晰可辨：三场资本开支战争",
      sub: "左列=2025年净利降幅（%）· 右列=投向（金额口径各异，并列展示不互除）· 红色=利润损失语义 · 点击钻取",
      src: "财新/澎湃测算 + 公司财报 · K20/K23–K25/K37/K38"
    });
    const W = 880, H = 330;
    const svg = KIT.svg(body, W, H);
    const D = window.RPT.profit_war;
    // 左：降幅
    const xL = d3.scaleLinear([0, 80], [0, 240]);
    KIT.halo(svg.append("text").attr("x", 40).attr("y", 24)
      .attr("font-family", KIT.MONO).attr("font-size", 10).attr("fill", P.neg).attr("letter-spacing", ".12em"))
      .text("净利降幅（2025）");
    const groups = [];
    D.drops.forEach((d, i) => {
      const y = 44 + i * 46;
      const g = svg.append("g").attr("opacity", 0);
      g.append("rect").attr("x", 150).attr("y", y).attr("width", xL(-d.delta)).attr("height", 20).attr("rx", 2)
        .attr("fill", "rgba(194,47,78,.85)");
      KIT.halo(g.append("text").attr("x", 144).attr("y", y + 14).attr("text-anchor", "end")
        .attr("font-family", KIT.SERIF).attr("font-size", 11.5).attr("fill", P.ink)).text(d.name);
      KIT.halo(g.append("text").attr("x", 150 + xL(-d.delta) + 8).attr("y", y + 14)
        .attr("font-family", KIT.MONO).attr("font-size", 11).attr("font-weight", 700).attr("fill", P.neg))
        .text(d.delta + "%");
      KIT.drill(g, () => KIT.kdrill(d.name.indexOf("字节") >= 0 ? "K43" : "K17", d.delta + "%"));
      groups.push(g);
    });
    // 右：投向
    KIT.halo(svg.append("text").attr("x", 470).attr("y", 24)
      .attr("font-family", KIT.MONO).attr("font-size", 10).attr("fill", P.ink).attr("letter-spacing", ".12em"))
      .text("投向：三场战争");
    const xR = d3.scaleLinear([0, 2200], [0, 250]);
    const fronts = [
      { f: D.fronts[0], v: 2200, vv: "1500–2200亿", k: "K23" },
      { f: D.fronts[1], v: 677, vv: "676.78亿/单季", k: "K20" },
      { f: D.fronts[2], v: 1000, vv: "三年超1000亿", k: "K37" }
    ];
    fronts.forEach((o, i) => {
      const y = 62 + i * 48;
      const g = svg.append("g").attr("opacity", 0);
      // 空心描边=投入（不占用与左列同一把“损失”标尺之外的含义，统一红色描边）
      g.append("rect").attr("x", 470).attr("y", y).attr("width", xR(o.v)).attr("height", 20).attr("rx", 2)
        .attr("fill", "rgba(194,47,78,.12)").attr("stroke", P.neg).attr("stroke-width", 1.4)
        .attr("stroke-dasharray", o.k === "K23" ? "0" : "5 3");
      KIT.halo(g.append("text").attr("x", 470).attr("y", y - 6)
        .attr("font-family", KIT.SERIF).attr("font-size", 11.5).attr("font-weight", 700).attr("fill", P.ink))
        .text(o.f.name);
      KIT.halo(g.append("text").attr("x", 474 + xR(o.v)).attr("y", y + 14)
        .attr("font-family", KIT.MONO).attr("font-size", 10.5).attr("font-weight", 700).attr("fill", P.neg))
        .text(o.vv);
      KIT.drill(g, () => Object.assign(KIT.kdrill(o.k, o.vv), { sub: o.f.detail }));
      groups.push(g);
    });
    // 连接注记
    KIT.halo(svg.append("text").attr("x", 40).attr("y", H - 26)
      .attr("font-family", KIT.SERIF).attr("font-size", 11.5).attr("fill", P.inkMd))
      .text("资金来源都是既有利润池——当期利润表已失真，评估应转向“投入换得的资产”。京东2026Q2率先验证拐点（K21）。");
    KIT.enter(host, sn => {
      if (sn) { groups.forEach(g => g.attr("opacity", 1)); return; }
      groups.forEach((g, i) => g.transition().delay(i * 90).duration(360).attr("opacity", 1));
    });
  })();
})();
