/* ============================================================
   CZE FRANCE — main.js  (chargé sur toutes les pages, modules gardés)
   ============================================================ */
(function () {
  "use strict";
  var EN = (document.documentElement.lang || "").slice(0, 2).toLowerCase() === "en";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----- Capture identifiant de clic Google Ads (gclid/gbraid/wbraid) -----
     Stocké à l'arrivée et conservé 90 j : persiste de page en page (site statique)
     pour être joint au lead lors de l'envoi du formulaire de contact. */
  var ADS_KEY = "cze_ads_click";
  (function () {
    try {
      var p = new URLSearchParams(location.search), keys = ["gclid", "gbraid", "wbraid"];
      for (var i = 0; i < keys.length; i++) {
        var v = p.get(keys[i]);
        if (v) { localStorage.setItem(ADS_KEY, JSON.stringify({ k: keys[i], v: v, t: Date.now(), page: location.pathname })); break; }
      }
    } catch (e) {}
  })();
  function getAdsClick() {
    try {
      var o = JSON.parse(localStorage.getItem(ADS_KEY) || "null");
      if (!o || !o.v || Date.now() - (o.t || 0) > 90 * 864e5) return null; // expiré après 90 jours
      return o;
    } catch (e) { return null; }
  }

  /* année */
  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* statut ouvert / fermé — Lun-Ven 9h-12h / 14h-18h */
  (function () {
    var s = $("#status"), t = $("#stxt"); if (!s || !t) return;
    function up() {
      var n = new Date(), day = n.getDay(), h = n.getHours() + n.getMinutes() / 60;
      var open = (day >= 1 && day <= 5) && ((h >= 9 && h < 12) || (h >= 14 && h < 18));
      s.classList.toggle("open", open);
      t.textContent = open ? (EN ? "Currently open" : "Actuellement ouvert") : (EN ? "Currently closed" : "Actuellement fermé");
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
        el.textContent = dec ? (EN ? v.toFixed(dec) : v.toFixed(dec).replace(".", ",")) : Math.round(v);
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
    if (typeof gtag === "function") gtag('event', 'view_contact_page', { language: EN ? 'en' : 'fr' });
    /* champ caché : identifiant de clic Google Ads (pour repérer les leads issus des pubs) */
    (function () {
      var g = getAdsClick();
      if (g && !f.querySelector('[name="' + g.k + '"]')) {
        var inp = document.createElement("input");
        inp.type = "hidden"; inp.name = g.k; inp.value = g.v;
        f.appendChild(inp);
      }
    })();
    var note = f.querySelector(".note");
    var setNote = function (t, err) { if (note) { note.textContent = t; note.style.color = err ? "#c0392b" : ""; } };

    // Pré-remplissage depuis le configurateur (?devis=...)
    try {
      var dv = new URLSearchParams(location.search).get("devis");
      if (dv) {
        var msg0 = f.querySelector('[name="message"]'); if (msg0) msg0.value = decodeURIComponent(dv) + "\n\n";
        var sel0 = f.querySelector('[name="sujet"]'); if (sel0) sel0.value = EN ? "Quote request — Cantilever" : "Demande de devis — Cantilever";
        var em0 = f.querySelector('[name="email"]'); if (em0) em0.focus();
      }
    } catch (e) {}

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var action = f.getAttribute("action") || "";
      var btn = f.querySelector('button[type="submit"]');
      var span = btn ? btn.querySelector("span") : null;
      if (!action || action.indexOf("VOTRE_ID") > -1) {
        setNote(EN ? "Form not configured: set your Formspree ID in the form action attribute." : "Formulaire non configuré : renseignez l'identifiant Formspree dans l'attribut action du formulaire.", true);
        return;
      }
      var subj = f.querySelector('[name="_subject"]'), sel = f.querySelector('[name="sujet"]');
      if (subj && sel) subj.value = "Site CZE France — " + sel.value;
      if (btn) btn.disabled = true; if (span) span.textContent = EN ? "Sending…" : "Envoi en cours…";
      fetch(action, { method: "POST", body: new FormData(f), headers: { "Accept": "application/json" } })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            if (typeof gtag === "function") gtag('event', 'generate_lead', { form_id: 'contactForm', language: EN ? 'en' : 'fr', value: 1, currency: 'EUR' });
            f.innerHTML = (EN ? '<div class="form-success"><div class="fs-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg></div><h3>Thank you — your request has been sent!</h3><p>Our team usually replies within 24 business hours. For anything urgent, call <a href="tel:0531605161">+33 5 31 60 51 61</a>.</p></div>' : '<div class="form-success"><div class="fs-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg></div><h3>Merci, votre demande est bien partie&nbsp;!</h3><p>Notre équipe vous répond généralement sous 24&nbsp;h ouvrées. Pour une urgence, appelez le <a href="tel:0531605161">05 31 60 51 61</a>.</p></div>');
            try { f.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          } else {
            var m = (res.d && res.d.errors) ? res.d.errors.map(function (x) { return x.message; }).join(" · ") : (EN ? "An error occurred. Please try again or email contact@cze-france.fr." : "Une erreur est survenue. Réessayez ou écrivez à contact@cze-france.fr.");
            if (btn) btn.disabled = false; if (span) span.textContent = EN ? "Send my request" : "Envoyer ma demande";
            setNote(m, true);
          }
        })
        .catch(function () {
          if (btn) btn.disabled = false; if (span) span.textContent = EN ? "Send my request" : "Envoyer ma demande";
          setNote(EN ? "Connection failed. Please try again or email contact@cze-france.fr." : "Connexion impossible. Réessayez ou écrivez à contact@cze-france.fr.", true);
        });
    });
  })();

  /* GA4 : tracking des clics sur le numéro de téléphone (tel:) — couvre top bar, footer, blocs CTA, partout */
  (function () {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if (!a || typeof gtag !== "function") return;
      var loc = a.closest(".util") ? "topbar" : a.closest("footer") ? "footer" : a.closest(".cta") ? "cta" : "page";
      gtag("event", "click_to_call", {
        phone_number: (a.getAttribute("href") || "").replace("tel:", ""),
        link_location: loc,
        language: EN ? "en" : "fr"
      });
    }, true);
  })();

  /* ============================================================
     CONFIGURATEUR CANTILEVER (home teaser + page dédiée)
     ============================================================ */
  (function () {
    if (!$("#modelOpts")) return;
    /* Tarifs HT par modèle × finition × niveau. 5 et 6 niveaux = sur devis (pas de prix affiché). */
    var PRICE = {
      simple: { thermo: { 3: 1095, 4: 1275, 5: 2055 }, galva: { 3: 1535, 4: 1725, 5: 2597 } },
      double: { thermo: { 3: 1395, 4: 1575, 5: 2588 }, galva: { 3: 1865, 4: 1925, 5: 3248 } }
    };
    var MODELS = {
      simple: { name: EN ? "Single Cantilever" : "Cantilever Simple", prof: "2,20 m" },
      double: { name: EN ? "Double Cantilever" : "Cantilever Double", prof: "3,90 m" }
    };
    var FINISH = { thermo: EN ? "Powder-coated" : "Thermolaquée", galva: EN ? "Galvanized" : "Galvanisée" };
    var SURDEVIS = EN ? "On request" : "Sur devis";
    /* Hauteur selon le nombre de niveaux (m). 3 niveaux = 4,50 m, 4 = 6,10 m (puis +1,60 m/niveau). */
    var DEC = EN ? "." : ",";
    var HEIGHT = { 3: "4" + DEC + "50", 4: "6" + DEC + "10", 5: "7" + DEC + "70", 6: "9" + DEC + "30" };
    var DEPTH = { simple: "2" + DEC + "20", double: "3" + DEC + "90" };
    var DLBL = EN ? "D" : "P";
    function updateDims() {
      $$("#modelOpts .opt").forEach(function (o) {
        var d = o.querySelector(".dim");
        if (d) d.textContent = "H " + HEIGHT[draft.lvl] + " m · " + DLBL + " " + DEPTH[o.dataset.key] + " m";
      });
    }
    var TIERS_DESC = [{ p: 120, d: .20 }, { p: 80, d: .15 }, { p: 40, d: .10 }];
    var TIERS_ASC = [{ p: 40, d: 10 }, { p: 80, d: 15 }, { p: 120, d: 20 }];
    var EUR = function (n) { return n.toLocaleString(EN ? "en-GB" : "fr-FR"); };
    var HT = EN ? " € excl. VAT" : " € HT";
    var draft = { key: "simple", finish: "thermo", lvl: 3, qty: 1 };
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
        if (out) { out.innerHTML = EN ? "Corsica / overseas — <b>please contact us</b>" : "Corse / hors métropole — <b>nous consulter</b>"; out.className = "zoneout consult"; }
      } else if (dep && DEPT_ZONE[dep]) {
        var z = DEPT_ZONE[dep], p = ZONE_PRICE[z];
        delivery = { city: raw, zone: z, price: p };
        if (out) { out.innerHTML = "Zone " + z + " · <b>" + EUR(p) + HT + "</b>"; out.className = "zoneout ok"; }
      } else {
        delivery = { city: raw, zone: null, price: 0 };
        if (out) { out.textContent = EN ? "Enter a postal code to estimate delivery." : "Indiquez un code postal pour estimer la livraison."; out.className = "zoneout consult"; }
      }
      render();
    }
    var unit = function (it) { var t = PRICE[it.key][it.finish]; return t ? t[it.lvl] : undefined; }; // undefined => sur devis
    var tierFor = function (p) { for (var i = 0; i < TIERS_DESC.length; i++) if (p >= TIERS_DESC[i].p) return TIERS_DESC[i].d; return 0; };
    var nextTier = function (p) { for (var i = 0; i < TIERS_ASC.length; i++) if (p < TIERS_ASC[i].p) return TIERS_ASC[i]; return null; };
    var set = function (id, v) { var e = $("#" + id); if (e) e.textContent = v; };

    function renderDraft() {
      var u = unit(draft), q = draft.qty > 1 ? " · " + draft.qty + "×" : "";
      set("draftPrice", (typeof u === "number" ? (EUR(u * draft.qty) + HT) : SURDEVIS) + q);
    }
    function render() {
      var list = $("#qitems"), html = "", sub = 0, pieces = 0, hasQuote = false;
      if (!items.length) html = '<div class="qempty">' + (EN ? "Configure a cantilever, then add it to your quote." : "Configurez un cantilever puis ajoutez-le à votre devis.") + '</div>';
      items.forEach(function (it, i) {
        var u = unit(it), priceTxt, perU; pieces += it.qty;
        if (typeof u === "number") { var lp = u * it.qty; sub += lp; priceTxt = EUR(lp) + " €"; perU = " · " + EUR(u) + " €/u"; }
        else { hasQuote = true; priceTxt = SURDEVIS; perU = ""; }
        html += '<div class="qline"><div class="qinfo"><div class="qn">' + MODELS[it.key].name + " · " + FINISH[it.finish] +
          '</div><div class="qm">' + it.lvl + (EN ? " levels · ×" : " niveaux · ×") + it.qty + perU +
          '</div></div><div class="qside"><span class="qp">' + priceTxt +
          '</span><button class="qx" title="' + (EN ? "Remove" : "Retirer") + '" data-i="' + i + '">✕</button></div></div>';
      });
      if (list) list.innerHTML = html;
      var d = tierFor(pieces), prod = Math.round(sub * (1 - d));
      var dp = (delivery && delivery.price) ? delivery.price : 0;
      var total = prod + dp;
      set("sPieces", pieces + (EN ? (pieces > 1 ? " units" : " unit") : (pieces > 1 ? " pièces" : " pièce")));
      set("sDisc", d ? ("− " + (d * 100) + " %") : "—");
      set("sDeliv", delivery ? (delivery.price ? (EUR(delivery.price) + HT) : (EN ? "Contact us" : "Nous consulter")) : "—");
      var nt = nextTier(pieces);
      var hint = $("#tierHint");
      if (hint) hint.textContent = nt ? (EN ? ((nt.p - pieces) + " more unit" + ((nt.p - pieces) > 1 ? "s" : "") + " for −" + nt.d + "\u00A0% off") : ("Plus que " + (nt.p - pieces) + " pièce" + ((nt.p - pieces) > 1 ? "s" : "") + " pour −" + nt.d + "\u00A0% de remise")) : (EN ? "Maximum discount applied · −20\u00A0%" : "Remise maximale appliquée · −20\u00A0%");
      var amt = $(".summary .amt"), htline = $(".summary .ht");
      if (hasQuote) {
        if (amt) amt.innerHTML = '<b id="sTotal">' + SURDEVIS + '</b>';
        if (htline) htline.style.display = "none";
      } else {
        if (amt) amt.innerHTML = '<b id="sTotal">' + EUR(total) + '</b> €';
        if (htline) { htline.style.display = ""; htline.innerHTML = (EN ? "excl. VAT · i.e. " : "HT · soit ") + '<span id="sTtc">' + EUR(Math.round(total * 1.2)) + '</span>' + (EN ? " € incl. VAT" : " € TTC"); }
      }
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
        s.classList.add("act"); draft.lvl = +s.dataset.lvl; updateDims(); renderDraft();
      });
    });
    $$("#finishOpts .opt").forEach(function (o) {
      o.addEventListener("click", function () {
        $$("#finishOpts .opt").forEach(function (x) { x.classList.remove("act"); });
        o.classList.add("act"); draft.finish = o.dataset.finish; renderDraft();
      });
    });
    var plus = $("#plus"), minus = $("#minus"), addBtn = $("#addBtn");
    if (plus) plus.addEventListener("click", function () { draft.qty++; set("qtyVal", draft.qty); renderDraft(); });
    if (minus) minus.addEventListener("click", function () { if (draft.qty > 1) { draft.qty--; set("qtyVal", draft.qty); renderDraft(); } });
    if (addBtn) addBtn.addEventListener("click", function () { items.push({ key: draft.key, finish: draft.finish, lvl: draft.lvl, qty: draft.qty }); render(); });
    var cityEl = $("#cityInput"); if (cityEl) cityEl.addEventListener("input", computeDelivery);
    renderDraft(); render(); updateDims();

    window.sendQuote = function () {
      var pieces = 0, sub = 0, hasQuote = false;
      items.forEach(function (it) { pieces += it.qty; var u = unit(it); if (typeof u === "number") sub += u * it.qty; else hasQuote = true; });
      var d = tierFor(pieces), prod = Math.round(sub * (1 - d));
      var dp = (delivery && delivery.price) ? delivery.price : 0;
      var grand = prod + dp;
      var desc = items.length
        ? items.map(function (it) {
            var mdl = (it.key === "double" ? "Double" : (EN ? "Single" : "Simple")), fin = FINISH[it.finish], sd = (typeof unit(it) !== "number");
            return EN
              ? (it.qty + " " + mdl + " cantilever, " + fin + " (" + it.lvl + " levels)" + (sd ? " [price on request]" : ""))
              : (it.qty + " cantilever " + mdl + ", " + fin + " (" + it.lvl + " niveaux)" + (sd ? " [prix sur devis]" : ""));
          }).join(", ")
        : (EN ? "a cantilever" : "un cantilever");
      var ville = (delivery && delivery.city) ? ((EN ? ", delivered to " : ", livré à ") + delivery.city) : "";
      var totLine;
      if (hasQuote) {
        totLine = EN ? "Estimated total: on request (some items are quoted on request)." : "Total estimé : sur devis (certains éléments sont chiffrés sur demande).";
      } else {
        var totTxt = EUR(grand) + HT + (dp ? (EN ? (" (Zone " + delivery.zone + " delivery included)") : (" (livraison Zone " + delivery.zone + " incluse)")) : "");
        totLine = (EN ? "Estimated total: " : "Total estimé : ") + totTxt + ".";
      }
      var msg = EN
        ? ("Hello,\n\nI built a quote on your configurator with " + desc + ville + ".\n" + totLine + "\n\nI would like to be contacted as soon as possible to finalise my order.\n\nThank you in advance.")
        : ("Bonjour,\n\nJ'ai réalisé un devis sur votre configurateur avec " + desc + ville + ".\n" + totLine + "\n\nJ'aimerais être recontacté(e) au plus vite afin de finaliser ma commande.\n\nMerci d'avance.");
      window.location.href = "contact.html?devis=" + encodeURIComponent(msg) + "#contactForm";
    };
  })();
})();

/* Lightbox : agrandissement des photos de cotes (page cantilever) */
(function () {
  var imgs = document.querySelectorAll(".cant-visuals .cv img, img.zoomable");
  if (!imgs.length) return;
  var EN = (document.documentElement.lang || "").slice(0, 2).toLowerCase() === "en";
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = '<button class="lb-close" aria-label="' + (EN ? "Close" : "Fermer") + '">\u00D7</button><img alt=""><div class="lb-hint">' + (EN ? "Click to close" : "Cliquez pour fermer") + '</div>';
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
