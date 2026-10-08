/* chart-verdict.js · P18 裁决天平 —— 基准情景 vs 下修风险（三重结构编码：方位/倾斜/虚位砝码） */
(function () {
  const host = document.getElementById("verdict-chart");
  if (!host) return;
  const body = U.frame(host, {
    title: "裁决：基准情景的证据更重，但三个虚位砝码尚未落盘",
    sub: "左盘=基准情景证据 · 右盘=下修风险 · 梁倾角为定性判断（非评分）· 盘外虚线砝码=升级触发条件 · 底部红纹封条=共同证伪线 · 点击砝码钻取",
    src: "锚点 K4/K12/K20/K21/K23/K33/K36 · 机构单点预测，非行业共识"
  });
  const P = KIT.PAL;
  const W = 880, H = 600;
  const svg = KIT.svg(body, W, H);
  const V = window.RPT.verdict;

  const pivotX = 440, pivotY = 140, half = 250;
  const TILT = 5.2;                                  // 左盘重 → 左端下沉
  const rad = TILT * Math.PI / 180;
  const endY = Math.sin(rad) * half;                 // 左端 +endY，右端 -endY

  // 红纹封条定义
  const defs = svg.append("defs");
  const seal = defs.append("pattern").attr("id", "vd-seal").attr("width", 8).attr("height", 8)
    .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  seal.append("rect").attr("width", 8).attr("height", 8).attr("fill", "rgba(194,47,78,.16)");
  seal.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8).attr("stroke", P.neg).attr("stroke-width", 1.6);

  // ── 立柱 + 读数牌 ──
  svg.append("rect").attr("x", pivotX - 7).attr("y", pivotY).attr("width", 14).attr("height", 300).attr("fill", P.ink);
  svg.append("rect").attr("x", pivotX - 145).attr("y", 300).attr("width", 290).attr("height", 62).attr("rx", 4)
    .attr("fill", P.paper).attr("stroke", P.ink).attr("stroke-width", 1.4);
  KIT.halo(svg.append("text").attr("x", pivotX).attr("y", 324).attr("text-anchor", "middle")
    .attr("font-family", KIT.SERIF).attr("font-size", 12.5).attr("font-weight", 700).attr("fill", P.ink))
    .text("基准情景成立：利润修复、份额“二八对换”");
  KIT.halo(svg.append("text").attr("x", pivotX).attr("y", 344).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 8.5).attr("fill", P.inkLo).attr("letter-spacing", ".1em"))
    .text("定性判断 · 非评分 · 触发条件全部落盘才升级读数");
  svg.append("polygon").attr("points", `${pivotX - 70},456 ${pivotX + 70},456 ${pivotX + 40},440 ${pivotX - 40},440`)
    .attr("fill", P.ink);

  // ── 支点表盘：三区位 + 指针停在左区 ──
  const dial = svg.append("g");
  dial.append("circle").attr("cx", pivotX).attr("cy", pivotY).attr("r", 26).attr("fill", P.paper).attr("stroke", P.ink).attr("stroke-width", 1.6);
  for (let i = -1; i <= 1; i++) {
    const a = -Math.PI / 2 + i * 0.62;
    dial.append("line")
      .attr("x1", pivotX + Math.cos(a) * 20).attr("y1", pivotY + Math.sin(a) * 20)
      .attr("x2", pivotX + Math.cos(a) * 26).attr("y2", pivotY + Math.sin(a) * 26)
      .attr("stroke", P.ink).attr("stroke-width", 2);
  }
  const needle = dial.append("line")
    .attr("x1", pivotX).attr("y1", pivotY)
    .attr("x2", pivotX + Math.cos(-Math.PI / 2 - 0.5) * 20).attr("y2", pivotY + Math.sin(-Math.PI / 2 - 0.5) * 20)
    .attr("stroke", P.red).attr("stroke-width", 2.6);
  dial.append("circle").attr("cx", pivotX).attr("cy", pivotY).attr("r", 3.4).attr("fill", P.red);

  // ── 梁（入场时从 0° 转到 -TILT，即左端下沉） ──
  const beam = svg.append("g")
    .attr("transform", `rotate(${KIT.REDUCE ? -TILT : 0} ${pivotX} ${pivotY})`);
  beam.append("rect").attr("x", pivotX - half).attr("y", pivotY - 4).attr("width", half * 2).attr("height", 8).attr("rx", 3).attr("fill", P.ink);
  beam.append("polygon").attr("points", `${pivotX - 16},${pivotY - 4} ${pivotX + 16},${pivotY - 4} ${pivotX},${pivotY - 22}`).attr("fill", P.ink);

  // ── 吊盘装配（整体平移，不随梁旋转） ──
  function panAssembly(cx, dropY, side) {
    const g = svg.append("g").attr("transform", `translate(0,${KIT.REDUCE ? dropY : 0})`);
    const topY = pivotY + 8;
    g.append("line").attr("x1", cx).attr("x2", cx - 62).attr("y1", topY).attr("y2", topY + 66).attr("stroke", P.ink).attr("stroke-width", 1.6);
    g.append("line").attr("x1", cx).attr("x2", cx + 62).attr("y1", topY).attr("y2", topY + 66).attr("stroke", P.ink).attr("stroke-width", 1.6);
    g.append("polygon").attr("points", `${cx - 78},${topY + 82} ${cx + 78},${topY + 82} ${cx + 62},${topY + 66} ${cx - 62},${topY + 66}`)
      .attr("fill", P.paper).attr("stroke", P.ink).attr("stroke-width", 1.8);
    return g;
  }
  // 砝码（实心梯形 + 顶钮）
  function weight(g, cx, baseY, w, h, label, fill) {
    const wg = g.append("g");
    wg.append("polygon")
      .attr("points", `${cx - w / 2},${baseY} ${cx + w / 2},${baseY} ${cx + w / 2 - 10},${baseY - h} ${cx - w / 2 + 10},${baseY - h}`)
      .attr("fill", fill).attr("stroke", P.ink).attr("stroke-width", 1.3);
    wg.append("rect").attr("x", cx - 8).attr("y", baseY - h - 8).attr("width", 16).attr("height", 9).attr("rx", 3)
      .attr("fill", fill).attr("stroke", P.ink).attr("stroke-width", 1.1);
    wg.append("text").attr("x", cx).attr("y", baseY - h / 2 + 3.5).attr("text-anchor", "middle")
      .attr("font-family", KIT.SERIF).attr("font-size", 10.5).attr("font-weight", 700)
      .attr("fill", "#fff")
      .text(label);   // 砝码均为深色填充：白字、不加光晕
    return wg;
  }

  const LX = pivotX - half, RX = pivotX + half;
  const panL = panAssembly(LX, endY, "L"), panR = panAssembly(RX, -endY, "R");
  const baseY0 = pivotY + 82;                    // 砝码初始（未倾斜）盘底高度

  const lw = ["京东拐点已确认", "补贴战随新规熄火", "高盛28:26路径", "即时零售万亿确定"];
  const rw = ["抖音增速回落", "补贴复燃风险", "国补退坡反噬"];
  const wGroups = [];
  lw.forEach((s, i) => {
    const wg = weight(svg, LX, baseY0 - i * 27, 128, 24, s, i === 0 ? P.ink : "#2c3e50");
    KIT.drill(wg, () => KIT.kdrill(V.left.weights[i].k, V.left.weights[i].t));
    wGroups.push(wg);
  });
  rw.forEach((s, i) => {
    const wg = weight(svg, RX, baseY0 - i * 27, 128, 24, s, "#42566a");
    KIT.drill(wg, () => KIT.kdrill(V.right.weights[i].k, V.right.weights[i].t));
    wGroups.push(wg);
  });
  // 盘名（随盘平移）
  const labL = svg.append("g"), labR = svg.append("g");
  KIT.halo(labL.append("text").attr("x", LX).attr("y", baseY0 + 24).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.red).attr("letter-spacing", ".1em"))
    .text("基准情景 · 证据更重");
  KIT.halo(labR.append("text").attr("x", RX).attr("y", baseY0 + 24).attr("text-anchor", "middle")
    .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.inkMd).attr("letter-spacing", ".1em"))
    .text("下修风险 · 证据较轻");

  // ── 盘外虚位砝码（升级触发，未落盘） ──
  const triggers = [["抖音增速守住20%", 0], ["闪购UE转正", 1], ["闲鱼费率不失速", 2]];
  const trgX = [180, 440, 700];
  const trgGroups = [];
  triggers.forEach(([s, i], j) => {
    const g = svg.append("g").attr("opacity", KIT.REDUCE ? 1 : 0);
    const cx = trgX[j], by = 502;
    g.append("polygon")
      .attr("points", `${cx - 58},${by} ${cx + 58},${by} ${cx + 48},${by - 24} ${cx - 48},${by - 24}`)
      .attr("fill", "rgba(34,81,255,.06)").attr("stroke", P.red).attr("stroke-width", 1.3).attr("stroke-dasharray", "5 3");
    g.append("rect").attr("x", cx - 7).attr("y", by - 32).attr("width", 14).attr("height", 8).attr("rx", 3)
      .attr("fill", "none").attr("stroke", P.red).attr("stroke-dasharray", "3 2");
    KIT.halo(g.append("text").attr("x", cx).attr("y", by - 9).attr("text-anchor", "middle")
      .attr("font-family", KIT.SERIF).attr("font-size", 10).attr("font-weight", 700).attr("fill", P.red)).text(s);
    // 虚线箭头指向盘
    const tx = j === 0 ? LX : (j === 2 ? RX : pivotX - half * 0.4);
    g.append("line").attr("x1", cx).attr("x2", tx).attr("y1", by - 36).attr("y2", j === 1 ? 400 : 330)
      .attr("stroke", P.red).attr("stroke-width", 1).attr("stroke-dasharray", "3 3").attr("opacity", .6);
    KIT.halo(g.append("text").attr("x", cx).attr("y", by + 14).attr("text-anchor", "middle")
      .attr("font-family", KIT.MONO).attr("font-size", 8).attr("fill", P.inkLo)).text("触发条件 · 未落盘");
    KIT.drill(g, () => KIT.kdrill(V.triggers[i].k, V.triggers[i].t));
    trgGroups.push(g);
  });

  // ── 底部证伪封条 ──
  svg.append("rect").attr("x", 60).attr("y", 524).attr("width", W - 120).attr("height", 52).attr("rx", 3)
    .attr("fill", "url(#vd-seal)").attr("stroke", P.neg).attr("stroke-width", 1.4);
  KIT.halo(svg.append("text").attr("x", 74).attr("y", 516)
    .attr("font-family", KIT.MONO).attr("font-size", 9).attr("fill", P.neg).attr("letter-spacing", ".14em"))
    .text("共同证伪线 · 任一成立即撤回裁决");
  const fsW = (W - 160) / 3;
  V.falsify.forEach((f, i) => {
    const g = svg.append("g");
    g.append("rect").attr("x", 80 + i * fsW).attr("y", 536).attr("width", fsW - 16).attr("height", 28).attr("rx", 2)
      .attr("fill", "#fff").attr("stroke", P.neg).attr("stroke-width", 1);
    g.append("text").attr("x", 80 + i * fsW + (fsW - 16) / 2).attr("y", 554).attr("text-anchor", "middle")
      .attr("font-family", KIT.SERIF).attr("font-size", 10).attr("font-weight", 700).attr("fill", P.neg)
      .text(f.t.length > 16 ? f.t.slice(0, 15) + "…" : f.t);
    KIT.drill(g, () => KIT.kdrill(f.k, f.t));
  });

  // ── 入场：砝码交替落盘 → 梁倾 → 针偏 ──
  KIT.enter(host, sn => {
    if (sn) return;   // REDUCE 已按终态绘制
    wGroups.forEach((wg, i) => {
      wg.attr("opacity", 0).attr("transform", "translate(0,-26)");
      wg.transition().delay(240 + i * 150).duration(480).ease(d3.easeBackOut.overshoot(1.6))
        .attr("opacity", 1).attr("transform", "translate(0,0)");
    });
    const done = 240 + wGroups.length * 150 + 260;
    beam.transition().delay(done).duration(700).ease(d3.easeCubicOut)
      .attr("transform", `rotate(${-TILT} ${pivotX} ${pivotY})`);
    panL.transition().delay(done).duration(700).ease(d3.easeCubicOut).attr("transform", `translate(0,${endY})`);
    panR.transition().delay(done).duration(700).ease(d3.easeCubicOut).attr("transform", `translate(0,${-endY})`);
    // 注：砝码挂在 svg 而非 pan 组内（保持水平堆叠），随梁倾同步平移
    lw.forEach((s, i) => wGroups[i].transition().delay(done).duration(700).attr("transform", `translate(0,${endY})`));
    rw.forEach((s, i) => wGroups[lw.length + i].transition().delay(done).duration(700).attr("transform", `translate(0,${-endY})`));
    labL.transition().delay(done).duration(700).attr("transform", `translate(0,${endY})`);
    labR.transition().delay(done).duration(700).attr("transform", `translate(0,${-endY})`);
    needle.transition().delay(done + 200).duration(500)
      .attr("x2", pivotX + Math.cos(-Math.PI / 2 - 0.5) * 20).attr("y2", pivotY + Math.sin(-Math.PI / 2 - 0.5) * 20);
    trgGroups.forEach((g, i) => g.transition().delay(done + 500 + i * 120).duration(360).attr("opacity", 1));
  });
  // REDUCE 终态：梁与盘已在 TILT 位置，砝码与盘名需同步平移
  if (KIT.REDUCE) {
    wGroups.forEach((wg, i) => wg.attr("transform", `translate(0,${i < lw.length ? endY : -endY})`));
    labL.attr("transform", `translate(0,${endY})`);
    labR.attr("transform", `translate(0,${-endY})`);
  }
})();
