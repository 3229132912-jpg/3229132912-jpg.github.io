/* chart-evidence.js · P17 证据对象 —— 快递包裹：全篇最硬的 7 个数字挂在语义部位上 */
(function () {
  const host = document.getElementById("evidence-chart");
  if (!host) return;
  const body = U.frame(host, {
    title: "把这只包裹拆开：七个数字就是整份报告",
    sub: "数值挂在包裹真实承担该度量功能的部位上 · 面单=大盘 / 箱体=格局 / 缓冲层=利润牺牲 / 商品=规模 / 贴纸=投入 / 胶带=循环 / 吊牌=预言 · 点击任意数字钻取",
    src: "本报告锚点登记 K1/K3/K4/K6/K17/K23/K33（估算口径逐条标注）"
  });

  const W = 880, H = 520;
  const svg = KIT.svg(body, W, H);
  const P = KIT.PAL;
  const items = window.RPT.evidence;

  const g = svg.append("g");
  // ── 地面线（统一承载） ──
  g.append("line").attr("x1", 60).attr("x2", W - 60).attr("y1", 486).attr("y2", 486)
    .attr("stroke", P.ink).attr("stroke-width", 1.6);
  g.append("line").attr("x1", 60).attr("x2", W - 60).attr("y1", 491).attr("y2", 491)
    .attr("stroke", P.line).attr("stroke-width", 1);

  // ── 包裹本体（前 3/4 视角） ──
  const box = g.append("g");
  const kraft = "#c9a06b", kraftD = "#a87f4d", kraftE = "#7d5c33";
  // 左侧面
  box.append("polygon").attr("points", "300,250 230,205 230,435 300,480").attr("fill", kraftD).attr("stroke", kraftE);
  // 顶面（开口内腔）
  box.append("polygon").attr("points", "300,250 230,205 550,205 620,250").attr("fill", "#8a683c").attr("stroke", kraftE);
  box.append("polygon").attr("points", "312,248 248,212 544,212 608,248").attr("fill", "rgba(5,28,44,.30)");
  // 正面
  box.append("rect").attr("x", 300).attr("y", 250).attr("width", 320).attr("height", 230)
    .attr("fill", kraft).attr("stroke", kraftE).attr("stroke-width", 1.4);
  // 打开的前后盖
  box.append("polygon").attr("points", "300,250 230,205 208,158 286,196").attr("fill", kraftD).attr("stroke", kraftE);
  box.append("polygon").attr("points", "620,250 550,205 566,160 640,200").attr("fill", kraftD).attr("stroke", kraftE);
  // 商品（蓝色内盒探出）
  const item = g.append("g");
  item.append("rect").attr("x", 384).attr("y", 168).attr("width", 130).attr("height", 86)
    .attr("fill", P.redHi).attr("stroke", "#0a2076").attr("stroke-width", 1.2);
  item.append("polygon").attr("points", "384,168 402,152 532,152 514,168").attr("fill", P.red).attr("stroke", "#0a2076");
  item.append("polygon").attr("points", "514,168 532,152 532,238 514,254").attr("fill", "#0e2a94").attr("stroke", "#0a2076");
  item.append("rect").attr("x", 428).attr("y", 192).attr("width", 42).attr("height", 22)
    .attr("fill", "rgba(255,255,255,.88)");
  // 缓冲层（气泡膜环绕商品）
  const cush = g.append("g");
  [[352, 200, 13], [352, 236, 11], [536, 190, 12], [542, 226, 10], [368, 168, 9], [530, 158, 9]].forEach(([x, y, r]) => {
    cush.append("circle").attr("cx", x).attr("cy", y).attr("r", r)
      .attr("fill", "rgba(125,155,255,.16)").attr("stroke", P.blueSoft).attr("stroke-width", 1.4);
  });
  // 面单（正面左上）
  const bill = g.append("g");
  bill.append("rect").attr("x", 318).attr("y", 272).attr("width", 128).attr("height", 84)
    .attr("fill", "#f4f6f8").attr("stroke", "rgba(66,86,106,.6)");
  for (let i = 0; i < 8; i++) {
    bill.append("line").attr("x1", 328 + i * 9).attr("x2", 328 + i * 9).attr("y1", 282).attr("y2", 306)
      .attr("stroke", P.inkMd).attr("stroke-width", i % 3 ? 1.4 : 2.6);
  }
  [0, 1, 2].forEach(i => bill.append("line")
    .attr("x1", 328).attr("x2", 328 + 92 - i * 22).attr("y1", 316 + i * 11).attr("y2", 316 + i * 11)
    .attr("stroke", "rgba(66,86,106,.7)").attr("stroke-width", 2));
  bill.append("circle").attr("cx", 424).attr("cy", 336).attr("r", 11)
    .attr("fill", "none").attr("stroke", P.red).attr("stroke-width", 1.6);
  // 封箱胶带（正面纵向）
  g.append("rect").attr("x", 500).attr("y", 250).attr("width", 34).attr("height", 230)
    .attr("fill", "rgba(232,238,246,.6)").attr("stroke", "rgba(133,149,166,.5)");
  // 贴纸（即时零售投入 · 右下）
  const stk = g.append("g");
  stk.append("rect").attr("x", 548).attr("y", 392).attr("width", 62).attr("height", 62)
    .attr("fill", "#ffffff").attr("stroke", P.red).attr("stroke-width", 1.6);
  stk.append("text").attr("x", 579).attr("y", 420).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 11).attr("fill", P.red).attr("font-weight", 700)
    .text("RUSH");
  stk.append("text").attr("x", 579).attr("y", 436).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", P.inkMd).text("30 MIN");
  // 吊牌（细绳 + 牌）
  const tag = g.append("g");
  tag.append("path").attr("d", "M640,200 C 690,210 706,240 700,268")
    .attr("fill", "none").attr("stroke", P.inkMd).attr("stroke-width", 1.2);
  tag.append("rect").attr("x", 664).attr("y", 268).attr("width", 76).attr("height", 46).attr("rx", 4)
    .attr("fill", P.ink).attr("stroke", P.ink);
  tag.append("circle").attr("cx", 674).attr("cy", 278).attr("r", 2.6).attr("fill", "#fff");
  KIT.halo(tag.append("text").attr("x", 702).attr("y", 286).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 10.5).attr("fill", "#fff").attr("font-weight", 700), 0)
    .text("2027E");
  KIT.halo(tag.append("text").attr("x", 702).attr("y", 302).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 12).attr("fill", P.blueSoft).attr("font-weight", 700), 0)
    .text("28:26");

  // ── 语义部位 callout（数值 + 引导线 + 钻取） ──
  const callouts = [
    { k: "waybill", ax: 382, ay: 268, tx: 120, ty: 120, anchor: "start" },
    { k: "boxtop", ax: 620, ay: 330, tx: 700, ty: 130, anchor: "middle" },
    { k: "cushion", ax: 352, ay: 218, tx: 118, ty: 300, anchor: "start", red: true },
    { k: "item", ax: 449, ay: 152, tx: 470, ty: 84, anchor: "middle" },
    { k: "sticker", ax: 610, ay: 423, tx: 730, ty: 430, anchor: "middle" },
    { k: "tape", ax: 500, ay: 470, tx: 210, ty: 452, anchor: "start" },
    { k: "tag", ax: 700, ay: 268, tx: 790, ty: 220, anchor: "middle" }
  ];
  const cg = g.append("g");
  const groups = [];
  callouts.forEach(c => {
    const it = items.find(x => x.site === c.k);
    const grp = cg.append("g").attr("opacity", 0);
    grp.append("polyline")
      .attr("points", `${c.ax},${c.ay} ${(c.ax + c.tx) / 2},${c.ty + 14} ${c.tx},${c.ty + 14}`)
      .attr("fill", "none").attr("stroke", "rgba(66,86,106,.55)").attr("stroke-width", 1);
    grp.append("circle").attr("cx", c.ax).attr("cy", c.ay).attr("r", 3)
      .attr("fill", c.red ? P.neg : P.red);
    KIT.halo(grp.append("text").attr("x", c.tx).attr("y", c.ty)
      .attr("text-anchor", c.anchor)
      .attr("font-family", KIT.MONO).attr("font-size", 19).attr("font-weight", 700)
      .attr("fill", c.red ? P.neg : P.ink))
      .text(it.value);
    KIT.halo(grp.append("text").attr("x", c.tx).attr("y", c.ty + 22)
      .attr("text-anchor", c.anchor)
      .attr("font-family", KIT.MONO).attr("font-size", 9.5).attr("fill", P.inkLo)
      .attr("letter-spacing", ".08em"))
      .text(it.label);
    KIT.drill(grp, () => KIT.kdrill(it.k, it.value));
    groups.push(grp);
  });

  // ── 入场：一件件“挂上” ──
  KIT.enter(host, staticNow => {
    if (staticNow) { groups.forEach(gr => gr.attr("opacity", 1)); return; }
    box.attr("opacity", 0).transition().duration(420).attr("opacity", 1);
    [item, cush, bill, stk, tag].forEach((sel, i) =>
      sel.attr("opacity", 0).transition().delay(200 + i * 130).duration(380).attr("opacity", 1));
    groups.forEach((gr, i) => {
      gr.attr("transform", "translate(0,-10)");
      gr.transition().delay(520 + i * 120).duration(420)
        .attr("opacity", 1).attr("transform", "translate(0,0)");
    });
  });
})();
