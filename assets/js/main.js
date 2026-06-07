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

  /* formulaire de contact -> Formspree (envoi direct, sans quitter la page) */
  (function () {
    var f = $("#contactForm"); if (!f) return;
    var note = f.querySelector(".note");
    var setNote = function (t, err) { if (note) { note.textContent = t; note.style.color = err ? "#c0392b" : ""; } };

    // Pré-remplissage depuis le configurateur (?devis=...)
    try {
      var dv = new URLSearchParams(location.search).get("devis");
      if (dv) {
        var msg0 = f.querySelector('[name="message"]'); if (msg0) msg0.value = decodeURIComponent(dv) + "\n\n";
        var sel0 = f.querySelector('[name="sujet"]'); if (sel0) sel0.value = "Demande de devis — Cantilever";
        var em0 = f.querySelector('[name="email"]'); if (em0) em0.focus();
      }
    } catch (e) {}

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var action = f.getAttribute("action") || "";
      var btn = f.querySelector('button[type="submit"]');
      var span = btn ? btn.querySelector("span") : null;
      if (!action || action.indexOf("VOTRE_ID") > -1) {
        setNote("Formulaire non configuré : renseignez l'identifiant Formspree dans l'attribut action du formulaire.", true);
        return;
      }
      var subj = f.querySelector('[name="_subject"]'), sel = f.querySelector('[name="sujet"]');
      if (subj && sel) subj.value = "Site CZE France — " + sel.value;
      if (btn) btn.disabled = true; if (span) span.textContent = "Envoi en cours…";
      fetch(action, { method: "POST", body: new FormData(f), headers: { "Accept": "application/json" } })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            f.innerHTML = '<div class="form-success"><div class="fs-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg></div><h3>Merci, votre demande est bien partie&nbsp;!</h3><p>Notre équipe vous répond généralement sous 24&nbsp;h ouvrées. Pour une urgence, appelez le <a href="tel:0531605161">05 31 60 51 61</a>.</p></div>';
            try { f.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          } else {
            var m = (res.d && res.d.errors) ? res.d.errors.map(function (x) { return x.message; }).join(" · ") : "Une erreur est survenue. Réessayez ou écrivez à contact@cze-france.fr.";
            if (btn) btn.disabled = false; if (span) span.textContent = "Envoyer ma demande";
            setNote(m, true);
          }
        })
        .catch(function () {
          if (btn) btn.disabled = false; if (span) span.textContent = "Envoyer ma demande";
          setNote("Connexion impossible. Réessayez ou écrivez à contact@cze-france.fr.", true);
        });
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
    var items = []; // devis vide au départ — se remplit via « Ajouter au devis »
    /* Livraison : tarifs par zone (cf. carte de la home) */
    var ZONE_PRICE = { 1: 500, 2: 700, 3: 900, 4: 960, 5: 880, 6: 960 };
    /* Département -> zone (approximatif, dérivé de la carte — ajustable librement) */
    var DEPT_ZONE = { "01":5,"02":6,"03":5,"04":5,"05":5,"06":5,"07":5,"08":6,"09":1,"10":6,"11":1,"12":1,"13":5,"14":4,"15":5,"16":2,"17":2,"18":3,"19":2,"21":6,"22":4,"23":2,"24":2,"25":6,"26":5,"27":4,"28":3,"29":4,"30":5,"31":1,"32":1,"33":2,"34":1,"35":4,"36":3,"37":3,"38":5,"39":6,"40":2,"41":3,"42":5,"43":5,"44":4,"45":3,"46":1,"47":2,"48":1,"49":4,"50":4,"51":6,"52":6,"53":4,"54":6,"55":6,"56":4,"57":6,"58":6,"59":6,"60":6,"61":4,"62":6,"63":5,"64":2,"65":1,"66":1,"67":6,"68":6,"69":5,"70":6,"71":6,"72":4,"73":5,"74":5,"75":3,"76":4,"77":3,"78":3,"79":2,"80":6,"81":1,"82":1,"83":5,"84":5,"85":4,"86":2,"87":2,"88":6,"89":6,"90":6,"91":3,"92":3,"93":3,"94":3,"95":3 };
    var delivery = null; // { city, zone, price } ou null

    function deptFromInput(v) {
      var s = String(v || ""), m = s.match(/(\d{5})/);
      var cp = m ? m[1] : (s.match(/\b(\d{2})\b/) || [])[1];
      if (!cp) return null;
      var two = cp.substring(0, 2);
      if (two === "20") return "CORSE";
      if (two === "97" || two === "98") return "OM";
      return two;
    }
    function computeDelivery() {
      var input = $("#cityInput"), out = $("#zoneOut");
      if (!input) { delivery = null; return; }
      var raw = input.value.trim();
      if (!raw) { delivery = null; if (out) { out.textContent = ""; out.className = "zoneout"; } render(); return; }
      var dep = deptFromInput(raw);
      if (dep === "CORSE" || dep === "OM") {
        delivery = { city: raw, zone: null, price: 0 };
        if (out) { out.innerHTML = "Corse / hors métropole — <b>nous consulter</b>"; out.className = "zoneout consult"; }
      } else if (dep && DEPT_ZONE[dep]) {
        var z = DEPT_ZONE[dep], p = ZONE_PRICE[z];
        delivery = { city: raw, zone: z, price: p };
        if (out) { out.innerHTML = "Zone " + z + " · <b>" + EUR(p) + " € HT</b>"; out.className = "zoneout ok"; }
      } else {
        delivery = { city: raw, zone: null, price: 0 };
        if (out) { out.textContent = "Indiquez un code postal pour estimer la livraison."; out.className = "zoneout consult"; }
      }
      render();
    }
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
      var d = tierFor(pieces), prod = Math.round(sub * (1 - d));
      var dp = (delivery && delivery.price) ? delivery.price : 0;
      var total = prod + dp;
      set("sPieces", pieces + (pieces > 1 ? " pièces" : " pièce"));
      set("sDisc", d ? ("− " + (d * 100) + " %") : "—");
      set("sDeliv", delivery ? (delivery.price ? (EUR(delivery.price) + " € HT") : "Nous consulter") : "—");
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
    var cityEl = $("#cityInput"); if (cityEl) cityEl.addEventListener("input", computeDelivery);
    renderDraft(); render();

    window.sendQuote = function () {
      var pieces = items.reduce(function (a, it) { return a + it.qty; }, 0);
      var sub = items.reduce(function (a, it) { return a + unit(it) * it.qty; }, 0);
      var d = tierFor(pieces), prod = Math.round(sub * (1 - d));
      var dp = (delivery && delivery.price) ? delivery.price : 0;
      var grand = prod + dp;
      var desc = items.length
        ? items.map(function (it) { return it.qty + " cantilever " + (it.key === "double" ? "Double" : "Simple") + " (" + it.lvl + " niveaux)"; }).join(", ")
        : "un cantilever";
      var ville = (delivery && delivery.city) ? (", livré à " + delivery.city) : "";
      var totTxt = EUR(grand) + " € HT" + (dp ? " (livraison Zone " + delivery.zone + " incluse)" : "");
      var msg = "Bonjour,\n\nJ'ai réalisé un devis sur votre configurateur avec " + desc + ville +
        ", pour un total estimé à " + totTxt + ".\n\nJ'aimerais être recontacté(e) au plus vite afin de finaliser ma commande.\n\nMerci d'avance.";
      window.location.href = "contact.html?devis=" + encodeURIComponent(msg) + "#contactForm";
    };
  })();
})();

/* Lightbox : agrandissement des photos de cotes (page cantilever) */
(function () {
  var imgs = document.querySelectorAll(".cant-visuals .cv img, img.zoomable");
  if (!imgs.length) return;
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = '<button class="lb-close" aria-label="Fermer">\u00D7</button><img alt=""><div class="lb-hint">Cliquez pour fermer</div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");
  function openLB(src, alt) { lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("on"); document.body.style.overflow = "hidden"; }
  function closeLB() { lb.classList.remove("on"); document.body.style.overflow = ""; }
  Array.prototype.forEach.call(imgs, function (im) {
    im.addEventListener("click", function () { openLB(im.currentSrc || im.src, im.alt); });
  });
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target === lbImg || e.target.classList.contains("lb-close")) closeLB();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLB(); });
})();
