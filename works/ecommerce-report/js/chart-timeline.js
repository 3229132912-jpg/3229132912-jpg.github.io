/* chart-timeline.js · P3 墙图时间线 —— 2024-09 → 2026-08 关键事件 */
(function () {
  const host = document.getElementById("timeline-chart");
  if (!host) return;
  const body = U.frame(host, {
    title: "两年二十四个月：从开征服务费到利润拐点",
    sub: " plaque=事件（序号+一句标题）· 蓝框=高热事件 · 底色带=即时零售大战窗口 · 点击 plaque 钻取依据",
    src: "锚点登记 K3/K10/K11/K20–K25/K34/K36/K37"
  });

  const evs = window.RPT.timeline;
  const W = 880;
  const t0 = new Date("2024-08-01"), t1 = new Date("2026-10-01");
  const x = d3.scaleTime([t0, t1], [56, W - 40]);

  // ── 贪心分层（plaque 宽度按字数估算，放不上就上一层） ──
  const plaques = evs.map((e, i) => {
    const d = new Date(e.date + "-15");
    const wpx = Math.max(96, e.title.length * 11.5 + 46);
    return { e, i, d, px: x(d), w: wpx, layer: 0 };
  });
  plaques.sort((a, b) => a.px - b.px);
  const layerRight = [];
  plaques.forEach(p => {
    let L = 0;
    while (layerRight[L] != null && p.px - p.w / 2 < layerRight[L] + 10) L++;
    p.layer = L;
    layerRight[L] = p.px + p.w / 2;
  });
  const layers = Math.max(...plaques.map(p => p.layer)) + 1;
  const H = 118 + layers * 44;

  const svg = KIT.svg(body, W, H);
  const P = KIT.PAL;
  const axisY = H - 44;

  // ── 大战窗口带（即时零售战役 2025-02 → 2026-06） ──
  svg.append("rect")
    .attr("x", x(new Date("2025-02-01"))).attr("width", x(new Date("2026-06-30")) - x(new Date("2025-02-01")))
    .attr("y", 20).attr("height", axisY - 20)
    .attr("fill", "rgba(34,81,255,.05)");
  KIT.halo(svg.append("text").attr("x", x(new Date("2025-08-01"))).attr("y", 32)
    .attr("text-anchor", "middle").attr("font-family", KIT.MONO).attr("font-size", 9)
    .attr("fill", P.red).attr("letter-spacing", ".12em")).text("即时零售大战窗口");

  // ── 双线时间轴 + 季刻度 ──
  svg.append("line").attr("x1", 40).attr("x2", W - 24).attr("y1", axisY).attr("y2", axisY).attr("stroke", P.ink).attr("stroke-width", 1.4);
  svg.append("line").attr("x1", 40).attr("x2", W - 24).attr("y1", axisY + 5).attr("y2", axisY + 5).attr("stroke", P.line).attr("stroke-width", 1);
  const ticks = d3.timeMonth.range(t0, t1, 3);
  ticks.forEach(d => {
    svg.append("line").attr("x1", x(d)).attr("x2", x(d)).attr("y1", axisY).attr("y2", axisY + 8)
      .attr("stroke", P.inkLo).attr("stroke-width", 1);
    svg.append("text").attr("x", x(d)).attr("y", axisY + 21).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", P.inkLo)
      .text(d3.timeFormat("%y-%m")(d));
  });

  // ── stem 层先画（避免穿透 plaque 文字），plaque 层后画 ──
  const stemL = svg.append("g"), plaqL = svg.append("g");
  const groups = [];
  plaques.forEach(p => {
    const py = axisY - 26 - p.layer * 44;
    stemL.append("line").attr("x1", p.px).attr("x2", p.px).attr("y1", py + 18).attr("y2", axisY)
      .attr("stroke", P.inkLo).attr("stroke-width", 1).attr("stroke-dasharray", p.layer ? "0" : "0");
    stemL.append("circle").attr("cx", p.px).attr("cy", axisY).attr("r", 2.6)
      .attr("fill", p.e.hot ? P.red : P.ink);
    const grp = plaqL.append("g").attr("opacity", 0);
    const bx = Math.max(44, Math.min(W - 40 - p.w, p.px - p.w / 2));
    grp.append("rect").attr("x", bx).attr("y", py - 14).attr("width", p.w).attr("height", 32).attr("rx", 3)
      .attr("fill", "#ffffff")
      .attr("stroke", p.e.hot ? P.red : P.ink).attr("stroke-width", p.e.hot ? 1.6 : 1.1)
      .attr("stroke-dasharray", p.e.tag === "格局" ? "4 3" : "0");
    grp.append("text").attr("x", bx + 8).attr("y", py - 1)
      .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", p.e.hot ? P.red : P.inkLo)
      .text(`${p.e.date} · ${String(p.i + 1).padStart(2, "0")}`);
    grp.append("text").attr("x", bx + 8).attr("y", py + 12)
      .attr("font-family", KIT.SERIF).attr("font-size", 10.5).attr("font-weight", 700).attr("fill", P.ink)
      .text(p.e.title.length > 15 ? p.e.title.slice(0, 14) + "…" : p.e.title);
    KIT.drill(grp, () => KIT.kdrill(p.e.k, p.e.date));
    groups.push(grp);
  });

  KIT.enter(host, staticNow => {
    if (staticNow) { groups.forEach(gg => gg.attr("opacity", 1)); return; }
    groups.forEach((gg, i) => gg.transition().delay(i * 70).duration(320).attr("opacity", 1));
  });
})();
