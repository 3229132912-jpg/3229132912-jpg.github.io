/* 猫猫虫作品集 · 交互动效脚本（原生 JS，无依赖） */
(function () {
  "use strict";

  /* ---------- 顶部进度条 / 吸顶导航 / 返回顶部 / 封面视差 ---------- */
  var progress = document.getElementById("progress");
  var topnav = document.getElementById("topnav");
  var toTop = document.getElementById("toTop");
  var cover = document.getElementById("cover");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    topnav.classList.toggle("show", y > 420);
    toTop.classList.toggle("show", y > 600);
    /* 封面轻微视差（最多下移 90px） */
    cover.style.transform = "translate3d(0," + Math.min(y * 0.3, 90) + "px,0)";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 导航当前区块高亮 ---------- */
  var navLinks = {};
  topnav.querySelectorAll("a[data-nav]").forEach(function (a) {
    navLinks[a.getAttribute("data-nav")] = a;
  });

  var sectionIds = ["about", "career", "works", "contact"];
  var current = "about";

  function setActive(id) {
    if (id === current) return;
    current = id;
    Object.keys(navLinks).forEach(function (k) {
      navLinks[k].classList.toggle("active", k === id);
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) setActive(e.target.id);
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });
  navLinks.about.classList.add("active");

  /* ---------- 点击复制 + Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }

  function copyText(text, el) {
    function done() {
      showToast("已复制：" + text);
      el.classList.add("copied");
      setTimeout(function () { el.classList.remove("copied"); }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { showToast("复制失败，请手动复制"); }
      document.body.removeChild(ta);
    }
  }

  document.querySelectorAll("[data-copy]").forEach(function (el) {
    el.addEventListener("click", function () { copyText(el.getAttribute("data-copy"), el); });
  });

  /* ---------- 实习经历平滑展开/收起 ---------- */
  document.querySelectorAll(".job-card details").forEach(function (d) {
    var summary = d.querySelector("summary");
    var body = d.querySelector(".detail-body");
    if (!summary || !body) return;

    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        /* 收起 */
        body.style.height = body.scrollHeight + "px";
        requestAnimationFrame(function () {
          body.style.transition = "height .25s ease";
          body.style.height = "0px";
        });
        body.addEventListener("transitionend", function h() {
          body.removeEventListener("transitionend", h);
          d.open = false;
          body.style.cssText = "";
        });
      } else {
        /* 展开 */
        d.open = true;
        var target = body.scrollHeight;
        body.style.height = "0px";
        requestAnimationFrame(function () {
          body.style.transition = "height .25s ease";
          body.style.height = target + "px";
        });
        body.addEventListener("transitionend", function h() {
          body.removeEventListener("transitionend", h);
          body.style.cssText = "";
        });
      }
    });
  });

  /* ---------- 作品案例研究弹窗 ---------- */
  var modal = document.getElementById("modal");
  var csSheet = modal.querySelector(".cs-sheet");
  var lastFocus = null;

  function openModal(card) {
    lastFocus = card;
    var cover = card.getAttribute("data-cover");
    modal.querySelector("#csTitle").innerHTML = card.getAttribute("data-hero") || card.getAttribute("data-title");
    modal.querySelector("#csKicker").textContent = card.getAttribute("data-kicker") || "PROJECT";
    modal.querySelector("#csTag").textContent = card.getAttribute("data-tag") || "课程项目";
    modal.querySelector("#csIcon").className = "cs-icon-ph " + cover;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    csSheet.scrollTop = 0;
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".work-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(card);
    });
  });

  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
})();
