/* ============================================================
   CZE FRANCE — main.js  (chargé sur toutes les pages, modules gardés)
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* année */
  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* statut ouvert / fermé — Lun-Ven 9h-12h / 14h-18h */
  (function () {
    var s = $("#status"), t = $("#stxt"); if (!s || !t) return;
    function up() {
      var n = new Date(), day = n.getDay(), h = n.getHours() + n.getMinutes() / 60;
      var open = (day >= 1 && day <= 5) && ((h >= 9 && h < 12) || (h >= 14 && h < 18));
      s.classList.toggle("open", open);
      t.textContent = open ? "Actuellement ouvert" : "Actuellement fermé";
    }
    up(); setInterval(up, 30000);
  })();

  /* header scroll + barre de progression + parallax hero */
  (function () {
    var header = $("#header"), prog = $("#progress"), ph = $("#heroPh");
    window.addEventListener("scroll", function () {
      var d = document.documentElement, top = d.scrollTop || document.body.scrollTop;
      if (prog) { var sc = top / (d.scrollHeight - d.clientHeight); prog.style.width = (sc * 100) + "%"; }
      if (header) header.classList.toggle("scrolled", top > 40);
      if (ph && top < 900) ph.style.transform = "translateY(" + (top * 0.06) + "px) scale(1.05)";
    }, { passive: true });
  })();

  /* nav mobile */
  (function () {
    var burger = $("#burger"), nav = $("#nav"); if (!burger || !nav) return;
    burger.addEventListener("click", function () { nav.classList.toggle("open"); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); }); });
  })();

  /* animation d'apparition du hero (home) */
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
    var lines = $$(".hero h1 .ln i");
    lines.forEach(function (el, i) { el.style.transition = "1s cubic-bezier(.16,1,.3,1) " + (0.25 + i * 0.12) + "s"; el.style.transform = "translateY(0)"; });
    [".hk", ".hero .lead", ".hero-cta", ".hchips", ".hvis"].forEach(function (s, i) {
      var e = $(s); if (!e) return;
      e.style.opacity = 0; e.style.transform = "translateY(24px)";
      e.style.transition = "1s cubic-bezier(.16,1,.3,1) " + (0.5 + i * 0.12) + "s";
      requestAnimationFrame(function () { e.style.opacity = 1; e.style.transform = "none"; });
    });
  });

  /* reveals */
  (function () {
    var els = $$(".rv"); if (!els.length || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* compteurs */
  (function () {
    var els = $$(".count"); if (!els.length || !("IntersectionObserver" in window)) return;
    function animate(el) {
      var to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || 0, 10), s = null, dur = 1600;
      function step(t) {
        if (!s) s = t; var p = Math.min((t - s) / dur, 1), e = 1 - Math.pow(1 - p, 3), v = to * e;
        el.textContent = dec ? v.toFixed(dec).replace(".", ",") : Math.round(v);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* marquee logos (duplication pour défilement continu) */
  (function () { var l = $("#logos"); if (l) l.innerHTML += l.innerHTML; })();

  /* FAQ accordéon */
  $$(".faq .q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var qa = btn.parentElement, a = $(".a", qa), open = qa.classList.toggle("open");
      a.style.maxHeight = open ? (a.scrollHeight + "px") : "0";
    });
  });

  /* formulaire de contact -> mailto */
  (function () {
    var f = $("#contactForm"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? encodeURIComponent(el.value) : ""; };
      var subject = "Demande via le site — " + (f.querySelector('[name="sujet"]') ? f.querySelector('[name="sujet"]').value : "Contact");
      var body = "Nom : " + g("nom") + "%0D%0AEntreprise : " + g("entreprise") + "%0D%0AEmail : " + g("email") +
        "%0D%0ATéléphone : " + g("telephone") + "%0D%0A%0D%0AMessage :%0D%0A" + g("message");
      window.location.href = "mailto:contact@cze-france.fr?subject=" + encodeURIComponent(subject) + "&body=" + body;
    });
  })();

  /* ============================================================
     CONFIGURATEUR CANTILEVER (home teaser + page dédiée)
     ============================================================ */
  (function () {
    if (!$("#modelOpts")) return;
    var LEVEL_ADD = 180; // estimation par niveau additionnel (placeholder à câbler sur tarif réel)
    var MODELS = {
      simple: { name: "Cantilever Simple", base: 1095, prof: "2,20 m" },
      double: { name: "Cantilever Double", base: 1395, prof: "3,90 m" }
    };
    var TIERS_DESC = [{ p: 120, d: .20 }, { p: 80, d: .15 }, { p: 40, d: .10 }];
    var TIERS_ASC = [{ p: 40, d: 10 }, { p: 80, d: 15 }, { p: 120, d: 20 }];
    var EUR = function (n) { return n.toLocaleString("fr-FR"); };
    var draft = { key: "simple", lvl: 3, qty: 1 };
    var items = [{ key: "simple", lvl: 3, qty: 1 }];
    var unit = function (it) { return MODELS[it.key].base + (it.lvl - 3) * LEVEL_ADD; };
    var tierFor = function (p) { for (var i = 0; i < TIERS_DESC.length; i++) if (p >= TIERS_DESC[i].p) return TIERS_DESC[i].d; return 0; };
    var nextTier = function (p) { for (var i = 0; i < TIERS_ASC.length; i++) if (p < TIERS_ASC[i].p) return TIERS_ASC[i]; return null; };
    var set = function (id, v) { var e = $("#" + id); if (e) e.textContent = v; };

    function renderDraft() {
      set("draftPrice", EUR(unit(draft) * draft.qty) + " € HT" + (draft.qty > 1 ? " · " + draft.qty + "×" : ""));
    }
    function render() {
      var list = $("#qitems"), html = "", sub = 0, pieces = 0;
      if (!items.length) html = '<div class="qempty">Configurez un cantilever puis ajoutez-le à votre devis.</div>';
      items.forEach(function (it, i) {
        var lp = unit(it) * it.qty; sub += lp; pieces += it.qty;
        html += '<div class="qline"><div class="qinfo"><div class="qn">' + MODELS[it.key].name +
          '</div><div class="qm">' + it.lvl + " niveaux · ×" + it.qty + " · " + EUR(unit(it)) +
          ' €/u</div></div><div class="qside"><span class="qp">' + EUR(lp) +
          ' €</span><button class="qx" title="Retirer" data-i="' + i + '">✕</button></div></div>';
      });
      if (list) list.innerHTML = html;
      var d = tierFor(pieces), total = Math.round(sub * (1 - d));
      set("sPieces", pieces + (pieces > 1 ? " pièces" : " pièce"));
      set("sDisc", d ? ("− " + (d * 100) + " %") : "—");
      var nt = nextTier(pieces);
      var hint = $("#tierHint");
      if (hint) hint.textContent = nt ? ("Plus que " + (nt.p - pieces) + " pièce" + ((nt.p - pieces) > 1 ? "s" : "") + " pour −" + nt.d + "\u00A0% de remise") : "Remise maximale appliquée · −20\u00A0%";
      set("sTotal", EUR(total));
      set("sTtc", EUR(Math.round(total * 1.2)));
      if (list) $$(".qx", list).forEach(function (b) { b.addEventListener("click", function () { items.splice(+b.dataset.i, 1); render(); }); });
    }
    $$("#modelOpts .opt").forEach(function (o) {
      o.addEventListener("click", function () {
        $$("#modelOpts .opt").forEach(function (x) { x.classList.remove("act"); });
        o.classList.add("act"); draft.key = o.dataset.key; renderDraft();
      });
    });
    $$("#levelSteps .step").forEach(function (s) {
      s.addEventListener("click", function () {
        $$("#levelSteps .step").forEach(function (x) { x.classList.remove("act"); });
        s.classList.add("act"); draft.lvl = +s.dataset.lvl; renderDraft();
      });
    });
    var plus = $("#plus"), minus = $("#minus"), addBtn = $("#addBtn");
    if (plus) plus.addEventListener("click", function () { draft.qty++; set("qtyVal", draft.qty); renderDraft(); });
    if (minus) minus.addEventListener("click", function () { if (draft.qty > 1) { draft.qty--; set("qtyVal", draft.qty); renderDraft(); } });
    if (addBtn) addBtn.addEventListener("click", function () { items.push({ key: draft.key, lvl: draft.lvl, qty: draft.qty }); render(); });
    renderDraft(); render();

    window.sendQuote = function () {
      var lines = items.map(function (it) { return "- " + MODELS[it.key].name + " · " + it.lvl + " niveaux · quantité " + it.qty; }).join("%0D%0A");
      var body = "Bonjour,%0D%0A%0D%0AJe souhaite un devis pour la configuration suivante :%0D%0A" + (lines || "- (aucun cantilever ajouté)") + "%0D%0A%0D%0AMerci.";
      window.location.href = "mailto:contact@cze-france.fr?subject=Demande de devis cantilever&body=" + body;
    };
  })();
})();
