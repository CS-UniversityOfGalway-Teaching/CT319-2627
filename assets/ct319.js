/* CT319 teaching pages — progressive enhancement only.
   The page is fully usable with JavaScript disabled: the teaching beats are
   native <details> elements, so they open, close and take keyboard focus
   without any of this file. This adds Expand all / Collapse all and makes
   links into a collapsed beat work. */

(function () {
  "use strict";

  var beats = Array.prototype.slice.call(document.querySelectorAll("details.beat"));
  if (!beats.length) return;

  var bar = document.querySelector("[data-beat-bar]");
  var expandBtn = document.querySelector("[data-expand-all]");
  var collapseBtn = document.querySelector("[data-collapse-all]");

  function setAll(open) {
    beats.forEach(function (b) { b.open = open; });
  }

  if (expandBtn) {
    expandBtn.addEventListener("click", function () { setAll(true); });
  }

  if (collapseBtn) {
    collapseBtn.addEventListener("click", function () {
      setAll(false);
      // Bring the outline back into view so the class can see the structure.
      var first = beats[0];
      if (first && first.getBoundingClientRect().top < 0) {
        first.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
  }

  /* Open whichever beat contains the element a link points at, so that
     in-page links and shared URLs land on visible content. */
  function revealTarget(hash) {
    if (!hash || hash.length < 2) return;
    var target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (e) {
      return;
    }
    if (!target) return;
    var node = target;
    while (node && node !== document.body) {
      if (node.tagName === "DETAILS") node.open = true;
      node = node.parentNode;
    }
    // Re-scroll: the browser measured position before the beat opened.
    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  window.addEventListener("hashchange", function () { revealTarget(location.hash); });

  /* ?open=all renders the page as flat revision notes on load. */
  if (/(^|[?&])open=all(&|$)/.test(location.search)) setAll(true);

  if (location.hash) revealTarget(location.hash);

  /* Reveal beats for in-page find, where the browser supports it. */
  beats.forEach(function (b) {
    b.addEventListener("beforematch", function () { b.open = true; });
  });

  /* Printing should produce complete notes, not a list of headings. Open
     everything for the print job, then put it back as the reader had it. */
  var beforePrintState = null;
  window.addEventListener("beforeprint", function () {
    beforePrintState = beats.map(function (b) { return b.open; });
    setAll(true);
  });
  window.addEventListener("afterprint", function () {
    if (!beforePrintState) return;
    beats.forEach(function (b, i) { b.open = beforePrintState[i]; });
    beforePrintState = null;
  });

  if (bar) bar.removeAttribute("hidden");
})();
