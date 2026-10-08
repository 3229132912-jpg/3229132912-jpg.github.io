/* chart-users.js · P5 矩阵热表 —— 七平台 × 四维画像（底纹=口径分级） + 会员体系 */
(function () {
  const host = document.getElementById("users-chart");
  if (!host) return;
  const body = U.frame(host, {
    title: "画像分野：得物最年轻、唯品会女性浓度最高、拼多多下沉最深",
    sub: "蓝底=官方/财报或权威机构口径 · 斜纹=第三方估算口径 · 灰底=未见权威披露（按缺口处理）· 点击单元格钻取",
    src: "QuestMobile 2025-10 / 各公司官方发布会 / 第三方汇编 · K13–K16/K28–K32"
  });

  const D = window.RPT.user_profile;
  // 口径分级：same=权威口径（蓝底） part=估算/第三方（斜纹） none=未见披露（灰底）
  const grade = {
    "淘宝":     ["same", "same", "same", "same"],
    "拼多多":   ["same", "part", "part", "same"],
    "京东":     ["same", "same", "same", "same"],
    "抖音":     ["same", "none", "same", "part"],
    "得物":     ["same", "part", "part", "same"],
    "唯品会":   ["same", "same", "same", "same"],
    "闲鱼":     ["part", "none", "part", "part"]
  };
  const kmap = {
    "淘宝": "K13", "拼多多": "K31", "京东": "K31", "抖音": "K13",
    "得物": "K28", "唯品会": "K30", "闲鱼": "K29"
  };

  const wrap = document.createElement("div");
  const table = document.createElement("table");
  table.className = "dt heat";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>平台</th>" + D.dims.map(d => `<th>${d}</th>`).join("") + "</tr>";
  table.appendChild(thead);
  const tb = document.createElement("tbody");
  D.rows.forEach(r => {
    const tr = document.createElement("tr");
    if (r.name === "京东") tr.className = "row-now";   // 当前参照行：综合平台中最年轻
    const td0 = document.createElement("td");
    td0.innerHTML = `<b>${r.name}</b>`;
    tr.appendChild(td0);
    r.cells.forEach((c, i) => {
      const td = document.createElement("td");
      const g = grade[r.name][i];
      td.className = g === "same" ? "cell-same" : g === "part" ? "cell-part" : "cell-none";
      td.textContent = c;
      td.setAttribute("data-drill-keep", "");
      td.classList.add("d-hit");
      td.addEventListener("click", e => {
        U.showDrill(Object.assign(KIT.kdrill(kmap[r.name], c),
          { title: `${r.name} · ${D.dims[i]} · ${g === "same" ? "权威口径" : g === "part" ? "估算/第三方口径" : "未见权威披露"}` }),
          { x: e.clientX, y: e.clientY });
        e.stopPropagation();
      });
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  wrap.appendChild(table);
  const leg = document.createElement("p");
  leg.className = "legend";
  leg.innerHTML = "底纹=口径分级：蓝底 官方/权威机构 · 斜纹 第三方估算 · 灰底 未见权威披露（缺口如实呈现，不做插补）· 京东行为当前参照行（综合平台中最年轻，白底加双细线）";
  wrap.appendChild(leg);

  // 会员体系表
  const h = document.createElement("p");
  h.className = "chart-title"; h.style.marginTop = "26px";
  h.textContent = "三套会员体系，三种会员经济学";
  wrap.appendChild(h);
  const t2 = document.createElement("table");
  t2.className = "dt";
  t2.innerHTML = "<thead><tr><th>会员</th><th>最新规模</th><th>用户价值（官方口径）</th></tr></thead>";
  const tb2 = document.createElement("tbody");
  D.memberships.forEach(m => {
    const tr = document.createElement("tr");
    if (m.name.indexOf("SVIP") >= 0) tr.className = "hl";
    tr.innerHTML = `<td><b>${m.name}</b></td><td class="num">${m.scale}</td><td>${m.value}</td>`;
    tr.setAttribute("data-drill-keep", ""); tr.classList.add("d-hit");
    tr.addEventListener("click", e => {
      U.showDrill(Object.assign(KIT.kdrill("K32", `${m.name} · ${m.scale}`), { sub: m.value }), { x: e.clientX, y: e.clientY });
      e.stopPropagation();
    });
    tb2.appendChild(tr);
  });
  t2.appendChild(tb2);
  wrap.appendChild(t2);
  body.appendChild(wrap);
})();
