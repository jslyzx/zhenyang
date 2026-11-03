/* ============ 臻扬科技官网 · 交互动效 ============ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 滚动揭示 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 数字滚动计数 ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".counter");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute("data-target") || "0").toFixed(
        parseInt(el.getAttribute("data-decimals") || "0", 10)
      );
    });
  }

  /* ---------- 时间轴进度点亮 ---------- */
  var timeline = document.getElementById("timeline");
  if (timeline) {
    var track = document.getElementById("timelineTrack");
    var items = timeline.querySelectorAll(".tl-item");
    var onScroll = function () {
      var rect = timeline.getBoundingClientRect();
      var viewH = window.innerHeight;
      // 已滚过视口中心的比例
      var passed = (viewH * 0.55 - rect.top) / rect.height;
      passed = Math.max(0, Math.min(1, passed));
      if (track) track.style.setProperty("--fill", (passed * 100).toFixed(1) + "%");
      items.forEach(function (item) {
        var r = item.getBoundingClientRect();
        if (r.top < viewH * 0.55) item.classList.add("lit");
        else item.classList.remove("lit");
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Hero 轻视差（桌面端 + 未开启减弱动效） ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var applyParallax = function () {
      var sy = window.scrollY || window.pageYOffset;
      if (sy < window.innerHeight * 1.2) {
        parallaxEls.forEach(function (el) {
          var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
          el.style.transform = "translate3d(0," + (sy * speed).toFixed(1) + "px,0)";
        });
      }
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    }, { passive: true });
  }

  /* ---------- 导航：滚动状态 + 当前板块高亮 ---------- */
  var header = document.getElementById("siteHeader");
  var navAnchors = document.querySelectorAll(".nav-links a");
  var sections = [];
  navAnchors.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ id: id, el: sec, link: a });
  });
  var spy = function () {
    if (header) header.classList.toggle("scrolled", (window.scrollY || 0) > 40);
    var pos = (window.scrollY || 0) + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= pos) current = s;
    });
    navAnchors.forEach(function (a) { a.classList.remove("active"); });
    if (current) current.link.classList.add("active");
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* ---------- 移动端菜单 ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---------- 锚点定位补偿（固定导航高度） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + (window.scrollY || 0) - 76;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
})();
