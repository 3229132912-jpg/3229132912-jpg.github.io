/* chartkit.js · 图表公共套件：固定 viewBox SVG、纸面光晕、IO 入场、钻取绑定、K 锚点溯源 */
window.KIT = (() => {
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAL = U.PAL;

  /* 固定坐标系 SVG（铁律：永不测量容器真实宽度） */
  function svg(host, W, H) {
    return d3.select(host).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("width", "100%").style("height", "auto").style("display", "block");
  }
  /* 文字纸面光晕（paint-order，≥4px） */
  function halo(sel, w = 4) {
    sel.attr("paint-order", "stroke").attr("stroke", "#ffffff")
      .attr("stroke-width", w).attr("stroke-linejoin", "round");
    return sel;
  }
  /* IO 入场（threshold .18，一次性）；REDUCE 直接完成帧 */
  function enter(host, onEnter) {
    if (REDUCE) { onEnter(true); return; }
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { io.disconnect(); onEnter(false); } });
    }, { threshold: 0.18 });
    io.observe(host);
  }
  /* 钻取绑定：sel 上 click → U.showDrill */
  function drill(sel, fn) {
    sel.attr("data-drill-keep", "").classed("d-hit", true)
      .on("click", (e, d) => {
        const o = fn(d);
        U.showDrill(Object.assign({ x: e.clientX, y: e.clientY }, o));
        e.stopPropagation();
      });
    return sel;
  }
  /* K 锚点 → 钻取卡字段 */
  function kdrill(k, value) {
    const a = (window.SRC.anchors || []).find(x => x.k === k);
    if (!a) return { title: k, value: value || "", sub: "", source: "" };
    const cn = SRC.cat_names[a.cat];
    const srcs = a.refs.slice(0, 2).map(n => {
      const r = SRC.refs[String(n)];
      return r ? `${r.src.split("《")[0]} · ${r.date}` : "";
    }).join(" / ");
    return {
      title: `${k} · ${cn} · ${a.grade}`,
      value: value || "",
      sub: a.fact,
      source: `${srcs} · 登记 #${a.refs.join("/#")}`
    };
  }
  const MONO = "Menlo, Consolas, monospace";
  const SERIF = "'et-book', Palatino, Georgia, serif";
  const fmtYi = v => v >= 1 ? v.toFixed(v >= 3 ? 1 : 2).replace(/\.?0+$/, "") + "万亿" : Math.round(v * 10000) + "亿";
  return { REDUCE, PAL, svg, halo, enter, drill, kdrill, MONO, SERIF, fmtYi };
})();
