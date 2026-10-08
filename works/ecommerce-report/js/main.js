/* main.js · 滚动引擎：章节轨道 + 右栏开关 + data-win 联动 + ◆来源按钮 + K表渲染 */
(function () {
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 章节轨道（era-rail） ── */
  const rail = document.getElementById("era-rail");
  const track = document.getElementById("rail-track");
  const railYear = document.getElementById("rail-year");
  const sections = [...document.querySelectorAll("[data-win]")];
  const SEC_LABEL = {
    "sec-exec": "§0 摘要", "sec-terms": "§0.5 概念", "sec-share": "§1 格局",
    "sec-players": "§2 玩家", "sec-fin": "§3 财务", "sec-users": "§4 用户",
    "sec-money": "§5 货币化", "sec-instant": "§6 战役", "sec-outlook": "§7 展望",
    "sec-appendix": "§8 附录", "sec-sources": "来源"
  };
  const segs = sections.map((sec, i) => {
    const el = document.createElement("div");
    el.className = "seg";
    const lab = document.createElement("span");
    lab.className = "seg-label";
    lab.textContent = SEC_LABEL[sec.id] || sec.id;
    el.appendChild(lab);
    el.addEventListener("click", () => sec.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth" }));
    track.appendChild(el);
    return { sec, el };
  });
  function layoutSegs() {
    const top0 = sections[0].offsetTop;
    const span = Math.max(1, document.body.scrollHeight - innerHeight - top0);
    const tw = track.clientWidth;
    segs.forEach(({ sec, el }) => {
      const f = (sec.offsetTop - top0) / span;
      el.style.left = (f * (tw - 60)) + "px";
      el.style.width = "52px";
    });
  }
  layoutSegs();
  addEventListener("resize", layoutSegs);
  addEventListener("load", layoutSegs);

  /* ── 滚动监听：轨道激活 + 右栏开关 + 当前章节 ── */
  const cover = document.getElementById("cover");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const past = scrollY > cover.offsetHeight * 0.72;
      rail.classList.toggle("on", past);
      document.getElementById("dash-rail").classList.toggle("on", past);
      // 当前章节
      const y = scrollY + innerHeight * 0.4;
      let cur = segs[0];
      segs.forEach(s => { if (s.sec.offsetTop <= y) cur = s; });
      segs.forEach(s => s.el.classList.toggle("active", s === cur));
      railYear.textContent = (SEC_LABEL[cur.sec.id] || "§0").split(" ")[0];
      const win = cur.sec.dataset.win;
      if (window.DASH && win) DASH.setWin(win);
    });
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ── 封面 chips ── */
  document.querySelectorAll("[data-goto]").forEach(b =>
    b.addEventListener("click", () => {
      const t = document.querySelector(b.dataset.goto);
      if (t) t.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth" });
    }));

  /* ── ◆ 来源按钮 → 钻取 ── */
  document.querySelectorAll(".src[data-k]").forEach(b => {
    b.setAttribute("data-drill-keep", "");
    b.addEventListener("click", e => {
      U.showDrill(Object.assign(KIT.kdrill(b.dataset.k), { value: b.dataset.k + " 锚点" }), { x: e.clientX, y: e.clientY });
      e.stopPropagation();
    });
  });

  /* ── K 锚点登记表 ── */
  const list = document.getElementById("source-list");
  if (list && window.SRC) {
    SRC.anchors.forEach(a => {
      const row = document.createElement("a");
      row.className = "src-row d-hit";
      row.setAttribute("data-drill-keep", "");
      const fact = document.createElement("span");
      fact.className = "s-fact";
      fact.innerHTML = `<span class="src-cat ${a.cat}">${SRC.cat_names[a.cat]}</span><b style="font-family:var(--mono);font-size:11px">${a.k}</b> · ${a.fact}`;
      const cite = document.createElement("span");
      cite.className = "s-cite";
      cite.textContent = a.refs.map(n => {
        const r = SRC.refs[String(n)];
        return r ? `#${n} ${r.src.split("《")[0]} · ${r.date}` : `#${n}`;
      }).join(" ｜ ") + ` ｜ 分级：${a.grade}`;
      row.appendChild(fact); row.appendChild(cite);
      row.addEventListener("click", e => {
        const full = a.refs.map(n => {
          const r = SRC.refs[String(n)];
          return r ? `#${n} ${r.src} · ${r.date} · ${r.url}` : "";
        }).join("<br>");
        U.showDrill({
          title: `${a.k} · ${SRC.cat_names[a.cat]} · ${a.grade}`,
          value: a.k, sub: a.fact, source: full
        }, { x: e.clientX, y: e.clientY });
        e.stopPropagation();
      });
      list.appendChild(row);
    });
  }

  /* ── 右栏启动 ── */
  if (window.DASH) DASH.start();
  onScroll();
})();
